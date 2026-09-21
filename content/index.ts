import { observatory } from "./observatory";
import { orchid } from "./orchid";
import { saqqayin } from "./saqqayin";
import type { Novel } from "../lib/types";

export const novels: Novel[] = [saqqayin, orchid, observatory];

export function getNovel(slug: string): Novel | undefined {
  return novels.find((novel) => novel.slug === slug);
}

export function getChapter(novel: Novel, chapterId: string) {
  return novel.chapters.find((chapter) => chapter.id === chapterId);
}

export function adjacentChapters(novel: Novel, chapterId: string) {
  const index = novel.chapters.findIndex((chapter) => chapter.id === chapterId);
  return {
    prev: index > 0 ? novel.chapters[index - 1] : undefined,
    next: index >= 0 && index < novel.chapters.length - 1 ? novel.chapters[index + 1] : undefined,
    index: index < 0 ? 0 : index,
  };
}

export function searchNovels(query: string): Novel[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return novels;
  return novels.filter((novel) => {
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
  });
}
