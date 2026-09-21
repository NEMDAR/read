export type Locale = "ar" | "en";

export type Localized = {
  ar: string;
  en: string;
};

export type Chapter = {
  id: string;
  title: Localized;
  paragraphs: Localized[];
};

export type Novel = {
  slug: string;
  title: Localized;
  author: Localized;
  synopsis: Localized;
  genre: Localized;
  cover: {
    background: string;
    accent: string;
    motif: "gate" | "orchid" | "moon";
  };
  chapters: Chapter[];
};

export type NovelProgress = {
  novelSlug: string;
  chapterId: string;
  scrollRatio: number;
  updatedAt: number;
};

export type ProgressStore = {
  last: NovelProgress | null;
  novels: Record<string, NovelProgress>;
};

export type ReaderTheme = "night" | "warm" | "paper";
export type FontScale = "sm" | "md" | "lg";
