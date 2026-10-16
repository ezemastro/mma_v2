import type { reader } from "./keystatic-reader";

// Narrowed from the reader's own return type so this stays in sync with
// src/schemas/settings.ts without duplicating the shape by hand.
type Settings = NonNullable<Awaited<ReturnType<typeof reader.singletons.settings.read>>>;

const SITE_URL = "https://mastropietro.com.ar";

/** Resolves a site-relative path (e.g. an optimized image's `.src`) to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// Shared by the home page's ProfessionalService and each obra's CreativeWork
// `creator`, so the organization's identity (address, geo, contact) is
// described once from the real settings data instead of duplicated per page.
export function buildOrganization(settings: Settings, logoUrl: string) {
  const addressParts = settings.contacto.direccionTexto.split(",").map((part) => part.trim());
  const [streetAddress, addressLocality, addressRegion] = addressParts;

  return {
    "@type": "ProfessionalService" as const,
    name: "Marcelo Mastropietro Ingeniería",
    url: SITE_URL,
    logo: logoUrl,
    telephone: settings.contacto.telefonoNumero,
    email: settings.contacto.email,
    address: {
      "@type": "PostalAddress" as const,
      streetAddress,
      addressLocality,
      addressRegion,
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates" as const,
      latitude: settings.contacto.mapaLat,
      longitude: settings.contacto.mapaLng,
    },
  };
}
