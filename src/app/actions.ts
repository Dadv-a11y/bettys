'use server';
import { hasDb, db } from '@/db';
import { orders } from '@/db/schema';
import { getProductsBySlugs } from '@/lib/repo';
import { fcfa, waLink } from '@/lib/products';
import { logActivity } from '@/lib/activity';
type In = { items:{slug:string;qty:number}[]; name:string; phone:string; city:string; note?:string; hp?:string; lang:string };
export type OrderResult = { ok:true; ref:string; url:string; saved:boolean } | { ok:false; error:string };
export async function createOrder(i: In): Promise<OrderResult> {
  const fr = i.lang !== 'en'; const e = (a:string,b:string):OrderResult => ({ ok:false, error: fr ? a : b });
  if (i.hp) return e('Erreur.', 'Error.');
  const name = i.name?.trim().slice(0,100), phone = i.phone?.trim().slice(0,30), city = i.city?.trim().slice(0,120), note = i.note?.trim().slice(0,500) || null;
  if (!name || !city) return e('Nom et ville requis.', 'Name and city are required.');
  if (!/^[+\d][\d\s().-]{6,24}$/.test(phone ?? '')) return e('Numéro de téléphone invalide.', 'Invalid phone number.');
  if (!Array.isArray(i.items) || !i.items.length || i.items.length > 30) return e('Panier vide.', 'Empty cart.');
  const qty = new Map<string, number>();
  for (const l of i.items) { const q = Math.floor(l.qty); if (!(q >= 1 && q <= 99)) return e('Quantité invalide.', 'Invalid quantity.'); qty.set(l.slug, (qty.get(l.slug) ?? 0) + q); }
  // Les prix viennent toujours du serveur, jamais du navigateur.
  const ps = await getProductsBySlugs([...qty.keys()]);
  if (ps.length !== qty.size || ps.some(p => !p.inStock)) return e('Un produit n’est plus disponible.', 'A product is no longer available.');
  const items = ps.map(p => ({ slug:p.slug, name:p.name, price:p.price, qty:qty.get(p.slug)! }));
  const total = items.reduce((a, l) => a + l.price * l.qty, 0);
  const ref = 'BC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  let saved = false;
  if (hasDb) { try { await db().insert(orders).values({ ref, customerName:name, phone, city, note, items, total, lang: fr ? 'fr' : 'en' }); saved = true; await logActivity('commande', `Nouvelle commande ${ref} — ${fcfa(total)}`); } catch (err) { console.error('order insert failed', err); } }
  const text = `Bonjour Betty's Cosmetics, je souhaite commander (réf. ${ref}) :\n` + items.map(l => `- ${l.qty} × ${l.name} — ${fcfa(l.price * l.qty)}`).join('\n') + `\nTotal : ${fcfa(total)} (hors livraison)\nNom : ${name}\nTél : ${phone}\nVille : ${city}` + (note ? `\nNote : ${note}` : '');
  return { ok:true, ref, url: waLink(text), saved };
}
