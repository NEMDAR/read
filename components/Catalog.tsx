"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { percentForNovel, readStore } from "@/lib/progress";
import type { Novel, NovelProgress } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { NovelCard } from "./NovelCard";
import { useLibraryNovels } from "./useLibraryNovels";
import { useMounted } from "./useMounted";

function matchesQuery(novel: Novel, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    novel.title.ar,
    novel.title.en,
    novel.author.ar,
    novel.author.en,
    novel.genre.ar,
    novel.genre.en,
    novel.synopsis.ar,
    novel.synopsis.en,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function Catalog() {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState("");
  const mounted = useMounted();
  const { novels, find } = useLibraryNovels();
  const results = novels.filter((novel) => matchesQuery(novel, query));
  const store = mounted ? readStore() : null;
  const last = store?.last;
  const lastNovel = last ? find(last.novelSlug) : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <section className="mb-8 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {locale === "ar" ? "قارئ فصول" : "Chapter reader"}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight">{t("brand")}</h1>
        <p className="mt-3 text-lg text-[color:var(--muted)]">{t("tagline")}</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{t("originalNote")}</p>
        <Link
          href="/import"
          className="mt-4 inline-block rounded-full border border-[color:var(--line)] px-4 py-2 text-sm"
        >
          {t("importJson")}
        </Link>
      </section>

      {last && lastNovel ? <ContinueBanner progress={last} novel={lastNovel} /> : null}

      <label className="mb-6 block">
        <span className="sr-only">{t("search")}</span>
        <input
          data-testid="catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      {results.length === 0 ? (
        <p>{t("noResults")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((novel) => {
            const progress = store?.novels[novel.slug];
            return (
              <li key={novel.slug}>
                <NovelCard
                  novel={novel}
                  progressPercent={progress ? percentForNovel(novel, progress) : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ContinueBanner({ progress, novel }: { progress: NovelProgress; novel: Novel }) {
  const { locale, t } = useLanguage();
  const chapter = useMemo(
    () => novel.chapters.find((item) => item.id === progress.chapterId) ?? novel.chapters[0],
    [novel, progress.chapterId],
  );
  const href = `/n/${novel.slug}/${chapter.id}`;

  return (
    <Link
      href={href}
      data-testid="continue-reading"
      className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--ink)] px-5 py-4 text-[color:var(--paper)]"
    >
      <span>
        <span className="block text-xs opacity-70">{t("continueFrom")}</span>
        <span className="block font-display text-xl">{novel.title[locale]}</span>
        <span className="block text-sm opacity-80">{chapter.title[locale]}</span>
      </span>
      <span className="rounded-full bg-white/15 px-4 py-2 text-sm">{t("continue")}</span>
    </Link>
  );
}
