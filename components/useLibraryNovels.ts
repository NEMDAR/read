"use client";

import { useMemo, useSyncExternalStore } from "react";
import { novels as bundled } from "@/content";
import { readImported, subscribeImported } from "@/lib/imported";
import type { Novel } from "@/lib/types";

const EMPTY: Novel[] = [];

export function useLibraryNovels() {
  const imported = useSyncExternalStore(subscribeImported, readImported, () => EMPTY);
  const novels = useMemo(() => {
    const importedSlugs = new Set(imported.map((novel) => novel.slug));
    return [...imported, ...bundled.filter((novel) => !importedSlugs.has(novel.slug))];
  }, [imported]);

  return {
    novels,
    imported,
    find: (slug: string) => novels.find((novel) => novel.slug === slug),
  };
}
