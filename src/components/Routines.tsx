import { Lang, x } from '@/lib/i18n';
import { fcfa } from '@/lib/products';
import { Routine } from '@/lib/routines';
import { Product } from '@/lib/products';
import AddButton from './AddButton';
type R = Routine & { items: Product[]; total: number };
export default function Routines({ routines, lang }: { routines: R[]; lang: Lang }) {
  const X = x[lang];
  return (<section id="routines" className="sand"><div className="wrap"><h2>{X.rTitle}</h2><p className="sub">{X.rSub}</p>
    <div className="routines">{routines.map(r => (<article className="rt" key={r.slug}><div className="ph" style={{aspectRatio:'16/10'}} role="img" aria-label={r.name}>Photo</div>
      <div className="b"><h3>{r.name}</h3><p className="steps">{r.steps}</p><p className="steps">{r.items.map(i=>i.name).join(', ')}</p>
      <div className="price">{fcfa(r.total)}</div>{r.saving>0&&<div className="steps">{X.rSave} : {fcfa(r.saving)}</div>}
      <AddButton className="btn o" label={X.rAdd} items={r.items.map(i=>({slug:i.slug,name:i.name,price:i.price}))}/></div></article>))}</div></div></section>);
}
