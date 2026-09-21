import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// ─────────────────────────────────────────────────────────────────────────────
// CSP — politique DOCUMENTÉE, NON APPLIQUÉE en production (décision owner).
//
// Hébergement réel : GitHub Pages (.github/workflows/docs.yml), qui ne permet
// pas de poser d'en-têtes HTTP. Le domaine (static/CNAME) passe par le proxy
// Cloudflare (constaté le 2026-09-21 : `server: cloudflare` +
// `x-github-request-id`) : un en-tête ne peut donc venir que d'une règle
// Cloudflare sur la zone, hors de ce dépôt. Un fichier `_headers` serait ignoré
// (fonction de Cloudflare Pages, pas de GitHub Pages).
//
// Le build est COMPATIBLE avec cette politique, sans `unsafe-eval` ni
// `unsafe-inline` pour les scripts :
//   - île Angular liée au build (angular-linker.ts) : pas de compilateur JIT ;
//   - script pré-hydratation servi en fichier (static/pre-hydration.js) ;
//   - amorce d'hydratation SvelteKit externalisée après le build
//     (scripts/externalize-inline-scripts.mjs).
// Preuve exécutable : `npm run csp:check` (scripts/csp-check.mjs) sert le build
// AVEC cet en-tête et charge les pages clés dans Chromium.
//
// Pourquoi pas `kit.csp` : sur les pages prérendues, SvelteKit écrit la
// politique dans une balise <meta http-equiv="content-security-policy">, donc
// l'APPLIQUE ; et ses hashes n'autorisent l'amorce inline que pour cette balise.
//
// `style-src 'unsafe-inline'` reste requis : le thème est injecté à l'exécution
// (compileTheme -> <style>), `{@html}` pour le thème de base, styles inline des
// îles. `script-src 'self'` suffit : jose est bundlé, aucun script tiers n'est
// chargé. `connect-src` autorise https://auth.sent-tech.ca (login OAuth : token,
// userinfo, jwks). `img-src https:` couvre un éventuel avatar (claim picture).
// `style-src https://cdn.jsdelivr.net` : /compare charge dans ses iframes srcdoc
// (qui héritent de la CSP) les CSS officielles de référence (DSFR…).
// ─────────────────────────────────────────────────────────────────────────────
export const DOCUMENTED_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "img-src 'self' data: https:",
  "connect-src 'self' https://auth.sent-tech.ca https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "frame-ancestors 'none'",
  "base-uri 'self'"
].join("; ");

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
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
