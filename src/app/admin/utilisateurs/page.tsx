import { asc } from 'drizzle-orm';
import { requireOwner } from '@/lib/auth';
import { db, hasDb } from '@/db';
import { adminUsers } from '@/db/schema';
import { createUser, setUserActive, resetPassword } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Users() {
  const me = await requireOwner(); if (!hasDb) return <p>DATABASE_URL requis.</p>;
  const us = await db().select().from(adminUsers).orderBy(asc(adminUsers.id));
  return (<div style={{padding:'24px 0 60px'}}><h1 style={{fontSize:'2rem'}}>Utilisateurs</h1>
    <p style={{color:'var(--mut)'}}>Administrateur : accès complet (suppressions, utilisateurs, export). Équipe : commandes, stock, prix, création et édition de produits et routines.</p>
    <table><thead><tr><th>Nom</th><th>Rôle</th><th>Statut</th><th>Mot de passe</th></tr></thead><tbody>{us.map(u => (<tr key={u.id}><td><b>{u.name}</b><br/><small>{u.email}</small></td><td>{u.role === 'admin' ? 'Administrateur' : 'Équipe'}</td>
      <td>{u.id === me.id ? 'Vous' : <form action={setUserActive}><input type="hidden" name="id" value={u.id}/><input type="hidden" name="to" value={u.active ? '0' : '1'}/><button className="chip">{u.active ? 'Actif — désactiver' : 'Inactif — réactiver'}</button></form>}</td>
      <td><form action={resetPassword} style={{display:'flex',gap:6}}><input type="hidden" name="id" value={u.id}/><input type="password" name="password" minLength={10} required placeholder="Nouveau (10+)" aria-label={`Nouveau mot de passe ${u.name}`} autoComplete="new-password" style={{border:'1px solid var(--line)',padding:8}}/><button className="chip">OK</button></form></td></tr>))}</tbody></table>
    <h2 style={{fontSize:'1.4rem',margin:'32px 0 0'}}>Ajouter un utilisateur</h2>
    <form action={createUser} className="of" style={{maxWidth:420}}>
      <label className="fl">Nom<input name="name" required/></label><label className="fl">E-mail<input type="email" name="email" required/></label>
      <label className="fl">Mot de passe (10 caractères minimum)<input type="password" name="password" minLength={10} required autoComplete="new-password"/></label>
      <label className="fl">Rôle<select name="role"><option value="staff">Équipe</option><option value="admin">Administrateur</option></select></label><button className="btn">Créer le compte</button></form></div>);
}
