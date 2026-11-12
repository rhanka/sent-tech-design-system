/** Diagnostic for the §7.3 / §7.4 conflict; never changes a gate or fixture. */
import { readFileSync } from "node:fs";

const fixture = JSON.parse(readFileSync(new URL("./fixtures/case-skills-r9/case-skills-r9.views.json", import.meta.url)));
const baseline = JSON.parse(readFileSync(new URL("./baseline.json", import.meta.url)));

// Enumerate every P-1 shelf width in both forms, with BF-1 admissibility.
// Deliberately REMOVE all container chrome and label headroom and relax P-3
// to allow every candidate, even a losing score: these are optimistic bounds.
function shapes(count) {
  if (count === 1) return [{ width: 460, height: 200 }];
  const out = [];
  for (let prefix = 1; prefix <= count; prefix += 1) {
    const shelves = Math.ceil(count / prefix);
    if (prefix > 1) out.push({ width: prefix * 460 + (prefix - 1) * 24, height: shelves * 200 + (shelves - 1) * 24 });
    if (shelves > 1) out.push({ width: shelves * 460 + (shelves - 1) * 24, height: prefix * 200 + (prefix - 1) * 24 });
  }
  return out;
}

for (const view of ["unfolded", "skills-unfolded"]) {
  const cards = fixture.views[view].cards;
  const roots = cards.filter((card) => card.parentId === null);
  if (roots.length !== 2) throw new Error("Proof requires the fixture's two roots");
  const counts = roots.map((root) => root.folded ? 1 : cards.filter((card) => card.parentId === root.id).length);
  if (counts[0] !== 10 || counts[1] !== (view === "unfolded" ? 4 : 1)) throw new Error("Fixture shape changed");
  const leafArea = counts.reduce((sum, n) => sum + n * 460 * 200, 0);
  let maximum = 0;
  let best;
  for (const left of shapes(counts[0])) for (const right of shapes(counts[1])) {
    // BF-1 forces two root boxes beside one another. Permit free extra
    // width/height to satisfy the aspect bound, including candidates whose
    // chrome-free shape falls outside it. Extra chrome/gaps cannot beat this.
    const width = left.width + 24 + right.width;
    const height = Math.max(left.height, right.height);
    const minimumArea = Math.max(width * height, width ** 2 / (1.78 * Math.exp(0.35)), height ** 2 * 1.78 * Math.exp(-0.35));
    const fill = leafArea / minimumArea;
    if (fill > maximum) { maximum = fill; best = { width, height, minimumArea }; }
  }
  const required = baseline[`case-skills-r9/${view}`].fillRatio + 0.10;
  console.log(JSON.stringify({ view: `case-skills-r9/${view}`, optimisticMaximumFill: maximum, requiredFill: required, ...best }));
}

// §7.3 frame fill also binds the four-leaf folded migration. BF-1/§3.6
// mandate the 2×2 grid. Even granting BOTH gutters the full cap (without
// requiring a crossing label) cannot exceed this optimistic frame fill.
const migration = JSON.parse(readFileSync(new URL("./fixtures/migration-cluster-mesh/migration-cluster-mesh.views.json", import.meta.url)));
const foldedRoots = migration.views.folded.cards.filter((card) => card.parentId === null);
if (foldedRoots.length !== 4 || foldedRoots.some((card) => !card.folded)) throw new Error("Folded migration shape changed");
const maximumFrameFill = (2 * 460 + 32) * (2 * 200 + 32) * 0.62 ** 2 / (1440 * 810);
console.log(JSON.stringify({ view: "migration-cluster-mesh/folded", optimisticMaximumFrameFill: maximumFrameFill,
  mustExceed: baseline["migration-cluster-mesh/folded"].frameFillRatio }));
