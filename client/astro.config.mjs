// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// Resolved here, in real Node, while this config file loads. Inlined below
// as a build-time constant because `process.cwd()` and `import.meta.url`
// are both unreliable inside the Cloudflare adapter's workerd prerender
// sandbox (cwd resolves to "/", and import.meta.url is not a valid file://
// URL there) -- see src/lib/keystatic-reader.ts.
const projectRoot = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://mastropietro.com.ar',

  // Every page is prerendered to static HTML. Only Keystatic's injected
  // routes (/keystatic, /api/keystatic/...) are rendered on demand by the
  // Cloudflare adapter.
  output: 'static',

  integrations: [
    react(),
    markdoc(),
    keystatic(),
    icon(),
    sitemap({
      // The sitemap integration collects every emitted page regardless of
      // rendering mode, so Keystatic's on-demand admin/API routes and the
      // post-form /descarga and 404 pages need an explicit filter to stay
      // out of what we ask search engines to index.
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path === '/descarga' || path === '/descarga/') return false;
        if (path === '/404' || path === '/404/') return false;
        if (path.startsWith('/keystatic')) return false;
        if (path.startsWith('/api/')) return false;
        return true;
      },
    }),
  ],

  adapter: cloudflare({
    // 'compile' optimizes images with sharp at build time for every
    // prerendered page; on-demand routes (Keystatic's admin) fall back to a
    // no-op passthrough, which is fine since they are not image-heavy pages.
    imageService: 'compile',
    // Prerendered pages read content from the filesystem through Keystatic's
    // local reader (node:fs). The default 'workerd' prerender sandbox has no
    // real filesystem access, so every read silently looks like a missing
    // file. On-demand routes (Keystatic's admin) are unaffected and keep
    // running in workerd, matching the production runtime.
    prerenderEnvironment: 'node',
    configPath: 'wrangler.jsonc',
  }),

  vite: {
    plugins: [tailwindcss()],
    define: {
      __PROJECT_ROOT__: JSON.stringify(projectRoot),
    },
    resolve: {
      // Cloudflare workaround for React 19: use react-dom/server.edge instead
      // of react-dom/server.browser, which needs MessageChannel (unavailable
      // in the workerd runtime) unless polyfilled.
      // https://github.com/withastro/adapters/pull/436#issuecomment-2525190557
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : undefined,
    },
  },
});
