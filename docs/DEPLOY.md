# Deploy guide

This repository (`ezemastro/mma_v2`) hosts the Astro + Keystatic site in `client/`. The site
is built to run entirely on Cloudflare's free tier: static pages are served as static assets,
and only the Keystatic admin (`/keystatic`, `/api/keystatic/*`) runs as an on-demand Worker
request. This document is the step-by-step to get that live, plus a no-CMS fallback.

Everything below was verified against Cloudflare's own docs (linked inline) and this repo's
actual config (`client/wrangler.jsonc`, `client/astro.config.mjs`, `client/keystatic.config.ts`)
while writing this guide. Anything not directly verifiable is marked **unverified** rather than
stated as fact.

## Why this fits the free tier

- **Workers static assets (free plan)**: serving the prerendered pages is free and unlimited
  traffic-wise, with a cap of 20,000 files per Worker version and a 25 MiB limit per file.
  Source: https://developers.cloudflare.com/workers/platform/limits/
- **Workers Builds (free plan)**: 3,000 build minutes per month, 1 concurrent build, 20 minute
  build timeout. Source: https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/
- **Worker requests (free plan)**: 100,000 requests/day. Only requests that hit the on-demand
  Worker count against this — which in this site is just `/keystatic` and `/api/keystatic/*`
  (every other route is a static asset response, not counted the same way). Source: same
  platform limits page above.
- Static-asset routing defaults to `auto-trailing-slash` handling: a request to `/obras` (no
  trailing slash) gets a 307 redirect to `/obras/`, matching the `/obras/index.html` this Astro
  build emits, so v1's no-trailing-slash URLs (`/obras`, `/software`, `/contacto`, `/descarga`)
  keep working without any extra redirect rules. Source:
  https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
  (default mode `auto-trailing-slash`).

## 1. Create the Cloudflare Worker from GitHub

1. Sign in (or create a free account) at https://dash.cloudflare.com.
2. **Workers & Pages → Create → Import a repository**, connect your GitHub account if not
   already connected, and select `ezemastro/mma_v2`.
3. Build settings:
   - **Root directory**: `client` (the Astro app does not live at the repo root).
   - **Build command**: `npm run build`.
   - **Deploy command**: `npx wrangler deploy` (this is what `@astrojs/cloudflare` expects;
     confirm against the adapter's own deploy docs if the Cloudflare UI's default differs:
     https://docs.astro.build/en/guides/integrations-guide/cloudflare/).
   - **Node version**: 22.22 or newer. Set the `NODE_VERSION` environment variable (build-time)
     to e.g. `22.22.0` — `client/package.json` declares `"engines": { "node": ">=22.22.0" }`.
4. Deploy once with no Keystatic GitHub env vars set. The site will build and serve every public
   page; `/keystatic` will still work in a degraded way (see step 2 — without the GitHub App
   configured, Keystatic's `storage.kind` resolves to `local`, which has no writable filesystem
   once deployed, so admin edits will fail until step 2 is done).

## 2. Keystatic GitHub App (lets the client edit content from /keystatic)

`client/keystatic.config.ts` switches to `storage: { kind: 'github', repo: 'ezemastro/mma_v2',
pathPrefix: 'client' }` once `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is set in production. To get the
required credentials:

1. Locally, set the `github` storage env vars (see `client/.env.example`) and run `npm run dev`
   inside `client/`.
2. Visit `http://localhost:4321/keystatic` and follow Keystatic's own flow to create a new
   GitHub App (Keystatic walks you through this on first run when it detects github storage
   without an app configured yet). You can also create the GitHub App manually from
   https://github.com/settings/apps/new.
3. **Callback URL**: `https://mastropietro.com.ar/api/keystatic/github/oauth/callback`. This
   exact path is hardcoded in the installed `@keystatic/core` package (verified directly in
   `node_modules/@keystatic/core/dist/keystatic-core-api-generic.node.react-server.js`, which
   builds the OAuth `redirect_uri` as `${origin}/api/keystatic/github/oauth/callback`) — it is
   not something to guess from Keystatic's hosted docs page, which was unreachable while writing
   this guide.
4. After creating the app, GitHub gives you a Client ID and Client Secret. Set these in
   Cloudflare (Workers & Pages → your Worker → Settings → Variables, as **build-time** variables
   so `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is baked into the client bundle, and the secrets as
   runtime variables too since the OAuth callback route runs server-side):
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` (mark as a Secret, not plain text)
   - `KEYSTATIC_SECRET` — any long random string, used to sign Keystatic's session cookie
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` — the app's slug (visible in the app's GitHub settings URL)
5. Install the GitHub App on the `ezemastro/mma_v2` repository (GitHub prompts for this after
   creation) so it can read/write content.
6. Redeploy (or trigger a rebuild) so the new environment variables take effect, then visit
   `https://mastropietro.com.ar/keystatic` and sign in with GitHub.

## 3. Custom domain (mastropietro.com.ar)

In the Worker's **Settings → Domains & Routes**, add `mastropietro.com.ar`. Cloudflare offers
two paths, both free:

- **Move the domain's nameservers to Cloudflare**: full DNS management moves to Cloudflare. If
  email for `@mastropietro.com.ar` is hosted at the current registrar (Hostinger), re-create the
  same MX records (and any SPF/DKIM TXT records) in Cloudflare's DNS before switching, so email
  keeps working.
- **Keep DNS at Hostinger**: add only the CNAME (or A/AAAA) record Cloudflare's domain-setup
  screen instructs for a Worker custom domain, without moving the rest of the zone.

Which of these two is simpler depends on what else currently depends on Hostinger DNS — this is
a user decision, not something to pick automatically.

## 4. How a content edit reaches the live site

Client edits in `/keystatic` → Keystatic (GitHub storage) commits the change directly to the
`ezemastro/mma_v2` repository → the commit triggers a new Cloudflare Workers Build → the new
version deploys automatically → the change is live once that build finishes (typically a couple
of minutes, bounded by the free plan's 20-minute build timeout).

## 5. Fallback without the CMS (static upload, no /keystatic)

If Cloudflare Workers isn't wanted, or as a one-off manual deploy:

```sh
cd client
npm run build
```

Upload the contents of `client/dist/client/` (the static asset output; `client/dist/` also
contains the server-side Worker bundle, which a plain static host like Hostinger's `public_html`
doesn't run) to Hostinger's `public_html`. This serves every public page, but `/keystatic` will
not work there — editing content then means redoing a local edit + build + re-upload instead of
using the admin UI.

## 6. Editor access

Keystatic's GitHub storage mode authenticates editors through GitHub itself: each person who
needs to use `/keystatic` needs a GitHub account with write (or admin) access to
`ezemastro/mma_v2`, granted the usual way (repo **Settings → Collaborators**, or org membership).
There is no separate Keystatic user/password system in this mode.
