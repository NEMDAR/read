import { novels as bundled } from "@/content";
import type { Novel } from "./types";

export const IMPORTED_KEY = "hikaya.imported.v1";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeImported(listener: () => void) {
  const wrapped = () => {
    cachedRaw = undefined;
    listener();
  };
  listeners.add(wrapped);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", wrapped);
  }
  return () => {
    listeners.delete(wrapped);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", wrapped);
    }
  };
}

const EMPTY: Novel[] = [];
let cachedRaw: string | null | undefined;
let cached: Novel[] = EMPTY;

export function readImported(): Novel[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(IMPORTED_KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    if (!raw) {
      cached = EMPTY;
      return cached;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      cached = EMPTY;
      return cached;
    }
    cached = parsed.filter((item): item is Novel =>
      Boolean(item && typeof item === "object" && "slug" in item && "chapters" in item),
    );
    return cached;
  } catch {
    cached = EMPTY;
    return cached;
  }
}

function uniqueSlug(slug: string, existing: Set<string>): string {
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
}

export function addImported(novels: Novel[]): Novel[] {
  const current = readImported();
  const taken = new Set([...bundled, ...current].map((novel) => novel.slug));
  const added: Novel[] = [];
  for (const novel of novels) {
    const slug = uniqueSlug(novel.slug, taken);
    taken.add(slug);
    added.push({ ...novel, slug, imported: true });
  }
  const next = [...added, ...current];
  window.localStorage.setItem(IMPORTED_KEY, JSON.stringify(next));
  cachedRaw = undefined;
  emit();
  return added;
}

export function removeImported(slug: string): void {
  const next = readImported().filter((novel) => novel.slug !== slug);
  window.localStorage.setItem(IMPORTED_KEY, JSON.stringify(next));
  cachedRaw = undefined;
  emit();
}

export function allNovels(): Novel[] {
  const imported = readImported();
  const importedSlugs = new Set(imported.map((novel) => novel.slug));
  return [...imported, ...bundled.filter((novel) => !importedSlugs.has(novel.slug))];
}

export function findNovel(slug: string): Novel | undefined {
  return allNovels().find((novel) => novel.slug === slug);
}
