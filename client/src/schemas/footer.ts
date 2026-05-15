import { fields, singleton } from "@keystatic/core";

export const footerSchema = singleton({
  label: "Pie de página",
  path: "src/content/globals/footer/",
  schema: {
    phone: fields.object(
      {
        title: fields.text({ label: "Título" }),
        number: fields.text({ label: "Número de teléfono" }),
      },
      { label: "Teléfono" },
    ),
    email: fields.object(
      {
        title: fields.text({ label: "Título" }),
        address: fields.text({ label: "Dirección de correo electrónico" }),
      },
      { label: "Correo electrónico" },
    ),
  },
});
