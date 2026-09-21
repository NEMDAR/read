import { novels as bundled } from "@/content";
import type { Novel } from "./types";

export const IMPORTED_KEY = "hikaya.imported.v1";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeImported(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function readImported(): Novel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(IMPORTED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Novel => Boolean(item && typeof item === "object" && "slug" in item && "chapters" in item));
  } catch {
    return [];
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
  emit();
  return added;
}

export function removeImported(slug: string): void {
  const next = readImported().filter((novel) => novel.slug !== slug);
  window.localStorage.setItem(IMPORTED_KEY, JSON.stringify(next));
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
