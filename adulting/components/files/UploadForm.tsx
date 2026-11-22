"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { ACCEPT_ATTRIBUTE, uploadDocuments } from "@/lib/upload";

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function UploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // don't reload the page
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "household");
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (!title) {
      setError("Please give these files a name.");
      return;
    }
    if (files.length === 0) {
      setError("Please choose at least one file.");
      return;
    }

    setIsUploading(true);
    const problem = await uploadDocuments({ files, title, category });
    setIsUploading(false);

    if (problem) {
      setError(problem);
      return;
    }

    // Done! Clear the form and refresh the file list.
    form.reset();
    setSuccess(`Uploaded ${files.length} file${files.length === 1 ? "" : "s"}!`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">Upload files</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_200px]">
        <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
          Name
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Physical Exam results"
            className={inputStyle}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
          Category
          <select name="category" defaultValue="household" className={inputStyle}>
            <option value="household">Household</option>
            <option value="auto">Auto</option>
            <option value="health">Health</option>
            <option value="finances">Finances</option>
          </select>
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1 text-sm font-semibold text-gray-700">
        Files (PDFs or images, up to 10 MB each)
        <input
          type="file"
          name="files"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="text-sm font-normal file:mr-4 file:rounded-lg file:border-0 file:bg-brand-light/30 file:px-4 file:py-2 file:font-semibold file:text-brand hover:file:bg-brand-light/50"
        />
      </label>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}