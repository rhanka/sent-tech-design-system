// Port metrics of lot P6 (`npm run measure:port`).
//
// Measures, from the repository alone:
//   1. the full `packages/dataviz-react/src` baseline at BASE_REF (128 files:
//      116 .tsx + 12 .ts, lines, runtime-gap reach);
//   2. the port table for every module recorded in `coverage-manifest.json`
//      (React lines, Preact lines, tokens touched, emission rewrites);
//   3. remaining unported files of `packages/dataviz-react/src`.
//
// Usage:
//   node scripts/port-metrics.mjs            print the report
//   node scripts/port-metrics.mjs --write    also write measurements/port-metrics.{json,txt}
//   node scripts/port-metrics.mjs --check    fail when the committed files differ
//   node scripts/port-metrics.mjs --ref=<commit>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { ADAPTERS, rewriteSpecifiers } from "./emit-react.mjs";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoDir = dirname(dirname(packageDir));
const measurementsDir = join(packageDir, "measurements");

/** Same pinned reference commit as components-preact (zero dataviz-react drift to origin/main). */
export const BASE_REF = "81083403e58dd1810bd1bd4f639882d226375d97";

const DATAVIZ_SRC = "packages/dataviz-react/src";

export function lineCount(text) {
  if (text === "") return 0;
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

function parse(text, file) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
}

export function tokens(text, file = "module.tsx") {
  const source = parse(text, file);
  const out = [];
  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.EndOfFileToken) return;
    const children = node.getChildren(source);
    if (children.length === 0) {
      const value = node.getText(source);
      if (node.kind === ts.SyntaxKind.JsxText ? value.trim() !== "" : value !== "") out.push(value.trim());
      return;
    }
    children.forEach(visit);
  };
  visit(source);
  return out;
}

export function lcsLength(a, b) {
  let previous = new Uint32Array(b.length + 1);
  let current = new Uint32Array(b.length + 1);
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = a[i - 1] === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], current[j - 1]);
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

export function tokensTouched(before, after, file) {
  const a = tokens(before, file);
  const b = tokens(after, file);
  return { total: a.length, touched: a.length - lcsLength(a, b) };
}

export const SVG_PRESENTATION =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;

const TRACKED_APIS = ["forwardRef", "useSyncExternalStore", "useInsertionEffect", "createPortal"];

export function reach(text, file) {
  const source = parse(text, file);
  const found = [];
  const add = (kind, node) =>
    found.push({ kind, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const name = node.name.text;
      const tag = node.parent.parent.tagName.getText(source);
      const intrinsic = /^[a-z]/.test(tag);
      if (SVG_PRESENTATION.test(name)) add(intrinsic ? "svgCasing.element" : "svgCasing.componentProp", node);
      if (name === "onFocus" || name === "onBlur") add(intrinsic ? "focus.element" : "focus.componentProp", node);
      if (name === "onChange")
        add(
          !intrinsic
            ? "onChange.componentProp"
            : tag === "input" || tag === "textarea"
              ? "onChange.textControl"
              : "onChange.otherElement",
          node,
        );
      if (name === "style") {
        const value = node.initializer && ts.isJsxExpression(node.initializer) ? node.initializer.expression : undefined;
        add(intrinsic && value && ts.isObjectLiteralExpression(value) ? "inlineStyle.elementLiteral" : "inlineStyle.other", node);
      }
    } else if (
      (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "React") ||
      (ts.isQualifiedName(node) && ts.isIdentifier(node.left) && node.left.text === "React")
    ) {
      const member = ts.isQualifiedName(node) ? node.right.text : node.name.text;
      add("reactNamespace", node);
      add(`react.${member}`, node);
    } else if (ts.isIdentifier(node) && TRACKED_APIS.includes(node.text)) {
      const parent = node.parent;
      if (!ts.isPropertyAccessExpression(parent) && !ts.isQualifiedName(parent) && !ts.isImportSpecifier(parent)) {
        add(`react.${node.text}`, node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

const round = (value, decimals = 1) => Number(value.toFixed(decimals));

function git(...args) {
  return execFileSync("git", args, { cwd: repoDir, maxBuffer: 1 << 28, encoding: "utf8" });
}

function hasCommit(ref) {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}^{commit}`], { cwd: repoDir, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function fetchBase(ref) {
  const shallow = git("rev-parse", "--is-shallow-repository").trim() === "true";
  const args = ["fetch", "--no-tags", ...(shallow ? ["--depth=1"] : []), "origin", ref];
  try {
    execFileSync("git", args, { cwd: repoDir, stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" });
  } catch (error) {
    throw new Error(
      `Base commit ${ref} is not in this clone and could not be fetched (git ${args.join(" ")}): ${String(error.stderr ?? error.message).trim()}`,
    );
  }
}

function reader(ref) {
  if (!hasCommit(ref)) {
    fetchBase(ref);
    if (!hasCommit(ref)) throw new Error(`Base commit ${ref} is still missing after: git fetch origin ${ref}`);
  }
  return {
    show: (path) => git("show", `${ref}:${path}`),
    list: (dir) =>
      git("ls-tree", "-r", "--name-only", ref, "--", dir)
        .split("\n")
        .filter((path) => /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path))
        .map((path) => path.slice(dir.length + 1))
        .sort(),
  };
}

const local = (path) => readFileSync(join(packageDir, path), "utf8");

export function measure(ref = BASE_REF) {
  const base = reader(ref);
  const datavizFiles = base.list(DATAVIZ_SRC);
  const datavizText = Object.fromEntries(datavizFiles.map((file) => [file, base.show(`${DATAVIZ_SRC}/${file}`)]));
  const tsxCount = datavizFiles.filter((file) => file.endsWith(".tsx")).length;
  const tsCount = datavizFiles.filter((file) => file.endsWith(".ts")).length;
  const totalLines = datavizFiles.reduce((sum, file) => sum + lineCount(datavizText[file]), 0);

  const manifest = JSON.parse(readFileSync(join(packageDir, "coverage-manifest.json"), "utf8"));
  const portedRows = manifest.modules.map((row) => {
    const relReact = row.reactSource.replace(/^dataviz-react\/src\//, "");
    const reactSource = datavizText[relReact];
    if (reactSource === undefined) {
      throw new Error(`coverage-manifest.json: reactSource ${row.reactSource} not found at ${ref}`);
    }
    const preactSource = local(row.file);
    return {
      module: row.module,
      kind: row.kind,
      file: row.file,
      reactSource: relReact,
      reactLines: lineCount(reactSource),
      preactLines: lineCount(preactSource),
      ...tokensTouched(reactSource, preactSource, relReact),
      emissionRewrites: rewriteSpecifiers(preactSource, row.file).rewrites.length,
    };
  });

  const sum = (key) => portedRows.reduce((total, row) => total + row[key], 0);
  const portTotals = {
    modules: portedRows.length,
    reactLines: sum("reactLines"),
    preactLines: sum("preactLines"),
    total: sum("total"),
    touched: sum("touched"),
    emissionRewrites: sum("emissionRewrites"),
  };

  const portedReactPaths = new Set(portedRows.map((row) => row.reactSource));
  // index.ts is the incrementally-populated package barrel (always present from scaffold).
  const remaining = datavizFiles.filter((file) => file !== "index.ts" && !portedReactPaths.has(file));

  const adapters = Object.keys(ADAPTERS);
  const shared = {
    "src/index.ts": lineCount(local("src/index.ts")),
    "src/classNames.ts": lineCount(local("src/classNames.ts")),
    preactAdapters: adapters.reduce((total, file) => total + lineCount(local(`src/${file}`)), 0),
    reactTwins: adapters.reduce((total, file) => total + lineCount(local(`react/${file}`)), 0),
    "scripts/emit-react.mjs": lineCount(local("scripts/emit-react.mjs")),
    "vitest.react.config.ts": lineCount(local("vitest.react.config.ts")),
  };

  const kinds = {};
  for (const file of datavizFiles) {
    for (const hit of reach(datavizText[file], file)) {
      kinds[hit.kind] ??= { uses: 0, files: new Set() };
      kinds[hit.kind].uses += 1;
      kinds[hit.kind].files.add(file);
    }
  }
  const count = (...names) => {
    const files = new Set();
    let uses = 0;
    for (const name of names) {
      uses += kinds[name]?.uses ?? 0;
      for (const file of kinds[name]?.files ?? []) files.add(file);
    }
    return { files: files.size, uses };
  };

  return {
    baseRef: ref,
    tree: {
      files: datavizFiles.length,
      tsx: tsxCount,
      ts: tsCount,
      lines: totalLines,
    },
    progress: {
      portedModules: portedRows.length,
      barrelFile: "index.ts",
      remainingModules: remaining.length,
      remainingFiles: remaining,
    },
    port: { modules: portedRows, totals: portTotals, shared },
    reach: {
      svgCasing: {
        onElements: count("svgCasing.element"),
        onComponentProps: count("svgCasing.componentProp"),
        all: count("svgCasing.element", "svgCasing.componentProp"),
      },
      focusEvents: {
        onElements: count("focus.element"),
        onComponentProps: count("focus.componentProp"),
        all: count("focus.element", "focus.componentProp"),
      },
      onChange: {
        onTextControls: count("onChange.textControl"),
        onOtherElements: count("onChange.otherElement"),
        onComponentProps: count("onChange.componentProp"),
        all: count("onChange.textControl", "onChange.otherElement", "onChange.componentProp"),
      },
      reactNamespace: count("reactNamespace"),
      inlineStyle: {
        objectLiteralOnElements: count("inlineStyle.elementLiteral"),
        all: count("inlineStyle.elementLiteral", "inlineStyle.other"),
      },
      apis: {
        forwardRef: count("react.forwardRef"),
        useSyncExternalStore: count("react.useSyncExternalStore"),
        useInsertionEffect: count("react.useInsertionEffect"),
        createPortal: count("react.createPortal"),
      },
    },
  };
}

function table(rows) {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => String(row[column]).length)));
  return rows
    .map((row) =>
      row
        .map((cell, column) => (column === 0 ? String(cell).padEnd(widths[column]) : String(cell).padStart(widths[column])))
        .join("  ")
        .trimEnd(),
    )
    .join("\n");
}

const pair = (value) => `${value.files} files / ${value.uses} uses`;

export function report(result) {
  const { tree, progress, port, reach: gaps } = result;
  const out = [];
  out.push(`Port metrics of lot P6 (dataviz-preact) - dataviz-react read at ${result.baseRef}`);
  out.push("");
  out.push("== Tree ==");
  out.push(`dataviz-react: ${tree.files} non-test modules (${tree.tsx} .tsx + ${tree.ts} .ts), ${tree.lines} lines`);
  out.push(
    `ported: ${progress.portedModules} modules (+ incremental barrel ${progress.barrelFile}), remaining: ${progress.remainingModules} modules`,
  );
  out.push("");
  out.push("== Ported modules ==");
  if (port.modules.length === 0) {
    out.push("(scaffold only — 0 modules ported yet)");
  } else {
    out.push(
      table([
        ["module", "kind", "React lines", "Preact lines", "tokens touched", "of", "%", "rewrites"],
        ...port.modules.map((row) => [
          row.module,
          row.kind,
          row.reactLines,
          row.preactLines,
          row.touched,
          row.total,
          row.total === 0 ? 0 : round((100 * row.touched) / row.total, 1),
          row.emissionRewrites,
        ]),
        [
          "total",
          "",
          port.totals.reactLines,
          port.totals.preactLines,
          port.totals.touched,
          port.totals.total,
          port.totals.total === 0 ? 0 : round((100 * port.totals.touched) / port.totals.total, 1),
          port.totals.emissionRewrites,
        ],
      ]),
    );
  }
  out.push(
    `shared code (lines): ${Object.entries(port.shared)
      .map(([name, lines]) => `${name} ${lines}`)
      .join(", ")}`,
  );
  out.push("");
  out.push("== Reach of runtime gaps in dataviz-react ==");
  out.push(`SVG presentation attributes in camelCase, on elements (affected): ${pair(gaps.svgCasing.onElements)}`);
  out.push(`  same names passed as component props: ${pair(gaps.svgCasing.onComponentProps)}; both: ${pair(gaps.svgCasing.all)}`);
  out.push(`onFocus / onBlur: ${pair(gaps.focusEvents.all)} = on elements ${pair(gaps.focusEvents.onElements)}, component props ${pair(gaps.focusEvents.onComponentProps)}`);
  out.push(`onChange: ${pair(gaps.onChange.all)} = on input / textarea ${pair(gaps.onChange.onTextControls)}, on other elements ${pair(gaps.onChange.onOtherElements)}, component props ${pair(gaps.onChange.onComponentProps)}`);
  out.push(`React. namespace: ${pair(gaps.reactNamespace)}`);
  out.push(`inline style: object literal on an element ${pair(gaps.inlineStyle.objectLiteralOnElements)}; every style attribute ${pair(gaps.inlineStyle.all)}`);
  out.push(
    `APIs: ${Object.entries(gaps.apis)
      .map(([name, value]) => `${name} ${pair(value)}`)
      .join("; ")}`,
  );
  return out.join("\n") + "\n";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const refArg = process.argv.find((value) => value.startsWith("--ref="));
  const result = measure(refArg ? refArg.slice("--ref=".length) : BASE_REF);
  const text = report(result);
  const json = JSON.stringify(result, null, 2) + "\n";
  const jsonFile = join(measurementsDir, "port-metrics.json");
  const textFile = join(measurementsDir, "port-metrics.txt");
  if (process.argv.includes("--check")) {
    const stale = [
      ["measurements/port-metrics.json", jsonFile, json],
      ["measurements/port-metrics.txt", textFile, text],
    ].filter(([, file, expected]) => {
      try {
        return readFileSync(file, "utf8") !== expected;
      } catch {
        return true;
      }
    });
    if (stale.length > 0) {
      for (const [label] of stale) console.error(`[port-metrics] ${label} is stale; run \`npm run measure:port\`.`);
      process.exit(1);
    }
    console.log(`[port-metrics] measurements/port-metrics.{json,txt} match ${result.baseRef}.`);
  } else if (process.argv.includes("--write")) {
    mkdirSync(measurementsDir, { recursive: true });
    writeFileSync(jsonFile, json);
    writeFileSync(textFile, text);
    console.log(`[port-metrics] wrote measurements/port-metrics.{json,txt} (${result.progress.portedModules} ported / ${result.tree.files} total).`);
  } else {
    process.stdout.write(text);
  }
}
