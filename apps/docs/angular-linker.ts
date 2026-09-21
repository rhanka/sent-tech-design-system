// Liaison Angular AU BUILD (« linking » AOT) pour l'île Angular de la doc.
//
// @sentropic/design-system-angular et les paquets @angular/* sont publiés en
// compilation PARTIELLE : leurs composants, directives et services portent des
// déclarations `ɵɵngDeclare*` à lier avant exécution. Non liées, Angular les
// compile au RUNTIME avec @angular/compiler (JIT, donc `new Function`) : le
// compilateur part dans le navigateur et la page exige `unsafe-eval`.
//
// Ce plugin applique le linker officiel (`@angular/compiler-cli/linker/babel`,
// le même que le CLI Angular via @angular/build) à ces fichiers : au build, en
// dev (pré-bundling des deps) et sous Vitest. Il ne transforme que le code de
// paquets publiés, au build ; aucun template n'est compilé à partir de données.

import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import type { Plugin } from "vite";

const PARTIAL_DECLARATION = "ɵɵngDeclare";
const JS_FILE = /\.[cm]?js$/;
// Même exclusion que le CLI Angular : @angular/core et @angular/compiler
// DÉFINISSENT les fonctions ɵɵngDeclare* (faux positifs), ils ne les appellent pas.
const NEVER_LINK = /[\\/]@angular[\\/](?:compiler|core)[\\/]/;

type Linked = { code: string; map: unknown } | null;
type Linker = (code: string, file: string) => Promise<Linked>;

let linker: Promise<Linker> | undefined;

// Réglages du CLI Angular (@angular/build, createLinkerPlugin), partagés : ces
// objets sont sans état.
const LINKER_OPTIONS = {
  linkerJitMode: false,
  // angular/angular#42769 : le linker ne remappe pas les source maps d'entrée ;
  // le système de fichiers ne sert qu'à ça.
  sourceMapping: false,
  // Déclaration plus récente que le linker installé : on échoue au build
  // plutôt que de livrer une île qui retomberait sur le JIT.
  unknownDeclarationVersionHandling: "error",
  fileSystem: {
    resolve,
    exists: existsSync,
    dirname,
    relative,
    readFile: (path: string) => readFileSync(path, "utf8")
  },
  logger: {
    level: 1,
    debug() {},
    info() {},
    warn: (...args: string[]) => console.warn("[angular-linker]", ...args),
    error: (...args: string[]) => console.error("[angular-linker]", ...args)
  }
} as const;

type Visitor = Record<string, unknown>;

// Le linker lève une CHAÎNE (`buildCodeFrameError` : "<fichier>: <message>").
// Babel tente d'y ajouter `.message` et la masque derrière un TypeError
// (« Cannot create property 'message' on string »). On relance une Error, sans
// le préfixe de fichier que Babel remet lui-même.
function withErrorObjects(visitor: Visitor, file: string): Visitor {
  const wrap = (fn: (...args: unknown[]) => unknown) =>
    function (this: unknown, ...args: unknown[]) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        if (typeof error !== "string") throw error;
        throw new Error(error.startsWith(`${file}: `) ? error.slice(file.length + 2) : error);
      }
    };
  return Object.fromEntries(
    Object.entries(visitor).map(([key, value]) => {
      if (typeof value === "function") return [key, wrap(value as (...args: unknown[]) => unknown)];
      if (value && typeof value === "object") {
        return [key, withErrorObjects(value as Visitor, file)];
      }
      return [key, value];
    })
  );
}

// Chargé à la demande : une config Vite/Vitest qui ne touche aucun fichier
// Angular ne paie pas l'import du linker.
function loadLinker(): Promise<Linker> {
  linker ??= (async () => {
    const [{ transformAsync }, { createEs2015LinkerPlugin }, { needsLinking }] = await Promise.all([
      import("@babel/core"),
      import("@angular/compiler-cli/linker/babel"),
      import("@angular/compiler-cli/linker")
    ]);

    return async (code, file) => {
      if (!needsLinking(file, code)) return null;
      // Un plugin PAR FICHIER, comme le CLI Angular : le plugin garde le
      // FileLinker du fichier en cours dans une variable de closure, qu'une
      // erreur laisse remplie ; partagé, il ferait échouer tous les fichiers
      // suivants (« BUG - expected `obj` to be null »).
      const plugin = createEs2015LinkerPlugin(LINKER_OPTIONS as never);
      const result = await transformAsync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        browserslistConfigFile: false,
        compact: false,
        sourceMaps: true,
        sourceType: "module",
        plugins: [{ ...plugin, visitor: withErrorObjects(plugin.visitor as Visitor, file) }]
      });
      return result?.code ? { code: result.code, map: result.map } : null;
    };
  })();
  return linker;
}

async function link(code: string, id: string): Promise<Linked> {
  const file = id.split("?", 1)[0];
  if (!JS_FILE.test(file) || NEVER_LINK.test(file) || !code.includes(PARTIAL_DECLARATION)) {
    return null;
  }
  return (await loadLinker())(code, file);
}

export function angularLinker(): Plugin {
  return {
    name: "docs:angular-linker",
    // Dev : les deps pré-bundlées par l'optimiseur (Rolldown) ne passent pas
    // par les hooks `transform` de Vite ; on y greffe le même linker.
    config: () => ({
      optimizeDeps: {
        rolldownOptions: {
          plugins: [{ name: "docs:angular-linker:deps", transform: link }]
        }
      }
    }),
    transform: {
      filter: { code: PARTIAL_DECLARATION },
      handler: link
    }
  };
}
