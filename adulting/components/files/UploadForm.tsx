"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light/40";

export default function UploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stop, and show an error message
  function fail(message: string) {
    setIsUploading(false);
    setError(message);
  }

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

    // 1. Check everything before uploading
    if (!title) return fail("Please give these files a name.");
    if (files.length === 0) return fail("Please choose at least one file.");
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return fail(`"${file.name}" isn't a PDF or an image.`);
      }
      if (file.size > MAX_BYTES) {
        return fail(`"${file.name}" is bigger than 10 MB.`);
      }
    }

    setIsUploading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fail("Please log in again.");

    // 2. Upload each file, then save its information
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        return fail(`Couldn't upload "${file.name}": ${uploadError.message}`);
      }

      const { error: saveError } = await supabase.from("documents").insert({
        title,
        category,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
      });

      if (saveError) {
        // Clean up the uploaded file so nothing is left behind
        await supabase.storage.from("documents").remove([path]);
        return fail(`Couldn't save "${file.name}". Please try again.`);
      }
    }

    // 3. Done! Clear the form and refresh the file list.
    form.reset();
    setIsUploading(false);
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
          accept=".pdf,image/jpeg,image/png,image/webp,image/heic"
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