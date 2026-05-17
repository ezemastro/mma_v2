import { config, collection } from "@keystatic/core";
import { iconCollectionSchema } from "./src/schemas/icons";
import { homepageSchema } from "./src/schemas/homepage";
import { footerSchema } from "./src/schemas/footer";

export default config({
  storage: {
    kind: "local",
  },
  singletons: {
    homepage: homepageSchema,
    footer: footerSchema,
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
