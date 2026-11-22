import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import UploadForm from "@/components/files/UploadForm";
import { CATEGORY_INFO, type Category } from "@/lib/task-helpers";
import { dateKey, formatKey } from "@/lib/dates";

type DocumentRow = {
  id: string;
  title: string;
  category: Category;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
};

export default function FilesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Files</h1>
        <p className="text-gray-600">Receipts, results, and records, all in one place</p>
      </div>

      <UploadForm />

      <Suspense fallback={<p className="text-gray-500">Loading your files...</p>}>
        <FileList />
      </Suspense>
    </div>
  );
}

async function FileList() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  // Newest files first
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, category, file_name, storage_path, mime_type, created_at")
    .order("created_at", { ascending: false });

  const docs = (documents ?? []) as DocumentRow[];

  if (docs.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-gray-500 shadow-sm">
        No files yet. Upload your first one above!
      </p>
    );
  }

  // Files are private, so we make temporary links that work for 1 hour
  const { data: signedLinks } = await supabase.storage
    .from("documents")
    .createSignedUrls(
      docs.map((doc) => doc.storage_path),
      60 * 60
    );

  const linkFor = new Map((signedLinks ?? []).map((link) => [link.path, link.signedUrl]));

  // Group files: same day + same name = one group (e.g. "Nov 22 – Physical Exam results")
  const timeZone = profile?.timezone ?? "America/Los_Angeles";
  const groups: { dayKey: string; title: string; category: Category; docs: DocumentRow[] }[] = [];

  for (const doc of docs) {
    const dayKey = dateKey(new Date(doc.created_at), timeZone);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.dayKey === dayKey && lastGroup.title === doc.title) {
      lastGroup.docs.push(doc);
    } else {
      groups.push({ dayKey, title: doc.title, category: doc.category, docs: [doc] });
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm">
      {groups.map((group, index) => {
        // Only show the date heading when the date changes
        const isNewDay = index === 0 || groups[index - 1].dayKey !== group.dayKey;

        return (
          <section key={`${group.dayKey}-${group.title}-${index}`}>
            {isNewDay && (
              <h2 className="mb-3 text-2xl font-bold">
                {formatKey(group.dayKey, { month: "long", day: "numeric", year: "numeric" })}
              </h2>
            )}

            <h3 className="flex items-center gap-2 font-semibold">
              <span className={`h-4 w-1 rounded-full ${CATEGORY_INFO[group.category].color}`} />
              {group.title}
            </h3>

            <ul className="mt-3 flex flex-wrap gap-6">
              {group.docs.map((doc) => (
                <FileTile key={doc.id} doc={doc} url={linkFor.get(doc.storage_path)} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// One file: a thumbnail (for photos) or a document icon (for PDFs), plus its name
function FileTile({ doc, url }: { doc: DocumentRow; url?: string }) {
  const isPreviewableImage =
    (doc.mime_type?.startsWith("image/") ?? false) && doc.mime_type !== "image/heic";

  return (
    <li className="w-28">
      <a href={url} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50 group-hover:border-brand">
          {isPreviewableImage && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={doc.file_name} className="h-full w-full object-cover" />
          ) : (
            <FileText className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <p
          className="mt-1 truncate text-sm font-medium group-hover:text-brand"
          title={doc.file_name}
        >
          {doc.file_name}
        </p>
      </a>
    </li>
  );
}