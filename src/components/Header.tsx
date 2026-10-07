'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, NEEDS } from '@/lib/products';
import { useCart } from './Cart';
import { Lang, x } from '@/lib/i18n';
export default function Header({ lang }: { lang: Lang }) {
  const { count, open } = useCart(); const other = lang === 'fr' ? 'en' : 'fr'; const [m, setM] = useState(false); const X = x[lang];
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setM(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  const close = () => setM(false);
  return (<header><div className="ann">{lang==='fr'?'Livraison au Cameroun • Expédition internationale • Commande via WhatsApp':'Delivery in Cameroon • International shipping • Order via WhatsApp'}</div>
    <div className="wrap hd"><button className="burger" onClick={()=>setM(true)} aria-label={X.menu} aria-expanded={m} aria-controls="mnav">☰</button>
      <Link href={`/${lang}`} className="logo">Betty’s <small>Cosmetics</small></Link>
      <nav aria-label="Principal" className="main">
        <div className="has-mega"><Link href={`/${lang}/boutique`}>{X.shop}</Link>
          <div className="mega"><div><h4>{lang==='fr'?'Par produit':'By product'}</h4>{CATEGORIES.map(c=><Link key={c.slug} href={`/${lang}/${c.slug}`}>{c[lang]}</Link>)}</div>
          <div><h4>{lang==='fr'?'Par besoin':'By need'}</h4>{NEEDS.map(n=><Link key={n} href={`/${lang}/boutique?need=${n}`}>{n}</Link>)}</div></div></div>
        {CATEGORIES.slice(0,4).map(c=><Link key={c.slug} href={`/${lang}/${c.slug}`}>{c[lang]}</Link>)}
        <Link href={`/${lang}#story`}>{X.about}</Link>
      </nav>
      <Link href={`/${other}`} hrefLang={other}>{other.toUpperCase()}</Link>
      <button onClick={open} aria-label="Panier">🛍 <span className="cnt">{count}</span></button></div>
    <div className={`ov ${m?'on':''}`} onClick={close}/>
    <aside id="mnav" className={`dr left ${m?'on':''}`} aria-label={X.menu} aria-hidden={!m}>
      <div className="dh"><span className="logo">Betty’s</span><button onClick={close} aria-label={X.close}>✕</button></div>
      <nav className="body mob" onClick={close}>
        <Link href={`/${lang}`}>{X.home}</Link><Link href={`/${lang}/boutique`}>{X.shop}</Link>
        {CATEGORIES.map(c=><Link key={c.slug} href={`/${lang}/${c.slug}`}>{c[lang]}</Link>)}
        <Link href={`/${lang}#story`}>{X.about}</Link></nav></aside></header>);
}
