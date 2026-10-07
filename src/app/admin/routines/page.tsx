import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { hasDb } from "@/db";
import { listRoutines } from '@/lib/repo';
import { fcfa } from '@/lib/products';
import ConfirmButton from '@/components/ConfirmButton';
import { deleteRoutine } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Routines() {
  const me = await requireAdmin(); if (!hasDb) return <p>DATABASE_URL requis.</p>;
  const rs = await listRoutines();
  return (<div style={{padding:'24px 0 60px'}}><div className="tools"><h1 style={{fontSize:'2rem',marginRight:'auto'}}>Routines</h1><Link className="btn" href="/admin/routines/nouveau">Ajouter une routine</Link></div>
    <table><thead><tr><th>Routine</th><th>Produits</th><th>Total</th><th></th></tr></thead><tbody>{rs.map(r => (<tr key={r.slug}><td><b>{r.name}</b><br/><small>{r.steps}</small></td><td>{r.items.map(i => i.name).join(', ')}</td>
      <td>{fcfa(r.total)}{r.saving > 0 && <><br/><small>économie {fcfa(r.saving)}</small></>}</td>
      <td style={{whiteSpace:'nowrap'}}><Link href={`/admin/routines/${r.slug}`}>Modifier</Link>{me.role === 'admin' && <>{' · '}<form action={deleteRoutine} style={{display:'inline'}}><input type="hidden" name="slug" value={r.slug}/><ConfirmButton className="chip" message={`Supprimer « ${r.name} » ?`}>Supprimer</ConfirmButton></form></>}</td></tr>))}</tbody></table>
    {!rs.length && <p>Aucune routine.</p>}</div>);
}
