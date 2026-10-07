import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, fcfa, waLink, CATEGORIES } from '@/lib/products';
import { getProduct, listProducts } from '@/lib/repo';
import ProductCard from '@/components/ProductCard';
export const revalidate = 3600;
import { Lang, LOCALES, t } from '@/lib/i18n';
import AddButton from '@/components/AddButton';
export const generateStaticParams = () => LOCALES.flatMap(lang => PRODUCTS.map(p => ({ lang, slug: p.slug })));
export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: l, slug } = await params; const lang = l as Lang; const p = await getProduct(slug); if (!p) return {};
  return { title:p.name, description:p.description, alternates:{ canonical:`/${lang}/produit/${slug}`, languages:{ fr:`/fr/produit/${slug}`, en:`/en/produit/${slug}` } }, openGraph:{ title:p.name, description:p.description, images:p.images } };
}
export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: l, slug } = await params; const lang = l as Lang; const p = await getProduct(slug); if (!p) notFound(); const L = t[lang]; const site = process.env.NEXT_PUBLIC_SITE_URL;
  const rel = (await listProducts()).filter(r=>r.slug!==slug&&r.category===p.category).slice(0,4);
  const cat = CATEGORIES.find(c => c.slug === p.category)!;
  const ld = [{ '@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,image:p.images.map(u=>u.startsWith('/')?`${site}${u}`:u),brand:{'@type':'Brand',name:'Betty’s Cosmetics'},offers:{'@type':'Offer',priceCurrency:'XAF',price:p.price,availability:p.inStock?'https://schema.org/InStock':'https://schema.org/OutOfStock',url:`${site}/${lang}/produit/${slug}`}},
    { '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{name:'Boutique',u:'boutique'},{name:cat[lang],u:cat.slug},{name:p.name,u:`produit/${slug}`}].map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:`${site}/${lang}/${x.u}`}))}];
  return (<main className="wrap" style={{padding:'36px 20px'}}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:40}}>
      {p.images.length ? <div className="gal">{p.images.map((u,i)=>/* eslint-disable-next-line @next/next/no-img-element */ <img key={u} src={u} alt={`${p.name} ${i+1}`} loading={i?'lazy':'eager'} width={1200} height={1200}/>)}</div> : <div className="ph" style={{aspectRatio:'1'}} role="img" aria-label={p.name}>Photo</div>}
      <div style={{display:'grid',gap:14,alignContent:'start'}}><h1 style={{fontSize:'3rem'}}>{p.name}</h1><div className="price" style={{fontSize:'1.5rem'}}>{fcfa(p.price)}</div><p>{p.description}</p>
        <div>{p.needs.map(n=>`✓ ${n}  `)}</div><AddButton items={[{slug:p.slug,name:p.name,price:p.price}]} label={L.add}/>
        <a className="btn wab" target="_blank" rel="noopener" href={waLink(`Bonjour Betty's Cosmetics, je souhaite commander : ${p.name} — ${fcfa(p.price)}.`)}>{L.wa}</a>
        <details><summary>{L.how}</summary><p>{p.usage ?? L.todo}</p></details><details><summary>{L.ingr}</summary><p>{p.ingredients ?? L.todo}</p></details></div></div><h2 style={{margin:'56px 0 24px'}}>{L.also}</h2><div className="grid">{rel.map(r=><ProductCard key={r.slug} p={r} lang={lang}/>)}</div></main>);
}
