import type { Metadata } from 'next';
import { Cormorant_Garamond, Hanken_Grotesk } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '@/components/Cart';
import Header from '@/components/Header';
import { LOCALES, Lang, t } from '@/lib/i18n';
import { waLink } from '@/lib/products';
const serif = Cormorant_Garamond({ subsets:['latin'], weight:['500','600'], variable:'--font-serif' });
const sans = Hanken_Grotesk({ subsets:['latin'], variable:'--font-sans' });
const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bettys-cosmetics.com';
export const generateStaticParams = () => LOCALES.map(lang => ({ lang }));
export const metadata: Metadata = { metadataBase:new URL(site), title:{ default:'Betty’s Cosmetics', template:'%s | Betty’s Cosmetics' }, description:'Soins visage et corps à Douala. Livraison au Cameroun et à l’international.', openGraph:{ siteName:'Betty’s Cosmetics', type:'website' } };
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: l } = await params; const lang = l as Lang; const L = t[lang];
  return (<html lang={lang} className={`${serif.variable} ${sans.variable}`}><body>
    <CartProvider labels={L} lang={lang}><Header lang={lang} />{children}
      <footer><div className="wrap">Douala, Cameroun — {L.tag}</div></footer>
      <a className="wa" target="_blank" rel="noopener" href={waLink("Bonjour Betty's Cosmetics, je souhaite passer commande.")}>{L.wa}</a></CartProvider></body></html>);
}
