import { requireAdmin } from '@/lib/auth';
import { logout, changePassword } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Account() {
  const me = await requireAdmin();
  return (<div style={{padding:'24px 0 60px',maxWidth:420}}><h1 style={{fontSize:'2rem'}}>{me.name}</h1><p>{me.email} — {me.role === 'admin' ? 'Administrateur' : 'Équipe'}</p>
    <form action={changePassword} className="of"><h2 style={{fontSize:'1.3rem'}}>Changer le mot de passe</h2>
      <label className="fl">Mot de passe actuel<input type="password" name="current" required autoComplete="current-password"/></label>
      <label className="fl">Nouveau mot de passe (10 caractères minimum)<input type="password" name="next" minLength={10} required autoComplete="new-password"/></label><button className="btn">Enregistrer</button></form>
    <form action={logout} style={{marginTop:24}}><button className="btn o">Déconnexion</button></form></div>);
}
