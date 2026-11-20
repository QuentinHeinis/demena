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

- La page **Calendrier** regroupe automatiquement le jour J (défini dans les paramètres de l’espace), les visites datées des appartements, les échéances des tâches et les événements libres ajoutés depuis le calendrier.
- Un événement libre peut être daté ou « toute la journée », avec un rappel propre : pour choisir, aucun, à l’heure, 5 min, 15 min, 1 jour ou 2 jours avant. Sans choix spécifique, il suit le délai global.
- Dans **Paramètres → Rappels du calendrier**, choisissez le délai global : à l’heure, 1 heure, 1 jour, 2 jours ou aucun.
- Cliquez sur **Exporter .ics**, envoyez le fichier sur votre téléphone et ouvrez-le avec l’application Calendrier d’Apple ou Google : les rappels sont intégrés à chaque événement.
- Activez les notifications de l’application Calendrier dans les réglages du téléphone pour recevoir les alertes.

## PWA et notifications push

- Le site est installable comme PWA : manifeste, icônes et service worker dans `public/`.
- Après connexion sur mobile, une fenêtre propose l’installation ; on peut la refuser pour 7 jours. Sur iOS, elle affiche la procédure « Sur l’écran d’accueil » car Safari ne déclenche pas `beforeinstallprompt`.
- La cloche de l’en-tête affiche déjà les événements des 7 prochains jours, sans configuration supplémentaire.
- Vercel héberge seulement le front. La Edge Function et le cron vivent dans Supabase (plan gratuit suffisant).

### 1. Clés VAPID

```bash
npx web-push generate-vapid-keys
```

Générez le couple une seule fois :

- `Public Key` → `NUXT_PUBLIC_VAPID_PUBLIC_KEY` dans `.env` **et** dans Vercel → Settings → Environment Variables, puis redéployez le front.
- `Private Key` → secret Supabase `VAPID_PRIVATE_KEY`. Ne la mettez jamais dans Vercel.
- `VAPID_SUBJECT` doit être une URI de contact, par exemple `mailto:vous@exemple.fr`.

### 2. Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase secrets set \
  VAPID_PUBLIC_KEY="la-clé-publique" \
  VAPID_PRIVATE_KEY="la-clé-privée" \
  VAPID_SUBJECT="mailto:vous@exemple.fr" \
  CRON_SECRET="une-chaine-aleatoire-longue"
supabase functions deploy send-due-notifications --no-verify-jwt --use-api
```

`VOTRE_PROJECT_REF` est l’identifiant de l’URL du dashboard : `https://supabase.com/dashboard/project/<ref>`.

`--no-verify-jwt` est volontaire : la fonction vérifie elle-même le JWT utilisateur pour le bouton **Tester**, et `CRON_SECRET` pour le cron.

### 3. Cron dans Supabase

Exécutez une seule fois dans le SQL Editor :

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select vault.create_secret('https://VOTRE_PROJECT_REF.supabase.co/functions/v1/send-due-notifications', 'push_function_url');
select vault.create_secret('LA_MEME_CHAINE_QUE_CRON_SECRET', 'push_cron_secret');

select cron.schedule('demena-push', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'push_function_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
$$);
```

Vérification :

```sql
select * from cron.job_run_details order by start_time desc limit 5;
```

### 4. Dans l’application

Installez la PWA sur le téléphone, puis **Paramètres → Notifications push → Activer** et **Tester**.

Sur iOS, il faut passer par « Ajouter à l’écran d’accueil » (iOS 16.4 minimum).

Les dates sans heure (jour J, échéances) sont calculées en UTC ; les visites avec heure utilisent l’heure enregistrée par le navigateur.

## Commandes

```bash
pnpm dev       # serveur de développement
pnpm build     # build de production
pnpm preview   # prévisualisation
pnpm typecheck # vérification TypeScript
```
