import { fields } from "@keystatic/core";

export const iconCollectionSchema = {
  key: fields.slug({
    name: {
      label: "Nombre amigable",
      description: "Nombre visible en el CMS.",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Se genera automaticamente del nombre.",
      generate: (name) =>
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
    },
  }),
  iconifyName: fields.text({
    label: "Nombre del icono (Iconify)",
    description:
      "Busca en icon-sets.iconify.design y pega el nombre completo. Ej: material-symbols:10k-outline-rounded",
    validation: { isRequired: true },
  }),
};

export const iconRelationship = fields.relationship({
  label: "Icono",
  collection: "icons",
  description:
    "Selecciona un icono guardado en la coleccion Iconos. Si no existe, crealo primero.",
  validation: { isRequired: true },
});
