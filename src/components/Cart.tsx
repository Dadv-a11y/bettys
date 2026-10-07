'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { fcfa } from '@/lib/products';
import { Lang, x } from '@/lib/i18n';
import { createOrder } from '@/app/actions';
export type Item = { slug:string; name:string; price:number };
type Line = Item & { qty:number };
const Ctx = createContext<{add:(i:Item,q?:number)=>void;count:number;open:()=>void}>({add(){},count:0,open(){}});
export const useCart = () => useContext(Ctx);
export function CartProvider({ children, labels, lang }: { children: ReactNode; labels:{cart:string;total:string;checkout:string;wa:string}; lang: Lang }) {
  const [lines, setLines] = useState<Line[]>([]); const [on, setOn] = useState(false);
  const [f, setF] = useState({ name:'', phone:'', city:'', note:'', hp:'' });
  const [st, setSt] = useState<'idle'|'sending'|'done'>('idle'); const [err, setErr] = useState(''); const [res, setRes] = useState<{ref:string;url:string;saved:boolean}|null>(null);
  const X = x[lang];
  const add = (i: Item, q=1) => { setLines(l => l.some(v=>v.slug===i.slug) ? l.map(v=>v.slug===i.slug?{...v,qty:v.qty+q}:v) : [...l,{...i,qty:q}]); setOn(true); setSt('idle'); };
  const set = (slug:string,d:number) => setLines(l => l.map(v=>v.slug===slug?{...v,qty:v.qty+d}:v).filter(v=>v.qty>0));
  const total = lines.reduce((a,i)=>a+i.price*i.qty,0);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSt('sending');
    const r = await createOrder({ items: lines.map(l=>({slug:l.slug,qty:l.qty})), ...f, lang });
    if (!r.ok) { setErr(r.error); setSt('idle'); return; }
    setRes(r); setSt('done'); setLines([]); window.open(r.url, '_blank', 'noopener');
  }
  const inp = (k: 'name'|'phone'|'city'|'note', label: string, req = true, type = 'text') => (<label className="fl">{label}<input type={type} required={req} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} autoComplete={k==='phone'?'tel':k==='name'?'name':undefined}/></label>);
  return (<Ctx.Provider value={{add,count:lines.reduce((a,l)=>a+l.qty,0),open:()=>setOn(true)}}>
    {children}
    <div className={`ov ${on?'on':''}`} onClick={()=>setOn(false)} />
    <aside className={`dr ${on?'on':''}`} aria-label={labels.cart} aria-hidden={!on}>
      <div className="dh"><h3>{labels.cart}</h3><button onClick={()=>setOn(false)} aria-label="Fermer">✕</button></div>
      <div className="body">
        {st==='done' && res && <div><h3>{X.thanks}</h3><p>Réf. <b>{res.ref}</b></p><a className="btn wab" target="_blank" rel="noopener" href={res.url}>{X.openWa}</a></div>}
        {lines.map(i=>(<div className="ci" key={i.slug}><div className="ph" /><div><b>{i.name}</b><br/>{fcfa(i.price)}<br/>
          <button onClick={()=>set(i.slug,-1)} aria-label="−">−</button> {i.qty} <button onClick={()=>set(i.slug,1)} aria-label="+">+</button></div></div>))}
        {lines.length>0 && <form onSubmit={submit} className="of"><p><b>{labels.total} : {fcfa(total)}</b><br/><small>{X.shipNote}</small></p>
          {inp('name',X.fName)}{inp('phone',X.fPhone,true,'tel')}{inp('city',X.fCity)}{inp('note',X.fNote,false)}
          <input tabIndex={-1} autoComplete="off" aria-hidden className="hp" value={f.hp} onChange={e=>setF({...f,hp:e.target.value})}/>
          {err && <p role="alert" style={{color:'var(--acc)'}}>{err}</p>}
          <button className="btn wab" disabled={st==='sending'}>{st==='sending'?X.sending:X.send}</button></form>}
      </div>
    </aside></Ctx.Provider>);
}
