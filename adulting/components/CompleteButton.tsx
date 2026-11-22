"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Paperclip, X } from "lucide-react";
import { completeTask } from "@/lib/actions/tasks";
import { ACCEPT_ATTRIBUTE, uploadDocuments } from "@/lib/upload";

// A round check button. Clicking it opens a popup to finish the task,
// with an optional place to attach receipts or documents.
export default function CompleteButton({
  taskId,
  taskTitle,
  category,
}: {
  taskId: string;
  taskTitle: string;
  category: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openPopup() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function closePopup() {
    if (fileInputRef.current) fileInputRef.current.value = ""; // forget chosen files
    dialogRef.current?.close();
  }

  async function finishTask() {
    setIsSaving(true);
    setError(null);

    // 1. Upload any attached files and link them to this task
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length > 0) {
      const problem = await uploadDocuments({ files, title: taskTitle, category, taskId });
      if (problem) {
        setIsSaving(false);
        setError(problem);
        return;
      }
    }

    // 2. Mark the task done (and schedule the next one if it repeats)
    const result = await completeTask(taskId);
    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    closePopup();
    router.refresh();
  }

  return (
    <>
      {/* The round check button */}
      <button
        type="button"
        onClick={openPopup}
        aria-label={`Mark "${taskTitle}" as done`}
        title="Mark as done"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 text-transparent transition hover:border-brand-light hover:text-brand-light"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>

      {/* The popup */}
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="p-6 text-left text-gray-900">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold">Mark &ldquo;{taskTitle}&rdquo; as done?</h2>
            <button
              type="button"
              onClick={closePopup}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Nice work! Want to attach a receipt or document? This is optional.
          </p>

          <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              Attach files (PDFs or images, up to 10 MB each)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_ATTRIBUTE}
              className="text-sm font-normal file:mr-4 file:rounded-lg file:border-0 file:bg-brand-light/30 file:px-4 file:py-2 file:font-semibold file:text-brand hover:file:bg-brand-light/50"
            />
          </label>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closePopup}
              className="rounded-lg px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={finishTask}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {isSaving ? "Saving..." : "Mark as Done"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}