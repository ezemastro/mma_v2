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

**Known dev-mode gotcha**: `npm run dev` + the Keystatic admin can hit a `@astrojs/cloudflare`
14.4.0 dev-mode limitation where `/api/keystatic/*` returns a 500 ("exports is not defined",
from `astro/dist/core/environment/dev-nonrunnable.js`) instead of routing the request, which
makes the admin's data-dependent pages (the obras list, any entry editor) reload in a loop. This
is confirmed dev-only scaffolding (the file name and its own comments say so) and does not run in
the deployed Worker, so it does not affect production. If you hit it: temporarily comment out the
`adapter: cloudflare({...})` line in `astro.config.mjs` while testing the admin locally (plain
pages keep working either way since `output: 'static'` doesn't need an adapter in dev), then
restore it before building. Also double-check `git diff` after saving a homepage/software edit
that touches an array of images (Clientes, Publicaciones) before committing -- one save during
this investigation reshuffled ~90 client logo files to different array-index-based paths; it was
fully reverted and not root-caused with confidence (plausibly tied to the same dev-mode
instability, given how loaded the box was while reproducing it), but hasn't been proven safe
under normal conditions either.

## Deploy docs

Deployment (Cloudflare Workers, the Keystatic GitHub App, the custom domain, and the fallback
static-upload path) is documented in `docs/DEPLOY.md` at the repository root. The non-technical
content-editing guide for the client is `docs/EDITAR-CONTENIDO.md` (in Spanish), also at the
repository root.
