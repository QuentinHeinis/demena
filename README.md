# Déména

Application de suivi de déménagement (tâches, budget, appartements, cartons, contacts) avec espaces partagés et droits d’accès, basée sur Nuxt 4, Tailwind CSS v4 et Supabase.

## Installation

```bash
pnpm install
cp .env.example .env
```

Renseignez dans `.env` :

- `NUXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : clé publique `sb_publishable_...` (Settings → API Keys). La clé secrète `sb_secret_...` ne doit **jamais** être utilisée ici : l’application tourne entièrement côté navigateur et s’appuie sur RLS.

## Base de données

1. Créez un projet Supabase.
2. Collez et exécutez `supabase/schema.sql` dans le SQL Editor.
3. Le script crée les tables, les politiques RLS, le déclencheur de création d’espace à l’inscription et les fonctions d’invitation.
4. Activez la confirmation d’email si vous le souhaitez dans Authentication → Providers.

## Lancer le projet

```bash
pnpm dev
```

## Espaces et droits

- Chaque utilisateur reçoit un espace personnel à l’inscription.
- Le **propriétaire** peut inviter des personnes, choisir leur rôle et le modifier ensuite.
- L’**éditeur** peut créer, modifier et supprimer tout le contenu.
- Le **lecteur** peut uniquement consulter.
- Les invitations génèrent un lien à partager : `Settings → API Keys` n’a pas besoin de clé serveur, l’acceptation passe par une fonction RPC sécurisée (`accept_workspace_invitation`) qui vérifie l’email du compte connecté.

## Calendrier et rappels

- La page **Calendrier** regroupe automatiquement le jour J (défini dans les paramètres de l’espace), les visites datées des appartements et les échéances des tâches.
- Dans **Paramètres → Rappels du calendrier**, choisissez le délai : à l’heure, 1 heure, 1 jour, 2 jours ou aucun.
- Cliquez sur **Exporter .ics**, envoyez le fichier sur votre téléphone et ouvrez-le avec l’application Calendrier d’Apple ou Google : les rappels sont intégrés à chaque événement.
- Activez les notifications de l’application Calendrier dans les réglages du téléphone pour recevoir les alertes.

## Commandes

```bash
pnpm dev       # serveur de développement
pnpm build     # build de production
pnpm preview   # prévisualisation
pnpm typecheck # vérification TypeScript
```
