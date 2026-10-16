import { fields, singleton } from "@keystatic/core";
import { iconField } from "./icons";
import { astroImage } from "./image";

export const softwareSchema = singleton({
  label: "Página de Software",
  path: "src/content/pages/software/",
  schema: {
    intro: fields.markdoc({
      label: "Introducción",
      description: "Párrafo inicial, debajo del título \"MASCalculador\".",
    }),
    caracteristicas: fields.array(
      fields.object(
        {
          title: fields.text({ label: "Título" }),
          icon: iconField,
        },
        { label: "Característica" },
      ),
      {
        label: "Características destacadas",
        description: "Las 3 tarjetas cortas debajo de la introducción (ej: Intuitivo, Sencillo).",
        itemLabel: (item) => item.fields.title.value || "Característica",
      },
    ),
    audiencia: fields.markdoc({
      label: "A quién está dirigido y características",
      description: "Texto largo: a quién está dirigido el programa y cómo funciona.",
    }),
    captura: astroImage("Captura de pantalla del programa", "software"),
    version: fields.text({
      label: "Versión",
      description: 'Ej: "Actualización 1.0.1"',
    }),
    instaladorUrl: fields.text({
      label: "URL del instalador",
      description: "Enlace de descarga directa del instalador (.msi).",
    }),
    formulario: fields.object(
      {
        titulo: fields.text({ label: "Título de la sección" }),
        subtitulo: fields.text({ label: "Subtítulo de la sección" }),
        destacado: fields.text({
          label: "Frase destacada",
          description: 'Ej: "Resolvé el cálculo estructural en hormigón de manera simple y conveniente."',
        }),
        boton: fields.text({ label: "Texto del botón" }),
      },
      { label: "Formulario de descarga" },
    ),
  },
});
