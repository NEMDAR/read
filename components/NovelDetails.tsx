"use client";

import Link from "next/link";
import { getChapter } from "@/content";
import { percentForNovel, readStore } from "@/lib/progress";
import type { Novel } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { useMounted } from "./useMounted";

export function NovelDetails({ novel }: { novel: Novel }) {
  const { locale, t } = useLanguage();
  const mounted = useMounted();
  const saved = mounted ? readStore().novels[novel.slug] : undefined;
  const savedChapter = saved ? getChapter(novel, saved.chapterId) : undefined;
  const href = savedChapter
    ? `/n/${novel.slug}/${savedChapter.id}`
    : `/n/${novel.slug}/${novel.chapters[0].id}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-[color:var(--muted)]">
        ← {t("catalog")}
      </Link>
      <header
        className="mt-4 overflow-hidden rounded-3xl p-6 text-[color:var(--paper)]"
        style={{ background: novel.cover.background }}
      >
        <p className="text-sm opacity-80">{novel.genre[locale]}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">{novel.title[locale]}</h1>
        <p className="mt-2 opacity-90">{novel.author[locale]}</p>
        <p className="mt-4 max-w-xl text-sm leading-7 opacity-90">{novel.synopsis[locale]}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            data-testid="start-reading"
            className="rounded-full bg-[color:var(--paper)] px-5 py-2 text-sm text-[color:var(--ink)]"
          >
            {savedChapter ? t("resume") : t("start")}
          </Link>
          {saved ? (
            <span className="text-sm opacity-80">
              {t("progress")}: {percentForNovel(novel, saved)}%
            </span>
          ) : null}
        </div>
      </header>

      <h2 className="mt-8 mb-3 font-display text-2xl">{t("chapters")}</h2>
      <ol className="divide-y divide-[color:var(--line)] overflow-hidden rounded-3xl border border-[color:var(--line)] bg-white/50">
        {novel.chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <Link
              href={`/n/${novel.slug}/${chapter.id}`}
              data-testid={`chapter-link-${chapter.id}`}
              className="flex items-center justify-between gap-4 px-4 py-5 hover:bg-black/5"
            >
              <span>
                <span className="block text-xs text-[color:var(--muted)]">
                  {t("chapter")} {index + 1}
                </span>
                <span className="block font-medium">{chapter.title[locale]}</span>
              </span>
              {saved?.chapterId === chapter.id ? (
                <span className="text-xs text-[color:var(--accent)]">{t("lastRead")}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
