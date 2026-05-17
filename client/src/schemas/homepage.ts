import { fields, singleton } from "@keystatic/core";
import { iconField } from "./icons";
import { link } from "./link";
import { astroImage } from "./image";

export const homepageSchema = singleton({
  label: "Página de inicio",
  path: "src/content/pages/homepage/",
  schema: {
    header: fields.object(
      {
        title: fields.text({ label: "Title" }),
        subtitle: fields.text({ label: "Subtitle" }),
        logo: astroImage("Logo"),
        background: astroImage("Imagen de fondo"),
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
                  icon: iconField,
                  link,
                },
                { label: "Tarjeta" },
              ),
              {
                label: "Tarjetas",
                itemLabel: (item) => item.fields.title.value || "Tarjeta",
              },
            ),
            image: astroImage("Imagen extra"),
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
            image: astroImage(),
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
                logo: astroImage("Logo del cliente"),
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
});
