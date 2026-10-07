import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Shop from '@/components/Shop';
import { CATEGORIES, Category } from '@/lib/products';
import { listByCategory } from '@/lib/repo';
export const revalidate = 3600;
import { Lang, LOCALES } from '@/lib/i18n';
export const generateStaticParams = () => LOCALES.flatMap(lang => CATEGORIES.map(c => ({ lang, categorie: c.slug })));
export async function generateMetadata({ params }: { params: Promise<{ lang: string; categorie: string }> }): Promise<Metadata> {
  const { lang: l, categorie } = await params; const lang = l as Lang; const c = CATEGORIES.find(x => x.slug === categorie); if (!c) return {};
  return { title:c[lang], description:`${c[lang]} — Betty’s Cosmetics, Douala.`, alternates:{ canonical:`/${lang}/${categorie}`, languages:{ fr:`/fr/${categorie}`, en:`/en/${categorie}` } } };
}
export default async function Page({ params }: { params: Promise<{ lang: string; categorie: string }> }) {
  const { lang: l, categorie } = await params; const lang = l as Lang; const c = CATEGORIES.find(x => x.slug === categorie); if (!c) notFound();
  return (<main className="wrap" style={{paddingTop:34}}><h1 style={{fontSize:'3rem',marginBottom:20}}>{c[lang]}</h1><Shop products={await listByCategory(categorie as Category)} lang={lang}/></main>);
}
