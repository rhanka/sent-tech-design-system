/**
 * GD-M2-WORKERS boundary enforcement: the dependency direction, and the worker
 * resolution form.
 *
 * The spec fixes three things this file makes failable:
 *   • the direction runs CLIENT → COMPUTATION and never back: `processing`
 *     imports neither the client nor the worker nor the shared protocol;
 *   • neither new subpath reaches the renderer (`renderer.ts`, `webgl-*.ts`);
 *   • the worker is resolved as `new Worker(new URL("./worker.js",
 *     import.meta.url), { type: "module" })` — the exact literal shape, because
 *     it is the shape Vite, webpack and Rollup detect as a worker asset. A
 *     refactor into a computed path or a string variable would still work in
 *     development and produce a package whose worker chunk no bundler emits,
 *     which is the failure this lot is most likely to ship by accident.
 *
 * The `processing` side of the boundary is enforced from the other direction too:
 * `tests/processing/no-dom-or-renderer.test.ts` forbids the token `Worker` in
 * anything the `processing` barrel reaches. That extension matters because the
 * guard there only ever forbade `document` / `window` / `navigator` while
 * `tsconfig.json` already put `DOM` in `lib`, so a module referencing `Worker`
 * behind a `typeof` check would have passed it unchanged (measured).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "..", "..", "src");

function read(relative: string): string {
  return readFileSync(join(srcDir, relative), "utf8");
}

/**
 * Relative specifiers a module LOADS: static imports and re-exports,
 * side-effect imports and dynamic imports. An inline type position
 * (`import("./x.js").Y`) loads nothing and is excluded — the same rule
 * `tests/processing/no-dom-or-renderer.test.ts` applies, and for the same
 * reason: `src/types.ts` writes exactly that against `webgl-boxes`.
 */
function relativeImports(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?:from|import)\s+["'](\.[^"']+)["']/g)) {
    found.push(match[1] as string);
  }
  for (const match of source.matchAll(/import\s*\(\s*["'](\.[^"']+)["']\s*\)(?!\s*\.)/g)) {
    found.push(match[1] as string);
  }
  return found;
}

function resolveSpecifier(fromFile: string, specifier: string): string {
  const parts = fromFile.split("/");
  parts.pop();
  for (const segment of specifier.split("/")) {
    if (segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  let resolved = parts.join("/");
  if (resolved.endsWith(".js")) resolved = `${resolved.slice(0, -3)}.ts`;
  else if (!/\.[a-z]+$/.test(resolved)) resolved += ".ts";
  return resolved;
}

/** Every source file reachable from `entry`, as `src/`-relative paths. */
function closure(entry: string): Set<string> {
  const seen = new Set<string>([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    for (const specifier of relativeImports(read(current))) {
      const resolved = resolveSpecifier(current, specifier);
      if (!seen.has(resolved)) {
        seen.add(resolved);
        queue.push(resolved);
      }
    }
  }
  return seen;
}

const RENDER_FILE = /(^|\/)renderer\.ts$|(^|\/)webgl-[^/]*\.ts$/;

describe("invariant — the dependency direction runs client → computation", () => {
  it("processing imports neither the client, nor the worker, nor the shared protocol", () => {
    const processing = closure("processing/index.ts");
    expect([...processing].filter((file) => /^(worker|layout-client|layout-protocol)\.ts$/.test(file))).toEqual([]);
  });

  it("no processing module so much as names the new subpaths", () => {
    for (const file of closure("processing/index.ts")) {
      const specifiers = relativeImports(read(file)).map((spec) => resolveSpecifier(file, spec));
      for (const specifier of specifiers) {
        expect(/^(worker|layout-client|layout-protocol)\.ts$/.test(specifier)).toBe(false);
      }
    }
  });

  it("neither the worker nor the client reaches the renderer or any WebGL module", () => {
    for (const entry of ["worker.ts", "layout-client.ts"]) {
      const reachable = [...closure(entry)];
      expect({ entry, offenders: reachable.filter((file) => RENDER_FILE.test(file)) }).toEqual({
        entry,
        offenders: [],
      });
    }
  });

  it("neither the worker nor the client reaches the layout registry either", () => {
    // Not required by the spec, and load-bearing all the same: importing the
    // registry would register the git-flow / radial / metro / grid engines as a
    // side effect and put all of them in the worker chunk.
    for (const entry of ["worker.ts", "layout-client.ts"]) {
      expect([...closure(entry)].filter((file) => file === "layout-registry.ts")).toEqual([]);
    }
  });

  it("the worker's closure is the protocol and the frozen computation, nothing else", () => {
    expect([...closure("worker.ts")].sort()).toEqual([
      "layout-protocol.ts",
      "processing/env.ts",
      "processing/graph-layout.ts",
      "worker.ts",
    ]);
  });
});

describe("invariant — the worker resolves in the published package", () => {
  it("uses the exact literal form every bundler rewrites", () => {
    const source = read("layout-client.ts");
    expect(source).toContain('new URL("./worker.js", import.meta.url)');
    expect(source).toContain('new Worker(resolveLayoutWorkerUrl(), { type: "module" })');
  });

  it("resolves the URL as a sibling of the client module", () => {
    // Evaluated against THIS module's own URL, the shape resolves to a sibling —
    // which is what makes it resolve to `dist/worker.js` next to
    // `dist/layout-client.js` once published. Resolution from the installed
    // tarball is verified by `scripts/smoke-pack.mjs`.
    const resolved = new URL("./worker.js", import.meta.url);
    expect(resolved.href.endsWith("/tests/workers/worker.js")).toBe(true);
  });

  it("declares both subpaths in the manifest, ESM-only and not re-exported by the root", () => {
    const manifest = JSON.parse(
      readFileSync(join(srcDir, "..", "package.json"), "utf8"),
    ) as { exports: Record<string, Record<string, string>> };
    expect(manifest.exports["./worker"]).toEqual({
      types: "./dist/worker.d.ts",
      import: "./dist/worker.js",
    });
    expect(manifest.exports["./layout-client"]).toEqual({
      types: "./dist/layout-client.d.ts",
      import: "./dist/layout-client.js",
    });
    // No `require`: `import.meta` has no CommonJS equivalent, so a CJS build of
    // the client would resolve a wrong URL silently. See tsup.config.ts.
    expect(manifest.exports["./worker"]?.require).toBeUndefined();
    expect(manifest.exports["./layout-client"]?.require).toBeUndefined();

    const rootBarrel = read("index.ts");
    expect(rootBarrel).not.toMatch(/worker|layout-client|layout-protocol/);
  });
});
