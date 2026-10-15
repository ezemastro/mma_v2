// Keystatic's fields.image() on a singleton/collection read through
// createReader() returns a plain public-path string (e.g.
// "/src/assets/cms/header/logo.png"), not an Astro ImageMetadata object.
// To let Astro optimize these images at build time we need to resolve that
// string back to the actual imported module. import.meta.glob (eager) does
// that lookup once per build.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/cms/**/*.{jpg,jpeg,png,webp,gif,svg,avif}",
  { eager: true },
);

/**
 * Resolves a Keystatic-stored CMS image path to its optimizable
 * ImageMetadata, for use as <Image src={resolveCmsImage(path)} />.
 * Returns null when the path is empty/missing, throws when the referenced
 * file cannot be found (broken content reference).
 */
export function resolveCmsImage(
  path: string | null | undefined,
): ImageMetadata | null {
  if (!path) return null;

  const mod = modules[path];
  if (!mod) {
    throw new Error(`CMS image not found in src/assets/cms: ${path}`);
  }
  return mod.default;
}
