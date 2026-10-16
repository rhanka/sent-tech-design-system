#!/usr/bin/env node
/**
 * Completeness guard (second, independent extractor).
 *
 * This file shares no code with enumerate.mjs. enumerate.mjs derives the
 * inventory semantically (ts.createProgram + TypeChecker); this guard
 * re-derives the expected surface syntactically (ts.createSourceFile AST
 * walk: export graph, type-literal/intersection/Pick/Omit expansion,
 * enum members, directory walk) and compares the two enumerations in
 * both directions. Any element present on one side and absent on the
 * other fails the guard (exit 1) and is listed. "100 %" may only be
 * claimed when this guard passes.
 *
 * It also checks inventory hygiene: unique ids, closed vocabularies,
 * resolvable sources, and proof discipline (covered/partial require a
 * resolvable proof; missing/excluded must carry proof: null, never a
 * fabricated location).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const worktree = resolve(here, "../..");
const repoParent = resolve(worktree, "..");
const SOURCE = join(repoParent, ".ds-scrap/re-sources/xyflow");
const invPath = join(worktree, "docs/re/xyflow-inventory.json");
const rawPath = join(here, "raw-enumeration.json");

async function loadTypeScript() {
  for (const c of [join(worktree, "node_modules/typescript/lib/typescript.js"), join(repoParent, "node_modules/typescript/lib/typescript.js")]) {
    if (existsSync(c)) return (await import(pathToFileURL(c).href)).default;
  }
  console.error("typescript not found in node_modules");
  process.exit(2);
}
const ts = await loadTypeScript();
const read = (p) => readFileSync(p, "utf8");
const norm = (p) => p.split("\\").join("/");

/* ---------- syntactic parse of every xyflow TS source ---------- */
function collectFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collectFiles(p, out);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}
const allFiles = [
  ...collectFiles(join(SOURCE, "packages/system/src")),
  ...collectFiles(join(SOURCE, "packages/react/src")),
  ...collectFiles(join(SOURCE, "packages/svelte/src/lib")),
];
const parsed = new Map(); // absFile -> SourceFile
for (const f of allFiles) {
  const kind = f.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  parsed.set(f, ts.createSourceFile(f, read(f), ts.ScriptTarget.ESNext, true, kind));
}
function resolveModule(fromFile, spec) {
  let base = null;
  if (spec === "@xyflow/system") base = join(SOURCE, "packages/system/src/index.ts");
  else if (spec.startsWith("@xyflow/system/")) base = join(SOURCE, "packages/system/src", spec.slice("@xyflow/system/".length));
  else if (spec.startsWith("$lib/")) base = join(SOURCE, "packages/svelte/src/lib", spec.slice(5));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = resolve(dirname(fromFile), spec);
  else return null;
  const noJs = base.replace(/\.js$/, "");
  const cands = [
    base, `${base}.ts`, `${base}.tsx`, `${base}.svelte.ts`,
    `${noJs}.ts`, `${noJs}.tsx`, `${noJs}.svelte.ts`,
    join(base, "index.ts"), join(base, "index.tsx"),
    join(noJs, "index.ts"), join(noJs, "index.tsx"),
    `${base}.svelte`, `${noJs}.svelte`,
  ];
  for (const c of cands) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}
/* type declaration registry + per-file import maps */
const declRegistry = new Map(); // `${file}::${name}` -> {file, node}
const globalNames = new Map(); // name -> Set(file)
const importMaps = new Map(); // file -> Map(local -> {file, orig})
for (const [file, sf] of parsed) {
  const imports = new Map();
  importMaps.set(file, imports);
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings)) {
      const target = resolveModule(file, st.moduleSpecifier.text);
      if (!target) continue;
      for (const el of st.importClause.namedBindings.elements) {
        imports.set(el.name.text, { file: target, orig: (el.propertyName ?? el.name).text });
      }
    }
    const named = [];
    if ((ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) named.push(st);
    for (const d of named) {
      declRegistry.set(`${file}::${d.name.text}`, { file, node: d });
      if (!globalNames.has(d.name.text)) globalNames.set(d.name.text, new Set());
      globalNames.get(d.name.text).add(file);
    }
  }
}
function resolveTypeDecl(name, contextFile, depth = 0) {
  if (depth > 6) return null;
  const local = declRegistry.get(`${contextFile}::${name}`);
  if (local) return local;
  const imp = importMaps.get(contextFile)?.get(name);
  if (imp) {
    const direct = declRegistry.get(`${imp.file}::${imp.orig}`);
    if (direct) return direct;
    const deeper = resolveTypeDecl(imp.orig, imp.file, depth + 1);
    if (deeper) return deeper;
  }
  const files = globalNames.get(name);
  if (files && files.size === 1) {
    const f = [...files][0];
    return declRegistry.get(`${f}::${name}`) ?? null;
  }
  if (files && files.size > 1) {
    // Prefer a file in the same package subtree as the context file.
    const pkg = norm(contextFile).includes("/react/") ? "/react/" : norm(contextFile).includes("/svelte/") ? "/svelte/" : "/system/";
    for (const f of files) if (norm(f).includes(pkg)) return declRegistry.get(`${f}::${name}`) ?? null;
    const f = [...files].sort()[0];
    return declRegistry.get(`${f}::${name}`) ?? null;
  }
  return null;
}
/* ---------- export graph (syntactic) ---------- */
const exportsCache = new Map();
function fileExports(file, inProgress = new Set()) {
  if (exportsCache.has(file)) return exportsCache.get(file);
  if (inProgress.has(file)) return new Set();
  inProgress.add(file);
  const names = new Set();
  const sf = parsed.get(file);
  if (sf) {
    const stars = [];
    const hasExport = (n) => (n.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const st of sf.statements) {
      if (ts.isExportDeclaration(st)) {
        if (st.moduleSpecifier) {
          if (st.exportClause && ts.isNamedExports(st.exportClause)) {
            for (const el of st.exportClause.elements) names.add(el.name.text);
          } else if (st.exportClause && ts.isNamespaceExport(st.exportClause)) {
            names.add(st.exportClause.name.text);
          } else if (!st.exportClause) {
            const target = resolveModule(file, st.moduleSpecifier.text);
            if (target) stars.push(target);
          }
        } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
          for (const el of st.exportClause.elements) names.add(el.name.text);
        }
        continue;
      }
      if (!hasExport(st)) continue;
      if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st)) && st.name) names.add(st.name.text);
      else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.add(d.name.text);
    }
    for (const t of stars) for (const n of fileExports(t, inProgress)) names.add(n);
  }
  inProgress.delete(file);
  exportsCache.set(file, names);
  return names;
}
/* ---------- type member expansion (syntactic) ---------- */
function literalMemberNames(node) {
  const out = [];
  for (const m of node.members) {
    if ((ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name) out.push(m.name.getText().replace(/^['"]|['"]$/g, ""));
  }
  return out;
}
function stringLiteralSet(node) {
  const out = new Set();
  const eat = (n) => {
    if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) out.add(n.literal.text);
    else if (ts.isUnionTypeNode(n)) n.types.forEach(eat);
    else if (ts.isParenthesizedTypeNode(n)) eat(n.type);
  };
  eat(node);
  return out;
}
function expandNode(node, contextFile, seen) {
  if (!node) return new Set();
  if (ts.isTypeLiteralNode(node)) return new Set(literalMemberNames(node));
  if (ts.isParenthesizedTypeNode(node)) return expandNode(node.type, contextFile, seen);
  if (ts.isIntersectionTypeNode(node)) {
    const out = new Set();
    for (const t of node.types) for (const n of expandNode(t, contextFile, seen)) out.add(n);
    return out;
  }
  if (ts.isUnionTypeNode(node)) {
    const out = new Set();
    for (const t of node.types) if (ts.isTypeLiteralNode(t)) for (const n of literalMemberNames(t)) out.add(n);
    return out;
  }
  if (ts.isConditionalTypeNode(node)) {
    const out = expandNode(node.trueType, contextFile, seen);
    for (const n of expandNode(node.falseType, contextFile, seen)) out.add(n);
    return out;
  }
  if (ts.isTypeReferenceNode(node)) {
    const refName = node.typeName.getText();
    if (refName.includes(".")) return new Set();
    const args = node.typeArguments ?? [];
    if (["Pick", "Omit", "Partial", "Required", "Readonly"].includes(refName) && args.length >= 1) {
      const base = expandNode(args[0], contextFile, seen);
      if (refName === "Pick" && args[1]) { const keep = stringLiteralSet(args[1]); return new Set([...base].filter((x) => keep.has(x))); }
      if (refName === "Omit" && args[1]) { const drop = stringLiteralSet(args[1]); return new Set([...base].filter((x) => !drop.has(x))); }
      return base;
    }
    if (["Record", "Array", "Promise", "Map", "Set", "Iterable"].includes(refName)) return new Set();
    const key = `${contextFile}::${refName}`;
    if (seen.has(key)) return new Set();
    const target = resolveTypeDecl(refName, contextFile);
    if (!target) return new Set();
    seen.add(key);
    return expandDecl(target, seen);
  }
  return new Set();
}
function expandDecl(target, seen = new Set()) {
  const { file, node } = target;
  if (ts.isEnumDeclaration(node)) return new Set();
  if (ts.isInterfaceDeclaration(node)) {
    const out = new Set();
    for (const m of node.members) if ((ts.isPropertySignature(m) || ts.isMethodSignature(m)) && m.name) out.add(m.name.getText().replace(/^['"]|['"]$/g, ""));
    for (const h of node.heritageClauses ?? []) for (const t of h.types) {
      for (const n of expandNode(t, file, seen)) out.add(n);
    }
    return out;
  }
  return expandNode(node.type, file, seen);
}
function membersOf(file, typeName) {
  const target = declRegistry.get(`${file}::${typeName}`) ?? resolveTypeDecl(typeName, file);
  if (!target) return new Set();
  return expandDecl(target, new Set([`${file}::${typeName}`]));
}
function enumOf(file, enumName) {
  const target = declRegistry.get(`${file}::${enumName}`);
  if (!target || !ts.isEnumDeclaration(target.node)) return new Set();
  return new Set(target.node.members.map((m) => m.name.getText().replace(/^['"]|['"]$/g, "")));
}
function returnOf(file, fnName) {
  const sf = parsed.get(file);
  if (!sf) return new Set();
  let fn = null;
  (function visit(n) { if (ts.isFunctionDeclaration(n) && n.name?.text === fnName) fn = n; ts.forEachChild(n, visit); })(sf);
  if (!fn?.type) return new Set();
  return expandNode(fn.type, file, new Set());
}

/* ---------- expected surface (independent re-derivation) ---------- */
const J = (p) => join(SOURCE, p);
const expected = new Map(); // key -> family
const expect = (family, name) => expected.set(`${family}:${name}`, family);
const sysExports = fileExports(J("packages/system/src/index.ts"));
const reactExports = fileExports(J("packages/react/src/index.ts"));
const svelteExports = fileExports(J("packages/svelte/src/lib/index.ts"));
for (const n of sysExports) expect("api-system", n);
for (const n of reactExports) expect("api-react", n);
for (const n of svelteExports) expect("api-svelte", n);
for (const m of membersOf(J("packages/react/src/types/component-props.ts"), "ReactFlowProps")) expect("props-flow", `ReactFlow.${m}`);
for (const m of membersOf(J("packages/svelte/src/lib/container/SvelteFlow/types.ts"), "SvelteFlowProps")) expect("props-flow", `SvelteFlow.${m}`);
for (const t of ["NodeEvents", "EdgeEvents", "PaneEvents", "NodeSelectionEvents"]) {
  for (const m of membersOf(J("packages/svelte/src/lib/types/events.ts"), t)) expect("props-flow", `SvelteFlow.${m} (${t})`);
}
const COMP_SPECS = [
  ["Background", "packages/react/src/additional-components/Background/types.ts", "BackgroundProps"],
  ["Controls", "packages/react/src/additional-components/Controls/types.ts", "ControlProps"],
  ["ControlButton", "packages/react/src/additional-components/Controls/types.ts", "ControlButtonProps"],
  ["MiniMap", "packages/react/src/additional-components/MiniMap/types.ts", "MiniMapProps"],
  ["MiniMapNode", "packages/react/src/additional-components/MiniMap/types.ts", "MiniMapNodeProps"],
  ["NodeToolbar", "packages/react/src/additional-components/NodeToolbar/types.ts", "NodeToolbarProps"],
  ["NodeResizer", "packages/react/src/additional-components/NodeResizer/types.ts", "NodeResizerProps"],
  ["ResizeControl", "packages/react/src/additional-components/NodeResizer/types.ts", "ResizeControlProps"],
  ["ResizeControlLine", "packages/react/src/additional-components/NodeResizer/types.ts", "ResizeControlLineProps"],
  ["EdgeToolbar", "packages/react/src/additional-components/EdgeToolbar/types.ts", "EdgeToolbarProps"],
  ["Panel", "packages/react/src/components/Panel/index.tsx", "PanelProps"],
  ["Handle", "packages/react/src/components/Handle/index.tsx", "HandleProps"],
  ["BaseEdge", "packages/react/src/types/edges.ts", "BaseEdgeProps"],
  ["EdgeText", "packages/react/src/types/edges.ts", "EdgeTextProps"],
  ["svelte:Controls", "packages/svelte/src/lib/plugins/Controls/types.ts", "ControlsProps"],
  ["svelte:ControlButton", "packages/svelte/src/lib/plugins/Controls/types.ts", "ControlButtonProps"],
  ["svelte:Background", "packages/svelte/src/lib/plugins/Background/types.ts", "BackgroundProps"],
  ["svelte:MiniMap", "packages/svelte/src/lib/plugins/Minimap/types.ts", "MiniMapProps"],
  ["svelte:MiniMapNode", "packages/svelte/src/lib/plugins/Minimap/types.ts", "MiniMapNodeProps"],
  ["svelte:NodeToolbar", "packages/svelte/src/lib/plugins/NodeToolbar/types.ts", "NodeToolbarProps"],
  ["svelte:EdgeToolbar", "packages/svelte/src/lib/plugins/EdgeToolbar/types.ts", "EdgeToolbarProps"],
  ["svelte:NodeResizer", "packages/svelte/src/lib/plugins/NodeResizer/types.ts", "NodeResizerProps"],
  ["svelte:ResizeControl", "packages/svelte/src/lib/plugins/NodeResizer/types.ts", "ResizeControlProps"],
  ["svelte:EdgeLabel", "packages/svelte/src/lib/components/EdgeLabel/types.ts", "EdgeLabelProps"],
  ["svelte:EdgeReconnectAnchor", "packages/svelte/src/lib/components/EdgeReconnectAnchor/types.ts", "EdgeReconnectAnchorProps"],
  ["svelte:Handle", "packages/svelte/src/lib/components/Handle/types.ts", "HandleProps"],
  ["svelte:ViewportPortal", "packages/svelte/src/lib/components/ViewportPortal/types.ts", "ViewportPortalProps"],
];
for (const [comp, relFile, typeName] of COMP_SPECS) {
  for (const m of membersOf(J(relFile), typeName)) expect("props-components", `${comp}.${m}`);
}
for (const n of reactExports) if (/^(use|experimental_use)/.test(n)) expect("hooks", `react:${n}`);
for (const n of svelteExports) if (/^(use|experimental_use)/.test(n)) expect("hooks", `svelte:${n}`);
for (const m of membersOf(J("packages/react/src/types/instance.ts"), "ReactFlowInstance")) expect("instance", m);
for (const m of returnOf(J("packages/svelte/src/lib/hooks/useSvelteFlow.svelte.ts"), "useSvelteFlow")) expect("instance", `useSvelteFlow.${m}`);
for (const t of ["ReactFlowStore", "ReactFlowActions"]) {
  for (const m of membersOf(J("packages/react/src/types/store.ts"), t)) expect("store", m);
}
for (const m of membersOf(J("packages/svelte/src/lib/store/types.ts"), "SvelteFlowStoreActions")) expect("store", `SvelteFlowStore.${m}`);
const CHANGE_TYPES = ["NodeDimensionChange", "NodePositionChange", "NodeSelectionChange", "NodeRemoveChange", "NodeAddChange", "NodeReplaceChange", "EdgeSelectionChange", "EdgeRemoveChange", "EdgeAddChange", "EdgeReplaceChange", "NodeChange", "EdgeChange"];
const hygiene = [];
for (const n of CHANGE_TYPES) {
  expect("changes", n);
  if (!sysExports.has(n)) hygiene.push(`changes:${n} is not exported by @xyflow/system`);
}
for (const m of membersOf(J("packages/system/src/types/nodes.ts"), "NodeBase")) expect("model", `NodeBase.${m}`);
for (const m of membersOf(J("packages/system/src/types/edges.ts"), "EdgeBase")) expect("model", `EdgeBase.${m}`);
{
  const baseN = membersOf(J("packages/system/src/types/nodes.ts"), "NodeBase");
  for (const m of membersOf(J("packages/react/src/types/nodes.ts"), "Node")) if (!baseN.has(m)) expect("model", `Node.${m}`);
  const baseE = membersOf(J("packages/system/src/types/edges.ts"), "EdgeBase");
  for (const m of membersOf(J("packages/react/src/types/edges.ts"), "Edge")) if (!baseE.has(m)) expect("model", `Edge.${m}`);
}
for (const [relFile, en] of [
  ["packages/system/src/types/general.ts", "ConnectionMode"],
  ["packages/system/src/types/general.ts", "PanOnScrollMode"],
  ["packages/system/src/types/general.ts", "SelectionMode"],
  ["packages/system/src/types/utils.ts", "Position"],
  ["packages/system/src/types/edges.ts", "ConnectionLineType"],
  ["packages/system/src/types/edges.ts", "MarkerType"],
  ["packages/react/src/additional-components/Background/types.ts", "BackgroundVariant"],
  ["packages/system/src/xyresizer/types.ts", "ResizeControlVariant"],
]) {
  for (const m of enumOf(J(relFile), en)) expect("model", `${en}.${m}`);
}
{
  const fns = new Set();
  const hunt = [...collectFiles(J("packages/system/src/utils/edges")), ...collectFiles(J("packages/react/src/components/Edges"))];
  for (const f of hunt) {
    const sf = parsed.get(f) ?? ts.createSourceFile(f, read(f), ts.ScriptTarget.ESNext, true, f.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    for (const st of sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.name && /^get\w+(Path|Center)$/.test(st.name.text)) fns.add(st.name.text);
    }
  }
  for (const n of fns) expect("edge-geometry", n);
  for (const t of ["default (bezier)", "straight", "step", "smoothstep", "simplebezier"]) expect("edge-geometry", `edgeType:${t}`);
  for (const c of ["BezierEdge", "StraightEdge", "StepEdge", "SmoothStepEdge", "SimpleBezierEdge"]) {
    if (!reactExports.has(c)) hygiene.push(`edge-geometry: built-in component ${c} missing from @xyflow/react exports`);
  }
}
const INTERACTION_CATALOGUE = [
  ["pan-by-drag", "packages/system/src/xypanzoom/XYPanZoom.ts", "XYPanZoom"],
  ["pan-on-scroll", "packages/system/src/xypanzoom/eventhandler.ts", "panOnScroll"],
  ["zoom-on-scroll-and-pinch", "packages/system/src/xypanzoom/XYPanZoom.ts", "scaleTo"],
  ["zoom-on-double-click", "packages/system/src/xypanzoom/XYPanZoom.ts", "zoomOnDoubleClick"],
  ["node-drag", "packages/system/src/xydrag/XYDrag.ts", "XYDrag"],
  ["multi-node-drag", "packages/system/src/xydrag/XYDrag.ts", "getDragItems"],
  ["snap-to-grid", "packages/system/src/xydrag/utils.ts", "snap"],
  ["selection-rectangle", "packages/react/src/container/Pane/index.tsx", "selection"],
  ["multi-selection-keys", "packages/react/src/hooks/useGlobalKeyHandler.ts", "multiSelectionKey"],
  ["connection-drag", "packages/system/src/xyhandle/XYHandle.ts", "XYHandle"],
  ["click-to-connect", "packages/react/src/components/Handle/index.tsx", "clickConnecting"],
  ["connection-validation", "packages/system/src/xyhandle/utils.ts", "isValid"],
  ["edge-reconnect", "packages/react/src/components/EdgeWrapper/index.tsx", "reconnect"],
  ["node-resize", "packages/system/src/xyresizer/XYResizer.ts", "XYResizer"],
  ["parent-and-subflow", "packages/system/src/utils/graph.ts", "parent"],
  ["extent-clamping", "packages/system/src/utils/graph.ts", "extent"],
  ["auto-pan-on-drag", "packages/system/src/xydrag/XYDrag.ts", "autoPan"],
  ["keyboard-move-and-delete", "packages/react/src/hooks/useGlobalKeyHandler.ts", "deleteKey"],
  ["keyboard-focus-and-a11y", "packages/react/src/components/A11yDescriptions/index.tsx", "aria"],
  ["only-render-visible-elements", "packages/react/src/hooks/useVisibleNodeIds.ts", "visible"],
  ["minimap-pan-zoom", "packages/system/src/xyminimap/index.ts", "minimap"],
  ["controls-buttons", "packages/react/src/additional-components/Controls/Controls.tsx", "Controls"],
  ["fit-view-on-init", "packages/system/src/utils/graph.ts", "getViewportForBounds"],
  ["elevate-on-select-zindex", "packages/react/src/store/initialState.ts", "elevateNodesOnSelect"],
  ["color-mode", "packages/react/src/hooks/useColorModeClass.ts", "colorMode"],
  ["hidden-and-visibility", "packages/system/src/types/nodes.ts", "hidden"],
];
for (const [slugName, relFile, anchor] of INTERACTION_CATALOGUE) {
  expect("interaction", slugName);
  const p = J(relFile);
  if (!existsSync(p)) hygiene.push(`interaction:${slugName} anchor file missing ${relFile}`);
  else if (!read(p).toLowerCase().includes(anchor.toLowerCase())) hygiene.push(`interaction:${slugName} anchor "${anchor}" not found in ${relFile}`);
}
function exampleDirs(base) {
  if (!existsSync(base)) return [];
  const out = [];
  for (const name of readdirSync(base).sort()) if (statSync(join(base, name)).isDirectory()) out.push(name);
  return out;
}
for (const n of exampleDirs(J("examples/react/src/examples"))) expect("examples", `react:${n}`);
for (const n of exampleDirs(J("examples/svelte/src/routes/examples"))) expect("examples", `svelte:${n}`);

/* ---------- inventory hygiene ---------- */
const inv = JSON.parse(read(invPath));
const errors = [...hygiene];
const ids = new Set();
const invKeys = new Set();
for (const e of inv.entries) {
  if (ids.has(e.id)) errors.push(`duplicate id ${e.id}`);
  ids.add(e.id);
  const key = `${e.family}:${e.name}`;
  if (invKeys.has(key)) errors.push(`duplicate key ${key}`);
  invKeys.add(key);
  for (const f of ["id", "family", "name", "source", "behaviour", "acceptance", "target", "status", "priority"]) if (!e[f]) errors.push(`${e.id}: missing field ${f}`);
  if (!["covered", "partial", "missing", "excluded"].includes(e.status)) errors.push(`${e.id}: bad status ${e.status}`);
  if (!["graph", "diagram-core", "diagram-canvas", "composant DS", "nouveau module"].includes(e.target)) errors.push(`${e.id}: bad target ${e.target}`);
  if (!["P0", "P1", "P2"].includes(e.priority)) errors.push(`${e.id}: bad priority`);
  const m = String(e.source).match(/^(.+):(\d+)$/);
  if (!m) errors.push(`${e.id}: source has no :line`);
  else if (!existsSync(join(repoParent, m[1]))) errors.push(`${e.id}: source file missing ${m[1]}`);
  if (e.status === "covered" || e.status === "partial") {
    if (!e.proof || !/:\d+$/.test(e.proof)) errors.push(`${e.id}: ${e.status} requires a resolvable proof`);
    else {
      const pm = e.proof.match(/^(.+):(\d+)$/);
      if (pm && !existsSync(join(worktree, pm[1]))) errors.push(`${e.id}: proof file missing ${pm[1]}`);
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
  const raw = JSON.parse(read(rawPath));
  const rawKeys = new Set(raw.keys ?? []);
  if (raw.total !== inv.entries.length) errors.push(`raw.total=${raw.total} != entries=${inv.entries.length}`);
  for (const k of rawKeys) if (!invKeys.has(k)) errors.push(`raw key without inventory entry: ${k}`);
  for (const k of invKeys) if (!rawKeys.has(k)) errors.push(`inventory key missing from raw ledger: ${k}`);
} catch (err) {
  errors.push(`raw ledger unreadable: ${err.message}`);
}

/* ---------- two-enumeration comparison ---------- */
const missingInInventory = [...expected.keys()].filter((k) => !invKeys.has(k)).sort();
const extraInInventory = [...invKeys].filter((k) => !expected.has(k)).sort();
const expByFamily = {}, invByFamily = {};
for (const k of expected.keys()) { const f = expected.get(k); expByFamily[f] = (expByFamily[f] ?? 0) + 1; }
for (const e of inv.entries) invByFamily[e.family] = (invByFamily[e.family] ?? 0) + 1;
console.log(`expected(AST)=${expected.size} inventory=${inv.entries.length}`);
console.log("byFamily expected", JSON.stringify(expByFamily));
console.log("byFamily inventory", JSON.stringify(invByFamily));
console.log(`byStatus ${JSON.stringify(inv.meta.byStatus)}`);
if (missingInInventory.length) {
  console.error(`MISSING IN INVENTORY (${missingInInventory.length}) — present in sources, absent from inventory:`);
  for (const k of missingInInventory.slice(0, 80)) console.error(" -", k);
  if (missingInInventory.length > 80) console.error(` ... and ${missingInInventory.length - 80} more`);
}
if (extraInInventory.length) {
  console.error(`EXTRA IN INVENTORY (${extraInInventory.length}) — present in inventory, absent from sources:`);
  for (const k of extraInInventory.slice(0, 80)) console.error(" -", k);
  if (extraInInventory.length > 80) console.error(` ... and ${extraInInventory.length - 80} more`);
}
if (errors.length) {
  console.error(`HYGIENE FAIL (${errors.length})`);
  for (const e of errors.slice(0, 40)) console.error(" -", e);
}
if (missingInInventory.length || extraInInventory.length || errors.length) {
  console.error("GUARD FAIL: the two independent enumerations disagree (see diffs above).");
  process.exit(1);
}
console.log("GUARD PASS: 100% of the independently enumerated surface has an inventory entry and every inventory entry resolves in the sources; ids unique; sources resolve; proof discipline holds.");
