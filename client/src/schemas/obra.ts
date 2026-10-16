import { fields } from "@keystatic/core";
import { slugify } from "../lib/slugify";

// Images are stored alongside each obra's index.yaml (directory left unset
// so Keystatic writes the file into the entry's own folder) and referenced
// with a bare relative filename ("portada.webp"), which is the format
// Astro's content-collection image() helper resolves against the entry's
// own file location (see src/content.config.ts).
//
// publicPath is intentionally omitted: Keystatic's getSrcPrefix() treats a
// string publicPath as "shared directory, namespaced by a `<slug>/`
// subfolder" and always prepends the entry's slug to it (confirmed by
// reading node_modules/@keystatic/core/dist/index-3c244051.js
// getSrcPrefix()). With publicPath: "./" that produced a stored value of
// "./<slug>/portada.webp" when creating an entry through the admin UI --
// one directory level too deep for our "colocated in the entry's own
// folder" convention, even though the uploaded file itself still landed in
// the right place on disk. Leaving publicPath unset makes getSrcPrefix()
// return "" instead, so the stored value is just the bare filename.
const obraImage = (label: string, isRequired: boolean) =>
  fields.image({
    label,
    validation: { isRequired },
  });

export const obraSchema = {
  titulo: fields.slug({
    name: {
      label: "Título",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Se genera automáticamente del título.",
      generate: (titulo) => slugify(titulo),
    },
  }),
  anio: fields.integer({
    label: "Año",
    validation: { isRequired: true },
  }),
  cliente: fields.text({
    label: "Cliente",
    validation: { isRequired: true },
  }),
  superficie: fields.integer({
    label: "Superficie (m²)",
    validation: { isRequired: false },
  }),
  ubicacion: fields.text({
    label: "Ubicación",
    description: "Localidad o barrio de la obra, ej: \"San Isidro\" o \"Puertos del Lago, Escobar\".",
    validation: { isRequired: false },
  }),
  categorias: fields.multiRelationship({
    label: "Categorías",
    collection: "categorias",
  }),
  descripcion: fields.text({
    label: "Descripción",
    multiline: true,
  }),
  portada: obraImage("Portada", true),
  galeria: fields.array(obraImage("Imagen", true), {
    label: "Galería",
    itemLabel: () => "Imagen",
  }),
  destacada: fields.checkbox({
    label: "Destacada en inicio",
    defaultValue: false,
  }),
  orden: fields.integer({
    label: "Orden (entre las destacadas)",
    validation: { isRequired: false },
  }),
};
