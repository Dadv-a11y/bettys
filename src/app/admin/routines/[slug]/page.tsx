import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { routines } from '@/db/schema';
import { listProducts } from '@/lib/repo';
import { fcfa } from '@/lib/products';
import { saveRoutine } from '../../actions';
export const dynamic = 'force-dynamic';
export default async function EditRoutine({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin(); const { slug } = await params; const isNew = slug === 'nouveau';
  const [r] = isNew ? [] : await db().select().from(routines).where(eq(routines.slug, slug)); if (!isNew && !r) notFound();
  const ps = await listProducts();
  return (<div style={{maxWidth:640,padding:'24px 0 60px'}}><p><Link href="/admin/routines">← Routines</Link></p><h1 style={{fontSize:'2rem'}}>{isNew ? 'Nouvelle routine' : r.name}</h1>
    <form action={saveRoutine} className="of">
      <label className="fl">Slug (URL)<input name="slug" defaultValue={r?.slug} readOnly={!isNew} required/></label>
      <label className="fl">Nom<input name="name" defaultValue={r?.name} required/></label>
      <label className="fl">Étapes (ex. Nettoyer → Exfolier → Hydrater)<input name="steps" defaultValue={r?.steps}/></label>
      <fieldset style={{border:'1px solid var(--line)',padding:'8px 14px'}}><legend>Produits inclus</legend>{ps.map(p => <label key={p.slug} style={{display:'flex',gap:8,minHeight:40,alignItems:'center'}}><input type="checkbox" name="products" value={p.slug} defaultChecked={r?.productSlugs.includes(p.slug)}/>{p.name} — {fcfa(p.price)}</label>)}</fieldset>
      <label className="fl">Économie sur le total (FCFA, 0 = aucune)<input type="number" name="saving" min={0} defaultValue={r?.saving ?? 0}/></label>
      <label className="fl">Position (ordre d’affichage)<input type="number" name="position" defaultValue={r?.position ?? 0}/></label>
      <button className="btn">Enregistrer</button></form></div>);
}
