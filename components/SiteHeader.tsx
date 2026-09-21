"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

export function SiteHeader() {
  const { t, toggleLocale, locale } = useLanguage();
  const pathname = usePathname();
  const inReader = /\/n\/[^/]+\/[^/]+$/.test(pathname);

  if (inReader) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:var(--paper)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="mark" />
          <span>{t("brand")}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className={`rounded-full px-3 py-1.5 ${pathname === "/" ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "hover:bg-black/5"}`}
          >
            {t("catalog")}
          </Link>
          <Link
            href="/library"
            data-testid="library-link"
            className={`rounded-full px-3 py-1.5 ${pathname.startsWith("/library") ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "hover:bg-black/5"}`}
          >
            {t("library")}
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-full border border-[color:var(--line)] px-3 py-1.5 hover:bg-black/5"
            aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {t("language")}
          </button>
        </nav>
      </div>
    </header>
  );
}
