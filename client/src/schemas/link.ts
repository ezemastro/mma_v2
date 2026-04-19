import { fields } from "@keystatic/core";

export const link = fields.object(
  {
    href: fields.text({ label: "URL" }),
    label: fields.text({ label: "Texto del enlace" }),
  },
  { label: "Enlace" },
);
