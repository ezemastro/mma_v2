import { fields } from "@keystatic/core";

// Images live under src/assets/cms so Astro can optimize them at build time
// (sharp-resized, lazy, no layout shift) instead of serving untouched
// originals from public/. Resolve the stored path with resolveCmsImage()
// (see src/lib/cms-image.ts) before passing it to <Image>.
// Keystatic names singleton images `<directory>/<field path>` with no
// per-singleton prefix, so every singleton other than the homepage passes its
// own subdirectory to keep field names from colliding.
export const astroImage = (label = "Imagen", subdirectory?: string) => {
  const directory = subdirectory ? `src/assets/cms/${subdirectory}` : "src/assets/cms";
  return fields.image({
    label,
    directory,
    publicPath: `/${directory}/`,
  });
};
