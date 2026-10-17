// Comparators in the strength order of the three specs:
// SPEC_RE_BPMN_JS_PARITY.md §8.3, SPEC_RE_XYFLOW_PARITY.md §6,
// SPEC_RE_JOINTJS_PARITY.md §5.3. What cannot be compared is `unknown`,
// never asserted (task L0 clause 3).
import { canonicalise, diffValues } from "./canonical.mjs";

// Float tolerance for DI geometry in model JSON (bpmn §8.3 point 1) and for
// final-state / viewport / SVG-path comparison (xyflow §6, C5).
export const MODEL_FLOAT_TOLERANCE = 1e-6;
// Geometry tolerance in CSS pixels (bpmn §8.4, joint §5.3 residual rule).
export const GEOMETRY_TOLERANCE_PX = 1;
// Rendered-geometry tolerance for xyflow (SPEC_RE_XYFLOW_PARITY §6: 0.5 px).
export const XYFLOW_GEOMETRY_TOLERANCE_PX = 0.5;

// Per-function rounding applied BEFORE comparison (SPEC_RE_JOINTJS_PARITY
// §5.3 / §6 Lot 0: "comparators of §5.3 with per-function rounding", then a
// 1e-6 residual). Keyed by geometry family; the value is the number of
// decimals kept (null = no rounding). The table is the normative §5.3
// list; jointFamilies (harness.mjs) emits routers.* / connectors.* from
// link cells only. pinRelative and layout.ports are not emitted today: no
// fixture uses a pin-relative connection strategy or port layouts, and port
// geometry is not extracted (not covered at L0).
export const ROUNDING_BY_FAMILY = {
  "connectors.straight": 1,
  "routers.manhattan": 1,
  "connectors.curve": 3,
  pinRelative: 3,
  "routers.metro": 0,
  "layout.ports": 0,
};

export function roundForFamily(value, family) {
  const decimals = ROUNDING_BY_FAMILY[family];
  if (decimals === undefined || decimals === null || typeof value !== "number") return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// An id-correspondence is usable only as a bijection: two distinct source
// ids mapped onto one target would merge distinct elements and mask a
// divergence (C6). Returns a list of problems (empty = valid bijection).
export function correspondenceProblems(correspondence = {}) {
  const problems = [];
  const targets = new Map();
  for (const [from, to] of Object.entries(correspondence || {})) {
    if (typeof to !== "string" || !to) problems.push(`idCorrespondence.${from}: target is not a non-empty string`);
    else if (targets.has(to)) problems.push(`idCorrespondence: ${targets.get(to)} and ${from} both map to ${to} (not a bijection)`);
    else targets.set(to, from);
  }
  return problems;
}

// Recursively remap every string value/key through the correspondence.
export function remapDeep(value, correspondence = {}) {
  if (!correspondence || Object.keys(correspondence).length === 0) return value;
  if (typeof value === "string") return correspondence[value] || value;
  if (Array.isArray(value)) return value.map((v) => remapDeep(v, correspondence));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[correspondence[k] || k] = remapDeep(v, correspondence);
    return out;
  }
  return value;
}

export function compareModel(left, right) {
  const diffs = diffValues(canonicalise(left), canonicalise(right), { floatTolerance: MODEL_FLOAT_TOLERANCE });
  return diffs.length === 0
    ? { verdict: "pass", detail: "canonical models equal (sorted keys, floats at 1e-6)" }
    : { verdict: "fail", detail: diffs.slice(0, 8).join("; ") };
}

// Event log: ordered names + payload keys; values compared only after the
// declared id-correspondence remaps them (bpmn §8.3 point 2). The
// correspondence must be a bijection (C6).
export function compareEvents(left, right, idCorrespondence = {}) {
  const problems = correspondenceProblems(idCorrespondence);
  if (problems.length) return { verdict: "fail", detail: problems[0] };
  const normalise = (log) => (log || []).map((e) => ({
    name: e.name,
    keys: Object.keys(e.payload || {}).sort(),
    values: remapDeep(e.payload || {}, idCorrespondence),
  }));
  const a = normalise(left); const b = normalise(right);
  if (a.length !== b.length) return { verdict: "fail", detail: `event count ${a.length} !== ${b.length}` };
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].name !== b[i].name) return { verdict: "fail", detail: `event[${i}] name ${a[i].name} !== ${b[i].name}` };
    if (JSON.stringify(a[i].keys) !== JSON.stringify(b[i].keys)) {
      return { verdict: "fail", detail: `event[${i}] ${a[i].name} payload keys ${a[i].keys} !== ${b[i].keys}` };
    }
    const valueDiffs = diffValues(a[i].values, b[i].values, { floatTolerance: MODEL_FLOAT_TOLERANCE });
    if (valueDiffs.length) return { verdict: "fail", detail: `event[${i}] ${a[i].name} ${valueDiffs[0]}` };
  }
  return { verdict: "pass", detail: `${a.length} events equal (names, payload keys, remapped values)` };
}

// Parse an SVG path `d` string into [command, ...numbers] pairs. Only the
// absolute commands xyflow/bpmn emit (M/L/C/Q/Z plus H/V normalised by the
// caller libraries) are needed for the numeric comparison at 1e-6.
export function parseSvgPath(d) {
  if (typeof d !== "string") return null;
  const tokens = d.match(/[MLCQZSTAHVmlcqzstahv]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  const out = [];
  let current = null;
  for (const tok of tokens) {
    if (/^[A-Za-z]$/.test(tok)) { current = [tok]; out.push(current); }
    else if (current) current.push(Number(tok));
  }
  return out;
}

// Geometry: bounds, waypoints, viewbox, DOM bounds and rendered edge paths.
// A side missing on one side only is a FAILURE, never silently equal (C5).
// Text metrics are excluded until the font-metric decision is taken
// (bpmn §8.4) -> reported in the detail, not compared.
export function compareGeometry(left, right, options = {}) {
  if (!left || !right) return { verdict: "fail", detail: "geometry missing on one side" };
  const tolerancePx = options.tolerancePx ?? GEOMETRY_TOLERANCE_PX;
  // Per-function rounding applies per link (familyById, JointJS §5.3);
  // without a declared family the residual 1e-6 applies to raw values.
  const familyById = options.familyById || {};
  const diffs = [];
  const checkBoundsMap = (lmap, rmap, label) => {
    const l = lmap || {}; const r = rmap || {};
    for (const id of new Set([...Object.keys(l), ...Object.keys(r)])) {
      if (!l[id] || !r[id]) { diffs.push(`${label}.${id}: missing on one side`); continue; }
      for (const f of ["x", "y", "width", "height"]) {
        if (Math.abs(l[id][f] - r[id][f]) > tolerancePx) diffs.push(`${label}.${id}.${f}: ${l[id][f]} !== ${r[id][f]} beyond ${tolerancePx}px`);
      }
    }
  };
  checkBoundsMap(left.bounds, right.bounds, "bounds");
  // DOM bounds are part of the rendered geometry whenever either side has them.
  if (left.domBounds !== undefined || right.domBounds !== undefined) {
    if (!left.domBounds || !right.domBounds) diffs.push("domBounds: missing on one side");
    else checkBoundsMap(left.domBounds, right.domBounds, "domBounds");
  }
  const lw = left.waypoints || {}; const rw = right.waypoints || {};
  for (const id of new Set([...Object.keys(lw), ...Object.keys(rw)])) {
    const a = lw[id] || []; const b = rw[id] || [];
    if (a.length !== b.length) { diffs.push(`waypoints.${id}: count ${a.length} !== ${b.length}`); continue; }
    const family = familyById[id] || null;
    a.forEach((p, i) => {
      const ax = roundForFamily(p.x, family); const ay = roundForFamily(p.y, family);
      const bx = roundForFamily(b[i].x, family); const by = roundForFamily(b[i].y, family);
      if (Math.abs(ax - bx) > MODEL_FLOAT_TOLERANCE || Math.abs(ay - by) > MODEL_FLOAT_TOLERANCE) {
        diffs.push(`waypoints.${id}[${i}]: (${ax},${ay}) !== (${bx},${by}) beyond 1e-6${family ? ` after ${family} rounding` : ""}`);
      }
    });
  }
  // Rendered edge paths (SVG `d`), compared numerically at 1e-6 (xyflow §6).
  if (left.edgePaths !== undefined || right.edgePaths !== undefined) {
    if (!left.edgePaths || !right.edgePaths) diffs.push("edgePaths: missing on one side");
    else {
      for (const id of new Set([...Object.keys(left.edgePaths), ...Object.keys(right.edgePaths)])) {
        const pa = parseSvgPath(left.edgePaths[id]); const pb = parseSvgPath(right.edgePaths[id]);
        if (!pa || !pb) { diffs.push(`edgePaths.${id}: missing on one side`); continue; }
        if (pa.length !== pb.length) { diffs.push(`edgePaths.${id}: ${pa.length} commands !== ${pb.length}`); continue; }
        for (let i = 0; i < pa.length; i += 1) {
          if (pa[i][0] !== pb[i][0]) { diffs.push(`edgePaths.${id}[${i}]: command ${pa[i][0]} !== ${pb[i][0]}`); break; }
          const numsA = pa[i].slice(1); const numsB = pb[i].slice(1);
          if (numsA.length !== numsB.length || numsA.some((n, j) => Math.abs(n - numsB[j]) > MODEL_FLOAT_TOLERANCE)) {
            diffs.push(`edgePaths.${id}[${i}]: coordinates differ beyond 1e-6`);
            break;
          }
        }
      }
    }
  }
  // A viewbox present on one side only is a divergence (C5), not equality.
  if (Boolean(left.viewbox) !== Boolean(right.viewbox)) {
    diffs.push("viewbox: missing on one side");
  } else if (left.viewbox && right.viewbox) {
    const viewboxTolerance = options.viewboxTolerance ?? tolerancePx;
    for (const f of ["x", "y", "width", "height"]) {
      if (Math.abs(left.viewbox[f] - right.viewbox[f]) > viewboxTolerance) diffs.push(`viewbox.${f} beyond ${viewboxTolerance}`);
    }
  }
  if (diffs.length) return { verdict: "fail", detail: diffs.slice(0, 8).join("; ") };
  return { verdict: "pass", detail: `bounds/waypoints/viewbox/domBounds/edgePaths within tolerance (${tolerancePx}px, paths at 1e-6); textMetrics=unknown (excluded, font decision pending)` };
}

// Pixels: secondary signal only (bpmn §8.3 point 4, joint §5.3). Threshold is
// per-fixture (fixture.pixelThreshold). Missing pixels -> unknown, never pass.
export function comparePixels(left, right, threshold = {}) {
  if (!left || !right || !left.data || !right.data) return { verdict: "unknown", detail: "pixel buffer missing on one side" };
  if (left.width !== right.width || left.height !== right.height) {
    return { verdict: "fail", detail: `pixel size ${left.width}x${left.height} !== ${right.width}x${right.height}` };
  }
  const maxRatio = threshold.maxMismatchRatio ?? 0.01;
  const delta = threshold.perChannelDelta ?? 8;
  const a = left.data; const b = right.data;
  let mismatched = 0; const total = left.width * left.height;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > delta || Math.abs(a[i + 1] - b[i + 1]) > delta ||
        Math.abs(a[i + 2] - b[i + 2]) > delta || Math.abs(a[i + 3] - b[i + 3]) > delta) mismatched += 1;
  }
  const ratio = total ? mismatched / total : 0;
  return ratio <= maxRatio
    ? { verdict: "pass", detail: `pixel mismatch ratio ${ratio.toFixed(6)} <= ${maxRatio} (secondary signal)` }
    : { verdict: "fail", detail: `pixel mismatch ratio ${ratio.toFixed(6)} > ${maxRatio} (secondary signal)` };
}
