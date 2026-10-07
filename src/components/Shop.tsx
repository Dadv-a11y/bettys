'use client';
import { useState, useMemo } from 'react';
import { Product, NEEDS, fcfa } from '@/lib/products';
import ProductCard from './ProductCard';
import { Lang, t } from '@/lib/i18n';
export default function Shop({ products, lang, initialNeed }: { products: Product[]; lang: Lang; initialNeed?: string }) {
  const [needs, setNeeds] = useState<string[]>(initialNeed ? [initialNeed] : []);
  const [max, setMax] = useState(30000); const [sort, setSort] = useState<'pop'|'new'|'asc'|'desc'>('pop'); const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    const r = products.filter(p => p.price <= max && needs.every(n => p.needs.includes(n)));
    if (sort==='asc') r.sort((a,b)=>a.price-b.price); if (sort==='desc') r.sort((a,b)=>b.price-a.price); if (sort==='new') r.reverse(); return r;
  }, [products, needs, max, sort]);
  const L = t[lang];
  return (<div><div className="tools"><button className="fb" onClick={()=>setOpen(true)}>{L.filters}</button>
    <select aria-label="Tri" value={sort} onChange={e=>setSort(e.target.value as typeof sort)}>{Object.entries(L.sort).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
    {needs.map(n=><button key={n} className="chip" onClick={()=>setNeeds(needs.filter(x=>x!==n))}>{n} ×</button>)}
    <span>{list.length}</span></div>
    <div className="grid">{list.map(p=><ProductCard key={p.slug} p={p} lang={lang}/>)}</div>{!list.length&&<p>{L.empty}</p>}
    <div className={`ov ${open?'on':''}`} onClick={()=>setOpen(false)}/>
    <aside className={`dr sheet ${open?'on':''}`} aria-label={L.filters}><div className="dh"><h3>{L.filters}</h3><button onClick={()=>setOpen(false)}>✕</button></div>
      <div className="body">{NEEDS.map(n=><label key={n} style={{display:'flex',gap:8,minHeight:40}}><input type="checkbox" checked={needs.includes(n)} onChange={e=>setNeeds(e.target.checked?[...needs,n]:needs.filter(x=>x!==n))}/>{n}</label>)}
        <p><b>Max : {fcfa(max)}</b></p><input type="range" min={4000} max={30000} step={500} value={max} onChange={e=>setMax(+e.target.value)} style={{width:'100%'}}/></div>
      <button className="btn o" onClick={()=>{setNeeds([]);setMax(30000)}}>{L.reset}</button></aside></div>);
}
