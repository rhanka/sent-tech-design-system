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
// Il traite de la même façon le script pré-hydratation d'app.html (inline dans
// <head>) : le nom ADRESSÉ PAR LE CONTENU interdit qu'un déploiement en cours
// serve un contenu périmé sous le nom qu'attend la page (la requête d'un
// nouveau nom sur une origine encore à l'ancien déploiement donne un 404 :
// aucun attribut, aucune amorce, jamais une ancienne liste blanche).
//
// STRICT : il lève une erreur sur tout script inline exécutable qu'il ne sait
// pas déplacer sans en changer la sémantique (voir externalizeRefusal :
// attributs autres que `type`/`nomodule`, `>` dans les attributs, import map),
// et sur une collision de nom avec un contenu différent.
//
// Idempotent : un second passage ne trouve plus rien. Les blocs de données
// (`<script type="application/json">`…) ne sont pas exécutés et ne relèvent pas
// de script-src : ils restent en place.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import config from "../svelte.config.js";
import { externalizeRefusal, parseScripts } from "./html-scripts.mjs";

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

/** Nom adressé par le contenu (24 hex du sha256). */
export function contentName(source) {
  return `${createHash("sha256").update(source).digest("hex").slice(0, 24)}.js`;
}

export function externalizeInlineScripts(buildDir) {
  const base = config.kit?.paths?.base ?? "";
  const appDir = config.kit?.appDir ?? "_app";
  const outDir = `${appDir}/immutable/inline`;

  // Deux temps : tout est vérifié AVANT la moindre écriture, pour qu'un refus
  // ne laisse pas un build à moitié transformé.
  let scripts = 0;
  const files = new Map();
  const rewrites = [];

  for (const file of htmlFiles(buildDir)) {
    const html = readFileSync(file, "utf8");
    const page = relative(buildDir, file);
    let next = "";
    let cursor = 0;

    for (const script of parseScripts(html)) {
      if (!script.inlineExecutable) continue;
      const refusal = externalizeRefusal(script);
      if (refusal) throw new Error(`${page} : script inline non externalisable (${refusal}) : ${script.tag.slice(0, 120)}`);

      const name = contentName(script.source);
      const target = join(buildDir, outDir, name);
      const known = files.get(name) ?? (existsSync(target) ? readFileSync(target, "utf8") : undefined);
      if (known !== undefined && known !== script.source) {
        throw new Error(`${page} : collision de nom ${outDir}/${name} avec un contenu différent`);
      }
      files.set(name, script.source);
      scripts += 1;
      next += `${html.slice(cursor, script.start)}<script${script.raw} src="${base}/${outDir}/${name}"></script>`;
      cursor = script.end;
    }

    if (cursor > 0) rewrites.push([file, next + html.slice(cursor)]);
  }

  mkdirSync(join(buildDir, outDir), { recursive: true });
  for (const [name, source] of files) {
    const target = join(buildDir, outDir, name);
    if (!existsSync(target)) writeFileSync(target, source);
  }
  for (const [file, html] of rewrites) writeFileSync(file, html);

  return { pages: rewrites.length, scripts, files: files.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const buildDir = resolve(process.argv[2] ?? "build");
  const { pages, scripts, files } = externalizeInlineScripts(buildDir);
  console.log(
    `[externalize-inline-scripts] ${scripts} script(s) inline externalisé(s) sur ${pages} page(s), ${files} fichier(s) distinct(s)`
  );
}
