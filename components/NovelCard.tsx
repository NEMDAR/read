"use client";

import Link from "next/link";
import type { Novel } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

export function NovelCard({
  novel,
  progressPercent,
}: {
  novel: Novel;
  progressPercent?: number;
}) {
  const { locale, t } = useLanguage();

  return (
    <Link
      href={`/n/${novel.slug}`}
      data-testid={`novel-card-${novel.slug}`}
      className="group block overflow-hidden rounded-3xl border border-[color:var(--line)] bg-white/60 shadow-[0_12px_40px_-24px_rgba(40,24,12,0.45)]"
    >
      <div
        className="relative h-40 p-4 text-[color:var(--paper)]"
        style={{ background: novel.cover.background }}
      >
        <CoverMotif motif={novel.cover.motif} accent={novel.cover.accent} />
        <p className="relative text-sm opacity-80">{novel.genre[locale]}</p>
        <h2 className="relative mt-6 font-display text-2xl leading-snug">{novel.title[locale]}</h2>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-[color:var(--muted)]">{novel.author[locale]}</p>
        <p className="line-clamp-3 text-sm leading-6">{novel.synopsis[locale]}</p>
        {typeof progressPercent === "number" ? (
          <p className="text-xs text-[color:var(--accent)]">
            {t("progress")}: {progressPercent}%
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CoverMotif({
  motif,
  accent,
}: {
  motif: Novel["cover"]["motif"];
  accent: string;
}) {
  if (motif === "gate") {
    return (
      <svg className="absolute inset-y-3 end-3 h-28 w-24 opacity-70" viewBox="0 0 80 100" aria-hidden>
        <path d="M10 95 V40 A30 30 0 0 1 70 40 V95" fill="none" stroke={accent} strokeWidth="4" />
        <circle cx="40" cy="58" r="4" fill={accent} />
      </svg>
    );
  }
  if (motif === "orchid") {
    return (
      <svg className="absolute inset-y-4 end-3 h-28 w-24 opacity-80" viewBox="0 0 80 100" aria-hidden>
        <circle cx="40" cy="42" r="16" fill={accent} opacity="0.85" />
        <circle cx="28" cy="54" r="12" fill={accent} opacity="0.6" />
        <circle cx="52" cy="54" r="12" fill={accent} opacity="0.6" />
        <rect x="38" y="58" width="4" height="28" fill={accent} />
      </svg>
    );
  }
  return (
    <svg className="absolute inset-y-3 end-2 h-28 w-28 opacity-80" viewBox="0 0 100 100" aria-hidden>
      <circle cx="62" cy="38" r="18" fill={accent} />
      <circle cx="28" cy="52" r="10" fill="none" stroke={accent} strokeWidth="3" />
    </svg>
  );
}
