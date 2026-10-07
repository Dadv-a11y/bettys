import type { Metadata } from 'next';
import Link from 'next/link';
import '../globals.css';
import { getSession } from '@/lib/auth';
export const metadata: Metadata = { title: 'Admin — Betty’s Cosmetics', robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return <html lang="fr"><body><div className="wrap adm">
    {s && <nav className="anav" aria-label="Admin"><b className="logo" style={{marginRight:'auto'}}>Betty’s</b><Link href="/admin">Tableau de bord</Link><Link href="/admin/commandes">Commandes</Link><Link href="/admin/produits">Produits</Link><Link href="/admin/routines">Routines</Link>{s.role === 'admin' && <Link href="/admin/utilisateurs">Utilisateurs</Link>}<Link href="/admin/compte">{s.name}</Link><Link href="/fr" target="_blank">Voir le site</Link></nav>}
    {children}</div></body></html>;
}
