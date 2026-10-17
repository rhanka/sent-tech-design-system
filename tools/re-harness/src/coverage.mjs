// Scenario -> inventory coverage verifier (task L0 clause 4). Same style as
// tools/re-*/verify.mjs: mechanical union against the three inventories.
// At L0 it REPORTS the gap; it never fails because later lots' scenarios do
// not exist yet (exit 1 only with --strict).
import fs from "node:fs";
import path from "node:path";

export function loadInventory(file) {
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  return doc.entries || [];
}

export function coverageReport({ inventories, scenarios }) {
  const exercised = new Set();
  for (const s of scenarios) for (const id of s.exercises || []) exercised.add(id);
  const perLibrary = {};
  for (const [lib, entries] of Object.entries(inventories)) {
    const p01 = entries.filter((e) => e.priority === "P0" || e.priority === "P1");
    const covered = p01.filter((e) => exercised.has(e.id));
    const missing = p01.filter((e) => !exercised.has(e.id));
    perLibrary[lib] = {
      totalEntries: entries.length,
      exercisedEntries: entries.filter((e) => exercised.has(e.id)).length,
      p0p1Total: p01.length,
      coveredP0P1: covered.length,
      missingP0P1: missing.length,
      missingIds: missing.map((e) => e.id),
    };
  }
  return { exercisedCount: exercised.size, perLibrary };
}

export function listScenarios(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) =>
    JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}
