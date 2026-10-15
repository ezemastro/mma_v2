import { fields } from "@keystatic/core";

// Images live under src/assets/cms so Astro can optimize them at build time
// (sharp-resized, lazy, no layout shift) instead of serving untouched
// originals from public/. Resolve the stored path with resolveCmsImage()
// (see src/lib/cms-image.ts) before passing it to <Image>.
export const astroImage = (label = "Imagen") => {
  return fields.image({
    label,
    directory: "src/assets/cms",
    publicPath: "/src/assets/cms/",
  });
};
