import { db } from './index';
import { products, routines } from './schema';
import { PRODUCTS } from '../lib/products';
import { ROUTINES } from '../lib/routines';
async function main() {
  const d = db();
  await d.insert(products).values(PRODUCTS.map(({ reviews, related, ...p }) => p)).onConflictDoNothing();
  await d.insert(routines).values(ROUTINES.map((r, i) => ({ ...r, position: i }))).onConflictDoNothing();
  console.log('Seed OK'); process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
