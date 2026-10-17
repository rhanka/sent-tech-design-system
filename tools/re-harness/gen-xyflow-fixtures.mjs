#!/usr/bin/env node
// Generates one xyflow fixture + scenario per example entry of
// docs/re/xyflow-inventory.json (93 examples: 66 React + 27 Svelte).
//
// C1: every fixture reproduces the INITIAL GRAPH OF THE NAMED EXAMPLE,
// extracted mechanically from the pinned sources under
// .ds-scrap/re-sources/xyflow/examples/** (nodes, edges, types, handles,
// parentId/extent, flow options). The extractor only accepts pure data
// literals: comments are stripped, a small set of pinned library enum
// constants (MarkerType, Position, ConnectionMode — values read from the
// pinned @xyflow/system sources) is substituted, and any remaining
// identifier, call, spread of a variable or template interpolation makes
// the literal non-extractable. An example whose graph is computed (loops,
// generator functions, imported builders, React/Svelte components in
// data, ...) is emitted with extraction.status="unknown" and its cause:
// the gate reports it `unknown`, never green, and no generic substitute
// graph is invented.
//
// Each extractable fixture also carries one representative operation
// script when the graph supports one (drag = move of the first node,
// connect between an unconnected pair), played through the real store.
//
// Re-run after an inventory regeneration:
//   node tools/re-harness/gen-xyflow-fixtures.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT, WT_ROOT } from "./src/oracles.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const inventory = JSON.parse(fs.readFileSync(path.join(WT_ROOT, "docs", "re", "xyflow-inventory.json"), "utf8"));
const examples = (inventory.entries || []).filter((e) => e.family === "examples");
const SOURCES_ROOT = path.join(REPO_ROOT, ".ds-scrap", "re-sources", "xyflow");

// Pinned enum constants of @xyflow/system (values verified in the pinned
// sources: packages/system/src/types/edges.ts, types/utils.ts,
// types/general.ts). Substituted before the literal-only check.
const ENUM_CONSTANTS = {
  "MarkerType.Arrow": "\"arrow\"",
  "MarkerType.ArrowClosed": "\"arrowclosed\"",
  "Position.Left": "\"left\"",
  "Position.Top": "\"top\"",
  "Position.Right": "\"right\"",
  "Position.Bottom": "\"bottom\"",
  "ConnectionMode.Strict": "\"strict\"",
  "ConnectionMode.Loose": "\"loose\"",
};

const BUILTIN_NODE_TYPES = new Set(["input", "default", "output", "group"]);
const BUILTIN_EDGE_TYPES = new Set(["default", "straight", "step", "smoothstep", "simplebezier", "bezier"]);

// ------------------------------------------------------------ text utils
// Strip // and /* */ comments while respecting string literals.
function stripComments(src) {
  let out = "";
  let i = 0;
  let state = null; // null | "'" | '"' | '`' | 'line' | 'block'
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1] || "";
    if (state === "line") { if (c === "\n") { state = null; out += c; } i += 1; continue; }
    if (state === "block") { if (c === "*" && next === "/") { state = null; i += 2; } else i += 1; continue; }
    if (state) {
      out += c;
      if (c === "\\") { out += next; i += 2; continue; }
      if (c === state) state = null;
      i += 1; continue;
    }
    if (c === "/" && next === "/") { state = "line"; i += 2; continue; }
    if (c === "/" && next === "*") { state = "block"; i += 2; continue; }
    if (c === "'" || c === '"' || c === "`") state = c;
    out += c;
    i += 1;
  }
  return out;
}

// Extract the balanced [...] or {...} starting at index `start` (which must
// point at the opening bracket), respecting strings. Returns { text, end }.
function extractBalanced(src, start) {
  const open = src[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let state = null;
  for (let i = start; i < src.length; i += 1) {
    const c = src[i];
    if (state) {
      if (c === "\\") { i += 1; continue; }
      if (c === state) state = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { state = c; continue; }
    if (c === open) depth += 1;
    else if (c === close) {
      depth -= 1;
      if (depth === 0) return { text: src.slice(start, i + 1), end: i + 1 };
    }
  }
  return null;
}

// Collect `const NAME = <literal>` declarations of one file (object,
// array or primitive literals) so that a spread `...NAME` or a value
// reference `NAME` to a LOCAL literal constant can be inlined
// mechanically (still pure data from the pinned sources, nothing
// invented). Maps name -> { inner } for objects (spread form) and
// name -> { text } for the value form.
function localObjectConstants(cleanSrc) {
  const constants = new Map();
  const re = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[^=;]{0,60})?=\s*(\{|\[|[-0-9"'`]|true|false|null)/g;
  let m;
  while ((m = re.exec(cleanSrc)) !== null) {
    const name = m[1];
    if (constants.has(name)) continue;
    const start = m.index + m[0].length - m[2].length;
    if (m[2] === "{" || m[2] === "[") {
      const extracted = extractBalanced(cleanSrc, start);
      if (!extracted) continue;
      if (!evalLiteral(extracted.text).ok) continue;
      if (m[2] === "{") constants.set(name, { inner: extracted.text.slice(1, -1).trim(), text: extracted.text });
      else constants.set(name, { text: extracted.text });
    } else {
      const rest = cleanSrc.slice(start, start + 80);
      const prim = /^('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|[-0-9.]+|true|false|null)/.exec(rest);
      if (prim) constants.set(name, { text: prim[1] });
    }
  }
  return constants;
}

// Replace value-position identifiers that name a local literal constant
// with the constant's literal text (string-aware; keys followed by `:`
// are left alone). Bounded passes for chained constants.
function substituteLocalConstants(text, constants) {
  let out = text;
  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;
    let result = "";
    let state = null;
    let i = 0;
    while (i < out.length) {
      const c = out[i];
      if (state) {
        result += c;
        if (c === "\\") { result += out[i + 1] || ""; i += 2; continue; }
        if (c === state) state = null;
        i += 1; continue;
      }
      if (c === "'" || c === '"' || c === "`") { state = c; result += c; i += 1; continue; }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i;
        while (j < out.length && /[\w$]/.test(out[j])) j += 1;
        const word = out.slice(i, j);
        let k = j;
        while (k < out.length && /\s/.test(out[k])) k += 1;
        const entry = constants.get(word);
        if (entry && entry.text && out[k] !== ":") {
          // Object shorthand `{ extent }` needs `extent: (<value>)`;
          // a plain value position takes `(<value>)`.
          let p = result.length - 1;
          while (p >= 0 && /\s/.test(result[p])) p -= 1;
          const shorthand = (result[p] === "{" || result[p] === ",") && (out[k] === "," || out[k] === "}");
          result += shorthand ? `${word}: (${entry.text})` : `(${entry.text})`;
          changed = true;
        }
        else result += word;
        i = j; continue;
      }
      result += c;
      i += 1;
    }
    out = result;
    if (!changed) break;
  }
  return out;
}

// A bracketed literal is mechanically extractable only when, after comment
// stripping and enum substitution, it contains no identifier other than
// true/false/null/undefined, no call and no template interpolation.
// `constants` optionally inlines spreads of local literal constants.
// Returns { ok, value?, offender? }.
function evalLiteral(rawText, constants = null) {
  let text = rawText;
  // Inline local literal constants first (spreads `...NAME` and value
  // references), THEN substitute the pinned enum constants, so enum
  // members carried by an inlined constant are substituted too.
  if (constants) {
    text = text.replace(/\.\.\.\s*([A-Za-z_$][\w$]*)/g, (all, name) => {
      const entry = constants.get(name);
      // Drop a trailing comma of the constant body: the use site usually
      // carries its own comma after the spread (`...nodeDefaults,`).
      return entry && entry.inner !== undefined ? entry.inner.replace(/,\s*$/, "") : all;
    });
    text = substituteLocalConstants(text, constants);
  }
  for (const [name, value] of Object.entries(ENUM_CONSTANTS)) {
    text = text.split(name).join(value);
  }
  // JSX inside the data (e.g. a React element as a node label) is
  // application code, not a pure data literal.
  if (/<(>|strong|div|span|p|button|em|b|i)[\s>]/.test(text)) {
    return { ok: false, offender: "JSX element in the graph data (application code, not pure data)" };
  }
  text = text.replace(/\bas\s+(const|[A-Za-z_$][\w$]*(<[^>]*>)?(\[\])?)/g, "");
  // Find the first offending identifier outside strings. An identifier
  // immediately followed by `:` is an object KEY (plain data); an
  // identifier in value position is a variable reference (not literal).
  let state = null;
  let word = "";
  let wordEnd = -1;
  const flush = () => {
    if (!word) return null;
    const w = word;
    word = "";
    if (["true", "false", "null", "undefined"].includes(w)) return null;
    let j = wordEnd;
    while (j < text.length && /\s/.test(text[j])) j += 1;
    if (text[j] === ":") return null; // object key
    return w;
  };
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (state) {
      if (c === "\\") { i += 1; continue; }
      if (state === "`" && c === "$" && text[i + 1] === "{") return { ok: false, offender: "template interpolation ${...}" };
      if (c === state) state = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { const bad = flush(); if (bad) return { ok: false, offender: bad }; state = c; continue; }
    if (/[A-Za-z_$]/.test(c)) { if (!word) wordEnd = i; word += c; wordEnd = i + 1; continue; }
    if (/[0-9]/.test(c) && word) { word += c; wordEnd = i + 1; continue; }
    const bad = flush();
    if (bad) return { ok: false, offender: bad };
  }
  const bad = flush();
  if (bad) return { ok: false, offender: bad };
  try {
    // Literal-only text (validated above): no identifiers, no calls.
    const value = new Function(`return (${text});`)();
    return { ok: true, value };
  } catch (err) {
    if (process.env.RE_XYFLOW_DEBUG) console.error("UNPARSEABLE:", JSON.stringify(text.slice(0, 400)));
    return { ok: false, offender: `unparseable literal (${String(err.message || err).slice(0, 60)})` };
  }
}

// Keep only JSON-serialisable plain data (drop functions/components).
function plainData(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (depth > 4) return undefined;
  if (Array.isArray(value)) return value.map((v) => plainData(v, depth + 1)).filter((v) => v !== undefined);
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const pv = plainData(v, depth + 1);
      if (pv !== undefined) out[k] = pv;
    }
    return out;
  }
  return undefined;
}

function listSourceFiles(dir) {
  const out = [];
  const walk = (d, depth) => {
    if (depth > 3 || !fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) { if (entry.name !== "node_modules") walk(full, depth + 1); }
      else if (/\.(tsx?|svelte|jsx?)$/.test(entry.name)) out.push(full);
    }
  };
  walk(dir, 0);
  return out;
}

// Find every array-literal candidate in a file, with the 90 characters of
// context before it (variable name / hook call) for classification.
function arrayCandidates(src, file) {
  const clean = stripComments(src);
  const constants = localObjectConstants(clean);
  const candidates = [];
  const re = /([A-Za-z_$][\w$]*(?:\s*:\s*[^=;]{0,60})?\s*=\s*|useNodesState\s*(?:<[^>]*>)?\(\s*|useEdgesState\s*(?:<[^>]*>)?\(\s*|useState\s*(?:<[^>]*>)?\(\s*|\$state(?:\.raw)?\s*(?:<[^>]*>)?\(\s*|defaultNodes\s*[:=]\s*\{?\s*|defaultEdges\s*[:=]\s*\{?\s*|nodes\s*[:=]\s*|edges\s*[:=]\s*)/g;
  let m;
  while ((m = re.exec(clean)) !== null) {
    // Search the opening bracket AFTER the matched prefix (the prefix may
    // itself contain `Node[]` type brackets that are not the array).
    let bracketAt = m.index + m[0].length;
    while (bracketAt < clean.length && /\s/.test(clean[bracketAt])) bracketAt += 1;
    if (clean[bracketAt] !== "[") continue;
    const extracted = extractBalanced(clean, bracketAt);
    if (!extracted) continue;
    candidates.push({ context: m[1], text: extracted.text, file, constants });
    re.lastIndex = Math.max(re.lastIndex, extracted.end);
  }
  return candidates;
}

function isNodeLike(v) {
  return v && typeof v === "object" && "id" in v && v.position && typeof v.position === "object"
    && typeof v.position.x === "number" && typeof v.position.y === "number";
}
function isEdgeLike(v) {
  return v && typeof v === "object" && "source" in v && "target" in v;
}

function sanitiseNode(n) {
  const out = { id: String(n.id), type: typeof n.type === "string" ? n.type : "default", position: { x: n.position.x, y: n.position.y } };
  const data = plainData(n.data || {});
  out.data = data && typeof data === "object" ? data : {};
  for (const f of ["parentId", "extent", "origin", "expandParent", "hidden", "selected", "draggable", "selectable", "deletable", "width", "height", "initialWidth", "initialHeight", "className", "sourcePosition", "targetPosition", "zIndex", "dragHandle"]) {
    const v = plainData(n[f]);
    if (v !== undefined) out[f] = v;
  }
  const style = plainData(n.style);
  if (style && typeof style === "object" && Object.keys(style).length) out.style = style;
  return out;
}

function sanitiseEdge(e, usedIds) {
  let id = e.id !== undefined && e.id !== null ? String(e.id) : `${e.source}->${e.target}`;
  if (usedIds.has(id)) id = `${id}#${usedIds.size}`;
  usedIds.add(id);
  const out = { id, source: String(e.source), target: String(e.target) };
  for (const f of ["sourceHandle", "targetHandle", "type", "animated", "hidden", "selected", "deletable", "selectable", "zIndex", "reconnectable"]) {
    const v = plainData(e[f]);
    if (v !== undefined && v !== null) out[f] = v;
  }
  if (typeof e.label === "string") out.label = e.label;
  for (const f of ["markerEnd", "markerStart"]) {
    const v = plainData(e[f]);
    if (v !== undefined) out[f] = v;
  }
  const style = plainData(e.style);
  if (style && typeof style === "object" && Object.keys(style).length) out.style = style;
  return out;
}

function extractFlowOptions(files) {
  const options = {};
  let viewport = null;
  for (const file of files) {
    const clean = stripComments(fs.readFileSync(file, "utf8"));
    const dv = /defaultViewport\s*(?:=\s*(?:\{[^}]*\})?|:\s*)/.exec(clean);
    if (dv) {
      const braceAt = clean.indexOf("{", dv.index);
      if (braceAt !== -1) {
        const extracted = extractBalanced(clean, braceAt);
        if (extracted) {
          const r = evalLiteral(extracted.text);
          if (r.ok && r.value && typeof r.value.x === "number") viewport = { x: r.value.x, y: r.value.y || 0, zoom: r.value.zoom ?? 1 };
        }
      }
    }
    const minZ = /minZoom\s*[:={]\s*([0-9.]+)/.exec(clean);
    const maxZ = /maxZoom\s*[:={]\s*([0-9.]+)/.exec(clean);
    if (minZ) options.minZoom = Number(minZ[1]);
    if (maxZ) options.maxZoom = Number(maxZ[1]);
    if (viewport && (options.minZoom !== undefined || options.maxZoom !== undefined)) break;
  }
  return { viewport, options };
}

// One level of relative-import resolution: an example may import its
// initial graph from a sibling module (e.g. `../CancelConnection/data`).
function withRelativeImports(files) {
  const out = [...files];
  const seen = new Set(out);
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    const re = /(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\s*['"](\.[^'"]+)['"]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const spec = m[1] || m[2];
      const base = path.resolve(path.dirname(file), spec);
      const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.svelte`,
        path.join(base, "index.ts"), path.join(base, "index.tsx"), path.join(base, "index.js")];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && !seen.has(candidate)) {
          seen.add(candidate);
          out.push(candidate);
        }
      }
    }
  }
  return out;
}

function extractExample(entry) {
  const relSource = String(entry.source || "").replace(/:\d+$/, "");
  const absSource = path.join(REPO_ROOT, relSource);
  const dir = path.dirname(absSource);
  if (!fs.existsSync(absSource)) return { ok: false, cause: `pinned example source missing: ${relSource}` };
  const files = withRelativeImports(listSourceFiles(dir));
  if (!files.length) return { ok: false, cause: `no source files under ${path.relative(REPO_ROOT, dir)}` };
  let bestNodes = null;
  let bestEdges = null;
  let emptyNodes = null;
  const offenders = [];
  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    for (const cand of arrayCandidates(src, file)) {
      const wantsNodes = /node/i.test(cand.context);
      const wantsEdges = /edge/i.test(cand.context);
      const r = evalLiteral(cand.text, cand.constants);
      if (!r.ok) {
        offenders.push(`${path.basename(file)}: non-literal ${r.offender}`);
        continue;
      }
      if (!Array.isArray(r.value)) continue;
      // An explicitly empty initial graph (e.g. the `empty` example) is a
      // real extraction: the named example starts with no nodes at all.
      if (r.value.length === 0) {
        if (wantsNodes && !emptyNodes) emptyNodes = { value: [], file, context: cand.context };
        continue;
      }
      if (r.value.every(isNodeLike) && (!bestNodes || r.value.length > bestNodes.value.length)) {
        bestNodes = { value: r.value, file, context: cand.context };
      } else if (r.value.every(isEdgeLike) && (!bestEdges || r.value.length > bestEdges.value.length)) {
        bestEdges = { value: r.value, file, context: cand.context };
      }
    }
  }
  if (!bestNodes && emptyNodes) bestNodes = emptyNodes;
  if (!bestNodes) {
    const cause = offenders.length
      ? `initial graph is not a pure data literal (${offenders[0]})`
      : "no initial nodes array literal found in the example sources (graph is computed, imported, or built by interaction callbacks)";
    return { ok: false, cause };
  }
  const usedIds = new Set();
  const nodes = bestNodes.value.map(sanitiseNode);
  const edges = bestEdges ? bestEdges.value.map((e) => sanitiseEdge(e, usedIds)) : [];
  const { viewport, options } = extractFlowOptions(files);
  return { ok: true, nodes, edges, viewport: viewport || { x: 0, y: 0, zoom: 1 }, flowOptions: options, sourceFile: path.relative(REPO_ROOT, bestNodes.file) };
}

// ------------------------------------------------------------------ main
const fixtureDir = path.join(HERE, "fixtures", "xyflow");
const scenarioDir = path.join(HERE, "fixtures", "scenarios");
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(scenarioDir, { recursive: true });

const written = new Set();
let extractedCount = 0;
let unknownCount = 0;
for (const entry of examples) {
  const slug = entry.id.replace(/^examples\./, "");
  const fixtureFile = `xyflow/${slug}.json`;
  const result = extractExample(entry);
  const fixture = {
    schemaVersion: 1,
    id: `xyflow-${slug}`,
    library: "xyflow",
    kind: "xyflow-graph",
    title: `xyflow example fixture for ${entry.id}`,
    model: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    viewport: { x: 0, y: 0, zoom: 1 },
    pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 },
  };
  let opsFile = null;
  if (result.ok) {
    extractedCount += 1;
    const customTypes = [
      ...new Set([
        ...result.nodes.map((n) => n.type).filter((t) => !BUILTIN_NODE_TYPES.has(t)),
        ...result.edges.map((e) => e.type).filter((t) => t && !BUILTIN_EDGE_TYPES.has(t)),
      ]),
    ].sort();
    fixture.model = { nodes: result.nodes, edges: result.edges, viewport: result.viewport };
    if (Object.keys(result.flowOptions).length) fixture.model.flowOptions = result.flowOptions;
    fixture.viewport = result.viewport;
    fixture.extraction = { status: "extracted", source: result.sourceFile };
    if (customTypes.length) fixture.extraction.customTypes = customTypes;
    // One representative operation script (drag, then connect) when the
    // graph supports it.
    const steps = [];
    const sortedNodes = [...result.nodes].sort((a, b) => a.id.localeCompare(b.id));
    if (sortedNodes.length >= 1) {
      const first = sortedNodes[0];
      steps.push({ op: "move", elementId: first.id, x: first.position.x + 40, y: first.position.y + 30 });
    }
    if (sortedNodes.length >= 2) {
      const connected = new Set(result.edges.map((e) => `${e.source}->${e.target}`));
      let pair = null;
      for (const a of sortedNodes) {
        for (const b of sortedNodes) {
          if (a.id !== b.id && !connected.has(`${a.id}->${b.id}`) && !connected.has(`${b.id}->${a.id}`)) { pair = [a, b]; break; }
        }
        if (pair) break;
      }
      if (pair) steps.push({ op: "connect", elementId: "xe1", sourceId: pair[0].id, targetId: pair[1].id });
    }
    if (steps.length) {
      opsFile = `xyflow/${slug}.ops.json`;
      fs.writeFileSync(path.join(HERE, "fixtures", opsFile), `${JSON.stringify({ schemaVersion: 1, id: `xyflow-${slug}-ops`, steps }, null, 2)}\n`);
      written.add(opsFile);
    }
  } else {
    unknownCount += 1;
    fixture.extraction = { status: "unknown", cause: result.cause, source: String(entry.source || "").replace(/:\d+$/, "") };
  }
  fs.writeFileSync(path.join(HERE, "fixtures", fixtureFile), `${JSON.stringify(fixture, null, 2)}\n`);
  written.add(fixtureFile);
  const scenario = {
    schemaVersion: 1,
    id: `xyflow-${slug}-selfparity`,
    library: "xyflow",
    fixtures: [fixtureFile],
    ...(opsFile ? { ops: opsFile } : {}),
    exercises: [entry.id],
    comparators: ["model", "events", "geometry", "pixels"],
  };
  const scenarioFile = `xyflow-${slug}.json`;
  fs.writeFileSync(path.join(scenarioDir, scenarioFile), `${JSON.stringify(scenario)}\n`);
  written.add(`scenarios/${scenarioFile}`);
  console.log(`${result.ok ? "EXTRACTED" : "UNKNOWN  "} ${slug}${result.ok ? ` nodes=${result.nodes.length} edges=${result.edges.length}` : ` cause=${result.cause}`}`);
}

// Remove stale generated files that no inventory entry produces anymore.
for (const dir of [fixtureDir, scenarioDir]) {
  for (const name of fs.readdirSync(dir)) {
    const rel = dir === fixtureDir ? `xyflow/${name}` : `scenarios/${name}`;
    const isGenerated = dir === fixtureDir ? name.endsWith(".json") : name.startsWith("xyflow-");
    if (isGenerated && !written.has(rel) && !written.has(`xyflow/${name}`)) {
      fs.unlinkSync(path.join(dir, name));
      console.log(`removed stale ${rel}`);
    }
  }
}
console.log(`xyflow fixtures generated: ${examples.length} (extracted=${extractedCount} unknown=${unknownCount})`);
