// Port metrics of spike S1 (`npm run measure:port`).
//
// Regenerates, from the repository alone, every figure of sections 5.2 and 8
// of `docs/preact-s1-spike.md` that is not a bundle size:
//
//   1. the port table: lines, tokens touched, emission rewrites and tests of
//      the eight ported modules (React source at the base commit, Preact
//      source in the working tree);
//   2. the port rate, derived from the committed raw timing log
//      `measurements/port-timing.json`;
//   3. the lines of every W3 conversion lot, from the component index
//      categories at the base commit, the lines of `catalog.tsx` being
//      attributed declaration by declaration to the module that re-exports
//      them;
//   4. the projection of the rate to the lots, restated per module class:
//      a class with no sampled module is `not measured` and keeps its plan
//      hours;
//   5. the reach counts of the runtime gaps (SVG attribute casing, focus
//      events, text input events, `React.` namespace, ...).
//
// The React trees are read with `git show <base>:<path>`, so the result does
// not depend on what `main` has become. Usage:
//
//   node scripts/port-metrics.mjs            print the report
//   node scripts/port-metrics.mjs --write    also write measurements/port-metrics.{json,txt}
//   node scripts/port-metrics.mjs --check    fail when the committed files differ
//   node scripts/port-metrics.mjs --ref=<commit>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { ADAPTERS, rewriteSpecifiers } from "./emit-react.mjs";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoDir = dirname(dirname(packageDir));
const measurementsDir = join(packageDir, "measurements");

/** `origin/main` when the spike branched: the tree every React count is read from. */
export const BASE_REF = "81083403e58dd1810bd1bd4f639882d226375d97";

const REACT_SRC = "packages/components-react/src";
const DATAVIZ_SRC = "packages/dataviz-react/src";
const INDEX_DIR = "packages/component-index/generated";
const CATALOG = "catalog.tsx";

/**
 * W3 lots of the DS programme plan (revision 4, section 4.4), with their plan
 * hours. `categories` are the component-index categories a conversion lot
 * owns; P4c also owns every module no catalogue entry points to.
 */
export const LOTS = [
  { lot: "P1", label: "layout + action + feedback", categories: ["layout", "action", "feedback"], planHours: 10 },
  { lot: "P2", label: "form", categories: ["form"], planHours: 12 },
  { lot: "P3", label: "navigation + overlay", categories: ["navigation", "overlay"], planHours: 14 },
  { lot: "P4a+P4b", label: "data", categories: ["data"], planHours: 24 },
  { lot: "P4c", label: "chat + other + uncatalogued", categories: ["chat", "other", "(uncatalogued)"], planHours: 8 },
  { lot: "P6", label: "dataviz-react", categories: ["(dataviz-react tree)"], planHours: 20 },
];
/** Lots of W3 that convert no module of the trees counted here. */
export const OTHER_LOTS = [
  { lot: "P5", label: "hard set (overlaps the category lots)", planHours: 10 },
  { lot: "P0", label: "scaffold, build, adapters, test infrastructure", planHours: 12 },
  { lot: "P7", label: "missing ports", planHours: 12 },
  { lot: "P8", label: "full React emission, release candidate", planHours: 10 },
  { lot: "P9", label: "elements Preact entry", planHours: 12 },
  { lot: "P10", label: "Preact island", planHours: 6 },
  { lot: "P11", label: "bundle and licence report", planHours: 4 },
  { lot: "P12", label: "autolayout twin", planHours: 3 },
];

/** The eight ported modules: Preact file in `src/`, React module at the base commit. */
export const SAMPLE = ["Button", "Input", "Modal", "Tabs", "SelectableRow", "ChatComposer", "Portal", "ThemeProvider"];

/** Judgment factors applied to the measured rate (not measurements). */
export const FACTORS = { low: 1, central: 2, high: 3 };

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested in port-metrics.test.mjs)
// ---------------------------------------------------------------------------

/** Lines as `wc -l` counts them for a file that ends with a newline. */
export function lineCount(text) {
  if (text === "") return 0;
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

function parse(text, file) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
}

/** Leaf tokens of a module, comments and whitespace excluded. */
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

/** Length of the longest common subsequence of two token lists. */
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

/** Tokens of `before` that do not survive in `after`: the edit a port made. */
export function tokensTouched(before, after, file) {
  const a = tokens(before, file);
  const b = tokens(after, file);
  return { total: a.length, touched: a.length - lcsLength(a, b) };
}

function declaredNames(statement) {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.map((d) => d.name.getText()).filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
  }
  if (
    ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isEnumDeclaration(statement)
  ) {
    return statement.name ? [statement.name.text] : [];
  }
  return [];
}

/** Top-level declarations of a module: names and 1-based line span (leading comments excluded). */
export function declarations(text, file) {
  const source = parse(text, file);
  const line = (position) => source.getLineAndCharacterOfPosition(position).line + 1;
  return source.statements
    .map((statement) => ({ names: declaredNames(statement), start: line(statement.getStart(source)), end: line(statement.getEnd()) }))
    .filter((declaration) => declaration.names.length > 0);
}

/**
 * Names a module re-exports from `./catalog.js`, or null when the module is
 * anything else than a list of such re-exports.
 */
export function catalogReexports(text, file) {
  const source = parse(text, file);
  if (source.statements.length === 0) return null;
  const names = [];
  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || statement.moduleSpecifier.text !== "./catalog.js") return null;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) return null;
    for (const element of statement.exportClause.elements) names.push((element.propertyName ?? element.name).text);
  }
  return names;
}

/**
 * Attribute every line of `catalog.tsx` to the module that re-exports the
 * declaration it belongs to. `reexports` maps a module file to the names it
 * re-exports. Lines of no re-exported declaration (imports, private helpers,
 * comments, blank lines) are the residual. Returns the owner of each line
 * (index 0 = line 1; null = residual).
 */
export function attributeCatalog(catalogText, reexports) {
  const owners = new Array(lineCount(catalogText)).fill(null);
  const ownerOfName = new Map();
  for (const file of Object.keys(reexports).sort()) {
    for (const name of reexports[file]) if (!ownerOfName.has(name)) ownerOfName.set(name, file);
  }
  for (const declaration of declarations(catalogText, CATALOG)) {
    const owner = declaration.names.map((name) => ownerOfName.get(name)).find(Boolean);
    if (!owner) continue;
    for (let line = declaration.start; line <= declaration.end; line += 1) owners[line - 1] ??= owner;
  }
  return owners;
}

/** SVG presentation attributes written in camelCase (the families `preact/compat` translates). */
export const SVG_PRESENTATION =
  /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;

const TRACKED_APIS = ["forwardRef", "useSyncExternalStore", "useInsertionEffect", "createPortal"];

/**
 * Occurrences, in one module, of the patterns Preact core treats differently
 * from React. Each occurrence is `{ kind, line }`.
 */
export function reach(text, file) {
  const source = parse(text, file);
  const found = [];
  const add = (kind, node) => found.push({ kind, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const name = node.name.text;
      const tag = node.parent.parent.tagName.getText(source);
      const intrinsic = /^[a-z]/.test(tag);
      if (SVG_PRESENTATION.test(name)) add(intrinsic ? "svgCasing.element" : "svgCasing.componentProp", node);
      if (name === "onFocus" || name === "onBlur") add(intrinsic ? "focus.element" : "focus.componentProp", node);
      if (name === "onChange") add(!intrinsic ? "onChange.componentProp" : tag === "input" || tag === "textarea" ? "onChange.textControl" : "onChange.otherElement", node);
      if (name === "style") {
        const value = node.initializer && ts.isJsxExpression(node.initializer) ? node.initializer.expression : undefined;
        add(intrinsic && value && ts.isObjectLiteralExpression(value) ? "inlineStyle.elementLiteral" : "inlineStyle.other", node);
      }
    } else if ((ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) && ts.isIdentifier(node.name)) {
      if (node.name.text === "onFocus" || node.name.text === "onBlur") add("focus.objectKey", node);
    } else if (
      (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "React") ||
      (ts.isQualifiedName(node) && ts.isIdentifier(node.left) && node.left.text === "React")
    ) {
      const member = ts.isQualifiedName(node) ? node.right.text : node.name.text;
      add("reactNamespace", node);
      add(`react.${member}`, node);
    } else if (ts.isPropertyAccessExpression(node) && TRACKED_APIS.includes(node.name.text)) {
      // `ReactDOM.createPortal(...)`; `React.x` is counted by the branch above.
      add(`react.${node.name.text}`, node);
    } else if (ts.isIdentifier(node) && TRACKED_APIS.includes(node.text)) {
      // Bare uses (`forwardRef(...)`), not the import that brings the name in.
      const parent = node.parent;
      if (!ts.isPropertyAccessExpression(parent) && !ts.isQualifiedName(parent) && !ts.isImportSpecifier(parent)) add(`react.${node.text}`, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/** Number of `it(...)` / `test(...)` cases of a test module. */
export function testCases(text, file) {
  const source = parse(text, file);
  let count = 0;
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && (node.expression.text === "it" || node.expression.text === "test")) count += 1;
    ts.forEachChild(node, visit);
  };
  visit(source);
  return count;
}

/**
 * Port rate from the raw timing log. Steps are ordered; a step starts at the
 * first write (file birth) of its files and ends where the next one starts.
 * The last step ends at its own last write: nothing in the file times marks
 * the moment its tests passed, so its duration is a lower bound.
 */
export function portRate(timing, linesOf) {
  const birth = new Map(timing.fileTimes.map((entry) => [entry.file, entry.birth]));
  const starts = timing.steps.map((step) => {
    const births = step.files.map((file) => {
      if (!birth.has(file)) throw new Error(`port-timing.json: no file time for ${file}`);
      return birth.get(file);
    });
    return { first: Math.min(...births), last: Math.max(...births) };
  });
  const steps = timing.steps.map((step, index) => {
    const start = starts[index].first;
    const end = index + 1 < starts.length ? starts[index + 1].first : starts[index].last;
    const lines = step.modules.reduce((sum, name) => sum + linesOf(name), 0);
    const seconds = end - start;
    return {
      step: step.step,
      modules: step.modules,
      lines,
      fileTimeSeconds: seconds,
      lowerBound: index + 1 === starts.length,
      reportedSeconds: step.reportedSeconds,
      secondsPerModule: step.modules.length ? round(seconds / step.modules.length, 1) : null,
      secondsPerLine: lines ? round(seconds / lines, 2) : null,
      reportedSecondsPerModule: step.modules.length ? round(step.reportedSeconds / step.modules.length, 1) : null,
    };
  });
  const moduleSteps = steps.filter((step) => step.modules.length > 0);
  const total = (key) => moduleSteps.reduce((sum, step) => sum + step[key], 0);
  const modules = moduleSteps.reduce((sum, step) => sum + step.modules.length, 0);
  const lines = total("lines");
  const pooled = (seconds) => ({ seconds, secondsPerModule: round(seconds / modules, 1), secondsPerLine: round(seconds / lines, 3) });
  const afterFirst = moduleSteps.slice(1);
  const afterFirstModules = afterFirst.reduce((sum, step) => sum + step.modules.length, 0);
  return {
    steps,
    modules,
    lines,
    fileTimes: pooled(total("fileTimeSeconds")),
    reported: pooled(total("reportedSeconds")),
    afterFirstPort: {
      modules: afterFirstModules,
      fileTimeSecondsPerModule: round(afterFirst.reduce((sum, step) => sum + step.fileTimeSeconds, 0) / afterFirstModules, 1),
      reportedSecondsPerModule: round(afterFirst.reduce((sum, step) => sum + step.reportedSeconds, 0) / afterFirstModules, 1),
    },
    setupFileTimeSeconds: steps.filter((step) => step.modules.length === 0).reduce((sum, step) => sum + step.fileTimeSeconds, 0),
    setupReportedSeconds: steps.filter((step) => step.modules.length === 0).reduce((sum, step) => sum + step.reportedSeconds, 0),
  };
}

export function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

/** Hours of a lot at a rate (seconds per line) and a judgment factor. */
export function hours(lines, secondsPerLine, factor = 1) {
  return round((lines * secondsPerLine * factor) / 3600, 1);
}

// ---------------------------------------------------------------------------
// Repository readers
// ---------------------------------------------------------------------------

function git(...args) {
  return execFileSync("git", args, { cwd: repoDir, maxBuffer: 1 << 28, encoding: "utf8" });
}

function reader(ref) {
  try {
    git("cat-file", "-e", `${ref}^{commit}`);
  } catch {
    throw new Error(`Base commit ${ref} is not in this clone. Fetch it first: git fetch origin ${ref}`);
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

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

export function measure(ref = BASE_REF) {
  const base = reader(ref);
  const reactFiles = base.list(REACT_SRC);
  const reactText = Object.fromEntries(reactFiles.map((file) => [file, base.show(`${REACT_SRC}/${file}`)]));
  const datavizFiles = base.list(DATAVIZ_SRC);
  const datavizText = Object.fromEntries(datavizFiles.map((file) => [file, base.show(`${DATAVIZ_SRC}/${file}`)]));

  // --- catalog.tsx: every line to the module that re-exports its declaration.
  const reexports = {};
  for (const file of reactFiles) {
    const names = file === CATALOG ? null : catalogReexports(reactText[file], file);
    if (names) reexports[file] = names;
  }
  const catalogOwners = attributeCatalog(reactText[CATALOG], reexports);
  const catalogLinesOf = (file) => catalogOwners.filter((owner) => owner === file).length;
  const catalogResidual = catalogOwners.filter((owner) => owner === null).length;

  // --- component index: category of each React module.
  const index = JSON.parse(base.show(`${INDEX_DIR}/component-index.json`));
  const categoryOf = new Map();
  let sharedModules = 0;
  let entriesWithReactModule = 0;
  for (const entry of [...index.entries].sort((a, b) => a.componentId.localeCompare(b.componentId))) {
    const detail = JSON.parse(base.show(`${INDEX_DIR}/${entry.path}`));
    for (const delivery of detail.delivery ?? []) {
      if (delivery.framework !== "react" || !delivery.path.startsWith(`${REACT_SRC}/`)) continue;
      entriesWithReactModule += 1;
      const file = delivery.path.slice(REACT_SRC.length + 1);
      if (categoryOf.has(file)) sharedModules += 1;
      else categoryOf.set(file, entry.category ?? "(uncatalogued)");
    }
  }
  const lotOfCategory = new Map(LOTS.flatMap((lot) => lot.categories.map((category) => [category, lot.lot])));
  const lotOfFile = (file) => lotOfCategory.get(categoryOf.get(file) ?? "(uncatalogued)");

  // --- lines per module and per lot. A module owns its own file plus the
  // declarations of catalog.tsx it re-exports; catalog.tsx keeps the residual.
  const moduleLines = (file) => (file === CATALOG ? catalogResidual : lineCount(reactText[file]) + (reexports[file] ? catalogLinesOf(file) : 0));
  const lots = Object.fromEntries(LOTS.map((lot) => [lot.lot, { ...lot, modules: 0, lines: 0, byCategory: {} }]));
  for (const file of reactFiles) {
    const category = categoryOf.get(file) ?? "(uncatalogued)";
    const lot = lots[lotOfFile(file)];
    lot.modules += 1;
    lot.lines += moduleLines(file);
    lot.byCategory[category] ??= { modules: 0, lines: 0, sampled: [] };
    lot.byCategory[category].modules += 1;
    lot.byCategory[category].lines += moduleLines(file);
  }
  lots.P6.modules = datavizFiles.length;
  lots.P6.lines = datavizFiles.reduce((sum, file) => sum + lineCount(datavizText[file]), 0);
  lots.P6.byCategory["(dataviz-react tree)"] = { modules: lots.P6.modules, lines: lots.P6.lines, sampled: [] };

  const reactLines = reactFiles.reduce((sum, file) => sum + lineCount(reactText[file]), 0);
  const assigned = LOTS.filter((lot) => lot.lot !== "P6").reduce((sum, lot) => sum + lots[lot.lot].lines, 0);
  if (assigned !== reactLines) throw new Error(`Lot lines (${assigned}) do not add up to the tree (${reactLines})`);

  // --- the eight ported modules.
  const emitted = Object.keys(ADAPTERS);
  const port = SAMPLE.map((name) => {
    const file = `${name}.tsx`;
    const fromCatalog = Boolean(reexports[file]);
    let reactSource = reactText[file];
    if (fromCatalog) {
      const spans = declarations(reactText[CATALOG], CATALOG).filter((declaration) => declaration.names.some((n) => reexports[file].includes(n)));
      const start = Math.min(...spans.map((span) => span.start));
      const end = Math.max(...spans.map((span) => span.end));
      reactSource = reactText[CATALOG].split("\n").slice(start - 1, end).join("\n") + "\n";
    }
    const preactSource = local(`src/${file}`);
    const testSource = local(`src/${name}.test.tsx`);
    const category = categoryOf.get(file) ?? "(uncatalogued)";
    lots[lotOfFile(file)].byCategory[category].sampled.push(name);
    return {
      module: name,
      category,
      lot: lotOfFile(file),
      reactSource: fromCatalog ? `${CATALOG} (declarations re-exported by ${file})` : file,
      reactLines: lineCount(reactSource),
      preactLines: lineCount(preactSource),
      ...tokensTouched(reactSource, preactSource, file),
      emissionRewrites: rewriteSpecifiers(preactSource, `src/${file}`).rewrites.length,
      tests: testCases(testSource, `${name}.test.tsx`),
      testLines: lineCount(testSource),
    };
  });
  const sum = (key) => port.reduce((total, row) => total + row[key], 0);
  const portTotals = {
    reactLines: sum("reactLines"),
    preactLines: sum("preactLines"),
    total: sum("total"),
    touched: sum("touched"),
    emissionRewrites: sum("emissionRewrites"),
    tests: sum("tests"),
    testLines: sum("testLines"),
  };
  const shared = {
    "src/internal.ts": lineCount(local("src/internal.ts")),
    "src/classNames.ts": lineCount(local("src/classNames.ts")),
    "src/index.ts": lineCount(local("src/index.ts")),
    preactAdapters: emitted.reduce((total, file) => total + lineCount(local(`src/${file}`)), 0),
    reactTwins: emitted.reduce((total, file) => total + lineCount(local(`react/${file}`)), 0),
    "scripts/emit-react.mjs": lineCount(local("scripts/emit-react.mjs")),
    "vitest.react.config.ts": lineCount(local("vitest.react.config.ts")),
  };

  // --- port rate from the raw timing log.
  const timing = JSON.parse(local("measurements/port-timing.json"));
  const reactLinesOf = (name) => port.find((row) => row.module === name).reactLines;
  const rate = portRate(timing, reactLinesOf);

  // --- projection, per lot. A lot is measured when the spike ported at least
  // one of its modules; otherwise it keeps its plan hours.
  const secondsPerLine = rate.fileTimes.secondsPerLine;
  const projection = LOTS.map(({ lot }) => {
    const entry = lots[lot];
    const sampled = port.filter((row) => row.lot === lot);
    const sampledLines = sampled.reduce((total, row) => total + row.reactLines, 0);
    const measured = sampled.length > 0;
    return {
      lot,
      label: entry.label,
      modules: entry.modules,
      lines: entry.lines,
      planHours: entry.planHours,
      status: measured ? "measured" : "not measured",
      sampledModules: sampled.map((row) => row.module),
      sampledLines,
      sampledShare: round((100 * sampledLines) / entry.lines, 1),
      unsampledCategories: Object.entries(entry.byCategory)
        .filter(([, category]) => category.sampled.length === 0)
        .map(([name]) => name),
      atRateHours: hours(entry.lines, secondsPerLine),
      atReportedRateHours: hours(entry.lines, rate.reported.secondsPerLine),
      revisedHours: measured
        ? { low: hours(entry.lines, secondsPerLine, FACTORS.low), central: hours(entry.lines, secondsPerLine, FACTORS.central), high: hours(entry.lines, secondsPerLine, FACTORS.high) }
        : null,
    };
  });
  const measuredLots = projection.filter((row) => row.status === "measured");
  const unmeasuredLots = projection.filter((row) => row.status !== "measured");
  const add = (rows, pick) => round(rows.reduce((total, row) => total + pick(row), 0), 1);
  const outsideHours = OTHER_LOTS.reduce((total, lot) => total + lot.planHours, 0);
  const planHours = outsideHours + LOTS.reduce((total, lot) => total + lot.planHours, 0);
  const keptHours = outsideHours + add(unmeasuredLots, (row) => row.planHours);
  const w3 = {
    planHours,
    measuredLotsPlanHours: add(measuredLots, (row) => row.planHours),
    measuredLotsRevised: {
      low: add(measuredLots, (row) => row.revisedHours.low),
      central: add(measuredLots, (row) => row.revisedHours.central),
      high: add(measuredLots, (row) => row.revisedHours.high),
    },
    notMeasuredPlanHours: keptHours,
    notMeasuredLots: [...unmeasuredLots.map((row) => row.lot), ...OTHER_LOTS.map((lot) => lot.lot)],
  };
  w3.derivable = {
    low: round(keptHours + w3.measuredLotsRevised.low, 1),
    central: round(keptHours + w3.measuredLotsRevised.central, 1),
    high: round(keptHours + w3.measuredLotsRevised.high, 1),
  };
  // What the total would become IF the rate held for the lots S1 did not
  // sample. Stated for reference; nothing in S1 measures it.
  const conversionLines = projection.reduce((total, row) => total + row.lines, 0);
  w3.ifRateHeldEverywhere = {
    conversionLines,
    low: round(outsideHours + hours(conversionLines, secondsPerLine, FACTORS.low), 1),
    central: round(outsideHours + hours(conversionLines, secondsPerLine, FACTORS.central), 1),
    high: round(outsideHours + hours(conversionLines, secondsPerLine, FACTORS.high), 1),
  };

  // --- reach of the runtime gaps over components-react (and SVG casing over dataviz-react).
  const kinds = {};
  const svgOwners = new Set();
  for (const file of reactFiles) {
    for (const hit of reach(reactText[file], file)) {
      kinds[hit.kind] ??= { uses: 0, files: new Set() };
      kinds[hit.kind].uses += 1;
      kinds[hit.kind].files.add(file);
      if (hit.kind === "svgCasing.element") svgOwners.add(file === CATALOG ? (catalogOwners[hit.line - 1] ?? CATALOG) : file);
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
  const members = (names) => Object.fromEntries(names.map((name) => [name, kinds[`react.${name}`]?.uses ?? 0]));
  const dataModules = reactFiles.filter((file) => lotOfFile(file) === "P4a+P4b");
  const dataWithSvg = dataModules.filter((file) => svgOwners.has(file));
  const datavizSvg = datavizFiles.filter((file) => reach(datavizText[file], file).some((hit) => hit.kind === "svgCasing.element"));
  const hardSet = reactFiles.filter(
    (file) =>
      file === "Portal.tsx" ||
      file === "ThemeProvider.tsx" ||
      ["forwardRef", "useSyncExternalStore", "useInsertionEffect"].some((name) => kinds[`react.${name}`]?.files.has(file)),
  );
  const reachReport = {
    svgCasing: {
      onElements: count("svgCasing.element"),
      onComponentProps: count("svgCasing.componentProp"),
      all: count("svgCasing.element", "svgCasing.componentProp"),
      dataModules: dataModules.length,
      dataModulesWithElementUse: dataWithSvg.length,
      dataLinesWithElementUse: dataWithSvg.reduce((total, file) => total + moduleLines(file), 0),
      datavizFilesWithElementUse: datavizSvg.length,
    },
    focusEvents: {
      onElements: count("focus.element"),
      onComponentProps: count("focus.componentProp"),
      asObjectKeys: count("focus.objectKey"),
      all: count("focus.element", "focus.componentProp", "focus.objectKey"),
      objectKeyFiles: [...(kinds["focus.objectKey"]?.files ?? [])].sort(),
    },
    onChange: {
      onTextControls: count("onChange.textControl"),
      onOtherElements: count("onChange.otherElement"),
      onComponentProps: count("onChange.componentProp"),
      all: count("onChange.textControl", "onChange.otherElement", "onChange.componentProp"),
    },
    reactNamespace: count("reactNamespace"),
    inlineStyle: { objectLiteralOnElements: count("inlineStyle.elementLiteral"), all: count("inlineStyle.elementLiteral", "inlineStyle.other") },
    apis: {
      forwardRef: count("react.forwardRef"),
      useSyncExternalStore: count("react.useSyncExternalStore"),
      useInsertionEffect: count("react.useInsertionEffect"),
      createPortal: count("react.createPortal"),
    },
    typeNames: members(["ReactNode", "PointerEvent", "KeyboardEvent", "MouseEvent", "FocusEvent", "ChangeEvent", "ElementType", "CSSProperties"]),
    hardSet: { modules: hardSet.length, lines: hardSet.reduce((total, file) => total + moduleLines(file), 0) },
  };

  return {
    baseRef: ref,
    trees: {
      componentsReact: {
        files: reactFiles.length,
        lines: reactLines,
        catalogLines: lineCount(reactText[CATALOG]),
        catalogReexportModules: Object.keys(reexports).length,
        catalogLinesAttributed: lineCount(reactText[CATALOG]) - catalogResidual,
        catalogResidualLines: catalogResidual,
        indexEntriesWithReactModule: entriesWithReactModule,
        modulesSharedByTwoEntries: sharedModules,
        uncataloguedModules: reactFiles.filter((file) => !categoryOf.has(file)).length,
      },
      datavizReact: { files: datavizFiles.length, lines: lots.P6.lines },
    },
    port: { modules: port, totals: portTotals, shared },
    rate,
    lots: LOTS.map(({ lot }) => ({ lot, label: lots[lot].label, modules: lots[lot].modules, lines: lots[lot].lines, byCategory: lots[lot].byCategory })),
    projection,
    otherLots: OTHER_LOTS,
    factors: FACTORS,
    w3,
    reach: reachReport,
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function table(rows) {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => String(row[column]).length)));
  return rows.map((row) => row.map((cell, column) => (column === 0 ? String(cell).padEnd(widths[column]) : String(cell).padStart(widths[column]))).join("  ").trimEnd()).join("\n");
}

const range = (value) => `${value.low}-${value.high}`;
const pair = (value) => `${value.files} files / ${value.uses} uses`;

export function report(result) {
  const { trees, port, rate, projection, w3, reach: gaps } = result;
  const out = [];
  out.push(`Port metrics of spike S1 - React trees read at ${result.baseRef}`);
  out.push("");
  out.push("== Trees ==");
  out.push(`components-react: ${trees.componentsReact.files} non-test modules, ${trees.componentsReact.lines} lines`);
  out.push(
    `  catalog.tsx: ${trees.componentsReact.catalogLines} lines, ${trees.componentsReact.catalogReexportModules} re-export modules; ` +
      `${trees.componentsReact.catalogLinesAttributed} lines attributed to them, ${trees.componentsReact.catalogResidualLines} residual (imports, private helpers) kept in P4c`,
  );
  out.push(
    `  component index: ${trees.componentsReact.indexEntriesWithReactModule} entries point to a module of this tree, ` +
      `${trees.componentsReact.modulesSharedByTwoEntries} modules shared by two entries (owned once), ${trees.componentsReact.uncataloguedModules} modules without an entry`,
  );
  out.push(`dataviz-react: ${trees.datavizReact.files} non-test modules, ${trees.datavizReact.lines} lines`);
  out.push("");
  out.push("== Port of the eight modules ==");
  out.push(
    table([
      ["module", "category", "lot", "React lines", "Preact lines", "tokens touched", "of", "%", "rewrites", "tests", "test lines"],
      ...port.modules.map((row) => [row.module, row.category, row.lot, row.reactLines, row.preactLines, row.touched, row.total, round((100 * row.touched) / row.total, 1), row.emissionRewrites, row.tests, row.testLines]),
      ["total", "", "", port.totals.reactLines, port.totals.preactLines, port.totals.touched, port.totals.total, round((100 * port.totals.touched) / port.totals.total, 1), port.totals.emissionRewrites, port.totals.tests, port.totals.testLines],
    ]),
  );
  out.push(`shared code (lines): ${Object.entries(port.shared).map(([name, lines]) => `${name} ${lines}`).join(", ")}`);
  out.push(`Preact test lines per React source line: ${round(port.totals.testLines / port.totals.reactLines, 1)}`);
  out.push("");
  out.push("== Port rate (measurements/port-timing.json) ==");
  out.push(
    table([
      ["step", "modules", "React lines", "file-time s", "s/module", "s/line", "reported s", "reported s/module"],
      ...rate.steps.map((step) => [step.step, step.modules.length, step.lines, `${step.lowerBound ? ">=" : ""}${step.fileTimeSeconds}`, step.secondsPerModule ?? "-", step.secondsPerLine ?? "-", step.reportedSeconds, step.reportedSecondsPerModule ?? "-"]),
    ]),
  );
  out.push(`eight modules, file times: ${rate.fileTimes.seconds} s = ${rate.fileTimes.secondsPerModule} s/module, ${rate.fileTimes.secondsPerLine} s/line (${rate.lines} React lines)`);
  out.push(`eight modules, reported  : ${rate.reported.seconds} s = ${rate.reported.secondsPerModule} s/module, ${rate.reported.secondsPerLine} s/line`);
  out.push(`after the first port (${rate.afterFirstPort.modules} modules): ${rate.afterFirstPort.fileTimeSecondsPerModule} s/module by file times, ${rate.afterFirstPort.reportedSecondsPerModule} s/module reported`);
  out.push(`setup before the first module: ${rate.setupFileTimeSeconds} s by file times, ${rate.setupReportedSeconds} s reported`);
  out.push("");
  out.push("== Lines per lot and per category ==");
  out.push(
    table([
      ["lot", "category", "modules", "lines", "sampled by"],
      ...result.lots.flatMap((lot) => [
        [lot.lot, "(all)", lot.modules, lot.lines, ""],
        ...Object.entries(lot.byCategory).map(([category, entry]) => ["", category, entry.modules, entry.lines, entry.sampled.join(", ") || "none"]),
      ]),
    ]),
  );
  out.push("");
  out.push(`== Projection (file-time rate ${rate.fileTimes.secondsPerLine} s/line; factors ${result.factors.low} / ${result.factors.central} / ${result.factors.high} are judgment, not measurement) ==`);
  out.push(
    table([
      ["lot", "status", "modules", "lines", "sampled lines", "sampled %", "plan h", "at rate h", "revised h", "range h"],
      ...projection.map((row) => [row.lot, row.status, row.modules, row.lines, row.sampledLines, row.sampledShare, row.planHours, row.atRateHours, row.revisedHours ? row.revisedHours.central : "plan kept", row.revisedHours ? range(row.revisedHours) : "-"]),
    ]),
  );
  out.push(`not measured, plan hours kept: ${w3.notMeasuredLots.join(", ")} = ${w3.notMeasuredPlanHours} h`);
  out.push(`measured lots: plan ${w3.measuredLotsPlanHours} h -> revised ${w3.measuredLotsRevised.central} h (range ${range(w3.measuredLotsRevised)})`);
  out.push(`W3 derivable from S1: ${w3.derivable.central} h (range ${range(w3.derivable)}), plan ${w3.planHours} h`);
  out.push(
    `for reference only, not measured: if the rate held on all ${w3.ifRateHeldEverywhere.conversionLines} conversion lines, W3 would be ` +
      `${w3.ifRateHeldEverywhere.central} h (range ${range(w3.ifRateHeldEverywhere)}), P5 and the lots outside the conversion kept at plan hours`,
  );
  out.push("");
  out.push("== Reach of the runtime gaps in components-react ==");
  out.push(`SVG presentation attributes in camelCase, on elements (affected): ${pair(gaps.svgCasing.onElements)}`);
  out.push(`  same names passed as component props (not affected): ${pair(gaps.svgCasing.onComponentProps)}; both: ${pair(gaps.svgCasing.all)}`);
  out.push(`  data modules with an affected use: ${gaps.svgCasing.dataModulesWithElementUse} of ${gaps.svgCasing.dataModules} (${gaps.svgCasing.dataLinesWithElementUse} lines); dataviz-react files: ${gaps.svgCasing.datavizFilesWithElementUse} of ${trees.datavizReact.files}`);
  out.push(`onFocus / onBlur: ${pair(gaps.focusEvents.all)} = on elements ${pair(gaps.focusEvents.onElements)}, component props ${pair(gaps.focusEvents.onComponentProps)}, object keys ${pair(gaps.focusEvents.asObjectKeys)} (${gaps.focusEvents.objectKeyFiles.join(", ")})`);
  out.push(`onChange: ${pair(gaps.onChange.all)} = on input / textarea ${pair(gaps.onChange.onTextControls)}, on other elements ${pair(gaps.onChange.onOtherElements)}, component props ${pair(gaps.onChange.onComponentProps)}`);
  out.push(`React. namespace: ${pair(gaps.reactNamespace)}`);
  out.push(`inline style: object literal on an element ${pair(gaps.inlineStyle.objectLiteralOnElements)}; every style attribute ${pair(gaps.inlineStyle.all)}`);
  out.push(`APIs: ${Object.entries(gaps.apis).map(([name, value]) => `${name} ${pair(value)}`).join("; ")}`);
  out.push(`type names (React.X uses): ${Object.entries(gaps.typeNames).map(([name, uses]) => `${name} ${uses}`).join(", ")}`);
  out.push(`hard set of P5 (Portal, ThemeProvider, forwardRef, external-store and insertion-effect users): ${gaps.hardSet.modules} modules, ${gaps.hardSet.lines} lines, counted in their category lots`);
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
      [jsonFile, json],
      [textFile, text],
    ].filter(([file, expected]) => readFileSync(file, "utf8") !== expected);
    if (stale.length > 0) {
      console.error(`Stale: ${stale.map(([file]) => file).join(", ")}. Run: npm run measure:port`);
      process.exit(1);
    }
    console.log("measurements/port-metrics.{json,txt} match the repository.");
  } else {
    process.stdout.write(text);
    if (process.argv.includes("--write")) {
      writeFileSync(jsonFile, json);
      writeFileSync(textFile, text);
    }
  }
}
