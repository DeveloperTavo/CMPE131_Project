import { Suspense } from "react";
import FormError from "@/components/FormError";
import NewTaskForm from "@/components/NewTaskForm";

export default function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-brand">New Task</h1>
      <p className="mt-1 text-sm text-gray-500">What do you need to remember?</p>

      <Suspense fallback={null}>
        <FormError searchParams={searchParams} />
      </Suspense>

      <NewTaskForm />
    </div>
  );
}