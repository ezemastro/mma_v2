/**
 * ASCII, kebab-case slug generator shared by the Keystatic schemas
 * (categorias, obras) and the obras migration script, so a title like
 * "Bakabá - Playacar" consistently becomes "bakaba-playacar".
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
