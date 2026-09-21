"use client";

import { LanguageProvider } from "./LanguageProvider";
import { SiteHeader } from "./SiteHeader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </LanguageProvider>
  );
}
