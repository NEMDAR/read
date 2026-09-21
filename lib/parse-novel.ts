import type { Chapter, Localized, Novel } from "./types";

const DEFAULT_COVERS: Novel["cover"][] = [
  { background: "#7a2e1f", accent: "#e7c38a", motif: "gate" },
  { background: "#1f4a3a", accent: "#d7b4d8", motif: "orchid" },
  { background: "#1b1830", accent: "#c45c48", motif: "moon" },
];

export type ParseResult =
  | { ok: true; novels: Novel[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function localized(value: unknown, fallback = ""): Localized {
  if (typeof value === "string" && value.trim()) {
    const text = value.trim();
    return { ar: text, en: text };
  }
  if (isRecord(value)) {
    const ar =
      (typeof value.ar === "string" && value.ar.trim()) ||
      (typeof value.arabic === "string" && value.arabic.trim()) ||
      "";
    const en =
      (typeof value.en === "string" && value.en.trim()) ||
      (typeof value.english === "string" && value.english.trim()) ||
      ar;
    if (ar || en) return { ar: ar || en, en: en || ar };
  }
  return { ar: fallback, en: fallback };
}

function slugify(input: string): string {
  const ascii = input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  if (ascii.length >= 2) return ascii;
  let hash = 0;
  for (const char of input) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `imported-${hash.toString(36) || "novel"}`;
}

const BLOCKED_HOSTS = new Set(["freewebnovel.com", "www.freewebnovel.com"]);

function hostFrom(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const text = value.trim().toLowerCase();
  try {
    const url = text.includes("://") ? new URL(text) : new URL(`https://${text}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return text.replace(/^www\./, "") || null;
  }
}

export function isBlockedSource(raw: unknown): boolean {
  if (!isRecord(raw)) return false;
  const suspects: unknown[] = [raw.source, raw.startUrl, raw.url];
  if (Array.isArray(raw.visitedUrls)) suspects.push(...raw.visitedUrls);
  if (Array.isArray(raw.pages)) {
    for (const page of raw.pages) {
      if (isRecord(page)) suspects.push(page.url, page.source);
    }
  }
  for (const suspect of suspects) {
    const host = hostFrom(suspect);
    if (host && BLOCKED_HOSTS.has(host)) return true;
    if (typeof suspect === "string" && /freewebnovel\.com/i.test(suspect)) return true;
  }
  return false;
}

function splitParagraphs(text: string): Localized[] {
  const doubled = text
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
  const parts =
    doubled.length >= 2 ? doubled : text.split(/\n+/g).map((part) => part.trim()).filter(Boolean);
  return parts.map((part) => ({ ar: part, en: part }));
}

function cleanChapterTitle(title: string, bookTitle: string): string {
  let cleaned = title.trim().replace(/\s*-\s*Free Web Novels?\s*$/i, "");
  if (bookTitle && cleaned.toLowerCase().startsWith(bookTitle.toLowerCase())) {
    cleaned = cleaned.slice(bookTitle.length).replace(/^\s*[-–:]\s*/, "");
  }
  return cleaned.trim() || title.trim();
}

function paragraphsFrom(chapter: Record<string, unknown>): Localized[] {
  const source =
    chapter.paragraphs ?? chapter.text ?? chapter.body ?? chapter.content ?? chapter.pages;
  if (typeof source === "string") return splitParagraphs(source);
  if (!Array.isArray(source)) return [];
  const out: Localized[] = [];
  for (const item of source) {
    if (typeof item === "string") out.push(...splitParagraphs(item));
    else if (isRecord(item) && typeof item.text === "string") out.push(...splitParagraphs(item.text));
    else {
      const loc = localized(item);
      if (loc.ar || loc.en) out.push(loc);
    }
  }
  return out.filter((item) => item.ar.trim() || item.en.trim());
}

function parseChapter(raw: unknown, index: number, bookTitle = ""): Chapter | null {
  if (typeof raw === "string") {
    const paragraphs = splitParagraphs(raw);
    if (paragraphs.length === 0) return null;
    return {
      id: String(index + 1),
      title: { ar: `الفصل ${index + 1}`, en: `Chapter ${index + 1}` },
      paragraphs,
    };
  }
  if (!isRecord(raw)) return null;
  const paragraphs = paragraphsFrom(raw);
  if (paragraphs.length === 0) return null;
  const id =
    (typeof raw.id === "string" && raw.id.trim()) ||
    (typeof raw.slug === "string" && raw.slug.trim()) ||
    (typeof raw.chapterNumber === "number" ? String(raw.chapterNumber) : "") ||
    (typeof raw.number === "number" ? String(raw.number) : "") ||
    String(index + 1);
  const rawTitle = localized(raw.title ?? raw.name, `الفصل ${index + 1}`);
  const cleaned = cleanChapterTitle(rawTitle.ar, bookTitle);
  return {
    id,
    title: { ar: cleaned, en: cleanChapterTitle(rawTitle.en, bookTitle) || cleaned },
    paragraphs,
  };
}

function parseCover(raw: unknown, index: number): Novel["cover"] {
  const fallback = DEFAULT_COVERS[index % DEFAULT_COVERS.length];
  if (!isRecord(raw)) return fallback;
  const motif = raw.motif === "gate" || raw.motif === "orchid" || raw.motif === "moon" ? raw.motif : fallback.motif;
  return {
    background: typeof raw.background === "string" ? raw.background : fallback.background,
    accent: typeof raw.accent === "string" ? raw.accent : fallback.accent,
    motif,
  };
}

export function parseOneNovel(raw: unknown, index = 0): Novel | null {
  if (!isRecord(raw)) return null;
  const title = localized(raw.title ?? raw.name);
  if (!title.ar && !title.en) return null;
  const chapterSource = Array.isArray(raw.chapters)
    ? raw.chapters
    : Array.isArray(raw.pages)
      ? raw.pages
      : Array.isArray(raw.stories)
        ? raw.stories
        : null;
  if (!chapterSource) return null;
  const chapters = chapterSource
    .map((chapter, chapterIndex) => parseChapter(chapter, chapterIndex, title.en || title.ar))
    .filter((chapter): chapter is Chapter => chapter !== null);
  if (chapters.length === 0) return null;
  const slugSource =
    (typeof raw.slug === "string" && raw.slug.trim()) ||
    (typeof raw.id === "string" && raw.id.trim()) ||
    title.en ||
    title.ar;
  return {
    slug: slugify(slugSource),
    title,
    author: localized(raw.author ?? raw.writer, "غير مسمى"),
    synopsis: localized(raw.synopsis ?? raw.description ?? raw.summary, title.ar),
    genre: localized(raw.genre ?? raw.category, "مستوردة"),
    cover: parseCover(raw.cover, index),
    chapters,
    imported: true,
  };
}

export function parseNovelJson(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "invalid-json" };
  }
  const candidates = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.novels)
      ? data.novels
      : isRecord(data) && Array.isArray(data.stories)
        ? data.stories
        : [data];
  if (candidates.some((item) => isBlockedSource(item))) {
    return { ok: false, error: "blocked-source" };
  }
  const novels = candidates
    .map((item, index) => parseOneNovel(item, index))
    .filter((item): item is Novel => item !== null);
  if (novels.length === 0) return { ok: false, error: "no-novels" };
  return { ok: true, novels };
}
