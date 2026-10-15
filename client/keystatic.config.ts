import { config, collection } from "@keystatic/core";
import { iconCollectionSchema } from "./src/schemas/icons";
import { homepageSchema } from "./src/schemas/homepage";
import { settingsSchema } from "./src/schemas/settings";
import { categoriaSchema } from "./src/schemas/categoria";
import { obraSchema } from "./src/schemas/obra";

// Local storage lets the Keystatic admin write directly to the filesystem,
// which only works in dev (there is no writable filesystem once deployed).
// In production we read/write through the GitHub App instead. We key off
// PUBLIC_KEYSTATIC_GITHUB_APP_SLUG (present only when the GitHub app env
// vars are configured) rather than import.meta.env.PROD alone, so a local
// production build without those vars still falls back to `local` and
// `npm run build` keeps working without any GitHub secrets.
const useGitHubStorage =
  import.meta.env.PROD && !!import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

export default config({
  storage: useGitHubStorage
    ? {
        kind: "github",
        repo: "ezemastro/mma_v2",
        // The Astro app lives in client/, not at the repo root.
        pathPrefix: "client",
      }
    : {
        kind: "local",
      },
  ui: {
    brand: { name: "Mastropietro Ingeniería" },
  },
  singletons: {
    homepage: homepageSchema,
    settings: settingsSchema,
  },
  collections: {
    icons: collection({
      label: "Iconos",
      path: "src/content/globals/icons/*",
      format: { data: "yaml" },
      slugField: "key",
      columns: ["key", "iconifyName"],
      schema: iconCollectionSchema,
    }),
    categorias: collection({
      label: "Categorías",
      path: "src/content/categorias/*",
      format: { data: "yaml" },
      slugField: "nombre",
      columns: ["nombre", "etiqueta"],
      schema: categoriaSchema,
    }),
    obras: collection({
      label: "Obras",
      path: "src/content/obras/*/",
      format: { data: "yaml" },
      slugField: "titulo",
      columns: ["titulo", "anio", "cliente"],
      previewUrl: "/obras/{slug}",
      schema: obraSchema,
    }),
  },
});
