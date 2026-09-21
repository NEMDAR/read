import type { Locale } from "./types";

export const messages = {
  ar: {
    brand: "حكايا",
    tagline: "اقرأ فصولًا متتابعة، وتابع من حيث توقفت.",
    catalog: "الكتالوج",
    library: "مكتبتي",
    search: "ابحث عن رواية أو كاتب…",
    continue: "أكمل القراءة",
    continueFrom: "من حيث توقفت",
    chapters: "الفصول",
    chapter: "الفصل",
    next: "التالي",
    prev: "السابق",
    start: "ابدأ القراءة",
    resume: "استأنف",
    emptyLibrary: "مكتبتك فارغة حتى تبدأ رواية.",
    browseCatalog: "تصفح الكتالوج",
    progress: "التقدّم",
    originalNote: "قصص أصلية داخل التطبيق. لا ننسخ روايات من مواقع التجميع.",
    language: "English",
    themeNight: "ليل",
    themeWarm: "دافئ",
    themePaper: "ورق",
    font: "الخط",
    noResults: "لا توجد روايات مطابقة.",
    lastRead: "آخر قراءة",
    of: "من",
  },
  en: {
    brand: "Hikaya",
    tagline: "Read chapter after chapter, and pick up where you left off.",
    catalog: "Catalog",
    library: "Library",
    search: "Search a novel or author…",
    continue: "Continue reading",
    continueFrom: "Pick up where you left off",
    chapters: "Chapters",
    chapter: "Chapter",
    next: "Next",
    prev: "Previous",
    start: "Start reading",
    resume: "Resume",
    emptyLibrary: "Your library is empty until you open a novel.",
    browseCatalog: "Browse the catalog",
    progress: "Progress",
    originalNote:
      "Original stories bundled with the app. We do not copy novels from aggregator sites.",
    language: "العربية",
    themeNight: "Night",
    themeWarm: "Warm",
    themePaper: "Paper",
    font: "Type",
    noResults: "No matching novels.",
    lastRead: "Last read",
    of: "of",
  },
} as const;

export type MessageKey = keyof typeof messages.ar;

export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
