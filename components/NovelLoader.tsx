"use client";

import { NovelDetails } from "./NovelDetails";
import { useLibraryNovels } from "./useLibraryNovels";
import { useMounted } from "./useMounted";
import type { Novel } from "@/lib/types";
import Link from "next/link";

export function NovelLoader({ slug, bundled }: { slug: string; bundled?: Novel }) {
  const mounted = useMounted();
  const { find } = useLibraryNovels();
  const novel = bundled ?? (mounted ? find(slug) : undefined);

  if (novel) return <NovelDetails novel={novel} />;
  if (!mounted) {
    return <p className="px-4 py-16 text-center text-[color:var(--muted)]">…</p>;
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl">غير موجود</h1>
      <p className="mt-3 text-[color:var(--muted)]">هذه الرواية غير موجودة، أو أن ملف JSON لم يُرفع على هذا الجهاز.</p>
      <Link href="/import" className="mt-6 inline-block rounded-full bg-[color:var(--ink)] px-4 py-2 text-[color:var(--paper)]">
        ملف JSON
      </Link>
    </div>
  );
}
