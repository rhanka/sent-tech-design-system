// Lecture des balises <script> d'une page HTML produite par le build.
//
// Partagé par externalize-inline-scripts.mjs (qui refuse tout ce qu'il ne sait
// pas déplacer sans changer la sémantique) et csp-check.mjs (qui vérifie le
// build) : les deux voient les MÊMES scripts, avec les MÊMES attributs.
//
// Ce n'est pas un parseur HTML général : il suffit au HTML de SvelteKit, et il
// LÈVE une erreur dès qu'une balise <script> sort de ce qu'il sait lire.

// Balise ouvrante tolérante aux guillemets : un `>` entre guillemets ne ferme
// pas la balise (il est ensuite refusé pour les scripts inline exécutables).
const SCRIPT = /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi;
const ATTRIBUTE = /\s*([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y;

// Types MIME JavaScript de la spécification HTML : script classique.
const CLASSIC_TYPES = new Set([
  "",
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript"
]);

// Inline, ces types relèvent de `script-src` sans pouvoir être servis en
// fichier (une import map externe n'existe pas).
const INLINE_ONLY_TYPES = new Set(["importmap", "speculationrules"]);

/** Attributs d'une balise, noms en minuscules. Lève une erreur si illisibles. */
export function parseAttributes(raw) {
  const attributes = new Map();
  ATTRIBUTE.lastIndex = 0;
  let index = 0;
  while (index < raw.length) {
    if (/^\s*\/?\s*$/.test(raw.slice(index))) break;
    ATTRIBUTE.lastIndex = index;
    const match = ATTRIBUTE.exec(raw);
    if (!match || match[0].length === 0) {
      throw new Error(`attributs de <script> illisibles : ${JSON.stringify(raw.slice(0, 120))}`);
    }
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    attributes.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted ?? "");
    index = ATTRIBUTE.lastIndex;
  }
  return attributes;
}

/**
 * Nature d'un script, d'après ses VRAIS attributs (`data-src` n'est pas `src`) :
 *   external  : attribut src (le contenu inline éventuel est ignoré par le navigateur) ;
 *   classic   : script classique inline ;
 *   module    : module inline ;
 *   inline-only : import map / speculation rules inline ;
 *   data      : bloc de données (type non exécutable, ex. application/json).
 */
export function scriptKind(attributes) {
  if (attributes.has("src")) return "external";
  const type = (attributes.get("type") ?? "").trim().toLowerCase();
  if (CLASSIC_TYPES.has(type)) return "classic";
  if (type === "module") return "module";
  if (INLINE_ONLY_TYPES.has(type)) return "inline-only";
  return "data";
}

/** Tous les <script> de la page, dans l'ordre, avec position et nature. */
export function parseScripts(html) {
  return [...html.matchAll(SCRIPT)].map((match) => {
    const [tag, raw, source] = match;
    const attributes = parseAttributes(raw);
    const kind = scriptKind(attributes);
    return {
      tag,
      raw,
      source,
      attributes,
      kind,
      start: match.index,
      end: match.index + tag.length,
      // Soumis à `script-src` et exécuté inline : ce qu'une CSP stricte bloque.
      inlineExecutable: kind !== "external" && kind !== "data" && source.trim() !== ""
    };
  });
}

/**
 * Raison pour laquelle un script inline exécutable ne peut PAS être déplacé
 * tel quel dans un fichier (`null` s'il le peut) : seuls `type` (classique ou
 * module) et `nomodule` se transposent sans changer l'ordre ni la sémantique
 * d'exécution. `async`, `defer`, `data-*`, `nonce`, `id`… sont refusés, comme
 * un `>` dans les attributs et les types sans équivalent externe (importmap).
 */
export function externalizeRefusal(script) {
  if (!script.inlineExecutable) return null;
  if (script.kind === "inline-only") {
    return `type="${script.attributes.get("type")}" n'a pas d'équivalent en fichier`;
  }
  if (script.raw.includes(">")) return "`>` dans les attributs";
  const extra = [...script.attributes.keys()].filter((name) => name !== "type" && name !== "nomodule");
  if (extra.length > 0) return `attribut(s) non transposable(s) : ${extra.join(", ")}`;
  return null;
}
