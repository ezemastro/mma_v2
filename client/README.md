# Marcelo Mastropietro Ingeniería — site

Astro + Keystatic site for mastropietro.com.ar. Every page is prerendered to static HTML;
only the Keystatic admin (`/keystatic`, `/api/keystatic/*`) runs on demand.

## Stack

- [Astro](https://astro.build) 7, `output: 'static'`, deployed with `@astrojs/cloudflare`
  (Cloudflare Workers static assets + on-demand Worker for the Keystatic routes).
- [Keystatic](https://keystatic.com) as the CMS: `local` storage in dev (writes straight to the
  filesystem), `github` storage in production (writes commit to GitHub through a GitHub App).
- Tailwind CSS v4 (CSS-first config, see `src/styles/global.css`) + `@tailwindcss/typography`.
- Markdoc for rich-text fields, `astro-icon` for the icon set, React only as Keystatic's own
  admin UI renderer (no React on the public site).

## Scripts

Run from this directory (`client/`):

| Command                | Action                                                               |
| :---------------------- | :-------------------------------------------------------------------- |
| `npm run dev`            | Local dev server at `http://localhost:4321`, Keystatic in local storage mode |
| `npm run build`           | Builds the production site to `./dist/`                              |
| `npm run preview`         | Builds and serves the output locally through Wrangler (Cloudflare's local runtime) |
| `npm run astro ...`       | Run Astro CLI commands, e.g. `npm run astro check`                   |
| `npm run migrate:obras`   | One-off script that migrated the v1 CSV + images into Keystatic obra entries (see `scripts/migrate-obras.mjs`); not needed for day-to-day editing |

## Content locations

All editable content lives under `src/content/`, matching `keystatic.config.ts`:

- `src/content/obras/<slug>/` — one folder per obra (`index.yaml` + its own `portada.webp` and
  gallery images, colocated so Astro's content-collection `image()` helper can resolve them).
- `src/content/categorias/` — the category tags obras can be filtered by.
- `src/content/globals/icons/` — the icon catalog used by card/feature fields.
- `src/content/globals/settings/` — the `settings` singleton (contact data, SEO defaults, GTM id).
- `src/content/pages/homepage/` — the `homepage` singleton (hero, every home section).
- `src/content/pages/software/` — the `software` singleton (MASCalculador page content).

CMS images that aren't part of the `obras` collection (homepage section images, client logos,
the software screenshot) live under `src/assets/cms/` and are resolved through
`src/lib/cms-image.ts`, since those are read via Keystatic's reader rather than a content
collection.

## Keystatic: local vs GitHub mode

`keystatic.config.ts` switches storage automatically:

- **Local** (used whenever `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` isn't set, which includes every
  `npm run dev` session): the admin reads and writes directly to the filesystem. This is how you
  test content changes before deploying.
- **GitHub** (used in production once the GitHub App env vars are configured): the admin reads
  and writes through a GitHub App, committing straight to the repository. See
  `docs/DEPLOY.md` at the repo root for how to set that up.

`.env.example` lists the GitHub-mode environment variables.

**Dev mode note**: `astro.config.mjs` attaches the Cloudflare adapter only for builds, because
its dev integration makes `/api/keystatic/*` return 500 under `astro dev`. Nothing to toggle by
hand. Images inside homepage blocks are stored at the index-based paths Keystatic itself writes
(`src/assets/cms/sections/<block>/value/...`); reordering or deleting blocks or list items makes
Keystatic rename those files on the next save, which is expected.

## Deploy docs

Deployment (Cloudflare Workers, the Keystatic GitHub App, the custom domain, and the fallback
static-upload path) is documented in `docs/DEPLOY.md` at the repository root. The non-technical
content-editing guide for the client is `docs/EDITAR-CONTENIDO.md` (in Spanish), also at the
repository root.
