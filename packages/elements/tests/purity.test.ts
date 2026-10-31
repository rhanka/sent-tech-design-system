/**
 * §4.5 purity: the validator core, the ports, the contracts and the
 * generated data are a PURE half — no DOM globals, no node builtins, no
 * dependency imports. The two Node-side modules sit OUTSIDE the scanned
 * directories and are imported only through RELATIVE specifiers: the
 * generator CLI (src/generator) and the ajv 2020-12 structure bridge
 * (src/structure), which the validator barrel injects as the default
 * `structure` seam (§4.3) — ajv itself is DOM-free, so the whole validator
 * loads in a DOM-less host.
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30): the
 * scanned directories did not exist, so the "sees every source module" test
 * failed on the file count.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

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

/** Static, side-effect and dynamic import specifiers. */
function importSpecifiers(source: string): readonly string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) found.push(match[1] as string);
  for (const match of source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) found.push(match[1] as string);
  return found;
}

/** The pure half of the package: everything a renderer imports at runtime. */
const pureDirs = ["contracts", "generated", "ports", "validate"].map((dir) => join(srcDir, dir));

describe("the runtime half of the package is pure", () => {
  const files = pureDirs.flatMap((dir) => sourceFiles(dir));

  it("sees every source module", () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it("imports nothing but its own relative modules — no DOM, no node, no dependency", () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const specifier of importSpecifiers(readFileSync(file, "utf8"))) {
        if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
        offenders.push(`${file.slice(packageDir.length + 1)} -> ${specifier}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("writes no DOM global and no node builtin in executable code", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\s)\/\/.*$/gm, "$1")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/`(?:[^`\\]|\\.)*`/g, "``");
      for (const name of ["document", "window", "navigator", "globalThis", "process", "require", "fetch"]) {
        if (new RegExp(`\\b${name}\\b`).test(code)) offenders.push(`${file.slice(packageDir.length + 1)} -> ${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("imports the whole validator barrel in Node with no DOM present", async () => {
    expect(typeof (globalThis as { document?: unknown }).document).toBe("undefined");
    expect(typeof (globalThis as { window?: unknown }).window).toBe("undefined");
    const barrel = await import("../src/validate/index.js");
    expect(typeof barrel.createEnvelopeValidator).toBe("function");
    expect(typeof barrel.createFocusPort).toBe("function");
    expect(typeof barrel.createBpmnCanvasPort).toBe("function");
  });
});
