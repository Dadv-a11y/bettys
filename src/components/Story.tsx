import Link from 'next/link';
import { Lang, x, t } from '@/lib/i18n';
export default function Story({ lang }: { lang: Lang }) {
  return (<section id="story" className="story"><div className="ph" role="img" aria-label="Betty’s Cosmetics">Photo de marque</div>
    <div className="tx"><h2>{x[lang].sTitle}</h2><p>{x[lang].sText}</p><Link className="btn gold" href={`/${lang}/boutique`}>{t[lang].shop}</Link></div></section>);
}
