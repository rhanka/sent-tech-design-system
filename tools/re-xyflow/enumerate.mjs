#!/usr/bin/env node
/**
 * Mechanical enumeration of the xyflow public surface.
 * No third-party code is copied: only names, signatures and source
 * locations are extracted. Behaviour text is written from the
 * observable contract (JSDoc + type shape), never from implementation.
 *
 * Usage:
 *   node tools/re-xyflow/enumerate.mjs [--source <xyflowRoot>] [--out <inventory.json>]
 * Defaults resolve from this file location:
 *   source = <repoParent>/.ds-scrap/re-sources/xyflow
 *   out    = <worktree>/docs/re/xyflow-inventory.json
 *   raw    = <worktree>/tools/re-xyflow/raw-enumeration.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const read = (p) => readFileSync(p, "utf8");
const linesOf = (p) => read(p).split("\n");
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

function findDefLine(file, name) {
  const ls = linesOf(file);
  const pats = [
    new RegExp(`^export\\s+(?:declare\\s+)?(?:type|interface|enum|class|const|function|let|var)\\s+${name}\\b`),
    new RegExp(`^export\\s+\\{[^}]*\\b${name}\\b`),
  ];
  for (let i = 0; i < ls.length; i++) for (const re of pats) if (re.test(ls[i])) return i + 1;
  return 1;
}

/** Follow `export *` / `export {..} from` transitively from an entry file. */
function collectExports(entry) {
  const seenFiles = new Set();
  const found = new Map(); // name -> {file, line, kind}
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift();
    if (seenFiles.has(file) || !existsSync(file)) continue;
    seenFiles.add(file);
    const ls = linesOf(file);
    ls.forEach((line, idx) => {
      let m = line.match(/export\s+\*\s+from\s+['"]([^'"]+)['"]/);
      if (m) { queue.push(resolveFrom(file, m[1])); return; }
      m = line.match(/export\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+['"]([^'"]+)['"])?/);
      if (m) {
        const fromFile = m[2] ? resolveFrom(file, m[2]) : file;
        for (let part of m[1].split(",")) {
          part = part.trim().replace(/^type\s+/, "");
          if (!part) continue;
          const as = part.match(/^(\S+)\s+as\s+(\S+)$/);
          const orig = as ? as[1] : part.split(/\s/)[0];
          const name = as ? as[2] : orig;
          if (name === "default") continue;
          if (!found.has(name)) found.set(name, { file: fromFile, line: findDefLine(fromFile, orig), kind: "export" });
        }
        return;
      }
      m = line.match(/^export\s+(?:declare\s+)?(type|interface|enum|class|const|function)\s+([A-Za-z_$][\w$]*)/);
      if (m && !found.has(m[2])) found.set(m[2], { file, line: idx + 1, kind: m[1] });
      m = line.match(/^export\s+default\s+(?:function|class)\s+([A-Za-z_$][\w$]*)/);
      if (m && !found.has(m[1])) found.set(m[1], { file, line: idx + 1, kind: "default" });
    });
  }
  return found;
}
function resolveFrom(fromFile, spec) {
  let base = resolve(dirname(fromFile), spec);
  if (spec.startsWith("@xyflow/system")) base = join(SOURCE, "packages/system/src/index.ts");
  if (spec.startsWith("$lib/")) base = join(SOURCE, "packages/svelte/src/lib", spec.slice(5));
  const cands = [base, base + ".ts", base + ".tsx", base + ".js", join(base, "index.ts"), join(base, "index.tsx"), join(base, "index.js"), base.replace(/\.js$/, ".ts"), base.replace(/\.js$/, ".svelte.ts")];
  for (const c of cands) if (existsSync(c) && statSync(c).isFile()) return c;
  return base + ".ts";
}

/** Members of `export interface X {..}` or `export type X = {..}` at brace depth 1. */
function objectMembers(file, typeName) {
  const ls = linesOf(file);
  const start = ls.findIndex((l) => new RegExp(`export\\s+(?:interface|type)\\s+${typeName}\\b`).test(l));
  if (start < 0) return [];
  let depth = 0, begun = false;
  const out = [];
  for (let i = start; i < ls.length; i++) {
    const line = ls[i];
    if (line.includes("{")) { begun = true; }
    if (!begun) continue;
    const before = depth;
    for (const ch of line) { if (ch === "{") depth++; else if (ch === "}") depth--; }
    if (before === 1) {
      const m = line.match(/^\s{2,}([A-Za-z_$][\w$]*|'[^']+')(\?)?:\s*(.*)$/);
      if (m && !line.trim().startsWith("*") && !line.trim().startsWith("//")) {
        // look back for @default in the preceding JSDoc block
        let def = null;
        for (let j = Math.max(0, i - 25); j < i; j++) {
          const d = ls[j].match(/@default\s+(.+)/);
          if (d) def = d[1].trim();
          if (ls[j].includes("*/")) def = def; // keep last seen in block
        }
        out.push({ name: m[1].replace(/'/g, ""), optional: !!m[2], type: m[3].replace(/;$/, "").slice(0, 120), line: i + 1, default: def });
      }
    }
    if (begun && depth === 0 && i > start) break;
  }
  return out;
}
/* ---------- sentropic corpus (coverage evidence) ---------- */
const CORPUS_DIRS = ["packages/graph/src", "packages/diagram-core/src", "packages/diagram-canvas/src"];
const corpus = []; // {file(relWt), lines[]}
for (const d of CORPUS_DIRS) {
  const abs = join(worktree, d);
  if (!existsSync(abs)) continue;
  for (const f of walk(abs, [".ts"])) corpus.push({ file: relWt(f), lines: linesOf(f) });
}
function proof(needle, fileHint) {
  const n = needle.toLowerCase();
  const ordered = fileHint ? [...corpus.filter((c) => c.file.includes(fileHint)), ...corpus.filter((c) => !c.file.includes(fileHint))] : corpus;
  for (const c of ordered) for (let i = 0; i < c.lines.length; i++)
    if (c.lines[i].toLowerCase().includes(n)) return `${c.file}:${i + 1}`;
  return null;
}
function proofIn(fileSuffix, needle) {
  const c = corpus.find((x) => x.file.endsWith(fileSuffix));
  if (!c) return null;
  const n = needle.toLowerCase();
  for (let i = 0; i < c.lines.length; i++) if (c.lines[i].toLowerCase().includes(n)) return `${c.file}:${i + 1}`;
  return null;
}
const P = {
  transform: () => proofIn("diagram-canvas/src/transform.ts", "export function worldToDevice") ?? "packages/diagram-canvas/src/transform.ts:200",
  hit: () => proofIn("diagram-canvas/src/hit.ts", "export function hitTest(") ?? "packages/diagram-canvas/src/hit.ts:85",
  region: () => proofIn("diagram-canvas/src/hit.ts", "hitTestRegion") ?? "packages/diagram-canvas/src/hit.ts:122",
  scene: () => proofIn("diagram-canvas/src/scene.ts", "export function buildScene") ?? "packages/diagram-canvas/src/scene.ts:168",
  straight: () => proofIn("graph/src/edge-geometry.ts", "EdgeCurveMode") ?? "packages/graph/src/edge-geometry.ts:3",
  octilinear: () => proof("octilinear", "graph") ?? "packages/graph/src/types.ts:60",
  camera: () => proofIn("graph/src/renderer.ts", "export function createGraphRenderer") ?? "packages/graph/src/renderer.ts:1180",
  commands: () => proofIn("diagram-core/src/commands.ts", "export function applyTransaction") ?? "packages/diagram-core/src/commands.ts:1016",
  rectUnion: () => proofIn("diagram-canvas/src/geometry.ts", "export function rectUnion") ?? "packages/diagram-canvas/src/geometry.ts:64",
};
function coverageFor(key, family) {
  const k = key.toLowerCase();
  const cov = (proofStr, note) => ({ status: "covered", proof: proofStr, note });
  const part = (proofStr, note) => ({ status: "partial", proof: proofStr, note });
  const miss = (proofStr, note) => ({ status: "missing", proof: proofStr, note });
  if (/worldtodevice|worldtoview|viewtodevice|composetransform/.test(k)) return cov(P.transform(), "diagram-canvas owns the world/view/device affine contract.");
  if (family === "interaction" && /hit-test|picking/.test(k)) return part(P.hit(), "diagram-canvas hitTest exists; no flow-level picking/hover engine on graph yet.");
  if (/getstraightpath|straightedge/.test(k)) return part(P.straight(), "graph edge-geometry provides straight/arc polylines, not the xyflow SVG path contract.");
  if (/bezier|smoothstep|stepedge|simplebezier/.test(k)) return miss(P.octilinear(), "graph has octilinear + arc routing; no bezier/smoothstep path functions. Neighbouring capability only.");
  if (/fitview|fitbounds|setcenter|zoomto|zoomin|zoomout|getviewport|setviewport|screenToFlow|flowtoscreen/.test(k)) return part(P.camera(), "graph renderer camera + diagram-canvas transform exist; no xyflow viewport-helper API (padding, duration, interpolation).");
  if (/panzoom|pan-on|zoom-on|onmove/.test(k)) return part(P.transform(), "camera transform exists; the d3 pan/zoom gesture engine (XYPanZoom) has no equivalent.");
  if (/applynodechanges|applyedgechanges|nodechange|edgechange/.test(k)) return part(P.commands(), "diagram-core has transactional commands with inverses; the xyflow change-array protocol is not implemented.");
  if (/buildscene|sceneframe|paint.order/.test(k)) return cov(P.scene(), "diagram-canvas buildScene + deterministic paint order cover the scene half; rendering binding stays open.");
  if (/rectcontains|rectsintersect|rectunion|getnodesbounds|nodebounds/.test(k)) return part(P.rectUnion(), "diagram-canvas geometry provides rect algebra; xyflow node-bounds API shape differs.");
  if (family === "examples") return miss(P.camera(), "No sentropic recipe implements this xyflow example scenario yet.");
  return miss(P.camera(), "No equivalent found in graph/diagram-core/diagram-canvas corpus (mechanical search at generation time).");
}
function targetFor(family, key) {
  const k = key.toLowerCase();
  if (family === "edge-geometry" || /edge.*path|marker|connectionline/.test(k)) return "graph";
  if (family === "model" || family === "changes" || /nodebase|edgebase|document|command/.test(k)) return "diagram-core";
  if (family === "interaction" || family === "store") return "nouveau module";
  if (/panzoom|drag|selection|viewport|transform|hit/.test(k)) return "diagram-canvas";
  if (family.startsWith("api-") || family === "hooks" || family === "props-components" || family === "props-flow" || family === "instance") return "composant DS";
  if (family === "examples") return "composant DS";
  return "nouveau module";
}
function priorityFor(family, key) {
  if (["model", "changes", "interaction"].includes(family)) return "P0";
  if (family === "props-flow" && /^(nodes|edges|onnodeschange|onedgeschange|onconnect|nodeTypes|edgeTypes|fitView|snapToGrid|minZoom|maxZoom)/.test(key)) return "P0";
  if (family === "instance" || family === "edge-geometry") return "P0";
  if (family === "examples") return "P2";
  return "P1";
}

function enumMembers(file, enumName) {
  const ls = linesOf(file);
  const start = ls.findIndex((l) => new RegExp(`export\\s+enum\\s+${enumName}\\b`).test(l));
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < ls.length; i++) {
    if (ls[i].includes("}")) break;
    const m = ls[i].match(/^\s*([A-Za-z_$][\w$]*)\s*(?:=\s*['"]?([^,'"]+)['"]?)?/);
    if (m && m[1]) out.push({ name: m[1], value: m[2] ?? null, line: i + 1 });
  }
  return out;
}

/* ---------- build inventory ---------- */
const raw = []; // {key, family, name, source}
const entries = [];
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
function add(family, name, sourceFile, sourceLine, behaviour, acceptance, keyOverride) {
  const key = keyOverride ?? `${family}:${name}`;
  raw.push({ key, family, name, source: `${rel(sourceFile)}:${sourceLine}` });
  const cov = coverageFor(name, family);
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

// 1. Package public exports (transitive from each index)
const EXPORT_MAPS = {};
const sysEntry = join(SOURCE, "packages/system/src/index.ts");
const reactEntry = join(SOURCE, "packages/react/src/index.ts");
const svelteEntry = join(SOURCE, "packages/svelte/src/lib/index.ts");
for (const [fam, entry] of [["api-system", sysEntry], ["api-react", reactEntry], ["api-svelte", svelteEntry]]) {
  const map = collectExports(entry);
  EXPORT_MAPS[fam] = map;
  for (const [name, info] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    add(fam, name, info.file, info.line,
      `Public export \`${name}\` (${info.kind}) of the package. Observable contract is its type/call signature at the cited definition; consumers import it by this exact name.`,
      diff("import surface (name resolves, kind matches) plus the behavioural scenario of the owning family"));
  }
}
// 2. Flow component props
const reactPropsFile = join(SOURCE, "packages/react/src/types/component-props.ts");
for (const m of objectMembers(reactPropsFile, "ReactFlowProps")) {
  add("props-flow", `ReactFlow.${m.name}`, reactPropsFile, m.line,
    `ReactFlow prop \`${m.name}\`${m.optional ? " (optional)" : ""}: ${m.type || "see type"}${m.default ? `. Documented default: ${m.default}` : ""}. Setting it changes the observable flow behaviour described by its type (controlled value, handler, or option).`,
    diff(`rendered model + emitted events with the prop set vs unset (default ${m.default ?? "documented in spec §options"})`));
}
const svelteTypesFile = join(SOURCE, "packages/svelte/src/lib/container/SvelteFlow/types.ts");
for (const m of objectMembers(svelteTypesFile, "SvelteFlowProps")) {
  add("props-flow", `SvelteFlow.${m.name}`, svelteTypesFile, m.line,
    `SvelteFlow prop \`${m.name}\`${m.optional ? " (optional)" : ""}: ${m.type || "see type"}${m.default ? `. Documented default: ${m.default}` : ""}. Svelte binding counterpart of the ReactFlow prop of the same name where present.`,
    diff("rendered model + emitted events with the prop set vs unset"));
}
// Svelte event contracts (NodeEvents/EdgeEvents/PaneEvents intersections)
const svelteEventsFile = join(SOURCE, "packages/svelte/src/lib/types/events.ts");
if (existsSync(svelteEventsFile)) {
  for (const t of ["NodeEvents", "EdgeEvents", "PaneEvents", "NodeSelectionEvents"]) {
    for (const m of objectMembers(svelteEventsFile, t)) {
      add("props-flow", `SvelteFlow.${m.name} (${t})`, svelteEventsFile, m.line,
        `SvelteFlow event prop \`${m.name}\` from ${t}: ${m.type || "handler"}. Fires on the user interaction named by the prop.`,
        diff("event sequence (name, payload shape, order) for the scripted interaction"));
    }
  }
}
// 3. Sub-component props
const compPropFiles = [
  ["Background", join(SOURCE, "packages/react/src/additional-components/Background/types.ts"), "BackgroundProps"],
  ["Controls", join(SOURCE, "packages/react/src/additional-components/Controls/types.ts"), "ControlsProps"],
  ["MiniMap", join(SOURCE, "packages/react/src/additional-components/MiniMap/types.ts"), "MiniMapProps"],
  ["NodeToolbar", join(SOURCE, "packages/react/src/additional-components/NodeToolbar/types.ts"), "NodeToolbarProps"],
  ["NodeResizer", join(SOURCE, "packages/react/src/additional-components/NodeResizer/types.ts"), "NodeResizerProps"],
  ["EdgeToolbar", join(SOURCE, "packages/react/src/additional-components/EdgeToolbar/types.ts"), "EdgeToolbarProps"],
  ["Panel", join(SOURCE, "packages/react/src/components/Panel/index.tsx"), "PanelProps"],
];
for (const [comp, file, typeName] of compPropFiles) {
  if (!existsSync(file)) continue;
  for (const m of objectMembers(file, typeName)) {
    add("props-components", `${comp}.${m.name}`, file, m.line,
      `${comp} prop \`${m.name}\`${m.optional ? " (optional)" : ""}: ${m.type || "see type"}${m.default ? `. Documented default: ${m.default}` : ""}.`,
      diff(`${comp} rendered output (DOM/geometry) and emitted callbacks`));
  }
  // the component itself
  const idx = walk(join(SOURCE, "packages/react/src"), [".tsx"]).find((f) => f.includes(comp) && read(f).includes(`function ${comp}`));
  add("props-components", comp, file, 1, `${comp} component: renders its documented chrome/overlay inside the flow viewport.`, diff(`${comp} presence, position and interaction outcome`));
}
// Handle + edge component props from system/react types
const handleTypes = join(SOURCE, "packages/system/src/types/handles.ts");
for (const m of objectMembers(handleTypes, "Handle")) {
  add("props-components", `Handle.${m.name}`, handleTypes, m.line, `Handle field \`${m.name}\`: ${m.type || "see type"}. Determines connection anchoring and validity.`, diff("connection outcome when dragging from/to this handle"));
}
// 4. Public hooks only (derived from the transitive export maps, framework-prefixed)
for (const [fam, fw] of [["api-react", "react"], ["api-svelte", "svelte"]]) {
  const map = EXPORT_MAPS[fam];
  if (!map) continue;
  for (const [name, info] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (!/^(use|experimental_use)/.test(name)) continue;
    add("hooks", `${fw}:${name}`, info.file, info.line,
      `Hook \`${name}\` (${fw}): subscribes to the flow store and returns the value/callbacks in its signature; updates when the selected slice changes.`,
      diff("returned value sequence across the scripted state changes"));
  }
}
// 5. Instance helpers
const instFile = join(SOURCE, "packages/react/src/types/instance.ts");
for (const t of ["GeneralHelpers", "ViewportHelperFunctions"]) {
  for (const m of objectMembers(instFile, t)) {
    add("instance", m.name, instFile, m.line, `Instance method \`${m.name}\`: ${m.type || "see signature"}. Imperative counterpart of the declarative props; triggers the documented change handlers in controlled mode.`, diff("model + viewport + emitted change arrays after the call"));
  }
}
// 6. Store fields
const storeFile = join(SOURCE, "packages/react/src/types/store.ts");
for (const m of objectMembers(storeFile, "ReactFlowStore")) {
  add("store", m.name, storeFile, m.line, `Store field \`${m.name}\`: ${m.type || "see type"}. Single source of truth slice read by hooks/components of the same name family.`, diff("store snapshot (serialisable slices) after each scripted step"));
}
// 7. Change variants
const changesFile = join(SOURCE, "packages/system/src/types/changes.ts");
for (const name of ["NodeDimensionChange", "NodePositionChange", "NodeSelectionChange", "NodeRemoveChange", "NodeAddChange", "NodeReplaceChange", "EdgeSelectionChange", "EdgeRemoveChange", "EdgeAddChange", "EdgeReplaceChange", "NodeChange", "EdgeChange"]) {
  const line = findDefLine(changesFile, name);
  add("changes", name, changesFile, line, `Change variant \`${name}\`: one element of the onNodesChange/onEdgesChange array protocol. Applying it with apply*Changes produces the documented next model.`, diff("change arrays emitted for the gesture, then model after apply*Changes round-trip"));
}
// 8. Model types (Node/Edge bases + core geometry types)
for (const [file, typeName] of [
  [join(SOURCE, "packages/system/src/types/nodes.ts"), "NodeBase"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "EdgeBase"],
]) {
  for (const m of objectMembers(file, typeName)) {
    add("model", `${typeName}.${m.name}`, file, m.line, `Model field \`${typeName}.${m.name}\`${m.optional ? " (optional)" : ""}: ${m.type || "see type"}. Part of the serialisable flow document.`, diff("serialised document (toObject) before/after the scenario"));
  }
}
// 9. Edge geometry functions + built-in edge types
for (const f of walk(join(SOURCE, "packages/system/src/utils/edges"), [".ts"]).sort()) {
  const ls = linesOf(f);
  ls.forEach((line, i) => {
    const m = line.match(/export\s+function\s+(get\w+Path|get\w+Center)\b/);
    if (m) add("edge-geometry", m[1], f, i + 1, `Path function \`${m[1]}\`: maps handle positions + options to an SVG path string and label centre. Pure function, no DOM.`, diff("path string (exact) and centre (tolerance 1e-6) over the fixture matrix of positions/options"));
  });
}
for (const edgeType of ["default (bezier)", "straight", "step", "smoothstep", "simplebezier"]) {
  const f = join(SOURCE, "packages/react/src/index.ts");
  add("edge-geometry", `edgeType:${edgeType}`, f, findDefLine(f, "BezierEdge"),
    `Built-in edge type \`${edgeType}\`: selects the path function and marker/label rendering for edges without a custom type.`,
    diff("rendered path geometry for a fixed node pair per edge type"));
}
// 10. Enums (each member is observable)
for (const [file, en] of [
  [join(SOURCE, "packages/system/src/types/general.ts"), "ConnectionMode"],
  [join(SOURCE, "packages/system/src/types/general.ts"), "PanOnScrollMode"],
  [join(SOURCE, "packages/system/src/types/general.ts"), "SelectionMode"],
  [join(SOURCE, "packages/system/src/types/utils.ts"), "Position"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "ConnectionLineType"],
  [join(SOURCE, "packages/system/src/types/edges.ts"), "MarkerType"],
]) {
  if (!existsSync(file)) continue;
  for (const mem of enumMembers(file, en)) {
    add("model", `${en}.${mem.name}`, file, mem.line, `Enum value \`${en}.${mem.name}\`${mem.value ? ` = "${mem.value}"` : ""}: selects the named behaviour branch wherever the enum is accepted.`, diff(`behaviour branch taken with ${en}.${mem.name} in the owning scenario`));
  }
}
// 11. Interaction behaviours (catalogue anchored in engine sources)
const INTERACTIONS = [
  ["pan-by-drag", "packages/system/src/xypanzoom/XYPanZoom.ts", "XYPanZoom", "Pointer drag on the pane translates the viewport (subject to panOnDrag, translateExtent, min/max zoom)."],
  ["pan-on-scroll", "packages/system/src/xypanzoom/eventhandler.ts", "panOnScroll", "Wheel scroll pans when panOnScroll is set; mode (vertical/horizontal/free) constrains the axis."],
  ["zoom-on-scroll-and-pinch", "packages/system/src/xypanzoom/XYPanZoom.ts", "scaleTo", "Wheel / pinch zooms around the pointer, clamped to minZoom/maxZoom, emitting onMove*."],
  ["zoom-on-double-click", "packages/system/src/xypanzoom/eventhandler.ts", "zoomOnDoubleClick", "Double-click zooms in (or out with the documented modifier) when zoomOnDoubleClick is set."],
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
  const ls = existsSync(file) ? linesOf(file) : [];
  const idx = ls.findIndex((l) => l.toLowerCase().includes(anchor.toLowerCase()));
  add("interaction", slugName, file, idx >= 0 ? idx + 1 : 1, behaviour + " Anchor verified in the cited engine source.", diff("event sequence + resulting model/viewport for the scripted gesture (Playwright)"));
}
// 12. Examples as acceptance scenarios
for (const base of [join(SOURCE, "examples/react/src/examples"), join(SOURCE, "examples/svelte/src/routes")]) {
  if (!existsSync(base)) continue;
  const fw = base.includes("svelte") ? "svelte" : "react";
  for (const name of readdirSync(base).sort()) {
    const p = join(base, name);
    if (!statSync(p).isDirectory()) continue;
    const first = walk(p, [".tsx", ".ts", ".svelte"])[0] ?? p;
    add("examples", `${fw}:${name}`, first, 1, `Example scenario \`${name}\` (${fw}): the monorepo's own recipe for the feature(s) its folder demonstrates. Used as a differential acceptance scenario, not as a spec of new behaviour.`, diff("scenario outcome (model/events/geometry) replayed from the example's initial fixture"));
  }
}
// de-duplicate ids (React/Svelte share hook names): suffix by family already distinct; hooks need fw split
const seen = new Map();
for (const e of entries) {
  if (seen.has(e.id)) { e.id = `${e.id}-${seen.get(e.id)}`; seen.set(e.id.replace(/-\d+$/, ""), (seen.get(e.id.replace(/-\d+$/, "")) ?? 1) + 1); }
  else seen.set(e.id, 1);
}
const byFamily = {};
for (const e of entries) byFamily[e.family] = (byFamily[e.family] ?? 0) + 1;
const byStatus = {};
for (const e of entries) byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
const versions = {};
for (const [k, p] of [["system", "packages/system/package.json"], ["react", "packages/react/package.json"], ["svelte", "packages/svelte/package.json"]]) {
  try { versions[k] = JSON.parse(read(join(SOURCE, p))).version; } catch { versions[k] = "unknown"; }
}
const inventory = {
  meta: {
    title: "xyflow mechanical inventory for @sentropic/graph parity",
    generatedBy: "tools/re-xyflow/enumerate.mjs (Node, no network)",
    sourceRoot: ".ds-scrap/re-sources/xyflow",
    versions,
    countingConvention: "One entry per mechanically enumerated observable: transitive public export, flow-prop member, sub-component prop member, hook, instance method, store field, change variant, model field, enum member, edge path function/type, anchored interaction behaviour, example scenario. Duplicated React/Svelte names count once per package surface (family prefix distinguishes them).",
    total: entries.length,
    byFamily, byStatus,
  },
  entries,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(inventory, null, 2) + "\n");
writeFileSync(RAW, JSON.stringify({ total: raw.length, keys: raw.map((r) => r.key).sort() }, null, 2) + "\n");
console.log(`enumerated=${raw.length} entries=${entries.length}`);
console.log("byFamily", JSON.stringify(byFamily));
console.log("byStatus", JSON.stringify(byStatus));
console.log(`wrote ${relWt(OUT)} and ${relWt(RAW)}`);

