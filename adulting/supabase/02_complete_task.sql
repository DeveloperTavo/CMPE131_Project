-- complete_task: marks a task done, and if it repeats,
-- creates the next one in the user's own time zone.
-- Returns the id of the new task (or null if it doesn't repeat).
create or replace function public.complete_task(task_id uuid)
returns uuid
language plpgsql
security invoker -- runs as the logged-in user, so RLS still protects everything
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
  -- 1. Find the task (RLS makes sure it belongs to this user)
  select * into t
  from public.tasks
  where id = task_id and status = 'pending';

  if not found then
    raise exception 'Task not found or already completed';
  end if;

  -- 2. Mark it completed
  update public.tasks
  set status = 'completed', completed_at = now()
  where id = task_id;

  -- 3. One-time task? We're done.
  if t.frequency = 'once' then
    return null;
  end if;

  -- 4. Work out the next due date in the user's time zone
  select timezone into user_tz from public.profiles where id = t.owner_id;
  user_tz := coalesce(user_tz, 'America/Los_Angeles');

  step := case t.frequency
    when 'daily' then interval '1 day'
    when 'weekly' then interval '1 week'
    when 'monthly' then interval '1 month'
    when 'yearly' then interval '1 year'
  end;

  -- Keep stepping forward until the next date is in the future
  -- (so finishing a very overdue task doesn't create another overdue one)
  local_due := t.due_at at time zone user_tz;
  loop
    n := n + 1;
    next_due := (local_due + step * n) at time zone user_tz;
    exit when next_due > now();
  end loop;

  -- 5. Create the next task with the same settings
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