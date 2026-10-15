import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// Obras are stored one per folder (src/content/obras/<slug>/index.yaml,
// portada/galeria images colocated in that same folder) by the Keystatic
// "obras" collection (see keystatic.config.ts / src/schemas/obra.ts). The
// glob loader tracks each entry's filePath, which is what lets the image()
// schema helper below resolve the stored relative paths ("./portada.webp")
// back to real, optimizable ImageMetadata.
const obras = defineCollection({
  loader: glob({ pattern: "*/index.yaml", base: "./src/content/obras" }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      anio: z.number(),
      cliente: z.string(),
      superficie: z.number().nullable().optional(),
      ubicacion: z.string().nullable().optional(),
      categorias: z.array(z.string()).default([]),
      descripcion: z.string(),
      portada: image(),
      galeria: z.array(image()).default([]),
      destacada: z.boolean().default(false),
      orden: z.number().nullable().optional(),
    }),
});

// Categorias has no images, so the plain Keystatic reader (see
// src/lib/keystatic-reader.ts) is enough wherever only the label/slug are
// needed, but exposing it as a content collection too keeps `/obras`
// filtering code consistent (one getCollection() call per data source).
const categorias = defineCollection({
  loader: glob({ pattern: "*", base: "./src/content/categorias" }),
  schema: z.object({
    nombre: z.string(),
    etiqueta: z.string(),
  }),
});

export const collections = { obras, categorias };
