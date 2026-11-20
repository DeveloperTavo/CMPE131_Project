import { Suspense } from "react";
import FormError from "@/components/FormError";
import NewTaskForm from "@/components/NewTaskForm";
import { CATEGORIES, type Category } from "@/lib/task-helpers";

type Params = Promise<{ error?: string; category?: string }>;

export default function NewTaskPage({ searchParams }: { searchParams: Params }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-brand">New Task</h1>
      <p className="mt-1 text-sm text-gray-500">What do you need to remember?</p>

      <Suspense fallback={null}>
        <FormError searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={null}>
        <FormWithCategory searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Reads ?category=auto from the web address and pre-picks it in the form
async function FormWithCategory({ searchParams }: { searchParams: Params }) {
  const { category } = await searchParams;
  const isValid = CATEGORIES.includes(category as Category);

  return <NewTaskForm defaultCategory={isValid ? category : "household"} />;
}