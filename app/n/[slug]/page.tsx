import { NovelLoader } from "@/components/NovelLoader";
import { getNovel, novels } from "@/content";

export const dynamicParams = true;

export function generateStaticParams() {
  return novels.map((novel) => ({ slug: novel.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const novel = getNovel(slug);
  if (!novel) return { title: "حكايا" };
  return { title: `${novel.title.ar} | حكايا` };
}

export default async function NovelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NovelLoader slug={slug} bundled={getNovel(slug)} />;
}
