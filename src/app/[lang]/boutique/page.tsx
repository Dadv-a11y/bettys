import type { Metadata } from 'next';
import Shop from '@/components/Shop';
import { listProducts } from '@/lib/repo';
import { Lang } from '@/lib/i18n';
export const metadata: Metadata = { title:'Boutique', description:'Tous les soins Betty’s Cosmetics : visage, corps, savons, gommages, packs.' };
export default async function Page({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ need?: string }> }) {
  const { lang: l } = await params; const lang = l as Lang; const { need } = await searchParams; const PRODUCTS = await listProducts();
  return (<main className="wrap" style={{paddingTop:34}}><h1 style={{fontSize:'3rem',marginBottom:20}}>Boutique</h1><Shop products={PRODUCTS} lang={lang} initialNeed={need}/></main>);
}
