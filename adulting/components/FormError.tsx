// Shows the red error box when the web address has ?error=... in it
export default async function FormError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!error) return null;

  return (
    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
  );
}