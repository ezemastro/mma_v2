import { fields } from "@keystatic/core";

export const selectIcon = fields.select({
  label: "Icono",
  defaultValue: "home",
  options: [
    { label: "Casa", value: "home" },
    { label: "Proyecto", value: "project" },
    { label: "Clientes", value: "clients" },
    { label: "Contacto", value: "contact" },
  ],
});
