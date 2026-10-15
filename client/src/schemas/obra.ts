import { fields } from "@keystatic/core";
import { slugify } from "../lib/slugify";

// Images are stored alongside each obra's index.yaml (directory left
// unset so Keystatic writes into the entry's own folder) and referenced
// with a relative publicPath. That relative string ("./portada.webp") is
// exactly the format Astro's content-collection image() helper resolves
// against the entry's own file location (see src/content.config.ts).
const obraImage = (label: string, isRequired: boolean) =>
  fields.image({
    label,
    publicPath: "./",
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
