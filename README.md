# Betty’s Cosmetics — Next.js 16 (standalone) + PostgreSQL

## Sans base (données statiques)
npm install && cp .env.example .env.local   # laisser DATABASE_URL vide
npm run dev
Les commandes ouvrent WhatsApp mais ne sont pas enregistrées ; l'admin est désactivée.

## Avec PostgreSQL (local, Neon, Supabase, VPS…)
1. Créer une base et renseigner DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET dans .env.local
2. npm run db:push     # tables products, routines, reviews, orders
3. npm run db:seed     # produits + routines de départ
4. npm run dev  → /admin

## Production standalone
npm run build
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
DATABASE_URL=... ADMIN_PASSWORD=... ADMIN_SECRET=... node .next/standalone/server.js
Les migrations (db:push / db:migrate) se lancent depuis le poste ou la CI, pas depuis le dossier standalone.

## Commandes
Le panier enregistre la commande (prix recalculés côté serveur) puis ouvre WhatsApp avec un message prérempli contenant la référence BC-XXXX.
Suivi et statuts : /admin/commandes.

## Admin
- Premier accès : renseigner ADMIN_SECRET et ADMIN_PASSWORD, ouvrir /admin, saisir votre e-mail + ADMIN_PASSWORD → crée l'administrateur. Ensuite retirer ADMIN_PASSWORD et gérer les comptes dans /admin/utilisateurs.
- Rôles : Administrateur (tout, y compris suppressions, utilisateurs, export CSV) ; Équipe (commandes, stock, prix, édition/création produits et routines). Désactiver un compte coupe l'accès immédiatement. 5 essais de connexion par e-mail / 15 min.
- /admin : tableau de bord ; /admin/produits ; /admin/routines ; /admin/commandes (+ export CSV, séparateur « ; », UTF-8 avec BOM pour Excel) ; /admin/compte.
- Après mise à jour : npm run db:push (tables activity_log et admin_users).

## Images (stockage local)
Les images téléversées dans la fiche produit sont converties en WebP (1200 px + miniature 480 px) et écrites dans UPLOAD_DIR, servies par /uploads/<id>.webp (cache immuable).
- En production : UPLOAD_DIR doit être un chemin absolu sur un disque persistant, sauvegardé (le dossier standalone est remplacé à chaque déploiement).
- Serveur unique uniquement (pas de stockage partagé entre plusieurs instances). Les fichiers d'un produit supprimé restent sur le disque.
- Migration future vers S3/Cloudinary : ne changer que src/app/admin/upload/route.ts et la route /uploads.
