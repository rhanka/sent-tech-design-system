/**
 * The package has no DOM, no framework, no renderer and no dependency.
 *
 * Three independent guards, because they fail at different moments:
 *   1. THE COMPILER. `tsconfig.json` gives src `lib: ["ES2022"]` and `types: []`,
 *      so `document`, `window` and every node builtin are unresolvable there. A
 *      module that reaches for one fails `npm run build`, before any test runs.
 *      Asserted here by reading the configuration, so a widened `lib` is caught.
 *   2. THE RUNTIME. This suite runs in vitest's `node` environment with no jsdom;
 *      the whole barrel is imported and every exported function is exercised at
 *      least once by the other suites. A DOM global appearing would make the
 *      first test below red.
 *   3. THE SOURCE. Every module reachable from the barrel is read and its import
 *      specifiers are checked: no renderer, no webgl, no framework, no design
 *      system package, no node builtin, no bare dependency at all.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as core from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");
const srcDir = join(packageDir, "src");

function sourceFiles(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

/** Static, side-effect and dynamic import specifiers. An inline type reference loads nothing. */
function importSpecifiers(source: string): readonly string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) found.push(match[1] as string);
  for (const match of source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) found.push(match[1] as string);
  return found;
}

describe("no DOM at runtime", () => {
  it("imports the whole barrel in Node with no DOM present", () => {
    // Note the cast: with `lib: ["ES2022"]` and no ambient DOM types, `document`
    // is not even a NAME the compiler knows here - which is guard 1 in action.
    expect(typeof (globalThis as { document?: unknown }).document).toBe("undefined");
    expect(typeof (globalThis as { window?: unknown }).window).toBe("undefined");
    // `navigator` is deliberately NOT asserted absent: Node 21 and later define
    // one themselves (measured on node v22.22.1, where it is an object), so its
    // presence says nothing about a DOM. The identifier is banned in the source
    // scan below instead, which is the check that actually means something here.
    expect(typeof core.validateDocument).toBe("function");
    expect(typeof core.applyTransaction).toBe("function");
    expect(typeof core.migrateStoredDocument).toBe("function");
    expect(typeof core.entityRef).toBe("function");
  });

  it("fails loudly if a DOM global is ever touched, rather than silently degrading", () => {
    // A proxy that throws on ANY access, installed under both names for the
    // duration of one barrel round trip. If some module read `document` lazily,
    // this is where it would surface.
    const trap = new Proxy(
      {},
      {
        get: () => {
          throw new Error("a DOM global was read by @sentropic/diagram-core");
        },
      },
    );
    const globals = globalThis as unknown as Record<string, unknown>;
    globals["document"] = trap;
    globals["window"] = trap;
    try {
      const document = core.createDocument({
        documentId: core.documentRef("probe"),
        profileRefs: [core.GENERIC_PROFILE_ID],
      });
      const state = core.createState(document, [
        core.createView({ viewId: core.viewRef("v1"), semanticDocumentId: document.documentId }),
      ]);
      expect(core.validateState(state, { registry: core.defaultProfileRegistry })).toEqual([]);
      expect(core.serialiseState(state).length).toBeGreaterThan(0);
    } finally {
      delete globals["document"];
      delete globals["window"];
    }
  });
});

describe("no DOM, no framework, no dependency in the source", () => {
  const files = sourceFiles(srcDir);

  it("sees every source module", () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
  });

  it("imports nothing but its own relative modules", () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const specifier of importSpecifiers(readFileSync(file, "utf8"))) {
        if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
        offenders.push(`${file.slice(packageDir.length + 1)} -> ${specifier}`);
      }
    }
    // No `@sentropic/graph` either: SPEC 3.1 allows DOM-free graph contracts, and
    // this lot needs none - see README, "What this package does not import".
    expect(offenders).toEqual([]);
  });

  it("names no renderer, webgl, framework or design system module", () => {
    const forbidden = /(^|\/)(renderer|webgl-[^/]*)(\.js)?$|@sentropic\/(design-system|dataviz)|^(svelte|react|vue|@angular)/;
    const offenders: string[] = [];
    for (const file of files) {
      for (const specifier of importSpecifiers(readFileSync(file, "utf8"))) {
        if (forbidden.test(specifier)) offenders.push(`${file.slice(packageDir.length + 1)} -> ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("writes no DOM global in executable code", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const code = readFileSync(file, "utf8")
        // Prose and string literals may mention the words; only code counts.
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\s)\/\/.*$/gm, "$1")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/`(?:[^`\\]|\\.)*`/g, "``");
      for (const name of ["document", "window", "navigator", "globalThis", "process", "require"]) {
        if (new RegExp(`\\b${name}\\b`).test(code)) offenders.push(`${file.slice(packageDir.length + 1)} -> ${name}`);
      }
    }
    // `document` as a LOCAL name is everywhere in this package (it models
    // documents), so only the global names that are not ours are listed here.
    expect(offenders.filter((entry) => !entry.endsWith("-> document"))).toEqual([]);
  });
});

describe("the manifest keeps the promises the layering guard relies on", () => {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
    readonly name: string;
    readonly version: string;
    readonly private?: boolean;
    readonly dependencies?: Readonly<Record<string, string>>;
    readonly peerDependencies?: Readonly<Record<string, string>>;
    readonly optionalDependencies?: Readonly<Record<string, string>>;
    readonly devDependencies?: Readonly<Record<string, string>>;
  };

  it("is private, so no npm name is committed and no publishable count moves", () => {
    expect(manifest.name).toBe("@sentropic/diagram-core");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.private).toBe(true);
  });

  it("declares no dependency of any kind", () => {
    expect(manifest.dependencies).toBeUndefined();
    expect(manifest.peerDependencies).toBeUndefined();
    expect(manifest.optionalDependencies).toBeUndefined();
    expect(manifest.devDependencies).toBeUndefined();
  });

  it("compiles src without the DOM lib and without ambient types", () => {
    const tsconfig = readFileSync(join(packageDir, "tsconfig.json"), "utf8");
    const options = JSON.parse(tsconfig.replace(/^\s*\/\/.*$/gm, "")) as {
      readonly compilerOptions: { readonly lib: readonly string[]; readonly types: readonly string[] };
    };
    expect(options.compilerOptions.lib).toEqual(["ES2022"]);
    expect(options.compilerOptions.types).toEqual([]);
  });
});
