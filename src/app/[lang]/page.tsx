import Link from 'next/link';
import { Lang, t } from '@/lib/i18n';
import { NEEDS } from '@/lib/products';
import { listProducts, listRoutines } from '@/lib/repo';
import ProductCard from '@/components/ProductCard';
import Routines from '@/components/Routines';
import Story from '@/components/Story';
export const revalidate = 3600;
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params; const lang = l as Lang; const L = t[lang];
  const [all, routines] = await Promise.all([listProducts(), listRoutines()]);
  return (<main>
    <div className="hero"><div className="tx"><b style={{letterSpacing:'.2em',fontSize:'.78rem',color:'var(--gold)'}}>BETTY’S COSMETICS</b><h1>{L.heroT}</h1><p style={{color:'var(--mut)',maxWidth:'44ch',margin:0}}>{L.heroP}</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><Link className="btn" href={`/${lang}/boutique`}>{L.shop}</Link><Link className="btn o" href="#routines">{L.routines}</Link></div></div><div className="ph" role="img" aria-label="Photo lifestyle">Photo lifestyle</div></div>
    <section><div className="wrap"><h2>{L.needs}</h2><div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:20}}>{NEEDS.map(n=><Link key={n} className="btn o" href={`/${lang}/boutique?need=${n}`}>{n}</Link>)}</div></div></section>
    <section style={{paddingTop:0}}><div className="wrap"><h2 style={{marginBottom:24}}>{L.best}</h2><div className="grid">{all.filter(p=>p.badge==='Bestseller'||p.badge==='Populaire').slice(0,4).map(p=><ProductCard key={p.slug} p={p} lang={lang}/>)}</div></div></section>
    <Routines routines={routines} lang={lang}/><Story lang={lang}/>
  </main>);
}
