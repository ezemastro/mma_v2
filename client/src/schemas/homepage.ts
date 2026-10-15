import { fields, singleton } from "@keystatic/core";
import { iconField } from "./icons";
import { link } from "./link";
import { astroImage } from "./image";

// Shared by the "cards" and "text" blocks below: lets the client pick a
// visual treatment per section instance from Keystatic without touching
// code, instead of every block of the same type looking identical.
const cardsVariante = fields.select({
  label: "Variante de diseño",
  description:
    "Cuadrícula: tarjetas en grilla. Imagen + lista: una imagen grande (ej. certificado) junto a los" +
    " ítems apilados, sin tarjetas repetidas.",
  options: [
    { label: "Cuadrícula", value: "grid" },
    { label: "Imagen + lista", value: "imagen-lista" },
  ],
  defaultValue: "grid",
});

const textVariante = fields.select({
  label: "Variante de diseño",
  description: "Lista numerada: para contenido tipo política de calidad, en 2 columnas.",
  options: [
    { label: "Simple", value: "simple" },
    { label: "Lista numerada en 2 columnas", value: "lista-numerada" },
  ],
  defaultValue: "simple",
});

export const homepageSchema = singleton({
  label: "Página de inicio",
  path: "src/content/pages/homepage/",
  schema: {
    header: fields.object(
      {
        title: fields.text({ label: "Title", description: "Usado como <title> de la página." } ),
        subtitle: fields.text({ label: "Subtitle" }),
        headline: fields.text({
          label: "Título del hero",
          description: "Frase principal del hero, ej: \"No existe proyecto de arquitectura sin estructura.\"",
          multiline: true,
        }),
        subtext: fields.text({
          label: "Bajada del hero",
          description: "Una oración corta debajo del título (máx. 20 palabras).",
          multiline: true,
        }),
        heroObra: fields.relationship({
          label: "Obra destacada en el hero",
          description: "La foto de esta obra se muestra junto al título del hero.",
          collection: "obras",
        }),
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
            variante: cardsVariante,
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
            image: astroImage("Imagen extra (usada en la variante Imagen + lista)"),
          }),
        },
        text: {
          label: "Texto",
          itemLabel: (item) => item.fields.title.value || "Texto",
          schema: fields.object({
            title: fields.text({ label: "Título" }),
            subtitle: fields.text({ label: "Subtítulo" }),
            variante: textVariante,
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
        publicaciones: {
          label: "Publicaciones",
          itemLabel: (item) => item.fields.title.value || "Publicaciones",
          schema: fields.object({
            title: fields.text({ label: "Título" }),
            content: fields.array(
              fields.object(
                {
                  title: fields.text({ label: "Título" }),
                  subtitle: fields.text({ label: "Subtítulo" }),
                  description: fields.markdoc({ label: "Descripción" }),
                  image: astroImage(),
                  link,
                },
                { label: "Publicación" },
              ),
              {
                label: "Publicaciones",
                itemLabel: (item) => item.fields.title.value || "Publicación",
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
