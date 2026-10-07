import Link from 'next/link';
import { count, desc, eq, gte } from 'drizzle-orm';
import { isAdmin, adminConfigured } from '@/lib/auth';
import { listProducts } from '@/lib/repo';
import { db, hasDb } from '@/db';
import { orders, activityLog } from '@/db/schema';
import { fcfa } from '@/lib/products';
import { login, logout } from './actions';
export const dynamic = 'force-dynamic';
const DAY = 864e5, OFF = 36e5; // Douala = UTC+1
const key = (t: number) => new Date(t + OFF).toISOString().slice(0, 10);
export default async function Admin({ searchParams }: { searchParams: Promise<{ err?: string; p?: string }> }) {
  const { err, p } = await searchParams;
  if (!adminConfigured()) return <p>Définissez DATABASE_URL et ADMIN_SECRET (puis ADMIN_PASSWORD pour créer le premier compte).</p>;
  if (!(await isAdmin())) return (<form action={login} className="of" style={{maxWidth:360,margin:'80px auto'}}><h1 style={{fontSize:'2rem'}}>Administration</h1>
    <label className="fl">E-mail<input type="email" name="email" required autoFocus autoComplete="username"/></label><label className="fl">Mot de passe<input type="password" name="password" required autoComplete="current-password"/></label>{err && <p role="alert" style={{color:'var(--acc)'}}>{err === '2' ? 'Trop de tentatives, réessayez dans 15 minutes.' : 'E-mail ou mot de passe incorrect.'}</p>}<button className="btn">Connexion</button></form>);
  if (!hasDb) return <p>Renseignez DATABASE_URL puis lancez db:push et db:seed pour utiliser l’admin.</p>;
  const days = p === '30' ? 30 : 7, now = Date.now();
  const [rows, [pend], acts, prods] = await Promise.all([
    db().select().from(orders).where(gte(orders.createdAt, new Date(now - 2 * days * DAY))).orderBy(desc(orders.createdAt)).limit(5000),
    db().select({ n: count() }).from(orders).where(eq(orders.status, 'nouvelle')),
    db().select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(12), listProducts()]);
  const cutoff = now - days * DAY, cur = rows.filter(o => +o.createdAt >= cutoff), prev = rows.filter(o => +o.createdAt < cutoff);
  const ok = (a: typeof rows) => a.filter(o => o.status !== 'annulée'), rev = (a: typeof rows) => ok(a).reduce((s, o) => s + o.total, 0);
  const delta = (a: number, b: number) => (b ? `${a >= b ? '+' : ''}${Math.round(((a - b) / b) * 100)} % vs période précédente` : 'pas de période précédente');
  const R = rev(cur), N = ok(cur).length, basket = N ? Math.round(R / N) : 0;
  const top = new Map<string, { qty: number; rev: number }>();
  ok(cur).forEach(o => o.items.forEach(i => { const t = top.get(i.name) ?? { qty: 0, rev: 0 }; t.qty += i.qty; t.rev += i.qty * i.price; top.set(i.name, t); }));
  const topList = [...top.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 5);
  const series = Array.from({ length: days }, (_, i) => { const t = now - (days - 1 - i) * DAY, k = key(t); return { k, d: k.slice(8), v: ok(cur).filter(o => key(+o.createdAt) === k).reduce((s, o) => s + o.total, 0) }; });
  const max = Math.max(1, ...series.map(s => s.v));
  const status = ['nouvelle', 'confirmée', 'expédiée', 'livrée', 'annulée'].map(s => [s, cur.filter(o => o.status === s).length] as const);
  const out = prods.filter(x => !x.inStock).length;
  return (<div style={{padding:'24px 0 60px'}}><div className="tools"><h1 style={{fontSize:'2rem',marginRight:'auto'}}>Tableau de bord</h1>
    <Link className={`chip ${days===7?'on':''}`} href="/admin?p=7">7 jours</Link><Link className={`chip ${days===30?'on':''}`} href="/admin?p=30">30 jours</Link><form action={logout}><button className="chip">Déconnexion</button></form></div>
    <div className="kpis"><div><small>Chiffre d’affaires</small><b>{fcfa(R)}</b><small>{delta(R, rev(prev))}</small></div>
      <div><small>Commandes</small><b>{N}</b><small>{delta(N, ok(prev).length)}</small></div>
      <div><small>Panier moyen</small><b>{fcfa(basket)}</b></div>
      <div><small>À traiter</small><b>{pend.n}</b><Link href="/admin/commandes">Voir les commandes</Link></div>
      <div><small>Catalogue</small><b>{prods.length} produits</b><small>{out} en rupture</small></div></div>
    <h2 style={{fontSize:'1.4rem',margin:'32px 0 12px'}}>Ventes par jour</h2>
    <div className="bars" role="img" aria-label="Ventes par jour">{series.map(s => <div key={s.k} title={`${s.k} : ${fcfa(s.v)}`}><i style={{height:`${Math.max(2,(s.v/max)*100)}%`}}/><span>{s.d}</span></div>)}</div>
    <div className="cols"><div><h2 style={{fontSize:'1.4rem',margin:'32px 0 12px'}}>Produits les plus vendus</h2>
      {topList.length ? <table><tbody>{topList.map(([n, t]) => <tr key={n}><td>{n}</td><td>{t.qty} vendus</td><td>{fcfa(t.rev)}</td></tr>)}</tbody></table> : <p>Aucune vente sur la période.</p>}
      <h2 style={{fontSize:'1.4rem',margin:'32px 0 12px'}}>Statuts</h2><div className="tools">{status.map(([s, n]) => <span className="chip" key={s}>{s} : {n}</span>)}</div></div>
    <div><h2 style={{fontSize:'1.4rem',margin:'32px 0 12px'}}>Activité récente</h2>
      {acts.length ? <ul className="act">{acts.map(a => <li key={a.id}><small>{a.createdAt.toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</small><br/>{a.label}</li>)}</ul> : <p>Aucune activité enregistrée.</p>}</div></div></div>);
}
