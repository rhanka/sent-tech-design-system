import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import * as processing from "../../src/processing/index.js";
import { computeLayout } from "../../src/processing/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "..", "..", "src", "processing");

function readSource(name: string): string {
  return readFileSync(join(srcDir, name), "utf8");
}

/**
 * Resolve `./x.js` / `../y.js` specifiers to source-relative paths.
 *
 * Three runtime forms count, because all three load the module: a static
 * import or re-export (`from "./x.js"`), a side-effect import
 * (`import "./x.js";`) and a dynamic one (`await import("./x.js")`). An
 * inline TYPE reference does not load anything, so `import("./x.js").Y` is
 * excluded — src/types.ts writes exactly that against webgl-boxes, and
 * counting it would report the barrel as pulling WebGL code when it does not.
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

function resolveImport(fromFile: string, spec: string): string {
  const parts = fromFile.split("/");
  parts.pop();
  for (const segment of spec.split("/")) {
    if (segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  let resolved = parts.join("/");
  if (resolved.endsWith(".js")) resolved = resolved.slice(0, -3) + ".ts";
  else if (!/\.[a-z]+$/.test(resolved)) resolved += ".ts";
  return resolved;
}

/** Transitive closure of relative source files reachable from the barrel. */
function barrelClosure(): Set<string> {
  const seen = new Set<string>(["processing/index.ts"]);
  const queue = ["processing/index.ts"];
  while (queue.length > 0) {
    const current = queue.pop() as string;
    const diskPath = current.startsWith("processing/")
      ? join(srcDir, current.slice("processing/".length))
      : join(srcDir, "..", current);
    const text = readFileSync(diskPath, "utf8");
    for (const spec of relativeImports(text)) {
      if (spec === "@sentropic/graph") continue;
      const resolved = resolveImport(current, spec);
      if (!seen.has(resolved)) {
        seen.add(resolved);
        queue.push(resolved);
      }
    }
  }
  return seen;
}

describe("processing is DOM- and renderer-free", () => {
  it("imports in Node with no DOM present", () => {
    expect(typeof document).toBe("undefined");
    expect(typeof computeLayout).toBe("function");
    expect(typeof processing.forceFa2Layout).toBe("function");
    expect(typeof processing.computeHierarchyAwarePositions).toBe("function");
  });

  it("no barrel-reachable module imports renderer or webgl code", () => {
    const closure = barrelClosure();
    const offenders = [...closure].filter((file) => /(^|\/)renderer\.ts$|(^|\/)webgl-[^/]*\.ts$/.test(file));
    expect(offenders).toEqual([]);
    for (const file of closure) {
      const diskPath = file.startsWith("processing/")
        ? join(srcDir, file.slice("processing/".length))
        : join(srcDir, "..", file);
      const text = readFileSync(diskPath, "utf8");
      for (const spec of relativeImports(text)) {
        expect(spec.startsWith("@sentropic/graph")).toBe(false);
      }
    }
  });

  it("no barrel-reachable module touches DOM globals", () => {
    const closure = barrelClosure();
    for (const file of closure) {
      const diskPath = file.startsWith("processing/")
        ? join(srcDir, file.slice("processing/".length))
        : join(srcDir, "..", file);
      // Prose and string literals may mention windowing concepts
      // ("window-left attaches", the git-flow `"window-left"` entry
      // vocabulary); only executable code tokens count.
      const code = readFileSync(diskPath, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\s)\/\/.*$/gm, "$1")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/`(?:[^`\\]|\\.)*`/g, "``");
      expect(code).not.toMatch(/\bdocument\b/);
      expect(code).not.toMatch(/\bwindow\b/);
      expect(code).not.toMatch(/\bnavigator\b/);
    }
  });

  it("scene-layout.ts stays out of the barrel (package self-import would drag the renderer)", () => {
    expect(barrelClosure().has("processing/scene-layout.ts")).toBe(false);
    // …while remaining present on disk, byte-identical, with provenance.
    expect(readSource("scene-layout.ts")).toContain("@sentropic/graph");
  });
});
