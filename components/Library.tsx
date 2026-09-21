"use client";

import Link from "next/link";
import { percentForNovel, readStore } from "@/lib/progress";
import { useLanguage } from "./LanguageProvider";
import { useLibraryNovels } from "./useLibraryNovels";
import { useMounted } from "./useMounted";

export function Library() {
  const { locale, t } = useLanguage();
  const mounted = useMounted();
  const { find } = useLibraryNovels();
  const store = mounted ? readStore() : { last: null, novels: {} };
  const entries = Object.values(store.novels).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="font-display text-4xl">{t("library")}</h1>
      <p className="mt-2 text-[color:var(--muted)]">{t("continueFrom")}</p>

      {entries.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-[color:var(--line)] p-8">
          <p>{t("emptyLibrary")}</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-[color:var(--ink)] px-4 py-2 text-[color:var(--paper)]">
            {t("browseCatalog")}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3" data-testid="library-list">
          {entries.map((progress) => {
            const novel = find(progress.novelSlug);
            if (!novel) return null;
            const chapter =
              novel.chapters.find((item) => item.id === progress.chapterId) ?? novel.chapters[0];
            return (
              <li key={novel.slug}>
                <Link
                  href={`/n/${novel.slug}/${chapter.id}`}
                  data-testid={`library-item-${novel.slug}`}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-white/60 px-4 py-4"
                >
                  <span>
                    <span className="block font-display text-xl">{novel.title[locale]}</span>
                    <span className="block text-sm text-[color:var(--muted)]">
                      {chapter.title[locale]}
                    </span>
                  </span>
                  <span className="text-sm text-[color:var(--accent)]">
                    {percentForNovel(novel, progress)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
