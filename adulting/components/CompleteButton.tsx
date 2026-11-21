"use client";

import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { completeTask } from "@/lib/actions/tasks";

// A round button that marks a task as done
export default function CompleteButton({
  taskId,
  taskTitle,
}: {
  taskId: string;
  taskTitle: string;
}) {
  return (
    <form action={completeTask}>
      {/* Hidden: tells the server WHICH task to complete */}
      <input type="hidden" name="taskId" value={taskId} />
      <CheckCircle label={`Mark "${taskTitle}" as done`} />
    </form>
  );
}

function CheckCircle({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      title="Mark as done"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 text-transparent transition hover:border-brand-light hover:text-brand-light disabled:border-brand-light disabled:bg-brand-light disabled:text-white"
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </button>
  );
}