// React emission of the single JSX source (decision K2).
//
// The Preact tree in `src/` is the authoring source. This script produces the
// React source tree in `.react-emit/src/` with two mechanical operations and
// nothing else:
//
//   1. Specifier rewrite. Every import/export specifier of a component module
//      is mapped through SPECIFIER_REWRITE (`preact` -> `react`, ...). No
//      other byte of a component module changes.
//   2. Adapter swap. The adapter modules (`compat.ts`, `runtime.ts`,
//      `signals.ts`) are replaced by their React twins from `react/`.
//
// It is also the lint of the single-source rule: a component module that names
// a runtime-specific specifier outside the map (`preact/compat`,
// `@preact/signals`, `react`, ...) fails the emission instead of producing a
// React tree that silently pulls Preact in.
//
// Specifiers are located with the TypeScript scanner (`ts.preProcessFile`),
// not with a regular expression, so a specifier quoted in a comment or in a
// string is never rewritten.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

/** The whole rewrite: Preact specifier -> React specifier. */
export const SPECIFIER_REWRITE = Object.freeze({
  preact: "react",
  "preact/hooks": "react",
  "lucide-preact": "lucide-react",
});

/**
 * Adapter modules, by path relative to `src/`. Each is replaced by the file of
 * the same name in `react/`. The value lists the runtime-specific specifiers
 * that only this module may import in the Preact tree.
 */
export const ADAPTERS = Object.freeze({
  "compat.ts": ["preact/compat"],
  "runtime.ts": [],
  "signals.ts": ["@preact/signals"],
});

/** A specifier that binds a module to one runtime. */
const RUNTIME_SPECIFIER = /^(?:preact|@preact\/[^/]+|react|react-dom|lucide-(?:preact|react))(?:\/|$)/;

const SOURCE_FILE = /\.tsx?$/;
const TEST_FILE = /\.test\.tsx?$/;

function walk(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path, base));
    else if (entry.isFile()) files.push(relative(base, path).split(sep).join("/"));
  }
  return files;
}

/**
 * Rewrite the specifiers of one component module.
 * Returns the new text and the list of rewrites; throws on a specifier that is
 * runtime-specific and not in the map.
 */
export function rewriteSpecifiers(text, file) {
  const { importedFiles } = ts.preProcessFile(text, true, true);
  const rewrites = [];
  let output = text;
  // Back to front, so earlier positions stay valid.
  for (const { fileName, pos } of [...importedFiles].sort((a, b) => b.pos - a.pos)) {
    // The scanner reports the position of the opening quote of the literal.
    const start = pos + 1;
    const end = start + fileName.length;
    const quote = text[pos];
    if ((quote !== '"' && quote !== "'") || text[end] !== quote || text.slice(start, end) !== fileName) {
      throw new Error(`${file}: specifier ${JSON.stringify(fileName)} is not at the scanned position`);
    }
    const target = SPECIFIER_REWRITE[fileName];
    if (target !== undefined) {
      output = output.slice(0, start) + target + output.slice(end);
      rewrites.push({ from: fileName, to: target });
    } else if (RUNTIME_SPECIFIER.test(fileName)) {
      throw new Error(
        `${file}: runtime-specific specifier ${JSON.stringify(fileName)} in a component module. ` +
          `Import it through an adapter (${Object.keys(ADAPTERS).join(", ")}) or add it to SPECIFIER_REWRITE.`,
      );
    }
  }
  return { text: output, rewrites: rewrites.reverse() };
}

/** Check that an adapter of the Preact tree imports nothing runtime-specific beyond its allowance. */
function checkAdapter(text, file, allowed) {
  for (const { fileName } of ts.preProcessFile(text, true, true).importedFiles) {
    if (!RUNTIME_SPECIFIER.test(fileName)) continue;
    if (fileName in SPECIFIER_REWRITE || allowed.includes(fileName)) continue;
    throw new Error(`${file}: adapter imports ${JSON.stringify(fileName)}, outside its allowance [${allowed.join(", ")}]`);
  }
}

export function emitReact({ srcDir = join(packageDir, "src"), twinsDir = join(packageDir, "react"), outDir = join(packageDir, ".react-emit") } = {}) {
  const outSrc = join(outDir, "src");
  rmSync(outSrc, { recursive: true, force: true });
  mkdirSync(outSrc, { recursive: true });

  const report = { modules: [], adapters: [], rewrites: 0, changedLines: 0, lines: 0 };

  for (const file of walk(srcDir)) {
    if (!SOURCE_FILE.test(file) || TEST_FILE.test(file)) continue;
    const source = readFileSync(join(srcDir, file), "utf8");
    const target = join(outSrc, file);
    mkdirSync(dirname(target), { recursive: true });

    if (file in ADAPTERS) {
      checkAdapter(source, `src/${file}`, ADAPTERS[file]);
      const twin = join(twinsDir, file);
      if (!existsSync(twin)) throw new Error(`src/${file}: no React twin at react/${file}`);
      writeFileSync(target, readFileSync(twin, "utf8"));
      report.adapters.push(file);
      continue;
    }

    const { text, rewrites } = rewriteSpecifiers(source, `src/${file}`);
    writeFileSync(target, text);
    const before = source.split("\n");
    const after = text.split("\n");
    const changedLines = before.filter((line, index) => line !== after[index]).length;
    report.modules.push({ file, lines: before.length - (source.endsWith("\n") ? 1 : 0), rewrites: rewrites.length, changedLines });
    report.rewrites += rewrites.length;
    report.changedLines += changedLines;
    report.lines += before.length - (source.endsWith("\n") ? 1 : 0);
  }

  for (const file of Object.keys(ADAPTERS)) {
    if (!report.adapters.includes(file)) throw new Error(`Adapter src/${file} is missing from the Preact tree`);
  }

  // The emitted tree is type-checked and compiled as a React package: its own
  // tsconfig, with the React JSX runtime (no `jsxImportSource`).
  writeFileSync(
    join(outDir, "tsconfig.json"),
    JSON.stringify(
      {
        extends: "../../../tsconfig.base.json",
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: false,
          jsx: "react-jsx",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          outDir: "dist",
          rootDir: "src",
          types: [],
        },
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(join(outDir, "emit-report.json"), JSON.stringify(report, null, 2) + "\n");
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = emitReact();
  console.log(
    `[emit-react] ${report.modules.length} component modules (${report.lines} lines) emitted with ` +
      `${report.rewrites} specifier rewrites on ${report.changedLines} lines; ` +
      `${report.adapters.length} adapters swapped (${report.adapters.join(", ")}).`,
  );
}
