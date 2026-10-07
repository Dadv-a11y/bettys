'use client';
import Link from 'next/link';
import { Product, fcfa, thumb } from '@/lib/products';
import { useCart } from './Cart';
import { Lang, t } from '@/lib/i18n';
export default function ProductCard({ p, lang }: { p: Product; lang: Lang }) {
  const { add } = useCart();
  return (<div className="card"><Link href={`/${lang}/produit/${p.slug}`}><div className="im">{p.badge&&<span className="badge">{p.badge}</span>}
    {p.images[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumb(p.images[0])} alt={p.name} loading="lazy" width={480} height={600}/> : <div className="ph" role="img" aria-label={p.name}>Photo</div>}</div><h3>{p.name}</h3></Link>
    <div className="m">{p.needs[0]} • {p.zone}</div><div className="price">{fcfa(p.price)}</div>
    <button className="quick" onClick={()=>add({slug:p.slug,name:p.name,price:p.price})}>{t[lang].add}</button></div>);
}
