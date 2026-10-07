import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/products';
import { listProducts } from '@/lib/repo';
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bettys-cosmetics.com'; const ps = await listProducts();
  return ['fr','en'].flatMap(l => [`/${l}`,`/${l}/boutique`,...CATEGORIES.map(c=>`/${l}/${c.slug}`),...ps.map(p=>`/${l}/produit/${p.slug}`)].map(u=>({url:s+u})));
}
