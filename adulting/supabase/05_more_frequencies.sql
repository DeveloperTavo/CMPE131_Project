-- Allow tasks to repeat every 3 months (quarterly) and every 6 months (semiannually)

-- 1. Replace the rule that lists the allowed repeat options
alter table public.tasks drop constraint tasks_frequency_check;

alter table public.tasks add constraint tasks_frequency_check
  check (frequency in (
    'once', 'daily', 'weekly', 'monthly', 'quarterly', 'semiannually', 'yearly'
  ));

-- 2. Teach complete_task how far to jump for the new options
create or replace function public.complete_task(task_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  t public.tasks%rowtype;
  user_tz text;
  step interval;
  local_due timestamp;
  next_due timestamptz;
  n integer := 0;
  next_id uuid;
begin
  select * into t
  from public.tasks
  where id = task_id and status = 'pending';

  if not found then
    raise exception 'Task not found or already completed';
  end if;

  update public.tasks
  set status = 'completed', completed_at = now()
  where id = task_id;

  if t.frequency = 'once' then
    return null;
  end if;

  select timezone into user_tz from public.profiles where id = t.owner_id;
  user_tz := coalesce(user_tz, 'America/Los_Angeles');

  step := case t.frequency
    when 'daily' then interval '1 day'
    when 'weekly' then interval '1 week'
    when 'monthly' then interval '1 month'
    when 'quarterly' then interval '3 months'
    when 'semiannually' then interval '6 months'
    when 'yearly' then interval '1 year'
  end;

  local_due := t.due_at at time zone user_tz;
  loop
    n := n + 1;
    next_due := (local_due + step * n) at time zone user_tz;
    exit when next_due > now();
  end loop;

  insert into public.tasks
    (owner_id, category, title, notes, due_at, frequency,
     remind_before_minutes, notify_email, notify_sms)
  values
    (t.owner_id, t.category, t.title, t.notes, next_due, t.frequency,
     t.remind_before_minutes, t.notify_email, t.notify_sms)
  returning id into next_id;

  return next_id;
end;
$$;