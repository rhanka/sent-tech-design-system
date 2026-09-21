// Externalise les <script> inline exécutables du build statique.
//
// Usage : node scripts/externalize-inline-scripts.mjs [buildDir]   (défaut : build)
// Lancé par `npm run build` juste après `vite build`.
//
// Pourquoi : SvelteKit écrit dans chaque page prérendue (et dans 404.html) une
// amorce d'hydratation INLINE (`<script>{ __sveltekit_… = …; kit.start(…) }</script>`).
// Sous une CSP `script-src 'self'` (sans 'unsafe-inline', sans hash), le
// navigateur la bloque et la page ne s'hydrate pas. `kit.csp` saurait la
// hacher, mais il écrirait alors lui-même la politique dans une balise
// <meta http-equiv> de chaque page prérendue, c'est-à-dire qu'il l'appliquerait.
//
// Ce post-traitement déplace chaque script inline dans un fichier nommé par le
// hash de son contenu (`<appDir>/immutable/inline/<sha256>.js`) et le remplace
// par `<script src>` AU MÊME ENDROIT : script classique synchrone, donc même
// ordre d'exécution, et `document.currentScript.parentElement` désigne toujours
// le conteneur d'hydratation. Il ne pose AUCUNE CSP.
//
// Idempotent : un second passage ne trouve plus rien. Les blocs de données
// (`<script type="application/json">`…) ne sont pas exécutés et ne relèvent pas
// de script-src : ils restent en place.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../svelte.config.js";

const EXECUTABLE_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);
const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function scriptType(attributes) {
  const match = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim().toLowerCase();
}

export function externalizeInlineScripts(buildDir) {
  const base = config.kit?.paths?.base ?? "";
  const appDir = config.kit?.appDir ?? "_app";
  const outDir = `${appDir}/immutable/inline`;
  mkdirSync(join(buildDir, outDir), { recursive: true });

  let pages = 0;
  let scripts = 0;
  const files = new Set();

  for (const file of htmlFiles(buildDir)) {
    const html = readFileSync(file, "utf8");
    let touched = false;
    const next = html.replace(SCRIPT, (tag, attributes, source) => {
      if (/\bsrc\s*=/i.test(attributes)) return tag;
      if (!EXECUTABLE_TYPES.has(scriptType(attributes))) return tag;
      if (source.trim() === "") return tag;

      const name = `${createHash("sha256").update(source).digest("hex").slice(0, 24)}.js`;
      const target = join(buildDir, outDir, name);
      if (!existsSync(target)) writeFileSync(target, source);
      files.add(name);
      scripts += 1;
      touched = true;
      return `<script${attributes} src="${base}/${outDir}/${name}"></script>`;
    });
    if (touched) {
      writeFileSync(file, next);
      pages += 1;
    }
  }

  return { pages, scripts, files: files.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const buildDir = resolve(process.argv[2] ?? "build");
  const { pages, scripts, files } = externalizeInlineScripts(buildDir);
  console.log(
    `[externalize-inline-scripts] ${scripts} script(s) inline externalisé(s) sur ${pages} page(s), ${files} fichier(s) distinct(s)`
  );
}
