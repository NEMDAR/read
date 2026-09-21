"use client";

import Link from "next/link";
import { Reader } from "./Reader";
import { useLibraryNovels } from "./useLibraryNovels";
import { useMounted } from "./useMounted";
import type { Novel } from "@/lib/types";

export function ChapterLoader({
  slug,
  chapterId,
  bundled,
}: {
  slug: string;
  chapterId: string;
  bundled?: Novel;
}) {
  const mounted = useMounted();
  const { find } = useLibraryNovels();
  const novel = bundled ?? (mounted ? find(slug) : undefined);
  const chapter = novel?.chapters.find((item) => item.id === chapterId);

  if (novel && chapter) return <Reader novel={novel} chapterId={chapterId} />;
  if (!mounted) {
    return <p className="px-4 py-16 text-center text-[color:var(--muted)]">…</p>;
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-3xl">غير موجود</h1>
      <Link href={novel ? `/n/${novel.slug}` : "/import"} className="mt-6 inline-block rounded-full bg-[color:var(--ink)] px-4 py-2 text-[color:var(--paper)]">
        رجوع
      </Link>
    </div>
  );
}
