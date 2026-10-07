'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { count, eq, inArray, ne, and } from 'drizzle-orm';
import { db } from '@/db';
import { products, orders, routines, adminUsers } from '@/db/schema';
import { checkBootstrap, hashPassword, verifyPassword, startSession, requireAdmin, requireOwner } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
const refresh = () => revalidatePath('/', 'layout');
const fails = new Map<string, { n: number; t: number }>();
export async function login(fd: FormData) {
  const email = String(fd.get('email') ?? '').trim().toLowerCase(), pw = String(fd.get('password') ?? '');
  const f = fails.get(email); if (f && f.n >= 5 && Date.now() - f.t < 15 * 60e3) redirect('/admin?err=2');
  const d = db(); const [{ n }] = await d.select({ n: count() }).from(adminUsers);
  let [user] = await d.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (n === 0 && email && checkBootstrap(pw)) {   // premier compte : ADMIN_PASSWORD sert une seule fois à créer l'administrateur
    [user] = await d.insert(adminUsers).values({ email, name: email.split('@')[0], role: 'admin', passwordHash: hashPassword(pw) }).returning();
  } else if (!user || !user.active || !verifyPassword(pw, user.passwordHash)) {
    fails.set(email, { n: (f?.n ?? 0) + 1, t: Date.now() }); redirect('/admin?err=1');
  }
  fails.delete(email); await startSession(user.id); redirect('/admin');
}
export async function logout() { (await cookies()).delete({ name:'adm', path:'/admin' }); redirect('/admin'); }
const list = (v: FormDataEntryValue | null, sep: RegExp) => String(v ?? '').split(sep).map(s => s.trim()).filter(Boolean);
const opt = (v: FormDataEntryValue | null) => String(v ?? '').trim() || null;
const slugOf = (v: FormDataEntryValue | null) => { const s = String(v ?? '').trim().toLowerCase(); if (!/^[a-z0-9-]{2,80}$/.test(s)) throw new Error('Slug invalide (a-z, 0-9, tirets)'); return s; };
const money = (v: FormDataEntryValue | null) => { const n = Math.round(Number(v)); if (!(n >= 0)) throw new Error('Montant invalide'); return n; };

export async function saveProduct(fd: FormData) {
  await requireAdmin(); const slug = slugOf(fd.get('slug')); const old = opt(fd.get('oldPrice'));
  const v = { slug, name:String(fd.get('name') ?? '').trim(), price:money(fd.get('price')), oldPrice: old ? money(old) : null, description:String(fd.get('description') ?? '').trim(),
    images:list(fd.get('images'), /\n/), category:String(fd.get('category')), type:String(fd.get('type') ?? '').trim(), zone:String(fd.get('zone') ?? '').trim(),
    needs:list(fd.get('needs'), /,/), skinTypes:list(fd.get('skinTypes'), /,/), ingredients:opt(fd.get('ingredients')), usage:opt(fd.get('usage')), precautions:opt(fd.get('precautions')),
    badge:opt(fd.get('badge')), inStock: fd.get('inStock') === 'on' };
  if (!v.name) throw new Error('Nom requis');
  await db().insert(products).values(v).onConflictDoUpdate({ target: products.slug, set: v });
  await logActivity('produit', `Produit enregistré : ${v.name}`); refresh(); redirect('/admin/produits');
}
export async function updatePrice(fd: FormData) {
  await requireAdmin(); const slug = slugOf(fd.get('slug')); const price = money(fd.get('price'));
  await db().update(products).set({ price }).where(eq(products.slug, slug));
  await logActivity('produit', `Prix modifié : ${slug} → ${price} FCFA`); refresh();
}
export async function toggleStock(fd: FormData) {
  await requireAdmin(); const slug = slugOf(fd.get('slug')); const inStock = fd.get('to') === '1';
  await db().update(products).set({ inStock }).where(eq(products.slug, slug));
  await logActivity('produit', `${slug} : ${inStock ? 'remis en stock' : 'marqué en rupture'}`); refresh();
}
export async function deleteProduct(fd: FormData) {
  await requireOwner(); const slug = slugOf(fd.get('slug'));
  await db().delete(products).where(eq(products.slug, slug));
  await logActivity('produit', `Produit supprimé : ${slug}`); refresh();
}
export async function saveRoutine(fd: FormData) {
  await requireAdmin(); const slug = slugOf(fd.get('slug')); const slugs = fd.getAll('products').map(String);
  const name = String(fd.get('name') ?? '').trim(); if (!name) throw new Error('Nom requis'); if (!slugs.length) throw new Error('Choisissez au moins un produit');
  const saving = money(fd.get('saving') || '0');
  const ps = await db().select().from(products).where(inArray(products.slug, slugs));
  if (saving > ps.reduce((a, p) => a + p.price, 0)) throw new Error('L’économie dépasse le total des produits');
  const v = { slug, name, steps:String(fd.get('steps') ?? '').trim(), productSlugs:slugs, saving, position:Math.round(Number(fd.get('position') || 0)) };
  await db().insert(routines).values(v).onConflictDoUpdate({ target: routines.slug, set: v });
  await logActivity('routine', `Routine enregistrée : ${name}`); refresh(); redirect('/admin/routines');
}
export async function deleteRoutine(fd: FormData) {
  await requireOwner(); const slug = slugOf(fd.get('slug'));
  await db().delete(routines).where(eq(routines.slug, slug)); await logActivity('routine', `Routine supprimée : ${slug}`); refresh();
}
export async function setOrderStatus(fd: FormData) {
  await requireAdmin(); const status = String(fd.get('status'));
  const [o] = await db().update(orders).set({ status }).where(eq(orders.id, Number(fd.get('id')))).returning({ ref: orders.ref });
  if (o) await logActivity('commande', `Commande ${o.ref} → ${status}`); revalidatePath('/admin', 'layout');
}

const pwd = (v: FormDataEntryValue | null) => { const p = String(v ?? ''); if (p.length < 10) throw new Error('Mot de passe : 10 caractères minimum'); return p; };
export async function createUser(fd: FormData) {
  await requireOwner(); const email = String(fd.get('email') ?? '').trim().toLowerCase(), name = String(fd.get('name') ?? '').trim(); const role = fd.get('role') === 'admin' ? 'admin' : 'staff';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) throw new Error('Nom et e-mail valides requis');
  try { await db().insert(adminUsers).values({ email, name, role, passwordHash: hashPassword(pwd(fd.get('password'))) }); } catch (e) { if (String(e).includes('unique') || String(e).includes('duplicate')) throw new Error('E-mail déjà utilisé'); throw e; }
  await logActivity('compte', `Compte créé : ${email} (${role})`); revalidatePath('/admin/utilisateurs');
}
export async function setUserActive(fd: FormData) {
  const me = await requireOwner(); const id = Number(fd.get('id')), active = fd.get('to') === '1';
  if (id === me.id) throw new Error('Vous ne pouvez pas désactiver votre propre compte');
  const others = await db().select({ n: count() }).from(adminUsers).where(and(eq(adminUsers.role, 'admin'), eq(adminUsers.active, true), ne(adminUsers.id, id)));
  const [u] = await db().select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!active && u?.role === 'admin' && others[0].n === 0) throw new Error('Il doit rester un administrateur actif');
  await db().update(adminUsers).set({ active }).where(eq(adminUsers.id, id));
  await logActivity('compte', `Compte ${u?.email} ${active ? 'réactivé' : 'désactivé'}`); revalidatePath('/admin/utilisateurs');
}
export async function resetPassword(fd: FormData) {
  await requireOwner(); const id = Number(fd.get('id'));
  const [u] = await db().update(adminUsers).set({ passwordHash: hashPassword(pwd(fd.get('password'))) }).where(eq(adminUsers.id, id)).returning({ email: adminUsers.email });
  await logActivity('compte', `Mot de passe réinitialisé : ${u?.email}`); revalidatePath('/admin/utilisateurs');
}
export async function changePassword(fd: FormData) {
  const me = await requireAdmin(); const [u] = await db().select().from(adminUsers).where(eq(adminUsers.id, me.id));
  if (!u || !verifyPassword(String(fd.get('current') ?? ''), u.passwordHash)) throw new Error('Mot de passe actuel incorrect');
  await db().update(adminUsers).set({ passwordHash: hashPassword(pwd(fd.get('next'))) }).where(eq(adminUsers.id, me.id));
  await logActivity('compte', 'Mot de passe modifié'); redirect('/admin');
}
