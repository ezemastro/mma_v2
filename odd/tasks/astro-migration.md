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
- Obra images live colocated with their entry (`src/content/obras/<slug>/portada.webp`, referenced as
  the relative path `./portada.webp`) so Astro's content-collection `image()` helper emits sized,
  responsive, lazy webp/avif. CMS (homepage) images live separately under `src/assets/cms/`, resolved
  through `src/lib/cms-image.ts` since those are read via Keystatic's reader, not a content collection.
  Originals are downscaled once during migration (max 2000 px long edge) to keep repo and builds light.
- Category tags normalized: 22 raw tags -> 20 clean `categorias` (merged "barrio privado"/"barrios
  privados" and the "losas postesadas" typo into "losas postensadas"; see
  `client/scripts/migrate-obras.mjs` for the full mapping).
- Featured obras on the home are an explicit `destacada` flag (+ `orden`), not "first 8 CSV rows",
  though the migration seeds it from the first 8 CSV rows to preserve today's selection.

## Tasks

- [x] T1 Foundation: Astro 7 upgrade, adapter + Keystatic storage switch, Layout (SEO meta, OG, GTM,
      self-hosted Raleway), Nav, Footer, settings singleton. Commit `f7cfd6f`.
      Checks observed: `npm run build` green (97 images optimized, static /, /404,
      Keystatic admin on-demand); `npx astro check` 0 errors (1 pre-existing hint); dev smoke test
      `/` 200, `/keystatic` 200, unknown route 404.
- [x] T2 Obras content model + migration script (CSV -> Keystatic entries, downscaled images, categories).
      Commits `bf97e30` (schemas/config/script) and `589c64d` (migrated data).
      Checks observed: `npm run build` green (9.2 MB dist, ~9.4s); `npx astro check` 0 errors;
      temporary `getCollection('obras')` probe returned 455 entries matching the script's own report,
      sample obra's portada emitted as an optimized responsive webp in `dist/`.
      Migrated 455/461 obras (131.5 MB -> 64.4 MB images); 6 rows have no matching source image even
      after fixing ~20 typo'd/mis-cased filenames (see script header); 20 categorias, 0 unmapped tags.
- [x] T3 `/obras` page (uniform grid, no CLS, filter chips + client filter + sort, URL state) and
      `/obras/[slug]` detail pages. Commit `b1ed36d`.
      Checks observed: `npm run build` green (2m49s total, first build generating all obra image
      widths; `dist/client/obras/index.html` 512 KB, 458 obra detail pages + index under
      `dist/client/obras/`); `npx astro check` 0 errors (same pre-existing hint as T1/T2).
      Headless chromium captures: `/obras` desktop 1440 and mobile 390 (via iframe harness, grid
      renders 1/2/3/4 cols correctly, chips scroll horizontally on mobile), `/obras/?categoria=cines`
      deep link (confirms client filter script runs on load: count updates to "2 obras", chip and
      "Limpiar filtros" reflect state), `/obras/estadio-ferrocarril-oeste-tribunas-caballito/` detail
      desktop (real photo, facts list, categoria links, related obras grid; this obra has no galeria
      so the lightbox section correctly doesn't render).
- [x] T4 Home: new hero, featured obras section, port remaining sections with refined styling.
      Commit `90563e4`.
      Checks observed: `npm run build` green (~33s once obra images are cached from T3); `npx astro
      check` 0 errors (same pre-existing hint). Headless chromium review: desktop hero at a realistic
      1440x900 viewport (confirmed it fits the first viewport without the min-h-[100dvh] section being
      artificially inflated by an oversized capture window); mobile hero at 390x844; a full top-to-
      bottom sweep of every section on desktop (1440 wide, 900px-tall slices via a same-origin iframe
      harness with scripted scrollTo, written into dist/ and removed afterward) and a shorter mobile
      sweep. Caught and fixed two issues from reading the captures: the final CTA band's button was
      rendering above its own body copy (reordered Section.astro to put the link after the slot), and
      T4 point 3 (featured obras) was missing entirely on the first pass, added as `FeaturedObras.astro`
      after re-reading the task list against the rendered page.
      Design: hero is an asymmetric split (headline/subtext/CTAs left, real portada of
      `estadio-ferrocarril-oeste-tribunas-caballito` right, caption built from the obra's own
      titulo/descripcion) via new `header.headline`/`subtext`/`heroObra` fields; old `header.logo`/
      `background` fields and `Header.astro` removed (fully superseded). Featured obras is a manual
      scroll-snap row (no autoplay) of the 8 `destacada` obras sorted by `orden`, first card wider.
      Diferenciales uses a new `imagen-lista` cards variant (ISO certificate left, stacked icon+text
      items right) instead of 3 identical cards. Libro + Revista CARAS merged into one new
      `publicaciones` block shown side by side so Bio/Libro/Revista don't stack 3 image+text splits in
      a row. Política de Calidad uses a new `lista-numerada` text variant (2-column numbered list, no
      hairline rows). Added 9 new icon entries (one per card, previously all shared a placeholder) and
      a single `--radius` token reused by every new/touched component. Zero eyebrows used anywhere.
      Pre-flight items consciously left unticked: no dark-mode variant (brief explicitly says
      redesign-preserve, v1 is light-only); no reduced-motion handling beyond CSS transitions (motion
      dial is 3, no scroll-triggered or JS-driven animation was added, so there's nothing to gate); a
      few client logos in the existing migrated data render faint/blank against the grayscale card
      background (pre-existing T2 data quality, not touched here).
- [x] T4b Polish pass from the T4 capture review. Commits `770a464` (style) and `4d89231` (data).
      Checks observed: `npm run build` green (~37-50s depending on cache); `npx astro check` 0 errors
      (same pre-existing hint). Headless chromium captures of `/` at 1440x900 and 390x844 (both full-page
      and first-viewport), `/obras` at both sizes, and one detail page; read back directly. CLS: home
      1440 0.0054, home 390 0, `/obras` 1440 0.029, `/obras` 390 0, detail 1440 0.00064 -- all well under
      0.1, no horizontal overflow on any capture (`sw === cw`).
      Fixed: hero dropped its full-viewport min-height (now pt-8/pb-10 desktop normal padding), headline
      confirmed 2 lines at 1440 (dropped the md:text-5xl bump, text-4xl fits "No existe proyecto de /
      arquitectura sin estructura." in 2 lines within the narrower 5/12 text column), photo column widened
      to 7/12 with a 4:3 crop; nav logo replaced the unreadable nav-logo.webp wordmark with the mark-only
      asset recovered from v1 `public/images/logo.png` (deleted, unused elsewhere) plus real HTML text
      "Marcelo Mastropietro" / "Ingeniería"; obras titles re-migrated (see data commit) so cards/detail
      pages show titulo + a muted ubicacion line instead of baked-in location text; featured obras excludes
      the hero's own obra and gained accessible prev/next buttons + edge fade; Section.astro now supports
      a `tono` field (editable per block in Keystatic) alternating a soft `#f7f7f7` background instead of
      a hairline, applied to Diferenciales/Curriculum/Política de Calidad/CTA final; Servicios and
      Curriculum no longer share a layout (Servicios: left-aligned icon+title 2x2, no orange bars;
      Curriculum: new `franja` cards variant, a compact 4-column link strip) with Bio moved between them;
      Diferenciales ISO image capped at 300px and centered; Bio split into 4 paragraphs at sentence
      boundaries (content edit, same words) with its photo now stretched to match the text block's height;
      Publicaciones covers now sit in a 4:3 contain box (read larger) and the "A LA VENTA EN" block
      tightened to one line; Clientes tiles are smaller, white, bordered, un-grayscaled (logos were
      disappearing against grayscale+light backgrounds) and the literal duplicate "A+R arquitectos" entry
      was removed; `/obras`' active "Todas" chip count is readable now (`group-aria-pressed:text-white/80`
      instead of a hardcoded muted gray) and the chip row/search/selects got a right-edge fade and
      matched mobile widths.
      Real bug found and fixed: `MarkdocRender.astro` hardcoded `text-left` on its wrapper unconditionally,
      which is why the final CTA's body copy wasn't centering under its already-centered title even though
      the parent wrapper had `text-center` -- removed, so it now inherits alignment like normal.
      `migrate-obras.mjs` now splits the CSV's single "titulo" column into a short titulo + a separate
      ubicacion (paren-aware split so a location group's own internal hyphen doesn't get cut), moving a
      parenthetical that lands in a location segment to the end of titulo instead (brand/building names
      describe the obra, not the place). Slugs still derive from the ORIGINAL raw CSV title (unchanged
      line), so re-running this idempotent script changed 436/458 obras' titulo/ubicacion without moving
      or renaming a single folder -- verified the hero's `heroObra: estadio-ferrocarril-oeste-tribunas-
      caballito` relationship and Keystatic's `slugField: titulo` collection config both still resolve
      correctly (titulo != slugify(titulo) for most obras now; Keystatic reads/writes by folder name, not
      by regenerating the slug from title on every load, so this is safe -- only an editor manually
      clicking "regenerate slug" in the Keystatic UI after editing titulo would create a mismatch, which
      is expected/acceptable per the task brief).
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

T5.
