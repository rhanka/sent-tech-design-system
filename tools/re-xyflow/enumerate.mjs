#!/usr/bin/env node
/**
 * Mechanical enumeration of the xyflow public surface (primary extractor).
 *
 * Method: TypeScript compiler API (ts.createProgram + TypeChecker), loaded
 * from the repository `node_modules/typescript`. No regex parsing of the
 * source surface, no network, no third-party code copied: only names,
 * signatures and source locations are extracted. Behaviour text states the
 * observable contract (JSDoc + type shape), never the implementation.
 *
 * Usage:
 *   node tools/re-xyflow/enumerate.mjs [--source <xyflowRoot>] [--out <inventory.json>]
 * Defaults resolve from this file location:
 *   source = <repoParent>/.ds-scrap/re-sources/xyflow
 *   out    = <worktree>/docs/re/xyflow-inventory.json
 *   raw    = <worktree>/tools/re-xyflow/raw-enumeration.json
 *
 * The completeness guard is a SEPARATE extractor in verify.mjs (syntactic
 * AST walk, independently written). This file never imports it.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const worktree = resolve(here, "../..");
const repoParent = resolve(worktree, "..");
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : fallback;
}
const SOURCE = arg("--source", join(repoParent, ".ds-scrap/re-sources/xyflow"));
const OUT = arg("--out", join(worktree, "docs/re/xyflow-inventory.json"));
const RAW = join(here, "raw-enumeration.json");
if (!existsSync(join(SOURCE, "packages/system/src/index.ts"))) {
  console.error(`xyflow source not found at ${SOURCE}`);
  process.exit(2);
}

async function loadTypeScript() {
  const candidates = [
    join(worktree, "node_modules/typescript/lib/typescript.js"),
    join(repoParent, "node_modules/typescript/lib/typescript.js"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return (await import(pathToFileURL(c).href)).default;
  }
  console.error("typescript not found in node_modules (worktree or repo root)");
  process.exit(2);
}
const ts = await loadTypeScript();

const read = (p) => readFileSync(p, "utf8");
function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}
const rel = (p) => relative(SOURCE, p).split("\\").join("/");
const relWt = (p) => relative(worktree, p).split("\\").join("/");

/* ---------- TypeScript program (semantic extraction) ---------- */
const sysEntry = join(SOURCE, "packages/system/src/index.ts");
const reactEntry = join(SOURCE, "packages/react/src/index.ts");
const svelteEntry = join(SOURCE, "packages/svelte/src/lib/index.ts");
const EXTRA_ROOTS = [
  "packages/react/src/types/component-props.ts",
  "packages/react/src/types/store.ts",
  "packages/react/src/types/instance.ts",
  "packages/react/src/types/general.ts",
  "packages/react/src/types/nodes.ts",
  "packages/react/src/types/edges.ts",
  "packages/svelte/src/lib/container/SvelteFlow/types.ts",
  "packages/svelte/src/lib/hooks/useSvelteFlow.svelte.ts",
  "packages/svelte/src/lib/store/types.ts",
  "packages/svelte/src/lib/types/events.ts",
  "packages/svelte/src/lib/plugins/Controls/types.ts",
  "packages/svelte/src/lib/plugins/Background/types.ts",
  "packages/svelte/src/lib/plugins/Minimap/types.ts",
  "packages/svelte/src/lib/plugins/NodeToolbar/types.ts",
  "packages/svelte/src/lib/plugins/EdgeToolbar/types.ts",
  "packages/svelte/src/lib/plugins/NodeResizer/types.ts",
  "packages/svelte/src/lib/components/EdgeLabel/types.ts",
  "packages/svelte/src/lib/components/EdgeReconnectAnchor/types.ts",
  "packages/svelte/src/lib/components/Handle/types.ts",
  "packages/svelte/src/lib/components/ViewportPortal/types.ts",
  "packages/react/src/additional-components/Background/types.ts",
  "packages/react/src/additional-components/Controls/types.ts",
  "packages/react/src/additional-components/MiniMap/types.ts",
  "packages/react/src/additional-components/NodeToolbar/types.ts",
  "packages/react/src/additional-components/NodeResizer/types.ts",
  "packages/react/src/additional-components/EdgeToolbar/types.ts",
  "packages/react/src/components/Panel/index.tsx",
  "packages/react/src/components/Handle/index.tsx",
].map((p) => join(SOURCE, p));
const program = ts.createProgram([sysEntry, reactEntry, svelteEntry, ...EXTRA_ROOTS], {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowImportingTsExtensions: true,
  noEmit: true,
  skipLibCheck: true,
  jsx: ts.JsxEmit.Preserve,
  allowJs: true,
  esModuleInterop: true,
  baseUrl: SOURCE,
  paths: {
    "@xyflow/system": ["packages/system/src/index.ts"],
    "$lib/*": ["packages/svelte/src/lib/*"],
  },
});
const checker = program.getTypeChecker();
const srcPrefix = SOURCE.split("\\").join("/");

function moduleExports(entryFile) {
  const sf = program.getSourceFile(entryFile);
  if (!sf) throw new Error(`program has no source file ${entryFile}`);
  const sym = checker.getSymbolAtLocation(sf);
  if (!sym) throw new Error(`no module symbol for ${entryFile}`);
  return checker.getExportsOfModule(sym);
}
function findDecl(file, typeName) {
  const sf = program.getSourceFile(file);
  if (!sf) return null;
  let found = null;
  (function visit(n) {
    if ((ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n) || ts.isEnumDeclaration(n)) && n.name.text === typeName) found = n;
    ts.forEachChild(n, visit);
  })(sf);
  return found ? { sf, node: found } : null;
}
function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function defaultOf(decl) {
  try {
    for (const tag of ts.getJSDocTags(decl)) {
      if (tag.tagName.text === "default") {
        const c = tag.comment;
        const text = typeof c === "string" ? c : Array.isArray(c) ? c.map((x) => x.text ?? "").join("") : "";
        return text.trim() || null;
      }
    }
  } catch { /* JSDoc is best-effort */ }
  return null;
}
/** Members of a named object type, restricted to declarations inside the xyflow tree. */
function typeMembers(file, typeName) {
  const d = findDecl(file, typeName);
  if (!d || ts.isEnumDeclaration(d.node)) return [];
  const sym = checker.getSymbolAtLocation(d.node.name);
  if (!sym) return [];
  const type = checker.getDeclaredTypeOfSymbol(sym);
  const out = [];
  for (const prop of checker.getPropertiesOfType(type)) {
    const decls = (prop.getDeclarations() ?? []).filter((x) => x.getSourceFile().fileName.split("\\").join("/").startsWith(srcPrefix));
    if (!decls.length) continue;
    const decl = decls[0];
    const sf = decl.getSourceFile();
    let typeStr = "";
    try { typeStr = checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, decl)).replace(/\s+/g, " ").slice(0, 240); } catch { typeStr = ""; }
    const optional = decls.some((x) => (ts.isPropertySignature(x) || ts.isPropertyDeclaration(x)) && !!x.questionToken) || (prop.flags & ts.SymbolFlags.Optional) !== 0;
    out.push({ name: prop.getName(), optional, type: typeStr, file: sf.fileName, line: lineOf(sf, decl), def: defaultOf(decl) });
  }
  out.sort((a, b) => a.line - b.line || a.name.localeCompare(b.name));
  return out;
}
/** Return-type members of an exported function (useSvelteFlow). */
function returnMembers(file, fnName) {
  const sf = program.getSourceFile(file);
  if (!sf) return [];
  let fn = null;
  (function visit(n) {
    if (ts.isFunctionDeclaration(n) && n.name?.text === fnName) fn = n;
    ts.forEachChild(n, visit);
  })(sf);
  if (!fn) return [];
  const sig = checker.getSignatureFromDeclaration(fn);
  if (!sig) return [];
  const rt = checker.getReturnTypeOfSignature(sig);
  const out = [];
  for (const prop of checker.getPropertiesOfType(rt)) {
    const decls = (prop.getDeclarations() ?? []).filter((x) => x.getSourceFile().fileName.split("\\").join("/").startsWith(srcPrefix));
    if (!decls.length) continue;
    const decl = decls[0];
    const dsf = decl.getSourceFile();
    let typeStr = "";
    try { typeStr = checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, decl)).replace(/\s+/g, " ").slice(0, 240); } catch { typeStr = ""; }
    out.push({ name: prop.getName(), optional: false, type: typeStr, file: dsf.fileName, line: lineOf(dsf, decl), def: defaultOf(decl) });
  }
  out.sort((a, b) => a.line - b.line || a.name.localeCompare(b.name));
  return out;
}
function enumMembers(file, enumName) {
  const d = findDecl(file, enumName);
  if (!d || !ts.isEnumDeclaration(d.node)) return [];
  return d.node.members.map((m) => ({
    name: m.name.getText(d.sf),
    line: lineOf(d.sf, m),
  }));
}
function exportInfo(entryFile) {
  const map = new Map();
  for (const sym of moduleExports(entryFile)) {
    const name = sym.getName();
    if (name === "default") continue;
    const decls = (sym.getDeclarations() ?? []).filter((x) => x.getSourceFile().fileName.split("\\").join("/").startsWith(srcPrefix));
    const isReExport = (x) => ts.isExportSpecifier(x) || ts.isImportSpecifier(x) || ts.isBindingElement(x);
    let decl = decls.find((x) => !isReExport(x)) ?? decls[0] ?? (sym.getDeclarations() ?? [])[0];
    try {
      const aliased = checker.getAliasedSymbol(sym);
      const aDecls = (aliased.getDeclarations() ?? []).filter((x) => x.getSourceFile().fileName.split("\\").join("/").startsWith(srcPrefix));
      const aDecl = aDecls.find((x) => !isReExport(x));
      if (aDecl) decl = aDecl;
    } catch { /* not an alias */ }
    if (!decl) continue;
    const sf = decl.getSourceFile();
    const isValue = (sym.flags & (ts.SymbolFlags.Value)) !== 0;
    let typeStr = "";
    try { typeStr = checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, decl)).replace(/\s+/g, " ").slice(0, 200); } catch { typeStr = ""; }
    map.set(name, { file: sf.fileName, line: lineOf(sf, decl), kind: isValue ? "value" : "type", type: typeStr });
  }
  return map;
}

/* ---------- sentropic corpus (coverage evidence) ---------- */
const CORPUS_DIRS = ["packages/graph/src", "packages/diagram-core/src", "packages/diagram-canvas/src"];
const corpus = [];
for (const d of CORPUS_DIRS) {
  const abs = join(worktree, d);
  if (!existsSync(abs)) continue;
  for (const f of walk(abs, [".ts"])) corpus.push({ file: relWt(f), lines: read(f).split("\n") });
}
function proofIn(fileSuffix, needle) {
  const c = corpus.find((x) => x.file.endsWith(fileSuffix));
  if (!c) return null;
  const n = needle.toLowerCase();
  for (let i = 0; i < c.lines.length; i++) if (c.lines[i].toLowerCase().includes(n)) return `${c.file}:${i + 1}`;
  return null;
}
const P = {
  transform: () => proofIn("diagram-canvas/src/transform.ts", "export function worldToView") ?? "packages/diagram-canvas/src/transform.ts:178",
  visibleRect: () => proofIn("diagram-canvas/src/transform.ts", "export function visibleWorldRect") ?? "packages/diagram-canvas/src/transform.ts:205",
  commands: () => proofIn("diagram-core/src/commands.ts", "export function applyTransaction") ?? "packages/diagram-core/src/commands.ts:1",
  rectUnion: () => proofIn("diagram-canvas/src/geometry.ts", "export function rectUnion") ?? "packages/diagram-canvas/src/geometry.ts:64",
  rectsIntersect: () => proofIn("diagram-canvas/src/geometry.ts", "export function rectsIntersect") ?? "packages/diagram-canvas/src/geometry.ts:51",
  straight: () => proofIn("graph/src/edge-geometry.ts", "EdgeCurveMode") ?? "packages/graph/src/edge-geometry.ts:3",
  visibility: () => proofIn("diagram-canvas/src/visibility.ts", "export function evaluateVisibility") ?? "packages/diagram-canvas/src/visibility.ts:196",
  entity: () => proofIn("diagram-core/src/document.ts", "export interface Entity") ?? "packages/diagram-core/src/document.ts:28",
};
const D3_TYPES = new Set(["D3ZoomInstance", "D3SelectionInstance", "D3ZoomHandler"]);
function coverageFor(family, name) {
  const bare = name.replace(/^(ReactFlow|SvelteFlow|useSvelteFlow|SvelteFlowStore)\./, "").replace(/^svelte:/, "");
  const k = bare.toLowerCase().replace(/[^a-z0-9]/g, "");
  const part = (proof, note) => ({ status: "partial", proof, note });
  const miss = (note) => ({ status: "missing", proof: null, note });
  if (family === "api-system" && D3_TYPES.has(name)) {
    return { status: "excluded", proof: null, note: "D3-coupled type alias (d3-zoom/d3-selection). No D3 on the sentropic stack: the parity surface keeps the name as a documented exclusion; implementations expose no D3 instance. See SPEC annex." };
  }
  if (family === "store") return miss("Headless flow store does not exist yet; this slice/action belongs to the new flow-engine module (SPEC §target architecture).");
  if (family === "changes") return part(P.commands(), "diagram-core has transactional commands with inverses; the xyflow change-array protocol is an adapter still to build.");
  if (/pointtorendererpoint|rendererpointtopoint/.test(k)) return part(P.transform(), "diagram-canvas worldToView implements the affine core with the opposite camera convention (SPEC §camera conversion); the xyflow [tx,ty,zoom] API shape is still to build.");
  if (/applynodechanges|applyedgechanges/.test(k)) return part(P.commands(), "diagram-core has transactional commands with inverses; the xyflow change-array protocol is not implemented.");
  if (family === "model") {
    if (/^(nodebase|edgebase|node|edge)\.(id|type|data|source|target|sourcehandle|targethandle)$/.test(bare.toLowerCase())) {
      return part(P.entity(), "diagram-core Entity/Relation already carry identity, type and attributes/endpoints; the xyflow field semantics (handles, markers) are still to map.");
    }
    return miss("No flow-document field with this semantics in diagram-core/diagram-canvas yet; transient and geometry fields are specified on the view/store side, never on SemanticDocument (SPEC §model contract).");
  }
  if (/getnodesbounds|nodebounds/.test(k)) return part(P.rectUnion(), "diagram-canvas geometry provides rect algebra; the xyflow node-bounds API shape differs.");
  if (/getintersectingnodes|isnodeintersecting/.test(k)) return part(P.rectsIntersect(), "diagram-canvas geometry provides rect intersection; the xyflow intersecting-nodes API shape differs.");
  if (/getstraightpath/.test(k) || (family === "edge-geometry" && /straight/.test(k))) return part(P.straight(), "graph edge-geometry provides straight/arc polylines, not the xyflow SVG path contract.");
  if (family === "interaction" && /onlyrendervisibleelements|hiddenandvisibility/.test(k)) return part(P.visibility(), "diagram-canvas evaluateVisibility + scene culling exist; the xyflow onlyRenderVisibleElements/hidden wiring is still to build.");
  if (family === "interaction" && /fitviewoninit/.test(k)) return part(P.visibleRect(), "diagram-canvas visibleWorldRect + rect algebra exist; the fitView framing helper (padding, clamp, animation) is still to build.");
  if ((family === "instance" || family.startsWith("api-")) && /fitview|fitbounds|setcenter|zoomto|setzoom|zoomin|zoomout|getzoom|setviewport|getviewport|screentoflow|flowtoscreen/.test(k)) {
    return part(P.transform(), "diagram-canvas transform + graph camera state exist; no xyflow viewport-helper API (padding, duration, interpolation).");
  }
  if (family === "examples") return miss("No sentropic recipe implements this xyflow example scenario yet.");
  return miss("No equivalent found in graph/diagram-core/diagram-canvas corpus (mechanical search at generation time).");
}
function targetFor(family, name) {
  const bare = name.replace(/^(ReactFlow|SvelteFlow|useSvelteFlow|SvelteFlowStore)\./, "").replace(/^svelte:/, "");
  const k = bare.toLowerCase();
  if (family === "edge-geometry") return "graph";
  if (family === "changes") return "diagram-core";
  if (family === "store" || family === "hooks") return family === "store" ? "nouveau module" : "composant DS";
  if (family === "props-components") return "composant DS";
  if (family === "examples") return "composant DS";
  if (family === "interaction") {
    if (/only-render-visible-elements|hidden-and-visibility|fit-view-on-init/.test(name)) return "diagram-canvas";
    return "nouveau module";
  }
  if (family === "model") {
    if (/\.(id|data|type|source|target|sourceHandle|targetHandle)$/.test(bare)) return "diagram-core";
    if (/\.(position|width|height|initialWidth|initialHeight)$/.test(bare)) return "diagram-canvas";
    if (/^(ConnectionLineType|MarkerType)\./.test(bare)) return "graph";
    return "nouveau module";
  }
  if (family === "instance") {
    if (/^(zoomIn|zoomOut|zoomTo|setZoom|getZoom|setViewport|getViewport|setCenter|fitBounds|fitView|screenToFlowPosition|flowToScreenPosition|viewportInitialized|getNodesBounds|getIntersectingNodes|isNodeIntersecting)$/.test(bare)) return "diagram-canvas";
    return "nouveau module";
  }
  if (family === "props-flow") {
    if (/\.(snapToGrid|snapGrid|nodeOrigin|connectionRadius|connectionMode|connectionLineType|onlyRenderVisibleElements|autoPanOnConnect|autoPanOnNodeDrag|autoPanOnSelection|autoPanSpeed|minZoom|maxZoom|translateExtent|nodeExtent|defaultViewport|initialViewport|viewport|fitView|fitViewOptions)$/.test(name)) return "nouveau module";
    return "composant DS";
  }
  if (family.startsWith("api-")) {
    if (family === "api-system" && name === "Handle") return "nouveau module";
    if (/^(use|experimental_use)/.test(name)) return "composant DS";
    if (/^(ReactFlow|SvelteFlow|Background|Controls|ControlButton|MiniMap|MiniMapNode|Panel|Handle|NodeToolbar|NodeResizer|NodeResizeControl|EdgeToolbar|EdgeLabelRenderer|EdgeLabel|EdgeReconnectAnchor|ViewportPortal|ReactFlowProvider|SvelteFlowProvider|BezierEdge|StepEdge|SmoothStepEdge|StraightEdge|SimpleBezierEdge|BaseEdge|EdgeText|Attribution)$/.test(name)) return "composant DS";
    if (/getbezier|getsmoothstep|getstraight|getsimplebezier|getedgecenter|getbezieredgecenter|marker|connectionline|bezierpathoptions|smoothsteppathoptions|steppathoptions|edge.*label/.test(k.replace(/[^a-z]/g, "")) || /^(MarkerType|ConnectionLineType|EdgeMarker|EdgeMarkerType)$/.test(name)) return "graph";
    if (/fitview|fitbounds|viewport|pointtorenderer|rendererpoint|getnodesbounds|screentoflow|flowtoscreen/.test(k.replace(/[^a-z]/g, ""))) return "diagram-canvas";
    if (/^(XYDrag|XYHandle|XYPanZoom|XYResizer|XYMinimap|PanZoomInstance|PanZoomParams|PanZoomUpdateOptions|PanZoomTransformOptions|OnPanZoom|getHostForElement|isInputDOMNode|getPointerPosition|handleAttributionWarning|isAttributionVisible)$/.test(name) || D3_TYPES.has(name)) return "nouveau module";
    return "diagram-core";
  }
  return "nouveau module";
}
function priorityFor(family, name) {
  if (["model", "changes", "interaction"].includes(family)) return "P0";
  if (family === "instance" || family === "edge-geometry") return "P0";
  if (family === "examples") return "P2";
  if (family === "props-flow" && /\.(nodes|edges|onNodesChange|onEdgesChange|onConnect|nodeTypes|edgeTypes|fitView|snapToGrid|minZoom|maxZoom)$/.test(name)) return "P0";
  return "P1";
}

/* ---------- build inventory ---------- */
const raw = [];
const entries = [];
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
function add(family, name, sourceFile, sourceLine, behaviour, acceptance) {
  raw.push({ key: `${family}:${name}`, family, name, source: `${rel(sourceFile)}:${sourceLine}` });
  const cov = coverageFor(family, name);
  entries.push({
    id: `${family}.${slug(name)}`,
    family,
    name,
    source: `.ds-scrap/re-sources/xyflow/${rel(sourceFile)}:${sourceLine}`,
    behaviour,
    acceptance,
    target: targetFor(family, name),
    status: cov.status,
    proof: cov.proof,
    coverageNote: cov.note,
    priority: priorityFor(family, name),
  });
}
const diff = (what) => `Differential harness: run the same fixture + scripted interaction on xyflow and on the sentropic implementation; compare ${what}. See SPEC_RE_XYFLOW_PARITY.md §differential harness.`;
const sig = (t) => (t ? `: ${t}` : "");

// 1. Package public exports (semantic, transitive from each entry module)
const EXPORT_MAPS = {};
for (const [fam, entry] of [["api-system", sysEntry], ["api-react", reactEntry], ["api-svelte", svelteEntry]]) {
  const map = exportInfo(entry);
  EXPORT_MAPS[fam] = map;
  for (const name of [...map.keys()].sort((a, b) => a.localeCompare(b))) {
    const info = map.get(name);
    add(fam, name, info.file, info.line,
      `Public export \`${name}\` (${info.kind}${info.type ? `, ${info.type}` : ""}) of the package. Observable contract is its type/call signature at the cited definition; consumers import it by this exact name.`,
      diff("import surface (name resolves, kind matches) plus the behavioural scenario of the owning family"));
  }
}
// 2. Flow component props
const reactPropsFile = join(SOURCE, "packages/react/src/types/component-props.ts");
for (const m of typeMembers(reactPropsFile, "ReactFlowProps")) {
  add("props-flow", `ReactFlow.${m.name}`, m.file, m.line,
    `ReactFlow prop \`${m.name}\`${m.optional ? " (optional)" : ""}${sig(m.type)}${m.def ? `. Documented default: ${m.def}` : ""}. Setting it changes the observable flow behaviour described by its type (controlled value, handler, or option).`,
    diff(`rendered model + emitted events with the prop set vs unset (default ${m.def ?? "as documented per entry"})`));
}
const svelteTypesFile = join(SOURCE, "packages/svelte/src/lib/container/SvelteFlow/types.ts");
for (const m of typeMembers(svelteTypesFile, "SvelteFlowProps")) {
  add("props-flow", `SvelteFlow.${m.name}`, m.file, m.line,
    `SvelteFlow prop \`${m.name}\`${m.optional ? " (optional)" : ""}${sig(m.type)}${m.def ? `. Documented default: ${m.def}` : ""}. Svelte binding counterpart of the ReactFlow prop of the same name where present.`,
    diff("rendered model + emitted events with the prop set vs unset"));
}
const svelteEventsFile = join(SOURCE, "packages/svelte/src/lib/types/events.ts");
if (existsSync(svelteEventsFile)) {
  for (const t of ["NodeEvents", "EdgeEvents", "PaneEvents", "NodeSelectionEvents"]) {
    for (const m of typeMembers(svelteEventsFile, t)) {
      add("props-flow", `SvelteFlow.${m.name} (${t})`, m.file, m.line,
        `SvelteFlow event prop \`${m.name}\` from ${t}${sig(m.type)}. Fires on the user interaction named by the prop.`,
        diff("event sequence (name, payload shape, order) for the scripted interaction"));
    }
  }
}
// 3. Sub-component props (React + Svelte)
const compPropSpecs = [
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
for (const [comp, relFile, typeName] of compPropSpecs) {
  const file = join(SOURCE, relFile);
  if (!existsSync(file)) continue;
  for (const m of typeMembers(file, typeName)) {
    add("props-components", `${comp}.${m.name}`, m.file, m.line,
      `${comp} prop \`${m.name}\`${m.optional ? " (optional)" : ""}${sig(m.type)}${m.def ? `. Documented default: ${m.def}` : ""}.`,
      diff(`${comp} rendered output (DOM/geometry) and emitted callbacks`));
  }
}
// 4. Public hooks (derived from the semantic export maps)
for (const [fam, fw] of [["api-react", "react"], ["api-svelte", "svelte"]]) {
  const map = EXPORT_MAPS[fam];
  for (const name of [...map.keys()].sort((a, b) => a.localeCompare(b))) {
    if (!/^(use|experimental_use)/.test(name)) continue;
    const info = map.get(name);
    add("hooks", `${fw}:${name}`, info.file, info.line,
      `Hook \`${name}\` (${fw}): subscribes to the flow store and returns the value/callbacks in its signature; updates when the selected slice changes.`,
      diff("returned value sequence across the scripted state changes"));
  }
}
// 5. Instance helpers: ReactFlowInstance (GeneralHelpers + ViewportHelperFunctions + viewportInitialized)
//    and the useSvelteFlow return contract.
const instFile = join(SOURCE, "packages/react/src/types/instance.ts");
for (const m of typeMembers(instFile, "ReactFlowInstance")) {
  add("instance", m.name, m.file, m.line,
    `Instance method \`${m.name}\`${sig(m.type)}. Imperative counterpart of the declarative props; triggers the documented change handlers in controlled mode.`,
    diff("model + viewport + emitted change arrays after the call"));
}
const svelteFlowHookFile = join(SOURCE, "packages/svelte/src/lib/hooks/useSvelteFlow.svelte.ts");
for (const m of returnMembers(svelteFlowHookFile, "useSvelteFlow")) {
  add("instance", `useSvelteFlow.${m.name}`, m.file, m.line,
    `Svelte instance method \`useSvelteFlow.${m.name}\`${sig(m.type)}. Svelte counterpart of the ReactFlowInstance helper of the same name where present (note setZoom vs React zoomTo).`,
    diff("model + viewport + emitted change arrays after the call"));
}
// 6. Store fields + actions (React store/actions, Svelte actions)
const storeFile = join(SOURCE, "packages/react/src/types/store.ts");
for (const t of ["ReactFlowStore", "ReactFlowActions"]) {
  for (const m of typeMembers(storeFile, t)) {
    add("store", m.name, m.file, m.line,
      `Store ${t === "ReactFlowActions" ? "action" : "field"} \`${m.name}\`${sig(m.type)}. Single source of truth slice/action read by hooks/components of the same name family.`,
      diff("store snapshot (serialisable slices) after each scripted step"));
  }
}
const svelteStoreFile = join(SOURCE, "packages/svelte/src/lib/store/types.ts");
for (const m of typeMembers(svelteStoreFile, "SvelteFlowStoreActions")) {
  add("store", `SvelteFlowStore.${m.name}`, m.file, m.line,
    `Svelte store action \`SvelteFlowStore.${m.name}\`${sig(m.type)}. Svelte counterpart of the React store action of the same name where present.`,
    diff("store snapshot (serialisable slices) after each scripted step"));
}
// 7. Change variants (fixed protocol list; existence is guarded against api-system exports)
for (const name of ["NodeDimensionChange", "NodePositionChange", "NodeSelectionChange", "NodeRemoveChange", "NodeAddChange", "NodeReplaceChange", "EdgeSelectionChange", "EdgeRemoveChange", "EdgeAddChange", "EdgeReplaceChange", "NodeChange", "EdgeChange"]) {
  const info = EXPORT_MAPS["api-system"].get(name);
  const changesFile = join(SOURCE, "packages/system/src/types/changes.ts");
  add("changes", name, info?.file ?? changesFile, info?.line ?? 1,
    `Change variant \`${name}\`: one element of the onNodesChange/onEdgesChange array protocol. Applying it with apply*Changes produces the documented next model.`,
    diff("change arrays emitted for the gesture, then model after apply*Changes round-trip"));
}
// 8. Model types (bases, framework extras, enum members)
for (const [file, typeName] of [
  [join(SOURCE, "packages/system/src/types/nodes.ts"), "NodeBase"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "EdgeBase"],
]) {
  for (const m of typeMembers(file, typeName)) {
    add("model", `${typeName}.${m.name}`, m.file, m.line,
      `Model field \`${typeName}.${m.name}\`${m.optional ? " (optional)" : ""}${sig(m.type)}. Part of the serialisable flow document.`,
      diff("serialised document (toObject) before/after the scenario"));
  }
}
{
  const nodeBaseNames = new Set(typeMembers(join(SOURCE, "packages/system/src/types/nodes.ts"), "NodeBase").map((m) => m.name));
  for (const m of typeMembers(join(SOURCE, "packages/react/src/types/nodes.ts"), "Node")) {
    if (nodeBaseNames.has(m.name)) continue;
    add("model", `Node.${m.name}`, m.file, m.line,
      `Model field \`Node.${m.name}\` (React extension of NodeBase)${m.optional ? " (optional)" : ""}${sig(m.type)}. Part of the serialisable flow document as rendered by React Flow.`,
      diff("serialised document (toObject) before/after the scenario"));
  }
  const edgeBaseNames = new Set(typeMembers(join(SOURCE, "packages/system/src/types/edges.ts"), "EdgeBase").map((m) => m.name));
  for (const m of typeMembers(join(SOURCE, "packages/react/src/types/edges.ts"), "Edge")) {
    if (edgeBaseNames.has(m.name)) continue;
    add("model", `Edge.${m.name}`, m.file, m.line,
      `Model field \`Edge.${m.name}\` (React extension of EdgeBase)${m.optional ? " (optional)" : ""}${sig(m.type)}. Part of the serialisable flow document as rendered by React Flow.`,
      diff("serialised document (toObject) before/after the scenario"));
  }
}
for (const [file, en] of [
  [join(SOURCE, "packages/system/src/types/general.ts"), "ConnectionMode"],
  [join(SOURCE, "packages/system/src/types/general.ts"), "PanOnScrollMode"],
  [join(SOURCE, "packages/system/src/types/general.ts"), "SelectionMode"],
  [join(SOURCE, "packages/system/src/types/utils.ts"), "Position"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "ConnectionLineType"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "MarkerType"],
  [join(SOURCE, "packages/react/src/additional-components/Background/types.ts"), "BackgroundVariant"],
  [join(SOURCE, "packages/system/src/xyresizer/types.ts"), "ResizeControlVariant"],
]) {
  if (!existsSync(file)) continue;
  for (const mem of enumMembers(file, en)) {
    add("model", `${en}.${mem.name}`, file, mem.line,
      `Enum value \`${en}.${mem.name}\`: selects the named behaviour branch wherever the enum is accepted.`,
      diff(`behaviour branch taken with ${en}.${mem.name} in the owning scenario`));
  }
}
// 9. Edge geometry functions + built-in edge types
{
  const seen = new Set();
  for (const [fam] of [["api-system"], ["api-react"]]) {
    for (const [name, info] of EXPORT_MAPS[fam]) {
      if (!/^get\w+(Path|Center)$/.test(name)) continue;
      const relFile = rel(info.file);
      if (!relFile.includes("utils/edges") && !relFile.includes("components/Edges")) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      add("edge-geometry", name, info.file, info.line,
        `Path function \`${name}\`: maps handle positions + options to an SVG path string and label centre. Pure function, no DOM.`,
        diff("parsed SVG path commands compared numerically (tolerance 1e-6) and centre (tolerance 1e-6) over the fixture matrix of positions/options"));
    }
  }
}
for (const edgeType of ["default (bezier)", "straight", "step", "smoothstep", "simplebezier"]) {
  add("edge-geometry", `edgeType:${edgeType}`, reactEntry, EXPORT_MAPS["api-react"].get("BezierEdge")?.line ?? 1,
    `Built-in edge type \`${edgeType}\`: selects the path function and marker/label rendering for edges without a custom type.`,
    diff("rendered path geometry for a fixed node pair per edge type"));
}
// 10. Interaction behaviours (anchored catalogue; anchors verified in the engine sources)
const INTERACTIONS = [
  ["pan-by-drag", "packages/system/src/xypanzoom/XYPanZoom.ts", "XYPanZoom", "Pointer drag on the pane translates the viewport (subject to panOnDrag, translateExtent, min/max zoom)."],
  ["pan-on-scroll", "packages/system/src/xypanzoom/eventhandler.ts", "panOnScroll", "Wheel scroll pans when panOnScroll is set; mode (vertical/horizontal/free) constrains the axis."],
  ["zoom-on-scroll-and-pinch", "packages/system/src/xypanzoom/XYPanZoom.ts", "scaleTo", "Wheel / pinch zooms around the pointer, clamped to minZoom/maxZoom, emitting onMove*."],
  ["zoom-on-double-click", "packages/system/src/xypanzoom/XYPanZoom.ts", "zoomOnDoubleClick", "Double-click zooms in (or out with the documented modifier) when zoomOnDoubleClick is set."],
  ["node-drag", "packages/system/src/xydrag/XYDrag.ts", "XYDrag", "Dragging a draggable node emits position changes (dragging flag), honours nodeExtent, snap grid and parent extent."],
  ["multi-node-drag", "packages/system/src/xydrag/XYDrag.ts", "getDragItems", "Dragging one selected node moves the whole selection by the same delta."],
  ["snap-to-grid", "packages/system/src/xydrag/utils.ts", "snap", "When snapToGrid is set, positions round to snapGrid [x,y] during drag and keyboard move."],
  ["selection-rectangle", "packages/react/src/container/Pane/index.tsx", "selection", "Drag with the selection key draws a rect; nodes/edges inside (per SelectionMode) become selected."],
  ["multi-selection-keys", "packages/react/src/hooks/useGlobalKeyHandler.ts", "multiSelectionKey", "Holding the multi-selection key toggles individual selection; selection key switches drag mode."],
  ["connection-drag", "packages/system/src/xyhandle/XYHandle.ts", "XYHandle", "Dragging from a Handle draws a connection line, validates targets live, and emits onConnect/onConnectEnd."],
  ["click-to-connect", "packages/react/src/components/Handle/index.tsx", "clickConnecting", "Clicking a handle then a target handle completes a connection when the click-connect props are used."],
  ["connection-validation", "packages/system/src/xyhandle/utils.ts", "isValid", "isValidConnection / connectionMode / handle type+id decide validity; invalid targets are marked and rejected."],
  ["edge-reconnect", "packages/react/src/components/EdgeWrapper/index.tsx", "reconnect", "Dragging an edge endpoint (reconnectable) emits onReconnect* and can re-anchor or cancel the edge."],
  ["node-resize", "packages/system/src/xyresizer/XYResizer.ts", "XYResizer", "NodeResizer handles emit dimension changes, honour min/max, aspect ratio and shouldResize."],
  ["parent-and-subflow", "packages/system/src/utils/graph.ts", "parent", "parentId + extent 'parent'/expandParent keep children inside the parent; parent moves carry children (positionAbsolute)."],
  ["extent-clamping", "packages/system/src/utils/graph.ts", "extent", "nodeExtent / translateExtent / parent extent clamp drag and pan results."],
  ["auto-pan-on-drag", "packages/system/src/xydrag/XYDrag.ts", "autoPan", "Dragging near the pane edge auto-pans (autoPanOnNodeDrag / connection / selection variants)."],
  ["keyboard-move-and-delete", "packages/react/src/hooks/useGlobalKeyHandler.ts", "deleteKey", "Delete key removes the selection (via onBeforeDelete gate); arrows move selected nodes by the documented step (snap-aware)."],
  ["keyboard-focus-and-a11y", "packages/react/src/components/A11yDescriptions/index.tsx", "aria", "Nodes/edges are focusable, Enter/Space selects, aria-live announces moves; ariaLabelConfig customises texts."],
  ["only-render-visible-elements", "packages/react/src/hooks/useVisibleNodeIds.ts", "visible", "onlyRenderVisibleElements restricts rendering to the viewport intersection (with the documented edge cases)."],
  ["minimap-pan-zoom", "packages/system/src/xyminimap/index.ts", "minimap", "MiniMap renders a scaled overview; clicking/dragging pans, wheel zooms (pannable/zoomable props)."],
  ["controls-buttons", "packages/react/src/additional-components/Controls/Controls.tsx", "Controls", "Controls buttons zoom in/out, fit view and toggle interactivity (lock), with aria labels."],
  ["fit-view-on-init", "packages/system/src/utils/graph.ts", "getViewportForBounds", "fitView (prop/option) frames all nodes with padding, maxZoom clamp and optional duration animation."],
  ["elevate-on-select-zindex", "packages/react/src/store/initialState.ts", "elevateNodesOnSelect", "elevateNodesOnSelect / zIndexMode control stacking of selected nodes and their edges."],
  ["color-mode", "packages/react/src/hooks/useColorModeClass.ts", "colorMode", "colorMode light/dark/system toggles the documented class and CSS variables."],
  ["hidden-and-visibility", "packages/system/src/types/nodes.ts", "hidden", "hidden nodes/edges are not rendered and are excluded from fit bounds and connections as documented."],
];
for (const [slugName, relFile, anchor, behaviour] of INTERACTIONS) {
  const file = join(SOURCE, relFile);
  const ls = existsSync(file) ? read(file).split("\n") : [];
  const idx = ls.findIndex((l) => l.toLowerCase().includes(anchor.toLowerCase()));
  add("interaction", slugName, file, idx >= 0 ? idx + 1 : 1, behaviour + " Anchor verified in the cited engine source.", diff("event sequence + resulting model/viewport for the scripted gesture (coordinate-driven, SPEC §differential harness)"));
}
// 11. Examples as acceptance scenarios (directories only)
for (const [fw, base] of [
  ["react", join(SOURCE, "examples/react/src/examples")],
  ["svelte", join(SOURCE, "examples/svelte/src/routes/examples")],
]) {
  if (!existsSync(base)) continue;
  for (const name of readdirSync(base).sort()) {
    const p = join(base, name);
    if (!statSync(p).isDirectory()) continue;
    const first = walk(p, [".tsx", ".ts", ".svelte"])[0] ?? p;
    add("examples", `${fw}:${name}`, first, 1, `Example scenario \`${name}\` (${fw}): the monorepo's own recipe for the feature(s) its folder demonstrates. Used as a differential acceptance scenario, not as a spec of new behaviour.`, diff("scenario outcome (model/events/geometry) replayed from the example's initial fixture"));
  }
}
// De-duplicate ids (React/Svelte share member names): suffix repeats deterministically.
{
  const seen = new Map();
  for (const e of entries) {
    const base = e.id;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    if (n > 1) e.id = `${base}-${n}`;
  }
  // Deterministic order inside each family for stable diffs.
  const famOrder = new Map();
  entries.forEach((e, i) => { if (!famOrder.has(e.family)) famOrder.set(e.family, i); });
  entries.sort((a, b) => (famOrder.get(a.family) - famOrder.get(b.family)) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  raw.sort((a, b) => a.key.localeCompare(b.key));
  // Re-derive canonical ids after sorting is unnecessary: ids already unique.
}
const byFamily = {};
for (const e of entries) byFamily[e.family] = (byFamily[e.family] ?? 0) + 1;
const byStatus = {};
for (const e of entries) byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
const byTarget = {};
for (const e of entries) byTarget[e.target] = (byTarget[e.target] ?? 0) + 1;
const byPriority = {};
for (const e of entries) byPriority[e.priority] = (byPriority[e.priority] ?? 0) + 1;
const versions = {};
for (const [k, p] of [["system", "packages/system/package.json"], ["react", "packages/react/package.json"], ["svelte", "packages/svelte/package.json"]]) {
  try { versions[k] = JSON.parse(read(join(SOURCE, p))).version; } catch { versions[k] = "unknown"; }
}
const inventory = {
  meta: {
    title: "xyflow mechanical inventory for @sentropic/graph parity",
    generatedBy: "tools/re-xyflow/enumerate.mjs (TypeScript compiler API, no network)",
    guard: "tools/re-xyflow/verify.mjs (independent syntactic AST extractor; see SPEC §2)",
    sourceRoot: ".ds-scrap/re-sources/xyflow",
    versions,
    countingConvention: "One entry per mechanically enumerated observable: transitive public export (semantic module exports), flow-prop member, sub-component prop member, hook, instance method, store field/action, change variant, model field, enum member, edge path function/type, anchored interaction behaviour, example scenario. Duplicated React/Svelte names count once per package surface (family prefix distinguishes them). Generic DOM attribute expansions (HTMLAttributes/SVGAttributes) are excluded: only members declared inside the xyflow tree count.",
    total: entries.length,
    byFamily, byStatus, byTarget, byPriority,
  },
  entries,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(inventory, null, 2) + "\n");
writeFileSync(RAW, JSON.stringify({ total: raw.length, keys: raw.map((r) => r.key) }, null, 2) + "\n");
console.log(`enumerated=${raw.length} entries=${entries.length}`);
console.log("byFamily", JSON.stringify(byFamily));
console.log("byStatus", JSON.stringify(byStatus));
console.log("byTarget", JSON.stringify(byTarget));
console.log(`wrote ${relWt(OUT)} and ${relWt(RAW)}`);
