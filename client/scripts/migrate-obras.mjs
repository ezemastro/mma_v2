#!/usr/bin/env node
/**
 * Migrates v1's obras CSV + image folder into Keystatic "obras" and
 * "categorias" collection entries for this app.
 *
 * Source (read-only, never modified):
 *   <MMA_V1_PATH>/public/docs/obras.csv      - ';'-delimited, UTF-8 with BOM,
 *                                              CRLF line endings, header:
 *                                              fecha;titulo;clientes;metros_cuadrados;imagen;categorias;descripcion
 *                                              "||" separates multiple
 *                                              categorias/descripcion values.
 *   <MMA_V1_PATH>/public/images/obras/*.webp - one source photo per row.
 *
 * Output (overwritten on every run -- this script is idempotent: re-running
 * it regenerates the exact same collections from the same CSV + images):
 *   src/content/categorias/<slug>.yaml
 *   src/content/obras/<slug>/index.yaml
 *   src/content/obras/<slug>/portada.webp   - resized (max 2000px long edge,
 *                                              webp quality 80, metadata
 *                                              stripped by sharp's defaults).
 *
 * The CSV row order matters: v1 showed the first 8 rows on the home
 * carousel, so this script marks those same 8 as `destacada: true` with
 * `orden` 1..8 to keep today's featured selection.
 *
 * Usage (from client/):
 *   node scripts/migrate-obras.mjs
 *   MMA_V1_PATH=/path/to/mma node scripts/migrate-obras.mjs   # override source
 */

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { Document } from "yaml";
import { slugify } from "../src/lib/slugify.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = path.resolve(__dirname, "..");
const V1_ROOT = process.env.MMA_V1_PATH ?? path.resolve(CLIENT_ROOT, "../../mma");

const CSV_PATH = path.join(V1_ROOT, "public/docs/obras.csv");
const IMAGES_DIR = path.join(V1_ROOT, "public/images/obras");

const CATEGORIAS_OUT = path.join(CLIENT_ROOT, "src/content/categorias");
const OBRAS_OUT = path.join(CLIENT_ROOT, "src/content/obras");

const FEATURED_COUNT = 8; // v1's home carousel showed the first N CSV rows.
const MAX_IMAGE_EDGE = 2000;
const WEBP_QUALITY = 80;

// The CSV's `imagen` column has ~20 rows with a typo'd or wrongly-cased
// filename that doesn't exist on disk, but a clearly-matching file (same
// obra, verified by title) exists under a slightly different name. Mapped
// here instead of silently dropping those rows. Left unmapped: rows whose
// CSV filename has no matching file anywhere in the source folder (those
// are reported as genuinely missing images).
const FILENAME_OVERRIDES = new Map([
  ["blancoencalada2185.webp", "BlancoEncadala2185.webp"], // typo in actual file: "Encadala"
  ["elgolf119,jpg.webp", "Elgolf119.webp"], // stray ",jpg" + case
  ["estrada 1480.webp", "estrada1480.webp"], // stray space
  ["lagosdelgolf492.webp", "LagosdelGolf492.webp"], // case
  ["marinas228.webp", "Marinas228.webp"], // case
  ["mastazamakro.webp", "mostazamakro.webp"], // typo: "masta" -> "mosta"
  ["mostazapuertodefrutos.webp", "mostazapuertosdefrutos.webp"], // "puerto" -> "puertos"
  ["mostazatriunvirato.pgn.webp", "mostazatriunvirato.webp"], // stray ".pgn"
  ["muelles177.webp", "Muelles177.webp"], // case
  ["navespigiel.webp", "naveszpigiel.webp"], // typo: missing "z"
  ["olavarria414.webp", "Olavarria414.webp"], // case
  ["posadadeloslagos91.webp", "posadasdeloslagos91.webp"], // "posada" -> "posadas"
  ["sansebastian13-136.webp", "sansebastián13-136.webp"], // missing accent
  ["santabarbara204.webp", "santabara204.webp"], // typo in actual file: missing "r"
  ["tapalque6666.webp", "tapalqué6666.webp"], // missing accent
  ["virazon121.webp", "Virazon121.webp"], // case
  ["virazon131.webp", "Virazon131.webp"], // case
  ["an213.webp", "albanueva213.webp"], // CSV used a truncated filename
  ["cañada12.webp", "lacañada12.webp"], // missing "la" prefix
  ["galicia411,png.webp", "galicia411.webp"], // stray ",png"
  ["laalameda446.webp", "lalameda446.webp"], // missing "a"
  ["milgor.webp", "mirgor.webp"], // the client is Mirgor
  ["mornghi.webp", "mornaghi.webp"], // typo: missing "a"
]);

// Rows whose CSV filename exists but points at another obra's photo.
// Keyed by the trimmed CSV title.
const TITLE_IMAGE_OVERRIDES = new Map([
  ["Santa Bárbara 2002 - Tigre", "santabarbara2002.webp"], // CSV reused santabarbara1103.webp
]);

// --- Category normalization -------------------------------------------
// Raw CSV tag (lowercased, trimmed) -> { slug, label }. Merges duplicates
// ("barrio privado" / "barrios privados"), fixes the "losas postesadas"
// typo (merged into "losas postensadas"), and gives every tag consistent
// capitalization for display.
const CATEGORY_MAP = new Map(
  Object.entries({
    "costa esmeralda": { slug: "costa-esmeralda", label: "Costa Esmeralda" },
    "areas comunes de barrios privados": {
      slug: "areas-comunes-de-barrios-privados",
      label: "Áreas comunes de barrios privados",
    },
    "barrio privado": { slug: "barrios-privados", label: "Barrios privados" },
    "barrios privados": { slug: "barrios-privados", label: "Barrios privados" },
    "cartel publicitario": {
      slug: "cartel-publicitario",
      label: "Cartel publicitario",
    },
    "centro medico": { slug: "centro-medico", label: "Centro médico" },
    cines: { slug: "cines", label: "Cines" },
    "edificios públicos": {
      slug: "edificios-publicos",
      label: "Edificios públicos",
    },
    edificios: { slug: "edificios", label: "Edificios" },
    "estructura metálica": {
      slug: "estructura-metalica",
      label: "Estructura metálica",
    },
    galpones: { slug: "galpones", label: "Galpones" },
    "grandes edificios": {
      slug: "grandes-edificios",
      label: "Grandes edificios",
    },
    "grandes obras": { slug: "grandes-obras", label: "Grandes obras" },
    internacional: { slug: "internacional", label: "Internacional" },
    "local comercial": { slug: "local-comercial", label: "Local comercial" },
    "losas alivianadas": {
      slug: "losas-alivianadas",
      label: "Losas alivianadas",
    },
    "losas postensadas": {
      slug: "losas-postensadas",
      label: "Losas postensadas",
    },
    "losas postesadas": {
      // typo in the source CSV
      slug: "losas-postensadas",
      label: "Losas postensadas",
    },
    nordelta: { slug: "nordelta", label: "Nordelta" },
    "puertos del lago": { slug: "puertos-del-lago", label: "Puertos del Lago" },
    residencial: { slug: "residencial", label: "Residencial" },
    "zona sísmica": { slug: "zona-sismica", label: "Zona sísmica" },
  }),
);

function toYaml(data) {
  const doc = new Document(data);
  return doc.toString({ lineWidth: 0 });
}

/** Minimal robust ';'-delimited CSV line splitter (no quoted fields in this
 * source file, verified against the real obras.csv). */
function splitRow(line) {
  return line.split(";").map((cell) => cell.trim());
}

async function parseCsv() {
  const raw = await readFile(CSV_PATH, "utf8");
  const withoutBom = raw.replace(/^﻿/, "");
  const lines = withoutBom.split(/\r\n|\n/).filter((line) => line.trim().length > 0);

  const [headerLine, ...dataLines] = lines;
  const header = splitRow(headerLine);
  const expected = [
    "fecha",
    "titulo",
    "clientes",
    "metros_cuadrados",
    "imagen",
    "categorias",
    "descripcion",
  ];
  if (header.join(",") !== expected.join(",")) {
    throw new Error(
      `Unexpected obras.csv header. Expected ${expected.join(";")}, got ${header.join(";")}`,
    );
  }

  return dataLines.map((line, index) => {
    const cols = splitRow(line);
    const [fecha, titulo, clientes, metros_cuadrados, imagen, categorias, descripcion] = cols;
    return {
      rowNumber: index + 2, // +1 for header, +1 for 1-based
      fecha,
      titulo,
      clientes,
      metros_cuadrados,
      imagen,
      categorias,
      descripcion,
    };
  });
}

function mapCategories(rawCategorias, failures, rowNumber) {
  const slugs = [];
  for (const rawTag of rawCategorias.split("||")) {
    const tag = rawTag.trim();
    if (!tag) continue;
    const mapped = CATEGORY_MAP.get(tag.toLowerCase());
    if (!mapped) {
      failures.push(`Row ${rowNumber}: unknown category "${tag}"`);
      continue;
    }
    if (!slugs.includes(mapped.slug)) slugs.push(mapped.slug);
  }
  return slugs;
}

/** Splits `str` on every occurrence of `sep` that is NOT inside a
 * parenthesized group, so a location like "Baradero (Centro de Robótica,
 * Automatización y Sensores)" never gets split on a comma/hyphen that
 * happens to sit inside its own parentheses. */
function splitOutsideParens(str, sep) {
  const parts = [];
  let depth = 0;
  let current = "";
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && str.startsWith(sep, i)) {
      parts.push(current);
      current = "";
      i += sep.length;
      continue;
    }
    current += ch;
    i += 1;
  }
  parts.push(current);
  return parts;
}

/** Normalizes "( foo )" -> "(foo)", collapsing whitespace just inside the
 * parentheses left by rows like "( Local Mostaza)" or "(Jardín  Nº 928 )". */
function cleanParens(str) {
  return str.replace(/\(\s*([^()]*?)\s*\)/g, (_match, inner) => `(${inner.replace(/\s+/g, " ").trim()})`);
}

/**
 * Splits the CSV's raw "titulo" column (address + location, loosely
 * " - "-delimited) into a short `titulo` and a separate `ubicacion`.
 *
 * Rules (see client/odd/tasks/astro-migration.md T4b item 3 for the worked
 * examples this was built against):
 *  - The first " - "-separated segment becomes `titulo`.
 *  - Remaining segments join with ", " into `ubicacion`.
 *  - A parenthesized group that lands in a *location* segment (e.g. a
 *    local's brand name, "San Isidro (Local Mostaza)") describes the obra,
 *    not the place, so it moves to the end of `titulo` instead.
 *  - Rows with no " - " separator keep the whole (cleaned) string as
 *    `titulo` and get no `ubicacion` (e.g. "Peajes autopista AUSUR").
 */
function splitTituloUbicacion(rawTitulo) {
  // Some rows space the separator on one side only ("Acacias 299- Puertos
  // del Lago", "Albanueva 07- Tigre"); normalize those to " - " first. A
  // hyphen with no space on either side (e.g. "12-73") is left alone.
  const collapsed = cleanParens(
    rawTitulo
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(\S)- /g, "$1 - ")
      .replace(/ -(\S)/g, " - $1"),
  );
  const segments = splitOutsideParens(collapsed, " - ")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return { titulo: collapsed, ubicacion: "" };

  let titulo = segments[0];
  const locationSegments = segments.slice(1);
  const cleanedLocationSegments = [];
  let movedParen = null;

  for (const segment of locationSegments) {
    const match = segment.match(/\(([^()]*)\)/);
    if (match && !movedParen) {
      movedParen = `(${match[1].trim()})`;
      const withoutParen = segment.replace(match[0], "").replace(/\s+/g, " ").trim();
      if (withoutParen) cleanedLocationSegments.push(withoutParen);
    } else {
      cleanedLocationSegments.push(segment);
    }
  }

  if (movedParen) titulo = `${titulo} ${movedParen}`;

  return { titulo, ubicacion: cleanedLocationSegments.join(", ") };
}

function uniqueSlug(base, used) {
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(slug);
  return slug;
}

async function writeCategorias() {
  await rm(CATEGORIAS_OUT, { recursive: true, force: true });
  await mkdir(CATEGORIAS_OUT, { recursive: true });

  const unique = new Map();
  for (const { slug, label } of CATEGORY_MAP.values()) {
    unique.set(slug, label);
  }

  for (const [slug, label] of unique) {
    await writeFile(
      path.join(CATEGORIAS_OUT, `${slug}.yaml`),
      toYaml({ nombre: label, etiqueta: label }),
      "utf8",
    );
  }

  return unique;
}

async function resizeImage(sourcePath, destPath) {
  const before = (await stat(sourcePath)).size;
  const image = sharp(sourcePath).rotate(); // auto-orient, then drop EXIF below
  const metadata = await image.metadata();
  const longEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0);

  let pipeline = image;
  if (longEdge > MAX_IMAGE_EDGE) {
    pipeline =
      (metadata.width ?? 0) >= (metadata.height ?? 0)
        ? pipeline.resize({ width: MAX_IMAGE_EDGE })
        : pipeline.resize({ height: MAX_IMAGE_EDGE });
  }

  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(destPath);
  const after = (await stat(destPath)).size;
  return { before, after };
}

async function main() {
  const rows = await parseCsv();
  const categoryFailures = [];
  const categorias = await writeCategorias();

  await rm(OBRAS_OUT, { recursive: true, force: true });
  await mkdir(OBRAS_OUT, { recursive: true });

  const usedSlugs = new Set();
  let migrated = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  const missingImages = [];
  const otherFailures = [];

  for (const row of rows) {
    const { rowNumber, fecha, titulo, clientes, metros_cuadrados, imagen, categorias: rawCategorias, descripcion } =
      row;

    if (!titulo || !imagen) {
      otherFailures.push(`Row ${rowNumber}: missing titulo or imagen, skipped`);
      continue;
    }

    const actualFilename =
      TITLE_IMAGE_OVERRIDES.get(titulo) ?? FILENAME_OVERRIDES.get(imagen) ?? imagen;
    const sourceImagePath = path.join(IMAGES_DIR, actualFilename);
    try {
      await stat(sourceImagePath);
    } catch {
      missingImages.push(`Row ${rowNumber} (${titulo}): image not found: ${imagen}`);
      continue;
    }

    // Slug stays derived from the ORIGINAL full CSV title (not the split
    // titulo below) so existing folder names -- and anything that already
    // references them, like the homepage's hero obra relationship -- never
    // change when this idempotent script is re-run.
    const slug = uniqueSlug(slugify(titulo), usedSlugs);
    const entryDir = path.join(OBRAS_OUT, slug);
    await mkdir(entryDir, { recursive: true });

    const { titulo: splitTitulo, ubicacion: splitUbicacion } = splitTituloUbicacion(titulo);

    const { before, after } = await resizeImage(sourceImagePath, path.join(entryDir, "portada.webp"));
    totalBefore += before;
    totalAfter += after;

    const anio = Number.parseInt(fecha, 10);
    const superficie = Number.parseInt(metros_cuadrados, 10);
    const descripcionParts = descripcion
      .split("||")
      .map((part) => part.trim())
      .filter(Boolean);

    const index = rows.indexOf(row);
    const isFeatured = index < FEATURED_COUNT;

    const data = {
      titulo: splitTitulo,
      anio: Number.isFinite(anio) ? anio : null,
      cliente: clientes,
      superficie: Number.isFinite(superficie) ? superficie : null,
      ubicacion: splitUbicacion,
      categorias: mapCategories(rawCategorias, categoryFailures, rowNumber),
      descripcion: descripcionParts.join("\n\n"),
      portada: "./portada.webp",
      galeria: [],
      destacada: isFeatured,
      orden: isFeatured ? index + 1 : null,
    };

    await writeFile(path.join(entryDir, "index.yaml"), toYaml(data), "utf8");
    migrated += 1;
  }

  console.log(`Categorías migradas: ${categorias.size}`);
  console.log(`Obras migradas: ${migrated} / ${rows.length}`);
  console.log(
    `Tamaño de imágenes: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB`,
  );

  if (missingImages.length) {
    console.log(`\nImágenes faltantes (${missingImages.length}):`);
    missingImages.forEach((line) => console.log(`  ${line}`));
  }
  if (categoryFailures.length) {
    console.log(`\nCategorías sin mapear (${categoryFailures.length}):`);
    categoryFailures.forEach((line) => console.log(`  ${line}`));
  }
  if (otherFailures.length) {
    console.log(`\nFilas con problemas (${otherFailures.length}):`);
    otherFailures.forEach((line) => console.log(`  ${line}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
