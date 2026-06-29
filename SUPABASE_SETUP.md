# Brancher la base partagée (Supabase) — 5 minutes

Tant que ce n'est pas fait, le site marche déjà mais **chaque personne ne voit que ses propres données** (stockage navigateur). Une fois branché, les 30 invités partagent tout et retrouvent leur compte avec **prénom + mot de passe**.

## 1. Créer le projet
1. Va sur https://supabase.com → **Sign in** (gratuit) → **New project**.
2. Donne un nom (ex. `magrin`), choisis une région proche (ex. *West EU*), et un mot de passe de base de données (garde-le de côté, on n'en a pas besoin pour le site).
3. Attends ~1 min que le projet se crée.

## 2. Créer les tables
1. Menu de gauche → **SQL Editor** → **New query**.
2. Ouvre le fichier [`supabase/schema.sql`](supabase/schema.sql) de ce projet, copie tout son contenu, colle-le, puis clique **Run**.
3. Tu dois voir « Success ».

## 3. Récupérer les 2 clés
1. Menu de gauche → **Project Settings** (l'engrenage) → **API**.
2. Copie **Project URL** (ex. `https://xxxx.supabase.co`).
3. Copie **anon public** (la clé publique, PAS la `service_role`).

## 4. Donner les clés au site
1. À la racine du projet, copie `.env.local.example` en `.env.local`.
2. Colle les valeurs :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. Relance le serveur (`npm run dev`). C'est tout — les données passent en partagé.

> Tu peux me redonner ces 2 valeurs et je les mets en place + je vérifie que tout fonctionne.

## Mettre le site en ligne (pour que les invités y accèdent)
Le plus simple : **Vercel**.
1. https://vercel.com → **Add New → Project** → importe ce dossier (ou via GitHub).
2. Dans **Environment Variables**, remets les 2 mêmes clés `NEXT_PUBLIC_SUPABASE_*`.
3. Deploy → tu obtiens un lien `https://magrin.vercel.app` à partager aux 30 invités.

## Note sécurité
Les mots de passe sont stockés en clair (simple, pour retrouver son compte sans email). C'est ok pour un site privé entre amis ; n'y mets pas un mot de passe que tu utilises ailleurs.
