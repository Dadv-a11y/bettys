import { eq, inArray, asc } from 'drizzle-orm';
import { db, hasDb } from '@/db';
import { products, routines } from '@/db/schema';
import { PRODUCTS, inCategory, Product, Category } from './products';
import { ROUTINES, Routine } from './routines';
const toProduct = (r: typeof products.$inferSelect): Product => ({
  slug:r.slug, name:r.name, price:r.price, oldPrice:r.oldPrice ?? undefined, description:r.description, images:r.images,
  category:r.category as Category, type:r.type, needs:r.needs, skinTypes:r.skinTypes, zone:r.zone,
  ingredients:r.ingredients ?? undefined, usage:r.usage ?? undefined, precautions:r.precautions ?? undefined,
  inStock:r.inStock, badge:r.badge ?? undefined, reviews:[], related:[],
});
export async function listProducts(): Promise<Product[]> {
  if (!hasDb) return PRODUCTS;
  return (await db().select().from(products).orderBy(asc(products.id))).map(toProduct);
}
export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!hasDb) return PRODUCTS.find(p => p.slug === slug);
  const [r] = await db().select().from(products).where(eq(products.slug, slug)).limit(1);
  return r && toProduct(r);
}
export async function listByCategory(c: Category): Promise<Product[]> {
  if (!hasDb) return inCategory(c);
  const all = await listProducts();
  return all.filter(p => p.category === c || (c === 'visage' && /Visage/.test(p.zone)));
}
export async function listRoutines(): Promise<(Routine & { items: Product[]; total: number })[]> {
  const rs: Routine[] = hasDb ? (await db().select().from(routines).orderBy(asc(routines.position))).map(r => ({ slug:r.slug, name:r.name, steps:r.steps, productSlugs:r.productSlugs, saving:r.saving })) : ROUTINES;
  const slugs = [...new Set(rs.flatMap(r => r.productSlugs))];
  const ps = hasDb ? (await db().select().from(products).where(inArray(products.slug, slugs))).map(toProduct) : PRODUCTS;
  return rs.map(r => { const items = r.productSlugs.map(s => ps.find(p => p.slug === s)).filter((p): p is Product => !!p);
    return { ...r, items, total: items.reduce((a, p) => a + p.price, 0) - r.saving }; });
}
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!hasDb) return PRODUCTS.filter(p => slugs.includes(p.slug));
  return (await db().select().from(products).where(inArray(products.slug, slugs))).map(toProduct);
}
