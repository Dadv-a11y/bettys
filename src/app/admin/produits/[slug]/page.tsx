import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getProduct } from '@/lib/repo';
import { CATEGORIES } from '@/lib/products';
import { saveProduct } from '../../actions';
import ImageField from '@/components/ImageField';
export const dynamic = 'force-dynamic';
export default async function Edit({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin(); const { slug } = await params; const isNew = slug === 'nouveau';
  const p = isNew ? undefined : await getProduct(slug); if (!isNew && !p) notFound();
  const F = (label: string, name: string, v: string | number | undefined, o: { area?: boolean; ro?: boolean; req?: boolean; type?: string } = {}) => (
    <label className="fl">{label}{o.area ? <textarea name={name} defaultValue={v} rows={3}/> : <input name={name} type={o.type ?? 'text'} defaultValue={v} readOnly={o.ro} required={o.req}/>}</label>);
  return (<div style={{maxWidth:640,padding:'24px 0 60px'}}><p><Link href="/admin/produits">← Produits</Link></p><h1 style={{fontSize:'2rem'}}>{isNew ? 'Nouveau produit' : p!.name}</h1>
    <form action={saveProduct} className="of">
      {F('Slug (URL)','slug',p?.slug,{ro:!isNew,req:true})}{F('Nom','name',p?.name,{req:true})}{F('Prix (FCFA)','price',p?.price,{req:true,type:'number'})}{F('Ancien prix (FCFA)','oldPrice',p?.oldPrice,{type:'number'})}
      {F('Description','description',p?.description,{area:true})}
      <label className="fl">Catégorie<select name="category" defaultValue={p?.category ?? 'visage'}>{CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.fr}</option>)}</select></label>
      {F('Type','type',p?.type)}{F('Zone (Visage, Corps…)','zone',p?.zone)}{F('Besoins (séparés par des virgules)','needs',p?.needs.join(', '))}{F('Types de peau (virgules)','skinTypes',p?.skinTypes.join(', '))}
      <ImageField initial={p?.images ?? []}/>{F('Ingrédients','ingredients',p?.ingredients,{area:true})}{F('Mode d’emploi','usage',p?.usage,{area:true})}{F('Précautions','precautions',p?.precautions,{area:true})}
      {F('Badge (Bestseller, Nouveau…)','badge',p?.badge)}
      <label style={{display:'flex',gap:8,minHeight:44,alignItems:'center'}}><input type="checkbox" name="inStock" defaultChecked={p?.inStock ?? true}/> En stock</label>
      <button className="btn">Enregistrer</button></form></div>);
}
