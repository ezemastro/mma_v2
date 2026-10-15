import { fields } from "@keystatic/core";
import { slugify } from "../lib/slugify";

export const categoriaSchema = {
  nombre: fields.slug({
    name: {
      label: "Nombre",
      description: "Nombre visible de la categoría, ej: Barrios privados.",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Se genera automáticamente del nombre.",
      generate: (nombre) => slugify(nombre),
    },
  }),
  etiqueta: fields.text({
    label: "Etiqueta",
    description: "Texto mostrado en los filtros y chips de obras.",
    validation: { isRequired: true },
  }),
};
