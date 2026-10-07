import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { logActivity } from '@/lib/activity';
export const runtime = 'nodejs';
const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const D = /^\d{4}-\d{2}-\d{2}$/;
export async function GET(req: Request) {
  const s = await getSession(); if (!s || s.role !== 'admin') return new Response('Forbidden', { status: 403 });
  const q = new URL(req.url).searchParams, from = q.get('from') ?? '', to = q.get('to') ?? '', st = q.get('status') ?? '';
  const w = [from && D.test(from) && gte(orders.createdAt, new Date(`${from}T00:00:00+01:00`)), to && D.test(to) && lte(orders.createdAt, new Date(`${to}T23:59:59.999+01:00`)), st && eq(orders.status, st)].filter(Boolean) as ReturnType<typeof eq>[];
  const rows = await db().select().from(orders).where(w.length ? and(...w) : undefined).orderBy(desc(orders.createdAt)).limit(20000);
  const head = ['Référence', 'Date (Douala)', 'Statut', 'Client', 'Téléphone', 'Ville', 'Note', 'Articles', 'Total FCFA (hors livraison)'];
  const lines = rows.map(o => [o.ref, o.createdAt.toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }), o.status, o.customerName, o.phone.replace(/\D/g, ''), o.city, o.note, o.items.map(i => `${i.qty} × ${i.name}`).join(' | '), o.total].map(cell).join(';'));
  await logActivity('commande', `Export CSV (${rows.length} commandes)`);
  return new Response('\uFEFF' + [head.map(cell).join(';'), ...lines].join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="commandes-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
