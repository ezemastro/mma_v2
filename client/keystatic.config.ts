import { config, fields, collection, singleton } from "@keystatic/core";
import { iconCollectionSchema } from "./src/schemas/icons";
import { homepageSchema } from "./src/schemas/homepage";

export default config({
  storage: {
    kind: "local",
  },
  singletons: {
    homepage: homepageSchema,
    footer: singleton({
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
    }),
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
  },
});
