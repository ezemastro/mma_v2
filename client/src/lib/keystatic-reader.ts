import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

// `__PROJECT_ROOT__` is a build-time constant injected via `vite.define` in
// astro.config.mjs. Neither `process.cwd()` nor `import.meta.url` are
// reliable here: the Cloudflare adapter prerenders pages inside a workerd
// sandbox where cwd resolves to "/" (read() then silently returns null, as
// if the file were missing) and import.meta.url is not a valid file:// URL
// (throws "Invalid URL string"). The define is a plain inlined string, so
// it survives that sandbox untouched. Declared globally in src/env.d.ts.

export const reader = createReader(__PROJECT_ROOT__, keystaticConfig);
