import { config, fields, collection, singleton } from "@keystatic/core";
import { selectIcon } from "./src/schemas/icons";

const link = fields.object(
  {
    href: fields.text({ label: "URL" }),
    label: fields.text({ label: "Texto del enlace" }),
  },
  { label: "Enlace" },
);

export default config({
  storage: {
    kind: "local",
  },
  singletons: {
    homepage: singleton({
      label: "Página de inicio",
      path: "src/content/pages/homepage/",
      schema: {
        header: fields.object(
          {
            title: fields.text({ label: "Title" }),
            subtitle: fields.text({ label: "Subtitle" }),
            logo: fields.image({ label: "Logo" }),
            background: fields.image({ label: "Imagen de fondo" }),
          },
          {
            label: "Encabezado",
          },
        ),

        sections: fields.blocks(
          {
            cards: {
              label: "Tarjetas",
              itemLabel: (item) => item.fields.title.value || "Tarjetas",
              schema: fields.object({
                title: fields.text({ label: "Título" }),
                subtitle: fields.text({ label: "Subtítulo" }),
                content: fields.array(
                  fields.object(
                    {
                      title: fields.text({ label: "Título" }),
                      description: fields.markdoc({ label: "Descripción" }),
                      icon: selectIcon,
                      link,
                    },
                    { label: "Tarjeta" },
                  ),
                  {
                    label: "Tarjetas",
                    itemLabel: (item) => item.fields.title.value || "Tarjeta",
                  },
                ),
                image: fields.image({ label: "Imagen extra" }),
              }),
            },
            text: {
              label: "Texto",
              itemLabel: (item) => item.fields.title.value || "Texto",
              schema: fields.object({
                title: fields.text({ label: "Título" }),
                subtitle: fields.text({ label: "Subtítulo" }),
                link,
                content: fields.markdoc({ label: "Contenido" }),
                image: fields.image({ label: "Imagen" }),
              }),
            },
            stats: {
              label: "Estadísticas",
              schema: fields.object(
                {
                  calculated: fields.number({
                    label: "Metros cuadrados calculados",
                  }),
                  projects: fields.number({ label: "Proyectos realizados" }),
                  years: fields.number({ label: "Años de experiencia" }),
                  clients: fields.number({ label: "Clientes satisfechos" }),
                },
                { label: "Estadísticas" },
              ),
            },
            clients: {
              label: "Clientes",
              schema: fields.object({
                title: fields.text({ label: "Título" }),
                subtitle: fields.text({ label: "Subtítulo" }),
                content: fields.array(
                  fields.object({
                    name: fields.text({ label: "Nombre del cliente" }),
                    logo: fields.image({ label: "Logo del cliente" }),
                  }),
                  {
                    label: "Clientes",
                    itemLabel: (item) => item.fields.name.value || "Cliente",
                  },
                ),
              }),
            },
          },
          {
            label: "Secciones",
          },
        ),
      },
    }),
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
  collections: {},
});
