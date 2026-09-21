import type { Novel, NovelProgress, ProgressStore } from "./types";

export const STORAGE_KEY = "hikaya.progress.v1";

export const emptyStore: ProgressStore = {
  last: null,
  novels: {},
};

export function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function progressPercent(
  chapterIndex: number,
  chapterCount: number,
  scrollRatio: number,
): number {
  if (chapterCount <= 0) return 0;
  const index = Math.min(Math.max(chapterIndex, 0), chapterCount - 1);
  const ratio = clampRatio(scrollRatio);
  const raw = ((index + ratio) / chapterCount) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function chapterIndexOf(novel: Novel, chapterId: string): number {
  const index = novel.chapters.findIndex((chapter) => chapter.id === chapterId);
  return index < 0 ? 0 : index;
}

export function percentForNovel(novel: Novel, progress: NovelProgress): number {
  return progressPercent(
    chapterIndexOf(novel, progress.chapterId),
    novel.chapters.length,
    progress.scrollRatio,
  );
}

export function readStore(): ProgressStore {
  if (typeof window === "undefined") return emptyStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore;
    const parsed = JSON.parse(raw) as ProgressStore;
    if (!parsed || typeof parsed !== "object") return emptyStore;
    return {
      last: parsed.last ?? null,
      novels: parsed.novels ?? {},
    };
  } catch {
    return emptyStore;
  }
}

export function writeStore(store: ProgressStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveProgress(progress: NovelProgress): ProgressStore {
  const store = readStore();
  const next: ProgressStore = {
    last: progress,
    novels: {
      ...store.novels,
      [progress.novelSlug]: progress,
    },
  };
  writeStore(next);
  return next;
}

export function scrollRatioFromElement(element: HTMLElement): number {
  const max = element.scrollHeight - element.clientHeight;
  if (max <= 0) return 1;
  return clampRatio(element.scrollTop / max);
}

export function scrollTopFromRatio(element: HTMLElement, ratio: number): number {
  const max = Math.max(0, element.scrollHeight - element.clientHeight);
  return Math.round(max * clampRatio(ratio));
}
