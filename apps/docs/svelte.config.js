import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// ─────────────────────────────────────────────────────────────────────────────
// CSP — À POSER EN HEADER HTTP CÔTÉ PROD (Cloudflare Pages `_headers`/règle),
// PAS via `kit.csp` ici.
//
// Pourquoi pas `kit.csp` : ce site injecte des <style> à l'exécution
// (compileTheme -> document.createElement('style').textContent), utilise
// `{@html}` pour le thème de base et des styles inline dans les îles React/Vue.
// Une CSP à hash (mode 'auto' d'adapter-static) bloquerait ces styles runtime et
// casserait le thème. On documente donc la CSP à poser en header, sans la durcir
// aveuglément au build.
//
// La SEULE directive AJOUTÉE pour le login OAuth est `connect-src`, qui doit
// autoriser https://auth.sent-tech.ca (token + userinfo + jwks). `script-src`
// reste 'self' : jose est bundlé, aucun script tiers n'est chargé.
//
//   Content-Security-Policy:
//     default-src 'self';
//     script-src 'self';
//     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
//     font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
//     img-src 'self' data: https:;
//     connect-src 'self' https://auth.sent-tech.ca https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net;
//     frame-ancestors 'none';
//     base-uri 'self';
//
// Note : `style-src 'unsafe-inline'` est requis tant que le thème est injecté à
// l'exécution. `img-src https:` couvre un éventuel avatar (claim picture).
// ─────────────────────────────────────────────────────────────────────────────

const BUILD_DIR = process.env.DOCS_BUILD_DIR ?? "build";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: BUILD_DIR,
      assets: BUILD_DIR,
      fallback: "404.html",
      precompress: false,
      strict: true
    }),
    paths: {
      relative: false
    },
    prerender: {
      handleHttpError: "warn",
      handleUnseenRoutes: "ignore",
      handleMissingId: "warn"
    }
  }
};
