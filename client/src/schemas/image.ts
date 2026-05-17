import { fields } from "@keystatic/core";

export const astroImage = (label = "Imagen") => {
  return fields.image({
    label,
    directory: "public/cms",
    publicPath: "/cms/",
  });
};
