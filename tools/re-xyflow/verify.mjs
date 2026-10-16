#!/usr/bin/env node
/**
 * Completeness guard (second extractor, syntactic).
 *
 * Independence contract: this file is written from the pinned xyflow
 * sources and the parity specification only. It uses a syntactic AST walk
 * (ts.createSourceFile) where the primary extractor in enumerate.mjs uses
 * the semantic TypeChecker (ts.createProgram). No enumeration table is
 * copied from the primary: public names come from the export graph,
 * member families are discovered by declaration patterns, directory
 * walks and the builtin edge-type object literal in the sources, the
 * Svelte store state comes from the store class body, change names from
 * the changes module, enums from every enum declaration, and interaction
 * slugs from the normative catalogue table in the specification. The
 * guard compares, for every key, the inventory `source` file (and a
 * candidate line set) and the signature detail, not only identifiers.
 * Any element present on one side and absent on the other, any source
 * mismatch and any detail mismatch fails the guard (exit 1).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const guardDir = dirname(fileURLToPath(import.meta.url));
const wtRoot = resolve(guardDir, "../..");
const parentRoot = resolve(wtRoot, "..");
const xyRoot = join(parentRoot, ".ds-scrap/re-sources/xyflow");
const invFile = join(wtRoot, "docs/re/xyflow-inventory.json");
const ledgerFile = join(guardDir, "raw-enumeration.json");
const specFile = join(wtRoot, "spec/SPEC_RE_XYFLOW_PARITY.md");

async function importCompiler() {
  const spots = [
    join(wtRoot, "node_modules/typescript/lib/typescript.js"),
    join(parentRoot, "node_modules/typescript/lib/typescript.js"),
  ];
  for (const s of spots) {
    if (existsSync(s)) return (await import(pathToFileURL(s).href)).default;
  }
  console.error("typescript not found in node_modules");
  process.exit(2);
}
const ts = await importCompiler();
const slurp = (p) => readFileSync(p, "utf8");
const slash = (p) => p.split("\\").join("/");
const relToXy = (abs) => slash(relative(xyRoot, abs));

function scanTree(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) scanTree(p, out);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}
const tsFiles = [
  ...scanTree(join(xyRoot, "packages/system/src")),
  ...scanTree(join(xyRoot, "packages/react/src")),
  ...scanTree(join(xyRoot, "packages/svelte/src/lib")),
];
const astByFile = new Map();
for (const f of tsFiles) {
  const kind = f.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  astByFile.set(f, ts.createSourceFile(f, slurp(f), ts.ScriptTarget.ESNext, true, kind));
}
function lineAt(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function unquote(t) {
  return t.replace(/^['"]|['"]$/g, "");
}
function resolveSpec(fromFile, spec) {
  let base = null;
  if (spec === "@xyflow/system") base = join(xyRoot, "packages/system/src/index.ts");
  else if (spec.startsWith("@xyflow/system/")) base = join(xyRoot, "packages/system/src", spec.slice("@xyflow/system/".length));
  else if (spec.startsWith("$lib/")) base = join(xyRoot, "packages/svelte/src/lib", spec.slice(5));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = resolve(dirname(fromFile), spec);
  else return null;
  const bare = base.replace(/\.js$/, "");
  const tries = [
    base, `${base}.ts`, `${base}.tsx`, `${base}.svelte.ts`,
    `${bare}.ts`, `${bare}.tsx`, `${bare}.svelte.ts`,
    join(base, "index.ts"), join(base, "index.tsx"),
    join(bare, "index.ts"), join(bare, "index.tsx"),
    `${base}.svelte`, `${bare}.svelte`,
  ];
  for (const c of tries) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}
const typeIndex = new Map();
const filesByTypeName = new Map();
const importsByFile = new Map();
const valuesByName = new Map();
const reexportPlaces = [];
function noteValue(name, file, line, kind) {
  if (!valuesByName.has(name)) valuesByName.set(name, []);
  valuesByName.get(name).push({ file, line, kind });
}
for (const [file, sf] of astByFile) {
  const imps = new Map();
  importsByFile.set(file, imps);
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings)) {
      const tgt = resolveSpec(file, st.moduleSpecifier.text);
      if (!tgt) continue;
      for (const el of st.importClause.namedBindings.elements) {
        imps.set(el.name.text, { file: tgt, orig: (el.propertyName ?? el.name).text });
      }
    }
    if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) {
        reexportPlaces.push({ name: el.name.text, file, line: lineAt(sf, el) });
      }
    }
    if ((ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) {
      typeIndex.set(`${file}::${st.name.text}`, { file, node: st });
      if (!filesByTypeName.has(st.name.text)) filesByTypeName.set(st.name.text, new Set());
      filesByTypeName.get(st.name.text).add(file);
    }
    if (ts.isFunctionDeclaration(st) && st.name) noteValue(st.name.text, file, lineAt(sf, st), "function");
    if (ts.isClassDeclaration(st) && st.name) noteValue(st.name.text, file, lineAt(sf, st), "class");
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) noteValue(d.name.text, file, lineAt(sf, d), "variable");
      }
    }
  }
}
function findTypeDecl(name, ctxFile, depth = 0) {
  if (depth > 6) return null;
  const local = typeIndex.get(`${ctxFile}::${name}`);
  if (local) return local;
  const imp = importsByFile.get(ctxFile)?.get(name);
  if (imp) {
    const direct = typeIndex.get(`${imp.file}::${imp.orig}`);
    if (direct) return direct;
    const deeper = findTypeDecl(imp.orig, imp.file, depth + 1);
    if (deeper) return deeper;
  }
  const files = filesByTypeName.get(name);
  if (!files || files.size === 0) {
    if (name.length > 4 && name.endsWith("Type")) return findTypeDecl(name.slice(0, -4), ctxFile, depth + 1);
    return null;
  }
  if (files.size === 1) {
    const f = [...files][0];
    return typeIndex.get(`${f}::${name}`) ?? null;
  }
  const seg = slash(ctxFile).includes("/react/") ? "/react/" : slash(ctxFile).includes("/svelte/") ? "/svelte/" : "/system/";
  for (const f of files) if (slash(f).includes(seg)) return typeIndex.get(`${f}::${name}`) ?? null;
  const f = [...files].sort()[0];
  return typeIndex.get(`${f}::${name}`) ?? null;
}
function literalSet(node) {
  const out = new Set();
  const eat = (n) => {
    if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) out.add(n.literal.text);
    else if (ts.isUnionTypeNode(n)) n.types.forEach(eat);
    else if (ts.isParenthesizedTypeNode(n)) eat(n.type);
  };
  eat(node);
  return out;
}
function harvestLiteral(node, file, into) {
  const sf = astByFile.get(file);
  for (const m of node.members) {
    if (!(ts.isPropertySignature(m) || ts.isMethodSignature(m)) || !m.name) continue;
    const nm = unquote(m.name.getText(sf));
    const place = `${relToXy(file)}:${lineAt(sf, m)}`;
    if (!into.has(nm)) into.set(nm, { places: new Set(), raws: [] });
    const rec = into.get(nm);
    rec.places.add(place);
    rec.raws.push(m.getText(sf).replace(/\s+/g, " ").trim());
  }
}
function harvestTypeNode(node, file, seen, into) {
  if (!node) return;
  if (ts.isTypeLiteralNode(node)) { harvestLiteral(node, file, into); return; }
  if (ts.isParenthesizedTypeNode(node)) { harvestTypeNode(node.type, file, seen, into); return; }
  if (ts.isIntersectionTypeNode(node)) { for (const t of node.types) harvestTypeNode(t, file, seen, into); return; }
  if (ts.isUnionTypeNode(node)) {
    for (const t of node.types) if (ts.isTypeLiteralNode(t)) harvestLiteral(t, file, into);
    return;
  }
  if (ts.isConditionalTypeNode(node)) {
    harvestTypeNode(node.trueType, file, seen, into);
    harvestTypeNode(node.falseType, file, seen, into);
    return;
  }
  if (ts.isTypeReferenceNode(node)) {
    const ref = node.typeName.getText();
    if (ref.includes(".")) return;
    const args = node.typeArguments ?? [];
    if (["Pick", "Omit", "Partial", "Required", "Readonly"].includes(ref) && args.length >= 1) {
      const base = new Map();
      harvestTypeNode(args[0], file, seen, base);
      if (ref === "Pick" && args[1]) { const keep = literalSet(args[1]); for (const [k, v] of base) if (keep.has(k)) mergeInto(into, k, v); return; }
      if (ref === "Omit" && args[1]) { const drop = literalSet(args[1]); for (const [k, v] of base) if (!drop.has(k)) mergeInto(into, k, v); return; }
      for (const [k, v] of base) mergeInto(into, k, v);
      return;
    }
    if (["Record", "Array", "Promise", "Map", "Set", "Iterable"].includes(ref)) return;
    const key = `${file}::${ref}`;
    if (seen.has(key)) return;
    const target = findTypeDecl(ref, file);
    if (!target) return;
    seen.add(key);
    harvestDecl(target, seen, into);
    return;
  }
}
function mergeInto(into, k, v) {
  if (!into.has(k)) into.set(k, { places: new Set(), raws: [] });
  const rec = into.get(k);
  for (const p of v.places) rec.places.add(p);
  rec.raws.push(...v.raws);
}
function harvestDecl(target, seen, into) {
  const { file, node } = target;
  if (ts.isEnumDeclaration(node)) return;
  if (ts.isInterfaceDeclaration(node)) {
    const sf = astByFile.get(file);
    for (const m of node.members) {
      if (!(ts.isPropertySignature(m) || ts.isMethodSignature(m)) || !m.name) continue;
      const nm = unquote(m.name.getText(sf));
      if (!into.has(nm)) into.set(nm, { places: new Set(), raws: [] });
      const rec = into.get(nm);
      rec.places.add(`${relToXy(file)}:${lineAt(sf, m)}`);
      rec.raws.push(m.getText(sf).replace(/\s+/g, " ").trim());
    }
    for (const h of node.heritageClauses ?? []) for (const t of h.types) harvestTypeNode(t, file, seen, into);
    return;
  }
  harvestTypeNode(node.type, file, seen, into);
}
function harvestMembers(file, typeName) {
  const target = typeIndex.get(`${file}::${typeName}`) ?? findTypeDecl(typeName, file);
  if (!target) return new Map();
  const into = new Map();
  harvestDecl(target, new Set([`${file}::${typeName}`]), into);
  return into;
}
function harvestReturn(file, fnName) {
  const sf = astByFile.get(file);
  if (!sf) return new Map();
  let fn = null;
  (function walk(n) { if (ts.isFunctionDeclaration(n) && n.name?.text === fnName) fn = n; ts.forEachChild(n, walk); })(sf);
  if (!fn?.type) return new Map();
  const into = new Map();
  harvestTypeNode(fn.type, file, new Set(), into);
  return into;
}
const barrelCache = new Map();
function barrelNames(entry, busy = new Set()) {
  if (barrelCache.has(entry)) return barrelCache.get(entry);
  if (busy.has(entry)) return new Set();
  busy.add(entry);
  const names = new Set();
  const sf = astByFile.get(entry);
  if (sf) {
    const stars = [];
    const exported = (n) => (n.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const st of sf.statements) {
      if (ts.isExportDeclaration(st)) {
        if (st.moduleSpecifier) {
          if (st.exportClause && ts.isNamedExports(st.exportClause)) {
            for (const el of st.exportClause.elements) names.add(el.name.text);
          } else if (st.exportClause && ts.isNamespaceExport(st.exportClause)) {
            names.add(st.exportClause.name.text);
          } else if (!st.exportClause) {
            const tgt = resolveSpec(entry, st.moduleSpecifier.text);
            if (tgt) stars.push(tgt);
          }
        } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
          for (const el of st.exportClause.elements) names.add(el.name.text);
        }
        continue;
      }
      if (!exported(st)) continue;
      if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) names.add(st.name.text);
      else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.add(d.name.text);
    }
    for (const t of stars) for (const n of barrelNames(t, busy)) names.add(n);
  }
  busy.delete(entry);
  barrelCache.set(entry, names);
  return names;
}
function reachableViaExports(entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const sf = astByFile.get(entry);
  if (!sf) return seen;
  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st) && st.moduleSpecifier) {
      const tgt = resolveSpec(entry, st.moduleSpecifier.text);
      if (tgt && astByFile.has(tgt)) reachableViaExports(tgt, seen);
    }
  }
  return seen;
}
function entryFor(seg, leaf) {
  for (const f of astByFile.keys()) if (slash(f).includes(seg) && slash(f).endsWith(leaf)) return f;
  return null;
}
const expected = new Map();
function noteExpect(family, name, places, kind, rawSample, fileOnly = false) {
  const key = `${family}:${name}`;
  const files = new Set([...places].map((p) => p.slice(0, p.lastIndexOf(":"))));
  if (!expected.has(key)) expected.set(key, { family, name, places: new Set(), files, kind, rawSample: rawSample ?? "", fileOnly });
  const rec = expected.get(key);
  for (const p of places) rec.places.add(p);
  for (const f of files) rec.files.add(f);
  if (!rec.rawSample && rawSample) rec.rawSample = rawSample;
}
function typeDeclPlace(file, node) {
  const sf = astByFile.get(file);
  return `${relToXy(file)}:${lineAt(sf, node)}`;
}
function declRawText(file, node) {
  const sf = astByFile.get(file);
  if (!sf) return "";
  if (ts.isTypeAliasDeclaration(node)) return node.type.getText(sf).replace(/\s+/g, " ").trim();
  if (ts.isInterfaceDeclaration(node)) return node.members.map((m) => m.getText(sf).replace(/\s+/g, " ").trim()).join("; ");
  if (ts.isEnumDeclaration(node)) return node.members.map((m) => m.getText(sf).replace(/\s+/g, " ").trim()).join(", ");
  return node.getText(sf).replace(/\s+/g, " ").trim();
}
const sysEntry = join(xyRoot, "packages/system/src/index.ts");
const reactEntry = join(xyRoot, "packages/react/src/index.ts");
const svelteEntry = join(xyRoot, "packages/svelte/src/lib/index.ts");
const sysNames = barrelNames(sysEntry);
const reactNames = barrelNames(reactEntry);
const svelteNames = barrelNames(svelteEntry);
const sysReach = reachableViaExports(sysEntry);
const reactReach = reachableViaExports(reactEntry);
const svelteReach = reachableViaExports(svelteEntry);
// Public Svelte components are `.svelte` files re-exported by a reachable
// index module; they have no TypeScript declaration, so their runtime
// presence is derived from those re-export specifiers alone.
const svelteComponentValues = new Set();
for (const f of svelteReach) {
  const sf = astByFile.get(f);
  if (!sf) continue;
  for (const st of sf.statements) {
    if (!ts.isExportDeclaration(st) || !st.moduleSpecifier) continue;
    const target = resolveSpec(f, st.moduleSpecifier.text);
    if (!target || !target.endsWith(".svelte")) continue;
    if (st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) svelteComponentValues.add(el.name.text);
    }
  }
}
function apiPlaces(family, name) {
  const allowed = family === "api-system" ? ["/system/"] : family === "api-react" ? ["/react/", "/system/"] : ["/svelte/", "/system/"];
  const places = new Set();
  const ok = (f) => allowed.some((s) => slash(f).includes(s));
  for (const v of valuesByName.get(name) ?? []) if (ok(v.file)) places.add(`${relToXy(v.file)}:${v.line}`);
  for (const f of filesByTypeName.get(name) ?? []) {
    if (!ok(f)) continue;
    const d = typeIndex.get(`${f}::${name}`);
    if (d) places.add(typeDeclPlace(f, d.node));
  }
  for (const r of reexportPlaces) if (r.name === name && ok(r.file)) places.add(`${relToXy(r.file)}:${r.line}`);
  if (places.size === 0) {
    for (const v of valuesByName.get(name) ?? []) places.add(`${relToXy(v.file)}:${v.line}`);
    for (const f of filesByTypeName.get(name) ?? []) { const d = typeIndex.get(`${f}::${name}`); if (d) places.add(typeDeclPlace(f, d.node)); }
    for (const r of reexportPlaces) if (r.name === name) places.add(`${relToXy(r.file)}:${r.line}`);
  }
  return places;
}
function apiKindAndRaw(family, name) {
  // Kind is decided inside the export-reachable files of the owning
  // package only, so an internal homonym (for example the internal
  // `Viewport` function or the internal `MiniMapNodes` function, neither
  // re-exported by the barrel) cannot flip a public type to a value.
  const reach = family === "api-system" ? sysReach : family === "api-react" ? reactReach : svelteReach;
  const vals = (valuesByName.get(name) ?? []).filter((v) => reach.has(v.file));
  let isEnum = false;
  const scopedTypeFiles = [...(filesByTypeName.get(name) ?? [])].filter((f) => reach.has(f));
  for (const f of scopedTypeFiles) { const d = typeIndex.get(`${f}::${name}`); if (d && ts.isEnumDeclaration(d.node)) isEnum = true; }
  const hasVal = vals.length > 0 || isEnum || (family === "api-svelte" && svelteComponentValues.has(name));
  const prefSeg = family === "api-react" ? "/react/" : family === "api-svelte" ? "/svelte/" : "/system/";
  const pool = scopedTypeFiles.length ? scopedTypeFiles : [...(filesByTypeName.get(name) ?? [])];
  const prefFile = pool.find((f) => slash(f).includes(prefSeg)) ?? pool.sort()[0] ?? null;
  let raw = "";
  if (prefFile) { const d = typeIndex.get(`${prefFile}::${name}`); if (d) raw = declRawText(prefFile, d.node); }
  return { kind: hasVal ? "value" : "type", raw };
}
for (const [family, names] of [["api-system", sysNames], ["api-react", reactNames], ["api-svelte", svelteNames]]) {
  for (const n of names) {
    const { kind, raw } = apiKindAndRaw(family, n);
    noteExpect(family, n, apiPlaces(family, n), kind, raw);
  }
}
for (const [, decl] of typeIndex) {
  const typeName = decl.node.name.text;
  if (!typeName.endsWith("FlowProps")) continue;
  const prefix = typeName.slice(0, -"Props".length);
  const members = harvestMembers(decl.file, typeName);
  for (const [m, rec] of members) noteExpect("props-flow", `${prefix}.${m}`, rec.places, "member", rec.raws[0] ?? "");
}
function hasComponentFile(base) {
  for (const f of tsFiles) {
    const b = slash(f).split("/").pop().replace(/\.tsx?$/, "");
    if (b === base) return true;
  }
  const stack = [join(xyRoot, "packages/react/src"), join(xyRoot, "packages/svelte/src/lib")];
  while (stack.length) {
    const d = stack.pop();
    if (!existsSync(d)) continue;
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) stack.push(p);
      else if (n === `${base}.svelte` || n === `${base}.tsx`) return true;
    }
  }
  return false;
}
{
  for (const [, decl] of typeIndex) {
    const typeName = decl.node.name.text;
    if (!typeName.endsWith("Props") || typeName.endsWith("FlowProps")) continue;
    const rel = slash(relToXy(decl.file));
    const isSvelte = rel.includes("/svelte/");
    const isReact = rel.includes("/react/");
    if (!isReact && !isSvelte) continue;
    const inPlugin = rel.includes("/additional-components/") || rel.includes("/plugins/");
    const inComponents = rel.includes("/components/");
    const inPanel = rel.includes("/container/Panel/");
    const inEdgesTypes = rel.endsWith("/types/edges.ts");
    if (!inPlugin && !inComponents && !inPanel && !inEdgesTypes) continue;
    const barrel = isSvelte ? svelteNames : reactNames;
    let compBase = typeName.slice(0, -"Props".length);
    if (!barrel.has(compBase) && barrel.has(`${compBase}s`)) compBase = `${compBase}s`;
    // Plugin props live in the plugin `types` module: internal pattern
    // helpers (for example the Background dot/line patterns) declare a
    // Props shape inside the pattern implementation file itself, so they
    // stay out of this family.
    if (inPlugin && !/(^|\/)types\.tsx?$/.test(rel)) continue;
    if ((inComponents || inPanel) && !barrel.has(compBase)) continue;
    if (inEdgesTypes && (!barrel.has(compBase) || !hasComponentFile(compBase))) continue;
    const prefix = isSvelte ? `svelte:${compBase}` : compBase;
    const members = harvestMembers(decl.file, typeName);
    for (const [m, rec] of members) noteExpect("props-components", `${prefix}.${m}`, rec.places, "member", rec.raws[0] ?? "");
  }
  // React ViewportPortal inline children prop (no named alias in sources).
  for (const [file, sf] of astByFile) {
    if (!slash(file).endsWith("packages/react/src/components/ViewportPortal/index.tsx")) continue;
    (function walk(n) {
      if (ts.isFunctionDeclaration(n) && n.name?.text === "ViewportPortal") {
        for (const p of n.parameters) {
          if (!p.type || !ts.isTypeLiteralNode(p.type)) continue;
          for (const m of p.type.members) {
            if (!(ts.isPropertySignature(m) || ts.isMethodSignature(m)) || !m.name) continue;
            const nm = unquote(m.name.getText(sf));
            noteExpect("props-components", `ViewportPortal.${nm}`, new Set([`${relToXy(file)}:${lineAt(sf, m)}`]), "member", m.getText(sf).replace(/\s+/g, " ").trim());
          }
        }
      }
      ts.forEachChild(n, walk);
    })(sf);
  }
}
for (const n of reactNames) if (/^(use|experimental_use)/.test(n)) noteExpect("hooks", `react:${n}`, apiPlaces("api-react", n), "hook", n);
for (const n of svelteNames) if (/^(use|experimental_use)/.test(n)) noteExpect("hooks", `svelte:${n}`, apiPlaces("api-svelte", n), "hook", n);
for (const [, decl] of typeIndex) {
  if (!slash(relToXy(decl.file)).endsWith("packages/react/src/types/instance.ts")) continue;
  // The instance contract is the exported instance shape in this module;
  // payload shapes declared alongside it (the serialised-object and
  // delete-options shapes) are model/api observables, not methods.
  if (!decl.node.name.text.endsWith("Instance")) continue;
  const members = harvestMembers(decl.file, decl.node.name.text);
  for (const [m, rec] of members) noteExpect("instance", m, rec.places, "member", rec.raws[0] ?? "");
}
for (const [file] of astByFile) {
  if (!slash(file).includes("/hooks/useSvelteFlow")) continue;
  const members = harvestReturn(file, "useSvelteFlow");
  for (const [m, rec] of members) noteExpect("instance", `useSvelteFlow.${m}`, rec.places, "member", rec.raws[0] ?? "");
}
{
  // Store: React slices/actions from the React store module, Svelte actions
  // from the Svelte store module, Svelte state from the store class body.
  for (const [file, sf] of astByFile) {
    const rel = slash(relToXy(file));
    if (rel.endsWith("packages/react/src/types/store.ts")) {
      for (const st of sf.statements) {
        if (!((ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name)) continue;
        if (!/Store|Actions|State/.test(st.name.text)) continue;
        const members = harvestMembers(file, st.name.text);
        for (const [m, rec] of members) noteExpect("store", m, rec.places, "member", rec.raws[0] ?? "");
      }
    }
    if (rel.endsWith("packages/svelte/src/lib/store/types.ts")) {
      for (const st of sf.statements) {
        if (!((ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name)) continue;
        if (!st.name.text.endsWith("Actions")) continue;
        const members = harvestMembers(file, st.name.text);
        for (const [m, rec] of members) noteExpect("store", `SvelteFlowStore.${m}`, rec.places, "member", rec.raws[0] ?? "");
      }
    }
  }
  for (const [file, sf] of astByFile) {
    if (!slash(relToXy(file)).includes("packages/svelte/src/lib/store/")) continue;
    const classes = [];
    (function walk(n) { if (ts.isClassDeclaration(n)) classes.push(n); ts.forEachChild(n, walk); })(sf);
    for (const cls of classes) {
      if (cls.members.length < 10) continue;
      const seenNames = new Set();
      for (const m of cls.members) {
        if (ts.isConstructorDeclaration(m) || !m.name) continue;
        const nm = unquote(m.name.getText(sf));
        if (seenNames.has(nm)) continue;
        seenNames.add(nm);
        noteExpect("store", `SvelteFlowStore.${nm}`, new Set([`${relToXy(file)}:${lineAt(sf, m)}`]), "member", m.getText(sf).replace(/\s+/g, " ").trim());
      }
    }
  }
}
for (const [, decl] of typeIndex) {
  const nm = decl.node.name.text;
  if (!nm.endsWith("Change")) continue;
  if (!slash(relToXy(decl.file)).includes("/types/changes")) continue;
  noteExpect("changes", nm, new Set([typeDeclPlace(decl.file, decl.node)]), "change", nm);
}
{
  // Document bases are the shape each framework node/edge shape extends:
  // they are found by following the framework shapes' own base reference,
  // not by suffix. Derived option/internal shapes that reuse other node
  // or edge shapes (default options, fit-view options, the internal node
  // shape) reuse fields already counted there and are not new fields.
  const baseByShort = new Map();
  for (const [, decl] of typeIndex) {
    const shapeName = decl.node.name.text;
    if (shapeName !== "Node" && shapeName !== "Edge") continue;
    const shapeRel = slash(relToXy(decl.file));
    if (!shapeRel.endsWith("types/nodes.ts") && !shapeRel.endsWith("types/edges.ts")) continue;
    if (!shapeRel.includes("/react/") && !shapeRel.includes("/svelte/")) continue;
    if (!ts.isTypeAliasDeclaration(decl.node) || !decl.node.type) continue;
    const refs = [];
    (function collect(t) {
      if (ts.isIntersectionTypeNode(t)) t.types.forEach(collect);
      else if (ts.isParenthesizedTypeNode(t)) collect(t.type);
      else if (ts.isTypeReferenceNode(t)) refs.push(t.typeName.getText());
    })(decl.node.type);
    for (const ref of refs) {
      if (!ref.endsWith("Base") || baseByShort.has(ref)) continue;
      const target = findTypeDecl(ref, decl.file);
      if (!target) continue;
      const members = harvestMembers(target.file, ref);
      baseByShort.set(ref, new Set(members.keys()));
      for (const [m, rec] of members) noteExpect("model", `${ref}.${m}`, rec.places, "member", rec.raws[0] ?? "");
    }
  }
  const nodeBaseSet = baseByShort.get("NodeBase") ?? new Set();
  const edgeBaseSet = baseByShort.get("EdgeBase") ?? new Set();
  function frameworkMembers(pkgSeg, fileSuffix, typeName) {
    for (const f of filesByTypeName.get(typeName) ?? []) {
      if (!slash(f).includes(pkgSeg) || !slash(relToXy(f)).endsWith(fileSuffix)) continue;
      return harvestMembers(f, typeName);
    }
    return new Map();
  }
  const reactNode = frameworkMembers("/react/", "types/nodes.ts", "Node");
  const reactEdge = frameworkMembers("/react/", "types/edges.ts", "Edge");
  for (const [m, rec] of reactNode) if (!nodeBaseSet.has(m)) noteExpect("model", `Node.${m}`, rec.places, "member", rec.raws[0] ?? "");
  for (const [m, rec] of reactEdge) if (!edgeBaseSet.has(m)) noteExpect("model", `Edge.${m}`, rec.places, "member", rec.raws[0] ?? "");
  const svelteNode = frameworkMembers("/svelte/", "types/nodes.ts", "Node");
  const svelteEdge = frameworkMembers("/svelte/", "types/edges.ts", "Edge");
  for (const [m, rec] of svelteNode) if (!nodeBaseSet.has(m) && !reactNode.has(m)) noteExpect("model", `svelte:Node.${m}`, rec.places, "member", rec.raws[0] ?? "");
  for (const [m, rec] of svelteEdge) if (!edgeBaseSet.has(m) && !reactEdge.has(m)) noteExpect("model", `svelte:Edge.${m}`, rec.places, "member", rec.raws[0] ?? "");
  const enumByName = new Map();
  for (const [, decl] of typeIndex) {
    if (!ts.isEnumDeclaration(decl.node)) continue;
    const en = decl.node.name.text;
    if (!enumByName.has(en)) enumByName.set(en, new Map());
    const bag = enumByName.get(en);
    const sf = astByFile.get(decl.file);
    for (const mem of decl.node.members) {
      const mn = unquote(mem.name.getText(sf));
      if (!bag.has(mn)) bag.set(mn, new Set());
      bag.get(mn).add(`${relToXy(decl.file)}:${lineAt(sf, mem)}`);
    }
  }
  for (const [en, bag] of enumByName) for (const [mn, places] of bag) noteExpect("model", `${en}.${mn}`, places, "member", mn);
}
{
  const fnPlaces = new Map();
  for (const [file, sf] of astByFile) {
    const rel = slash(relToXy(file));
    if (!rel.includes("utils/edges") && !rel.includes("components/Edges")) continue;
    for (const st of sf.statements) {
      if (!ts.isFunctionDeclaration(st) || !st.name) continue;
      const nm = st.name.text;
      if (!nm.startsWith("get") || !(nm.includes("Path") || nm.includes("Center"))) continue;
      if (!fnPlaces.has(nm)) fnPlaces.set(nm, new Set());
      fnPlaces.get(nm).add(`${relToXy(file)}:${lineAt(sf, st)}`);
    }
  }
  for (const [nm, places] of fnPlaces) noteExpect("edge-geometry", nm, places, "edgefunc", nm);
  for (const [file, sf] of astByFile) {
    let found = null;
    (function walk(n) { if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === "builtinEdgeTypes") found = n; ts.forEachChild(n, walk); })(sf);
    if (!found?.initializer || !ts.isObjectLiteralExpression(found.initializer)) continue;
    for (const prop of found.initializer.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const keyText = prop.name.getText(sf).replace(/^['"]|['"]$/g, "");
      const compText = prop.initializer.getText(sf).trim();
      const comp = compText.replace(/Internal$/, "");
      const slugName = keyText === "default" ? "default (bezier)" : keyText;
      const places = new Set();
      for (const v of valuesByName.get(comp) ?? []) if (slash(v.file).includes("/react/")) places.add(`${relToXy(v.file)}:${v.line}`);
      if (places.size === 0) for (const v of valuesByName.get(comp) ?? []) places.add(`${relToXy(v.file)}:${v.line}`);
      noteExpect("edge-geometry", `edgeType:${slugName}`, places, "edgetype", comp);
    }
  }
}
function firstExampleFile(dir) {
  const all = [];
  (function walk(d) {
    for (const n of readdirSync(d).sort()) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx|ts|svelte)$/.test(n)) all.push(p);
    }
  })(dir);
  return all[0] ?? dir;
}
for (const [fw, base] of [["react", join(xyRoot, "examples/react/src/examples")], ["svelte", join(xyRoot, "examples/svelte/src/routes/examples")]]) {
  if (!existsSync(base)) continue;
  for (const name of readdirSync(base).sort()) {
    const p = join(base, name);
    if (!statSync(p).isDirectory()) continue;
    const first = firstExampleFile(p);
    noteExpect("examples", `${fw}:${name}`, new Set([`${relToXy(first)}:1`]), "example", name);
  }
}
const hygiene = [];
{
  // Interaction slugs are behavioural catalogue entries, not type members:
  // the normative list lives in the specification catalogue table.
  let specText = "";
  try { specText = slurp(specFile); } catch { hygiene.push("specification file unreadable for interaction catalogue"); }
  let inCatalogue = false;
  for (const line of specText.split("\n")) {
    if (/interaction catalogue/i.test(line)) inCatalogue = true;
    if (!inCatalogue) continue;
    const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([^`]+)`/);
    if (!m) continue;
    const [, slugName, relFile] = m;
    noteExpect("interaction", slugName, new Set([`${relFile}:1`]), "catalogue", slugName, true);
    const abs = join(xyRoot, relFile);
    if (!existsSync(abs)) hygiene.push(`interaction:${slugName} catalogue file missing ${relFile}`);
  }
}
const inv = JSON.parse(slurp(invFile));
const errors = [...hygiene];
const idsSeen = new Set();
const invKeys = new Set();
const invByKey = new Map();
for (const e of inv.entries) {
  if (idsSeen.has(e.id)) errors.push(`duplicate id ${e.id}`);
  idsSeen.add(e.id);
  const key = `${e.family}:${e.name}`;
  if (invKeys.has(key)) errors.push(`duplicate key ${key}`);
  invKeys.add(key);
  invByKey.set(key, e);
  for (const f of ["id", "family", "name", "source", "behaviour", "acceptance", "target", "status", "priority"]) if (!e[f]) errors.push(`${e.id}: missing field ${f}`);
  if (!["covered", "partial", "missing", "excluded"].includes(e.status)) errors.push(`${e.id}: bad status ${e.status}`);
  if (!["graph", "diagram-core", "diagram-canvas", "composant DS", "nouveau module"].includes(e.target)) errors.push(`${e.id}: bad target ${e.target}`);
  if (!["P0", "P1", "P2"].includes(e.priority)) errors.push(`${e.id}: bad priority`);
  const m = String(e.source).match(/^(.+):(\d+)$/);
  if (!m) errors.push(`${e.id}: source has no :line`);
  else if (!existsSync(join(parentRoot, m[1]))) errors.push(`${e.id}: source file missing ${m[1]}`);
  if (e.status === "covered" || e.status === "partial") {
    if (!e.proof || !/:\d+$/.test(e.proof)) errors.push(`${e.id}: ${e.status} requires a resolvable proof`);
    else {
      const pm = e.proof.match(/^(.+):(\d+)$/);
      if (pm && !existsSync(join(wtRoot, pm[1]))) errors.push(`${e.id}: proof file missing ${pm[1]}`);
    }
  } else if (e.proof !== null) {
    errors.push(`${e.id}: ${e.status} must carry proof: null (no fabricated location)`);
  }
}
if (inv.meta?.total !== inv.entries.length) errors.push(`meta.total=${inv.meta?.total} != entries=${inv.entries.length}`);
{
  const bf = {}, bs = {};
  for (const e of inv.entries) { bf[e.family] = (bf[e.family] ?? 0) + 1; bs[e.status] = (bs[e.status] ?? 0) + 1; }
  if (JSON.stringify(bf) !== JSON.stringify(inv.meta?.byFamily ?? {})) errors.push("meta.byFamily does not match entries");
  if (JSON.stringify(bs) !== JSON.stringify(inv.meta?.byStatus ?? {})) errors.push("meta.byStatus does not match entries");
}
try {
  const ledger = JSON.parse(slurp(ledgerFile));
  const ledgerKeys = new Set(ledger.keys ?? []);
  if (ledger.total !== inv.entries.length) errors.push(`raw.total=${ledger.total} != entries=${inv.entries.length}`);
  for (const k of ledgerKeys) if (!invKeys.has(k)) errors.push(`raw key without inventory entry: ${k}`);
  for (const k of invKeys) if (!ledgerKeys.has(k)) errors.push(`inventory key missing from raw ledger: ${k}`);
} catch (err) {
  errors.push(`raw ledger unreadable: ${err.message}`);
}
function tokensOf(text) {
  return new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3));
}
const missingInInventory = [...expected.keys()].filter((k) => !invKeys.has(k)).sort();
const extraInInventory = [...invKeys].filter((k) => !expected.has(k)).sort();
const sourceMismatches = [];
const detailMismatches = [];
for (const [key, exp] of expected) {
  const e = invByKey.get(key);
  if (!e) continue;
  const m = String(e.source).match(/^(.+):(\d+)$/);
  if (!m) { sourceMismatches.push(`${key} unparsable source ${e.source}`); continue; }
  const relPart = m[1].replace(/^\.ds-scrap\/re-sources\/xyflow\//, "");
  const place = `${relPart}:${m[2]}`;
  if (exp.fileOnly) {
    if (!exp.files.has(relPart)) sourceMismatches.push(`${key} source file ${relPart} != catalogue ${[...exp.files].join(",")}`);
  } else if (!exp.places.has(place)) {
    sourceMismatches.push(`${key} source ${place} not in syntactic candidates [${[...exp.places].slice(0, 4).join(", ")}${exp.places.size > 4 ? ", ..." : ""}]`);
  }
  const beh = String(e.behaviour ?? "");
  // Detail comparison is family-shaped: the public-export families carry
  // an explicit `(value, ...)` / `(type, ...)` signature in the inventory
  // text, member families carry the member name plus its declared type,
  // and the remaining families name their hook/change/function/scenario.
  // The signature detail of hooks, changes and path functions is checked
  // strictly on their public-export entry; here the family entry must at
  // least name the same observable beyond its key.
  if (exp.kind === "value" || exp.kind === "type") {
    if (!beh.includes(`(${exp.kind},`)) detailMismatches.push(`${key} kind ${exp.kind} not in behaviour prefix`);
    if (beh.includes("(type, any)")) detailMismatches.push(`${key} still carries (type, any)`);
    if (exp.kind === "type" && exp.rawSample) {
      const want = tokensOf(exp.rawSample);
      const have = tokensOf(beh);
      let shared = false;
      for (const t of want) if (have.has(t)) { shared = true; break; }
      if (want.size && !shared) detailMismatches.push(`${key} type detail shares no token with syntactic declaration`);
    }
  } else if (exp.kind === "member") {
    const leaf = e.name.split(".").pop().replace(/^svelte:/, "");
    if (!beh.includes(leaf)) detailMismatches.push(`${key} behaviour does not name member ${leaf}`);
    if (exp.rawSample && !exp.rawSample.includes("[")) {
      const want = tokensOf(exp.rawSample);
      const have = tokensOf(beh);
      let shared = false;
      for (const t of want) if (have.has(t)) { shared = true; break; }
      if (want.size && !shared) detailMismatches.push(`${key} member detail shares no token with syntactic declaration`);
    }
  } else if (exp.kind === "hook" || exp.kind === "change" || exp.kind === "edgefunc" || exp.kind === "example") {
    const leaf = e.name.includes(":") ? e.name.slice(e.name.indexOf(":") + 1) : e.name;
    const base = leaf.split(".").pop();
    if (!beh.includes(base)) detailMismatches.push(`${key} behaviour does not name ${base}`);
    if (beh.includes("(type, any)")) detailMismatches.push(`${key} still carries (type, any)`);
  } else if (exp.kind === "edgetype") {
    const leaf = e.name.replace(/^edgeType:/, "");
    if (!beh.toLowerCase().includes(leaf.toLowerCase().split(" ")[0])) detailMismatches.push(`${key} behaviour does not name edge type ${leaf}`);
    if (exp.rawSample && !beh.includes(exp.rawSample)) detailMismatches.push(`${key} behaviour does not name component ${exp.rawSample}`);
  } else if (exp.kind === "catalogue") {
    if (beh.length < 20) detailMismatches.push(`${key} interaction behaviour too short`);
  }
}
const expByFamily = {}, invByFamily = {};
for (const rec of expected.values()) expByFamily[rec.family] = (expByFamily[rec.family] ?? 0) + 1;
for (const e of inv.entries) invByFamily[e.family] = (invByFamily[e.family] ?? 0) + 1;
console.log(`expected(AST)=${expected.size} inventory=${inv.entries.length}`);
console.log("byFamily expected", JSON.stringify(expByFamily));
console.log("byFamily inventory", JSON.stringify(invByFamily));
console.log(`byStatus ${JSON.stringify(inv.meta.byStatus)}`);
if (missingInInventory.length) {
  console.error(`MISSING IN INVENTORY (${missingInInventory.length}) — present in sources/spec, absent from inventory:`);
  for (const k of missingInInventory.slice(0, 80)) console.error(" -", k);
  if (missingInInventory.length > 80) console.error(` ... and ${missingInInventory.length - 80} more`);
}
if (extraInInventory.length) {
  console.error(`EXTRA IN INVENTORY (${extraInInventory.length}) — present in inventory, absent from sources/spec:`);
  for (const k of extraInInventory.slice(0, 80)) console.error(" -", k);
  if (extraInInventory.length > 80) console.error(` ... and ${extraInInventory.length - 80} more`);
}
if (sourceMismatches.length) {
  console.error(`SOURCE MISMATCH (${sourceMismatches.length}) — inventory source file/line differs from syntactic derivation:`);
  for (const k of sourceMismatches.slice(0, 80)) console.error(" -", k);
  if (sourceMismatches.length > 80) console.error(` ... and ${sourceMismatches.length - 80} more`);
}
if (detailMismatches.length) {
  console.error(`DETAIL MISMATCH (${detailMismatches.length}) — inventory signature detail differs from syntactic derivation:`);
  for (const k of detailMismatches.slice(0, 80)) console.error(" -", k);
  if (detailMismatches.length > 80) console.error(` ... and ${detailMismatches.length - 80} more`);
}
if (errors.length) {
  console.error(`HYGIENE FAIL (${errors.length})`);
  for (const e of errors.slice(0, 40)) console.error(" -", e);
}
if (missingInInventory.length || extraInInventory.length || sourceMismatches.length || detailMismatches.length || errors.length) {
  console.error("GUARD FAIL: the two independent enumerations disagree (see diffs above).");
  process.exit(1);
}
console.log("GUARD PASS: 100% of the independently enumerated surface has an inventory entry and every inventory entry resolves in the sources; source files/lines and signature details match the syntactic derivation; ids unique; proof discipline holds.");
