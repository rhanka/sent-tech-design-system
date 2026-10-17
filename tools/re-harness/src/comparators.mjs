// Comparators in the strength order of the three specs:
// SPEC_RE_BPMN_JS_PARITY.md §8.3, SPEC_RE_XYFLOW_PARITY.md §6,
// SPEC_RE_JOINTJS_PARITY.md §5.3. What cannot be compared is `unknown`,
// never asserted (task L0 clause 3).
import { canonicalise, diffValues } from "./canonical.mjs";

// Float tolerance for DI geometry in model JSON (bpmn §8.3 point 1).
export const MODEL_FLOAT_TOLERANCE = 1e-6;
// Geometry tolerance in CSS pixels (bpmn §8.4, joint §5.3 residual rule).
export const GEOMETRY_TOLERANCE_PX = 1;

export function compareModel(left, right) {
  const diffs = diffValues(canonicalise(left), canonicalise(right), { floatTolerance: MODEL_FLOAT_TOLERANCE });
  return diffs.length === 0
    ? { verdict: "pass", detail: "canonical models equal (sorted keys, DI floats at 1e-6)" }
    : { verdict: "fail", detail: diffs.slice(0, 8).join("; ") };
}

// Event log: ordered names + payload keys; values compared only after the
// declared id-correspondence remaps them (bpmn §8.3 point 2).
export function compareEvents(left, right, idCorrespondence = {}) {
  const remap = (v) => (typeof v === "string" && idCorrespondence[v] ? idCorrespondence[v] : v);
  const normalise = (log) => (log || []).map((e) => ({
    name: e.name,
    keys: Object.keys(e.payload || {}).sort(),
    values: Object.fromEntries(Object.entries(e.payload || {}).map(([k, v]) => [k, remap(v)])),
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

// Geometry: bounds, waypoints, viewbox at ±1 CSS px. Text metrics are
// excluded until the font-metric decision is taken (bpmn §8.4) -> unknown.
export function compareGeometry(left, right) {
  if (!left || !right) return { verdict: "unknown", detail: "geometry missing on one side" };
  const diffs = [];
  const checkPoint = (p, q, label) => {
    if (Math.abs(p.x - q.x) > GEOMETRY_TOLERANCE_PX || Math.abs(p.y - q.y) > GEOMETRY_TOLERANCE_PX) {
      diffs.push(`${label}: (${p.x},${p.y}) !== (${q.x},${q.y}) beyond 1px`);
    }
  };
  const lb = left.bounds || {}; const rb = right.bounds || {};
  for (const id of new Set([...Object.keys(lb), ...Object.keys(rb)])) {
    if (!lb[id] || !rb[id]) { diffs.push(`bounds.${id}: missing on one side`); continue; }
    for (const f of ["x", "y", "width", "height"]) {
      if (Math.abs(lb[id][f] - rb[id][f]) > GEOMETRY_TOLERANCE_PX) diffs.push(`bounds.${id}.${f}: ${lb[id][f]} !== ${rb[id][f]} beyond 1px`);
    }
  }
  const lw = left.waypoints || {}; const rw = right.waypoints || {};
  for (const id of new Set([...Object.keys(lw), ...Object.keys(rw)])) {
    const a = lw[id] || []; const b = rw[id] || [];
    if (a.length !== b.length) { diffs.push(`waypoints.${id}: count ${a.length} !== ${b.length}`); continue; }
    a.forEach((p, i) => checkPoint(p, b[i], `waypoints.${id}[${i}]`));
  }
  if (left.viewbox && right.viewbox) {
    for (const f of ["x", "y", "width", "height"]) {
      if (Math.abs(left.viewbox[f] - right.viewbox[f]) > GEOMETRY_TOLERANCE_PX) diffs.push(`viewbox.${f} beyond 1px`);
    }
  }
  if (diffs.length) return { verdict: "fail", detail: diffs.slice(0, 8).join("; ") };
  return { verdict: "pass", detail: "bounds/waypoints/viewbox within 1 CSS px; textMetrics=unknown (excluded, font decision pending)" };
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
