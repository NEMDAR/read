import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl">غير موجود</h1>
      <p className="mt-3 text-[color:var(--muted)]">هذه الصفحة أو الرواية غير موجودة في حكايا.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-[color:var(--ink)] px-4 py-2 text-[color:var(--paper)]">
        الكتالوج
      </Link>
    </div>
  );
}
