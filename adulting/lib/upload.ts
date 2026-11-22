import { createClient } from "@/lib/supabase/client";

// Used by any upload box in the app (Files page, Complete Task popup)
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
export const ACCEPT_ATTRIBUTE = ".pdf,image/jpeg,image/png,image/webp,image/heic";

// Checks files before uploading. Returns an error message, or null if everything is OK.
export function checkFiles(files: File[]): string | null {
  for (const file of files) {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      return `"${file.name}" isn't a PDF or an image.`;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return `"${file.name}" is bigger than 10 MB.`;
    }
  }
  return null;
}

// Uploads files to Storage and saves their information.
// Returns an error message, or null if everything worked.
export async function uploadDocuments({
  files,
  title,
  category,
  taskId,
}: {
  files: File[];
  title: string;
  category: string;
  taskId?: string; // set when the files belong to a task
}): Promise<string | null> {
  const problem = checkFiles(files);
  if (problem) return problem;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "Please log in again.";

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      return `Couldn't upload "${file.name}": ${uploadError.message}`;
    }

    const { error: saveError } = await supabase.from("documents").insert({
      title,
      category,
      task_id: taskId ?? null,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    });

    if (saveError) {
      // Clean up the uploaded file so nothing is left behind
      await supabase.storage.from("documents").remove([path]);
      return `Couldn't save "${file.name}". Please try again.`;
    }
  }

  return null;
}