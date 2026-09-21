import { ChapterLoader } from "@/components/ChapterLoader";
import { getChapter, getNovel, novels } from "@/content";

export const dynamicParams = true;

export function generateStaticParams() {
  return novels.flatMap((novel) =>
    novel.chapters.map((chapter) => ({ slug: novel.slug, chapter: chapter.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const novel = getNovel(slug);
  const current = novel ? getChapter(novel, chapter) : undefined;
  if (!novel || !current) return { title: "حكايا" };
  return { title: `${current.title.ar} | ${novel.title.ar}` };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const novel = getNovel(slug);
  const bundled = novel && getChapter(novel, chapter) ? novel : undefined;
  return <ChapterLoader slug={slug} chapterId={chapter} bundled={bundled} />;
}
