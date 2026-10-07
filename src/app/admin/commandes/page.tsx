import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { db, hasDb } from '@/db';
import { orders } from '@/db/schema';
import { fcfa } from '@/lib/products';
import { setOrderStatus } from '../actions';
export const dynamic = 'force-dynamic';
const STATUS = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'];
export default async function Orders() {
  const me = await requireAdmin(); if (!hasDb) return <p>DATABASE_URL requis.</p>;
  const rows = await db().select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  return (<div style={{padding:'24px 0 60px'}}><p><Link href="/admin">← Tableau de bord</Link></p><h1 style={{fontSize:'2rem'}}>Commandes</h1>
    {me.role === 'admin' && <form action="/admin/commandes/export" className="tools"><label className="fl">Du<input type="date" name="from"/></label><label className="fl">Au<input type="date" name="to"/></label><label className="fl">Statut<select name="status"><option value="">Tous</option>{STATUS.map(x=><option key={x}>{x}</option>)}</select></label><button className="btn o" style={{alignSelf:'end'}}>Exporter en CSV</button></form>}
    <table><thead><tr><th>Réf.</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead><tbody>{rows.map(o=>(<tr key={o.id}>
      <td>{o.ref}<br/><small>{o.createdAt.toLocaleString('fr-FR')}</small></td>
      <td>{o.customerName}<br/><a href={`https://wa.me/${o.phone.replace(/\D/g,'')}`}>{o.phone}</a><br/><small>{o.city}{o.note ? ` — ${o.note}` : ''}</small></td>
      <td>{o.items.map(i=>`${i.qty} × ${i.name}`).join(', ')}</td><td>{fcfa(o.total)}</td>
      <td><form action={setOrderStatus}><input type="hidden" name="id" value={o.id}/><select name="status" defaultValue={o.status}>{STATUS.map(s=><option key={s}>{s}</option>)}</select> <button className="chip">OK</button></form></td></tr>))}</tbody></table>
    {!rows.length && <p>Aucune commande pour le moment.</p>}</div>);
}
