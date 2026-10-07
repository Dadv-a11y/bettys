import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { listProducts } from '@/lib/repo';
import { hasDb } from '@/db';
import { CATEGORIES, fcfa } from '@/lib/products';
import ConfirmButton from '@/components/ConfirmButton';
import { updatePrice, toggleStock, deleteProduct } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const me = await requireAdmin(); if (!hasDb) return <p>DATABASE_URL requis.</p>;
  const { q = '', cat = '' } = await searchParams;
  const ps = (await listProducts()).filter(p => (!cat || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (<div style={{padding:'24px 0 60px'}}><div className="tools"><h1 style={{fontSize:'2rem',marginRight:'auto'}}>Produits ({ps.length})</h1><Link className="btn" href="/admin/produits/nouveau">Ajouter un produit</Link></div>
    <form className="tools"><input name="q" defaultValue={q} placeholder="Rechercher…" aria-label="Rechercher" style={{border:'1px solid var(--line)',padding:'10px 12px',minHeight:44}}/>
      <select name="cat" defaultValue={cat} aria-label="Catégorie"><option value="">Toutes les catégories</option>{CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.fr}</option>)}</select><button className="fb">Filtrer</button></form>
    <table><thead><tr><th>Produit</th><th>Catégorie</th><th>Prix (FCFA)</th><th>Stock</th><th></th></tr></thead><tbody>{ps.map(p => (<tr key={p.slug}>
      <td><b>{p.name}</b>{p.badge && <> <span className="chip">{p.badge}</span></>}<br/><small>{p.slug}</small></td><td>{p.category}</td>
      <td><form action={updatePrice} style={{display:'flex',gap:6}}><input type="hidden" name="slug" value={p.slug}/><input type="number" name="price" defaultValue={p.price} min={0} aria-label={`Prix ${p.name}`} style={{width:110,border:'1px solid var(--line)',padding:8}}/><button className="chip">OK</button></form><small>{fcfa(p.price)}</small></td>
      <td><form action={toggleStock}><input type="hidden" name="slug" value={p.slug}/><input type="hidden" name="to" value={p.inStock ? '0' : '1'}/><button className="chip">{p.inStock ? 'En stock ✓' : 'Rupture'}</button></form></td>
      <td style={{whiteSpace:'nowrap'}}><Link href={`/admin/produits/${p.slug}`}>Modifier</Link>{me.role === 'admin' && <>{' · '}<form action={deleteProduct} style={{display:'inline'}}><input type="hidden" name="slug" value={p.slug}/><ConfirmButton className="chip" message={`Supprimer « ${p.name} » ? Les routines qui l’utilisent l’ignoreront.`}>Supprimer</ConfirmButton></form></>}</td></tr>))}</tbody></table>
    {!ps.length && <p>Aucun produit ne correspond.</p>}</div>);
}
