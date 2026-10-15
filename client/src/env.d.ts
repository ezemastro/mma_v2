/// <reference types="astro/client" />

// Build-time constant injected via `vite.define` in astro.config.mjs.
// See src/lib/keystatic-reader.ts for why this exists.
declare const __PROJECT_ROOT__: string;
