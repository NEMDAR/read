import type { Metadata } from "next";
import { Amiri, IBM_Plex_Sans_Arabic, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const ui = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});

const display = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

const reading = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-reading",
});

export const metadata: Metadata = {
  title: "حكايا",
  description: "قارئ روايات عربي بفصول متتابعة وحفظ موضع القراءة. قصص أصلية مرخّصة داخل التطبيق.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${ui.variable} ${display.variable} ${reading.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
