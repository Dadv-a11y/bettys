import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, hasDb } from '@/db';
import { adminUsers } from '@/db/schema';
export type Session = { id: number; email: string; name: string; role: 'admin' | 'staff' };
const sign = (v: string) => createHmac('sha256', process.env.ADMIN_SECRET ?? '').update(v).digest('hex');
const safeEq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
export const adminConfigured = () => !!process.env.ADMIN_SECRET && hasDb;
export const checkBootstrap = (p: string) => !!process.env.ADMIN_PASSWORD && safeEq(sign('pw:' + p), sign('pw:' + process.env.ADMIN_PASSWORD));
export function hashPassword(pw: string) { const salt = randomBytes(16); return `s1$${salt.toString('hex')}$${scryptSync(pw, salt, 64).toString('hex')}`; }
export function verifyPassword(pw: string, stored: string) {
  const [v, salt, hash] = stored.split('$'); if (v !== 's1' || !salt || !hash) return false;
  return safeEq(scryptSync(pw, Buffer.from(salt, 'hex'), 64).toString('hex'), hash);
}
export async function startSession(id: number) {
  const exp = Date.now() + 8 * 3600e3, v = `${id}.${exp}`;
  (await cookies()).set('adm', `${v}.${sign(v)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/admin', maxAge: 8 * 3600 });
}
export const getSession = cache(async (): Promise<Session | null> => {
  if (!adminConfigured()) return null;
  const c = (await cookies()).get('adm')?.value; if (!c) return null;
  const [id, exp, sig] = c.split('.'); if (!id || !exp || !sig || !safeEq(sig, sign(`${id}.${exp}`)) || Number(exp) < Date.now()) return null;
  const [u] = await db().select().from(adminUsers).where(eq(adminUsers.id, Number(id))).limit(1);
  return u && u.active ? { id: u.id, email: u.email, name: u.name, role: u.role === 'admin' ? 'admin' : 'staff' } : null;   // désactiver un compte coupe l'accès immédiatement
});
export const isAdmin = async () => !!(await getSession());
export async function requireAdmin() { const s = await getSession(); if (!s) redirect('/admin'); return s; }
export async function requireOwner() { const s = await requireAdmin(); if (s.role !== 'admin') redirect('/admin'); return s; }
