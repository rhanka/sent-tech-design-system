/**
 * Reproducible measurements for the PriorityMatrix label placement.
 *
 * Every figure the documentation page states comes from this file, so a reader
 * can re-derive it: `node packages/dataviz-core/bench/priority-matrix-measure.mjs`
 * (after `npm run build -w @sentropic/dataviz-core`).
 *
 * It mirrors the geometry the four framework components use — margins, the
 * two-line box model of `splitLabel`, and the obstacle set built from the
 * threshold bands plus the four quadrant names. See
 * packages/components-react/src/PriorityMatrix.tsx (MARGIN, splitLabel,
 * buildMatrixObstacles, the placePriorityLabels call). If that geometry
 * changes, this harness has to change with it, and the page's numbers with it.
 *
 * Dense sets are generated from a named seed so the same run gives the same
 * sets everywhere; the reference set is the one the documentation page renders.
 */

import { placePriorityLabels } from "../dist/index.js";

const MARGIN = { top: 26, right: 18, bottom: 36, left: 48 };
const QUADRANT_NAMES = ["Gains rapides", "Projets majeurs", "Attendre", "Ne pas faire"];
const ANCHOR_RADIUS = 5;

const REFERENCE = [
  { x: 18, y: 82, label: "Auth SSO" },
  { x: 20, y: 80, label: "SSO SAML" },
  { x: 22, y: 79, label: "MFA" },
  { x: 68, y: 72, label: "Exports CSV" },
  { x: 70, y: 70, label: "Export PDF" },
  { x: 71, y: 69, label: "API webhooks" },
  { x: 30, y: 30, label: "Thème sombre" },
  { x: 32, y: 28, label: "Mode offline" },
  { x: 85, y: 15, label: "Chat temps réel" },
  { x: 15, y: 25, label: "Audit logs" },
  { x: 55, y: 55, label: "SSO SCIM" },
  { x: 90, y: 85, label: "IA résumés" },
  { x: 50, y: 50, label: "SSO rôles" },
];

/** Same generator family as the placement itself, so the sets are portable. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORDS = ["Auth", "Export", "Chat", "Audit", "Mode", "Thème", "API", "SSO", "Batch", "Index", "Cache", "Rapport", "Webhook", "Import", "Facturation"];

function denseSet(n, seed = 42) {
  const random = mulberry32(seed);
  const set = [];
  for (let i = 0; i < n; i += 1) {
    const words = 1 + Math.floor(random() * 3);
    const label = Array.from({ length: words }, () => WORDS[Math.floor(random() * WORDS.length)]).join(" ");
    set.push({ x: Math.round(random() * 100), y: Math.round(random() * 100), label });
  }
  return set;
}

function splitLabel(value) {
  const chars = [...value];
  if (chars.length <= 12) return [value];
  const mid = Math.ceil(chars.length / 2);
  const space = value.lastIndexOf(" ", mid + 4);
  if (space > 2 && space < value.length - 2) return [value.slice(0, space), value.slice(space + 1)];
  return [value.slice(0, mid), value.slice(mid)];
}

function componentBoxes(data) {
  return data.map((d) => {
    const lines = splitLabel(d.label);
    const longest = Math.max(...lines.map((l) => [...l].length));
    return { w: Math.min(120, 12 + 7 * longest), h: lines.length > 1 ? 34 : 20, lines };
  });
}

function geometry(width, height) {
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
  const scaleX = (v) => MARGIN.left + (Math.min(Math.max(v, 0), 100) / 100) * plotWidth;
  const scaleY = (v) => MARGIN.top + (1 - Math.min(Math.max(v, 0), 100) / 100) * plotHeight;
  return { width, height, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth, plotHeight, scaleX, scaleY };
}

function buildObstacles(g, xThreshold, yThreshold) {
  const tx = g.scaleX(xThreshold);
  const ty = g.scaleY(yThreshold);
  const names = [
    { x: MARGIN.left + 6, y: MARGIN.top + 14, anchor: "start", text: QUADRANT_NAMES[0] },
    { x: MARGIN.left + g.plotWidth - 6, y: MARGIN.top + 14, anchor: "end", text: QUADRANT_NAMES[1] },
    { x: MARGIN.left + 6, y: MARGIN.top + g.plotHeight - 8, anchor: "start", text: QUADRANT_NAMES[2] },
    { x: MARGIN.left + g.plotWidth - 6, y: MARGIN.top + g.plotHeight - 8, anchor: "end", text: QUADRANT_NAMES[3] },
  ];
  const bands = [
    { x: tx - 3, y: MARGIN.top, w: 6, h: g.plotHeight },
    { x: MARGIN.left, y: ty - 3, w: g.plotWidth, h: 6 },
  ];
  const nameRects = names.map((q) => {
    const w = [...q.text].length * 6.5 + 4;
    return { x: q.anchor === "start" ? q.x : q.x - w, y: q.y - 9, w, h: 12 };
  });
  return { obstacles: [...bands, ...nameRects], bands, nameRects };
}

const overlapArea = (a, b) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

function measure(data, { width = 640, height = 400, xThreshold = 50, yThreshold = 50 } = {}) {
  const g = geometry(width, height);
  const boxes = componentBoxes(data);
  const { obstacles, bands, nameRects } = buildObstacles(g, xThreshold, yThreshold);
  const frame = { width, height, marginLeft: MARGIN.left, marginTop: MARGIN.top, plotWidth: g.plotWidth, plotHeight: g.plotHeight };
  const started = process.hrtime.bigint();
  const placed = placePriorityLabels(data, boxes, frame, { xThreshold, yThreshold, obstacles });
  const ms = Number(process.hrtime.bigint() - started) / 1e6;

  const rects = placed.map((p, i) => ({ x: p.x, y: p.y, w: boxes[i].w, h: boxes[i].h }));
  let boxOverlaps = 0;
  for (let i = 0; i < rects.length; i += 1)
    for (let j = i + 1; j < rects.length; j += 1) if (overlapArea(rects[i], rects[j]) > 0) boxOverlaps += 1;

  const anchors = data.map((d) => ({
    x: g.scaleX(d.x) - ANCHOR_RADIUS,
    y: g.scaleY(d.y) - ANCHOR_RADIUS,
    w: ANCHOR_RADIUS * 2,
    h: ANCHOR_RADIUS * 2,
  }));
  const covered = anchors.filter((a) => rects.some((r) => overlapArea(a, r) > 0)).length;
  const maskedBands = bands.filter((b) => rects.some((r) => overlapArea(b, r) > 0)).length;
  const maskedNames = nameRects.filter((b) => rects.some((r) => overlapArea(b, r) > 0)).length;
  const outOfPlot = rects.filter(
    (r) =>
      r.x < MARGIN.left - 0.5 ||
      r.y < MARGIN.top - 0.5 ||
      r.x + r.w > MARGIN.left + g.plotWidth + 0.5 ||
      r.y + r.h > MARGIN.top + g.plotHeight + 0.5,
  ).length;
  const leaders = placed.reduce((sum, p, i) => {
    const cx = g.scaleX(data[i].x);
    const cy = g.scaleY(data[i].y);
    const box = rects[i];
    const nx = Math.min(Math.max(cx, box.x), box.x + box.w);
    const ny = Math.min(Math.max(cy, box.y), box.y + box.h);
    return sum + Math.hypot(nx - cx, ny - cy);
  }, 0);

  return { n: data.length, ms, boxOverlaps, covered, maskedBands, maskedNames, outOfPlot, leaders, placed };
}

const table = (rows) => rows.map((r) => r.join("\t")).join("\n");

console.log("# Quality by density (640x400, seed 42 for the dense sets)");
console.log(table([
  ["set", "n", "box/box", "covered", "masked bands/2", "masked names/4", "leaders px"],
  ...[["reference", REFERENCE], ["dense", denseSet(25)], ["dense", denseSet(40)]].map(([name, set]) => {
    const m = measure(set);
    return [name, m.n, m.boxOverlaps, `${m.covered}/${m.n}`, m.maskedBands, m.maskedNames, m.leaders.toFixed(1)];
  }),
]));

console.log("\n# Cost by size (dense sets, seed 42)");
console.log(table([
  ["n", "iterations", "ms", "box/box", "covered"],
  ...[13, 30, 50, 80, 100].map((n) => {
    const m = measure(denseSet(n));
    return [n, Math.max(1500, n * 120), m.ms.toFixed(1), m.boxOverlaps, `${m.covered}/${n}`];
  }),
]));

console.log("\n# Frame floor (reference set)");
console.log(table([
  ["frame", "box/box", "covered", "out of plot", "leaders px"],
  ...[[640, 400], [480, 300], [400, 250], [320, 200], [200, 140], [120, 90]].map(([w, h]) => {
    const m = measure(REFERENCE, { width: w, height: h });
    return [`${w}x${h}`, m.boxOverlaps, `${m.covered}/${m.n}`, m.outOfPlot, m.leaders.toFixed(1)];
  }),
]));

console.log("\n# Input-order sensitivity (reference set, component geometry with obstacles)");
{
  const forward = measure(REFERENCE);
  const reversed = measure([...REFERENCE].reverse());
  const back = reversed.placed.slice().reverse();
  let moved = 0;
  let maxShift = 0;
  for (let i = 0; i < forward.placed.length; i += 1) {
    const shift = Math.hypot(forward.placed[i].x - back[i].x, forward.placed[i].y - back[i].y);
    if (shift > 0.5) moved += 1;
    maxShift = Math.max(maxShift, shift);
  }
  console.log(table([
    ["moved", "max shift px", "leaders forward px", "leaders reversed px"],
    [`${moved}/${forward.n}`, maxShift.toFixed(1), forward.leaders.toFixed(1), reversed.leaders.toFixed(1)],
  ]));
}

console.log("\n# Determinism (reference set)");
{
  const a = JSON.stringify(measure(REFERENCE).placed);
  const b = JSON.stringify(measure(REFERENCE).placed);
  console.log(`two runs in this process: ${a === b ? "identical" : "DIFFERENT"}`);
}
