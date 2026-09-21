"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { adjacentChapters } from "@/content";
import {
  saveProgress,
  scrollRatioFromElement,
  scrollTopFromRatio,
  readStore,
} from "@/lib/progress";
import type { FontScale, Novel, ReaderTheme } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

const THEME_KEY = "hikaya.reader.theme";
const FONT_KEY = "hikaya.reader.font";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readTheme(): ReaderTheme {
  if (typeof window === "undefined") return "paper";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "night" || stored === "warm" || stored === "paper" ? stored : "paper";
}

function readFont(): FontScale {
  if (typeof window === "undefined") return "md";
  const stored = window.localStorage.getItem(FONT_KEY);
  return stored === "sm" || stored === "md" || stored === "lg" ? stored : "md";
}

const themes: ReaderTheme[] = ["paper", "warm", "night"];

export function Reader({
  novel,
  chapterId,
}: {
  novel: Novel;
  chapterId: string;
}) {
  const { locale, t, toggleLocale } = useLanguage();
  const router = useRouter();
  const scrollerRef = useRef<HTMLElement | null>(null);
  const restoredRef = useRef(false);
  const [chrome, setChrome] = useState(true);
  const theme = useSyncExternalStore(subscribe, readTheme, () => "paper" as ReaderTheme);
  const font = useSyncExternalStore(subscribe, readFont, () => "md" as FontScale);
  const chapter = novel.chapters.find((item) => item.id === chapterId) ?? novel.chapters[0];
  const { prev, next, index } = adjacentChapters(novel, chapter.id);

  const persist = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    saveProgress({
      novelSlug: novel.slug,
      chapterId: chapter.id,
      scrollRatio: scrollRatioFromElement(scroller),
      updatedAt: Date.now(),
    });
  }, [novel.slug, chapter.id]);

  useEffect(() => {
    restoredRef.current = false;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const entry = readStore().novels[novel.slug];
    const ratio = entry?.chapterId === chapter.id ? entry.scrollRatio : 0;

    const restore = () => {
      const el = scrollerRef.current;
      if (!el || restoredRef.current) return;
      if (ratio > 0 && el.scrollHeight <= el.clientHeight) return;
      el.scrollTop = scrollTopFromRatio(el, ratio);
      restoredRef.current = true;
    };

    requestAnimationFrame(restore);
    const timeout = window.setTimeout(restore, 120);
    const observer = new ResizeObserver(() => restore());
    observer.observe(scroller);
    saveProgress({
      novelSlug: novel.slug,
      chapterId: chapter.id,
      scrollRatio: ratio,
      updatedAt: Date.now(),
    });
    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [novel.slug, chapter.id]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(persist);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
      window.cancelAnimationFrame(frame);
      persist();
    };
  }, [persist]);

  const go = (id: string) => {
    persist();
    router.push(`/n/${novel.slug}/${id}`);
  };

  return (
    <div className={`reader reader-${theme} reader-font-${font}`} data-testid="reader-shell">
      {chrome ? (
        <header className="reader-chrome">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Link href={`/n/${novel.slug}`} className="truncate text-sm opacity-80">
              {novel.title[locale]}
            </Link>
            <div className="flex items-center gap-2 text-xs">
              <button type="button" onClick={toggleLocale} className="reader-chip">
                {t("language")}
              </button>
              {themes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`reader-chip ${theme === item ? "is-active" : ""}`}
                  onClick={() => {
                    window.localStorage.setItem(THEME_KEY, item);
                    emit();
                  }}
                >
                  {item === "night" ? t("themeNight") : item === "warm" ? t("themeWarm") : t("themePaper")}
                </button>
              ))}
              <label className="reader-chip">
                {t("font")}
                <select
                  className="bg-transparent"
                  value={font}
                  onChange={(event) => {
                    window.localStorage.setItem(FONT_KEY, event.target.value);
                    emit();
                  }}
                >
                  <option value="sm">A-</option>
                  <option value="md">A</option>
                  <option value="lg">A+</option>
                </select>
              </label>
            </div>
          </div>
        </header>
      ) : null}

      <article
        ref={scrollerRef}
        data-testid="reader-article"
        className="reader-article"
        onClick={() => setChrome((value) => !value)}
      >
        <div className="mx-auto w-full max-w-2xl px-5 py-10">
          <p className="text-sm opacity-60">
            {t("chapter")} {index + 1} {t("of")} {novel.chapters.length}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-snug">{chapter.title[locale]}</h1>
          <div className="reader-body mt-8">
            {chapter.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph[locale]}</p>
            ))}
          </div>
          <nav className="mt-12 flex items-center justify-between gap-3 pb-16" onClick={(event) => event.stopPropagation()}>
            {prev ? (
              <button type="button" data-testid="prev-chapter" className="reader-nav" onClick={() => go(prev.id)}>
                {t("prev")}
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button type="button" data-testid="next-chapter" className="reader-nav" onClick={() => go(next.id)}>
                {t("next")}
              </button>
            ) : (
              <Link href={`/n/${novel.slug}`} className="reader-nav">
                {t("chapters")}
              </Link>
            )}
          </nav>
        </div>
      </article>
    </div>
  );
}
