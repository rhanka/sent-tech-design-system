/**
 * Appendix E proof, independent of the layout engine and after.json.
 * Run: node tests/layout/dc2a/fill-feasibility.mjs
 * Its stdout is pinned verbatim in fill-feasibility.json and checked by L2.
 *
 * This is a bound under the prescribed P-1/P-3/P-4/O-2 and BF-6 algorithm,
 * not an unrestricted rectangle-packing bound. Enumerate BOTH forms at every
 * prefix limit, select their score optima, then freeze those shelves (BF-6).
 * Seat them at MINIMUM legal gaps, with fixed leaves, header chrome and the
 * measured path's U-channel reservation. Every pass-2 gap is in [24, 32];
 * with frozen shelves and fixed headers it can only increase the bbox area.
 * Therefore leafArea / minimumBboxArea is an optimistic upper bound.
 *
 * Sources: SPEC §§3.2–3.5, §4.2, Appendix D BF-1/BF-6; layout/measure.ts,
 * layout/measured.ts (sizeRun/sizeBox), scenes.ts (pinned text advances).
 * No fitted output, threshold adjustment or emitted geometry is an input.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const baseline = JSON.parse(readFileSync(new URL("./baseline.json", import.meta.url)));
const GAP = 24, GAP_CAP = 32, WIDTH = 460, HEIGHT = 200;
const INSET = 16, TOGGLE = 66, RULE_GAP = 4, RULE_TO_CHILD = 16, BOTTOM = 16;
const TARGET = 1.78, TALL_BIAS = 1.6, EMPTY_WEIGHT = 0.4, EPSILON = 1e-9;

/** Independent exhaustive P-1 enumeration; no import of pack.ts. */
function pack(boxes, chromeWidth, chromeHeight) {
  if (boxes.length === 0) return { width: 0, height: 0, rows: true, shelves: [], candidates: 0, score: 0 };
  const winners = [];
  let candidates = 0;
  for (const rows of [true, false]) {
    let limit = 0, winner;
    const seen = new Set();
    for (let prefix = 0; prefix < boxes.length; prefix += 1) {
      limit += (rows ? boxes[prefix].width : boxes[prefix].height) + (prefix ? GAP : 0);
      const shelves = [[]];
      let length = 0;
      boxes.forEach((box, index) => {
        const size = rows ? box.width : box.height;
        if (shelves.at(-1).length && length + GAP + size > limit + 0.5) { shelves.push([]); length = 0; }
        length += (shelves.at(-1).length ? GAP : 0) + size;
        shelves.at(-1).push(index);
      });
      const key = shelves.map((shelf) => shelf.length).join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      if (boxes.length >= 2 && (rows ? shelves.length === boxes.length : shelves.length === 1)) continue; // BF-1
      const lengths = shelves.map((shelf) => shelf.reduce((sum, i) => sum + (rows ? boxes[i].width : boxes[i].height), 0) + (shelf.length - 1) * GAP);
      const thicknesses = shelves.map((shelf) => Math.max(...shelf.map((i) => rows ? boxes[i].height : boxes[i].width)));
      const main = Math.max(...lengths), cross = thicknesses.reduce((a, b) => a + b, 0) + (shelves.length - 1) * GAP;
      const width = rows ? main : cross, height = rows ? cross : main;
      const ratio = (width + chromeWidth) / (height + chromeHeight) / TARGET;
      const slack = lengths.reduce((sum, value, i) => sum + (main - value) * thicknesses[i], 0);
      const score = boxes.length === 1 ? 0 : Math.abs(Math.log(ratio)) * (ratio < 1 ? TALL_BIAS : 1) + EMPTY_WEIGHT * slack / (width * height);
      const candidate = { width, height, rows, shelves, score };
      candidates += 1;
      if (!winner || score < winner.score - EPSILON || (Math.abs(score - winner.score) <= EPSILON && width > winner.width)) winner = candidate;
    }
    assert(winner, "positive fixed footprints must admit a candidate");
    winners.push(winner);
  }
  // O-2/O-3, no previous-orientation input for the acceptance measurements.
  return { ...(winners[1].score < winners[0].score - EPSILON ? winners[1] : winners[0]), candidates };
}

function labelSize(text) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ").filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= 40 || line === "") line = next; // EDGE_LABEL_WIDTH 400 / advance 10
    else { lines.push(line); line = word; }
  }
  lines.push(line);
  return { width: Math.max(...lines.map((value) => value.length)) * 10, height: lines.length * 22 };
}

function prove(view) {
  const byId = new Map(view.cards.map((card) => [card.id, card]));
  const project = (id) => {
    let card = byId.get(id), representative = card;
    assert(card, `unknown endpoint ${id}`);
    while (card.parentId !== null) {
      card = byId.get(card.parentId);
      assert(card, "unknown parent");
      if (card.folded) representative = card;
    }
    return representative;
  };
  const visible = view.cards.filter((card) => project(card.id) === card);
  const edges = view.edges.map((edge) => {
    const ends = view.view.relationOccurrences[`occurrence:e-${edge.id}`]?.endpoints;
    const end = (role) => project(ends?.find((e) => e.role === role)?.occurrence.replace(/^occurrence:o-/, "") ?? edge[role]);
    return { source: end("source"), target: end("target"), label: edge.label };
  }).filter((edge) => edge.source !== edge.target && edge.label !== null);
  const levels = [];
  const level = (id, children, chromeWidth, chromeHeight) => {
    const choice = pack(children.map(size), chromeWidth, chromeHeight);
    levels.push({ level: id, rows: choice.rows, shelves: choice.shelves.map((shelf) => shelf.map((i) => children[i].id)), candidates: choice.candidates, score: choice.score });
    return choice;
  };
  function size(card) {
    if (!card.container || card.folded) return { width: WIDTH, height: HEIGHT };
    const children = visible.filter((child) => child.parentId === card.id);
    // The header-driven floor fits the unwrapped title/kicker, so heights
    // stay fixed as children or gaps grow. Empty zones retain their floor.
    const floor = Math.max(WIDTH, Math.max((card.kicker ?? "").length * 12, (card.title ?? "").length * 17) + 2 * INSET + TOGGLE);
    const headerHeight = 42 + (card.kicker === null ? 0 : RULE_GAP + 29);
    const chromeHeight = INSET + headerHeight + RULE_TO_CHILD + BOTTOM;
    const choice = level(card.id, children, 2 * INSET, chromeHeight);
    let headroom = 0;
    for (const edge of edges) {
      if (edge.source.parentId !== card.id || edge.target.parentId !== card.id) continue;
      const source = children.indexOf(edge.source), target = children.indexOf(edge.target);
      if (!choice.shelves.some((shelf) => shelf.includes(source) && shelf.includes(target))) continue;
      const label = labelSize(edge.label);
      if ((choice.rows ? label.width : label.height) + 8 > GAP) headroom += label.height + 8;
    }
    return { width: Math.max(floor, choice.width + (children.length ? 2 * INSET : 0)), height: choice.height + chromeHeight + headroom };
  }
  const root = level("root", visible.filter((card) => card.parentId === null), 0, 0);
  const leafCount = visible.filter((card) => !card.container || card.folded).length;
  return { leafCount, minimumWidth: root.width, minimumHeight: root.height,
    optimisticMaximumFill: leafCount * WIDTH * HEIGHT / (root.width * root.height),
    levels: levels.sort((a, b) => a.level < b.level ? -1 : a.level > b.level ? 1 : 0) };
}

const scenes = [];
for (const key of Object.keys(baseline)) {
  const [caseId, viewName] = key.split("/");
  const bytes = readFileSync(new URL(`./fixtures/${caseId}/${caseId}.views.json`, import.meta.url));
  const proof = prove(JSON.parse(bytes).views[viewName]);
  if (proof.leafCount < 9) continue; // Cap scope is checked live in L2.
  const requiredFill = baseline[key].fillRatio + 0.10;
  assert(proof.optimisticMaximumFill < requiredFill, `${key}: spec threshold is reachable; remove its exception`);
  scenes.push({ view: key, fixtureSha256: createHash("sha256").update(bytes).digest("hex"), ...proof,
    requiredFill, threshold: proof.optimisticMaximumFill - 0.02 });
}

// Retain the original capped-frame conflict proof as context, not a gate:
// canonical four-card 2×2 at BOTH maximum gutters still cannot beat L0.
const migration = JSON.parse(readFileSync(new URL("./fixtures/migration-cluster-mesh/migration-cluster-mesh.views.json", import.meta.url)));
const foldedRoots = migration.views.folded.cards.filter((card) => card.parentId === null);
assert(foldedRoots.length === 4 && foldedRoots.every((card) => card.folded));
const cappedFrame = { view: "migration-cluster-mesh/folded",
  optimisticMaximumFrameFill: (2 * WIDTH + GAP_CAP) * (2 * HEIGHT + GAP_CAP) * 0.62 ** 2 / (1440 * 810),
  requiredFrameFill: baseline["migration-cluster-mesh/folded"].frameFillRatio,
  scope: "capped; no fill gate (Appendix E)" };

console.log(JSON.stringify({ method: "P-1/P-3/P-4/O-2 at base gaps; BF-6 frozen shelves; fixed chrome and U-channel reservation; bound minus 0.02", scenes, cappedFrame }, null, 2));
