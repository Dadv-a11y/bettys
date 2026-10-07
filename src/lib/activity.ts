import 'server-only';
import { db, hasDb } from '@/db';
import { activityLog } from '@/db/schema';
import { getSession } from '@/lib/auth';
export async function logActivity(kind: 'commande' | 'produit' | 'routine' | 'compte', label: string) {
  if (!hasDb) return;
  try { const s = await getSession().catch(() => null); await db().insert(activityLog).values({ kind, label: (s ? `[${s.name}] ` : '') + label.slice(0, 180) }); } catch (e) { console.error('activity log failed', e); }
}
