/**
 * The package has no DOM, no framework, no renderer, and exactly ONE bare import
 * specifier: `@sentropic/diagram-core`, the edge the target DAG declares.
 *
 * Four guards, failing at four different moments:
 *   1. THE COMPILER. `tsconfig.json` gives src `lib: ["ES2022"]` and `types: []`,
 *      so `document`, `window` and every node builtin are unresolvable names
 *      there. A module reaching for one fails `npm run build`. Asserted here by
 *      reading the configuration, so a widened `lib` is caught too.
 *   2. THE RUNTIME. This suite runs in vitest's `node` environment with no jsdom,
 *      and exercises the barrel with a throwing proxy installed under both names.
 *   3. THE SOURCE. Every module reachable from the barrel is read and its import
 *      specifiers checked against the one allowed bare name.
 *   4. THE MANIFEST. The promises the repository's layering guard and its
 *      licensing gate rely on: private, one dependency, that dependency.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as canvas from "../src/index.js";
import { VIEW, sampleState } from "./fixtures.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");
const srcDir = join(packageDir, "src");

/** The one bare specifier this package may name. Everything else must be relative. */
const ALLOWED_BARE = "@sentropic/diagram-core";

function sourceFiles(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

function importSpecifiers(source: string): readonly string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) found.push(match[1] as string);
  for (const match of source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) found.push(match[1] as string);
  return found;
}

describe("no DOM at runtime", () => {
  it("imports the whole barrel in Node with no DOM present", () => {
    expect(typeof (globalThis as { document?: unknown }).document).toBe("undefined");
    expect(typeof (globalThis as { window?: unknown }).window).toBe("undefined");
    expect(typeof canvas.buildScene).toBe("function");
    expect(typeof canvas.hitTest).toBe("function");
    expect(typeof canvas.worldToDevice).toBe("function");
  });

  it("fails loudly if a DOM global is ever touched, rather than silently degrading", () => {
    const trap = new Proxy(
      {},
      {
        get: () => {
          throw new Error("a DOM global was read by @sentropic/diagram-canvas");
        },
      },
    );
    const globals = globalThis as unknown as Record<string, unknown>;
    globals["document"] = trap;
    globals["window"] = trap;
    globals["devicePixelRatio"] = trap;
    try {
      // The whole pipeline, not one function: build a scene, hit it in world
      // space and in device space, and run a marquee over it.
      const frame = canvas.buildScene(sampleState(), VIEW);
      expect(frame.items.length).toBeGreaterThan(0);
      expect(canvas.hitTest(frame, { x: 20, y: 10 })).toBeDefined();
      expect(
        canvas.hitTestAtDevicePoint(frame, { x: 0, y: 0, zoom: 2 }, { cssWidth: 100, cssHeight: 100, devicePixelRatio: 2 }, { x: 80, y: 40 }),
      ).toBeDefined();
      expect(canvas.hitTestRegion(frame, { x: -10, y: -10, width: 100, height: 100 }, { mode: "intersect" }).length).toBeGreaterThan(0);
    } finally {
      delete globals["document"];
      delete globals["window"];
      delete globals["devicePixelRatio"];
    }
  });
});

describe("no DOM, no framework, one declared dependency in the source", () => {
  const files = sourceFiles(srcDir);

  it("sees every source module", () => {
    // A floor, so a moved folder empties the set and fails instead of passing.
    expect(files.length).toBeGreaterThanOrEqual(6);
  });

  it("imports nothing but its own relative modules and @sentropic/diagram-core", () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const specifier of importSpecifiers(readFileSync(file, "utf8"))) {
        if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
        if (specifier === ALLOWED_BARE) continue;
        offenders.push(`${file.slice(packageDir.length + 1)} -> ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("really does import the one allowed dependency, so the rule above is not vacuous", () => {
    const bare = files.flatMap((file) =>
      importSpecifiers(readFileSync(file, "utf8")).filter((specifier) => !specifier.startsWith(".")),
    );
    expect(new Set(bare)).toEqual(new Set([ALLOWED_BARE]));
    expect(bare.length).toBeGreaterThanOrEqual(3);
  });

  it("names no renderer, webgl, framework or design system module", () => {
    const forbidden = /(^|\/)(renderer|webgl-[^/]*)(\.js)?$|@sentropic\/(design-system|dataviz|graph)|^(svelte|react|vue|@angular)/;
    const offenders: string[] = [];
    for (const file of files) {
      for (const specifier of importSpecifiers(readFileSync(file, "utf8"))) {
        if (forbidden.test(specifier)) offenders.push(`${file.slice(packageDir.length + 1)} -> ${specifier}`);
      }
    }
    // `@sentropic/graph` is in that pattern on purpose. The DAG declares the edge
    // `diagram-canvas -> graph`, and this slice does NOT pose it: the scene is
    // built from persisted view geometry, so it needs no layout and no render
    // geometry. See README, "The graph edge this slice does not pose".
    expect(offenders).toEqual([]);
  });

  it("writes no DOM global in executable code", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\s)\/\/.*$/gm, "$1")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/`(?:[^`\\]|\\.)*`/g, "``");
      for (const name of ["document", "window", "navigator", "globalThis", "process", "require", "devicePixelRatio"]) {
        if (new RegExp(`\\b${name}\\b`).test(code)) offenders.push(`${file.slice(packageDir.length + 1)} -> ${name}`);
      }
    }
    // `document` is a LOCAL name throughout this package (it consumes semantic
    // documents), and `devicePixelRatio` is a FIELD of `Viewport`. Both are ours;
    // the point of the scan is the globals that are not.
    const ours = (entry: string) => entry.endsWith("-> document") || entry.endsWith("-> devicePixelRatio");
    expect(offenders.filter((entry) => !ours(entry))).toEqual([]);
  });
});

describe("the manifest keeps the promises the repository's guards rely on", () => {
  const manifest = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
    readonly name: string;
    readonly version: string;
    readonly private?: boolean;
    readonly dependencies?: Readonly<Record<string, string>>;
    readonly devDependencies?: Readonly<Record<string, string>>;
    readonly peerDependencies?: Readonly<Record<string, string>>;
    readonly optionalDependencies?: Readonly<Record<string, string>>;
  };

  it("is private, which is a CONSEQUENCE of depending on a private package", () => {
    expect(manifest.name).toBe("@sentropic/diagram-canvas");
    expect(manifest.version).toBe("0.1.0");
    // `@sentropic/diagram-core` is `private: true` and absent from the registry
    // (measured: `npm view @sentropic/diagram-core version` answers E404). A
    // PUBLISHED package naming it as a dependency installs broken for everyone,
    // so this flag is not a preference. Publishable count stays at 17.
    expect(manifest.private).toBe(true);
  });

  it("declares exactly one dependency, and no dependency of any other kind", () => {
    expect(manifest.dependencies).toEqual({ "@sentropic/diagram-core": "0.1.0" });
    expect(manifest.devDependencies).toBeUndefined();
    expect(manifest.peerDependencies).toBeUndefined();
    expect(manifest.optionalDependencies).toBeUndefined();
  });

  it("pins the dependency at the exact version the workspace holds", () => {
    const core = JSON.parse(readFileSync(join(packageDir, "..", "diagram-core", "package.json"), "utf8")) as {
      readonly version: string;
      readonly private?: boolean;
    };
    expect(manifest.dependencies!["@sentropic/diagram-core"]).toBe(core.version);
    expect(core.private).toBe(true);
  });

  it("compiles src without the DOM lib and without ambient types", () => {
    const options = JSON.parse(
      readFileSync(join(packageDir, "tsconfig.json"), "utf8").replace(/^\s*\/\/.*$/gm, ""),
    ) as { readonly compilerOptions: { readonly lib: readonly string[]; readonly types: readonly string[] } };
    expect(options.compilerOptions.lib).toEqual(["ES2022"]);
    expect(options.compilerOptions.types).toEqual([]);
  });
});
