# Feature: astro-migration

Locator: `odd/tasks/astro-migration.md` (Engram mirror: `odd/astro-migration/tasks`, project `mma-v2`)
Branch: `feat/astro-migration`

## Objective

Replace the live React+Vite site (mastropietro.com.ar, repo `ezemastro/MMA`) with this Astro + Keystatic
site, keeping the visual identity (orange `#E07611`, Raleway, light theme, logo) while making it look more
professional, loading obras fast and without layout shift, and letting the client edit every piece of
content (obras included) from `/keystatic` without touching code.

## Problem

- Obras: 461 rows in a `;`-delimited CSV + 134 MB of unresized webp originals (up to 4128 px, 3.7 MB).
  No width/height, no lazy loading, masonry via `column-count`, every image mounted even when filtered out.
  Result: slow page, constant layout jumps, ugly filter UI (select + pills).
- Adding an obra means editing a CSV and dropping a file in a folder.
- Hero is a washed-out blueprint background with a centered logo.
- SEO bugs: single title for every route, sitemap points to `tusitio.com`, robots to localhost, no OG tags.
- v2 only has a partial homepage; no Nav/Footer/Layout, no obras model, no adapter.

## Scope (authorized)

- Port every v1 route: `/`, `/obras`, `/software`, `/contacto`, `/descarga` (+ real 404), same slugs.
- New: `/obras/[slug]` detail pages, Keystatic collections for obras and categories, settings singleton
  (contact data), editable software page, migrated content from v1 CSV + images.
- New hero (real obra photography, no AI imagery), refined sections, same brand.
- Deploy setup for a free host that can run Keystatic's admin (Cloudflare), static fallback still works.

## Constraints

- Do not change the UI identity too much: brand colors, Raleway, light theme, logo.
- Content stays in Spanish (existing project language); code/comments in English.
- No em-dashes in visible copy. No AI-generated imagery.
- Never edit `ezemastro/MMA` (v1, source only).
- Push / PR / deploy / DNS are the user's decisions.

## Decisions

- Astro 7 + `@keystatic/astro` 6 (peer `astro 5 || 6 || 7`) + Tailwind v4 + `@astrojs/cloudflare`.
  All pages prerendered; only Keystatic routes run on the server.
- Keystatic storage: `local` in dev, `github` in production (env-driven), repo `ezemastro/mma_v2`,
  `pathPrefix: client`.
- Obra images live in `src/assets/` so Astro `<Image>` emits sized, responsive, lazy webp/avif.
  Originals are downscaled once during migration (max 2000 px long edge) to keep repo and builds light.
- Category tags normalized (e.g. "barrio privado"/"barrios privados", "losas postesadas" typo).
- Featured obras on the home are an explicit `destacada` flag, not "first 8 CSV rows".

## Tasks

- [ ] T1 Foundation: Astro 7 upgrade, adapter + Keystatic storage switch, Layout (SEO meta, OG, GTM,
      self-hosted Raleway), Nav, Footer, settings singleton.
- [ ] T2 Obras content model + migration script (CSV -> Keystatic entries, downscaled images, categories).
- [ ] T3 `/obras` page (uniform grid, no CLS, filter chips + client filter + sort, URL state) and
      `/obras/[slug]` detail pages.
- [ ] T4 Home: new hero, featured obras section, port remaining sections with refined styling.
- [ ] T5 `/software`, `/descarga`, `/contacto`, 404.
- [ ] T6 SEO + docs: sitemap, robots, JSON-LD, redirects; `docs/EDITAR-CONTENIDO.md` (client guide) and
      `docs/DEPLOY.md` (Cloudflare + GitHub app + DNS).
- [ ] T7 Visual QA: desktop + mobile captures of every route, CLS check on `/obras`.

## Checks (per task)

- `npm run build` in `client/` green; `npx astro check` with no new errors.
- Headless Chromium captures for touched routes.
- TDD: off (no project/session config enables it). Runner: none configured.

## Delivery

- Strategy: `ask-on-risk`. Forecast is far over 400 authored lines (plus data files), so the chain
  strategy will be asked once before any PR is opened. Commits stay local on the feature branch.
- RDD: off (global), so no native review runs.

## Progress

(updated per task)

## Next step

T1.
