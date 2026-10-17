#!/usr/bin/env node
// Generates one small deterministic xyflow fixture + scenario per example
// entry of docs/re/xyflow-inventory.json (93 examples: 66 React + 27 Svelte).
// Fixtures are pure data seeded by the example id (stable hash -> positions);
// no xyflow code is copied. Re-run after an inventory regeneration:
//   node tools/re-harness/gen-xyflow-fixtures.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WT_ROOT = path.resolve(HERE, "..", "..");
const inventory = JSON.parse(fs.readFileSync(path.join(WT_ROOT, "docs", "re", "xyflow-inventory.json"), "utf8"));
const examples = (inventory.entries || []).filter((e) => e.family === "examples");

function hash(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100000; return h; }

const fixtureDir = path.join(HERE, "fixtures", "xyflow");
const scenarioDir = path.join(HERE, "fixtures", "scenarios");
fs.mkdirSync(fixtureDir, { recursive: true });
fs.mkdirSync(scenarioDir, { recursive: true });

for (const entry of examples) {
  const h = hash(entry.id);
  const slug = entry.id.replace(/^examples\./, "");
  const fixture = {
    schemaVersion: 1,
    id: `xyflow-${slug}`,
    library: "xyflow",
    kind: "xyflow-graph",
    title: `xyflow example fixture for ${entry.id}`,
    model: {
      nodes: [
        { id: "n1", type: "default", position: { x: 40 + (h % 60), y: 40 }, data: { label: "One" }, width: 120, height: 44 },
        { id: "n2", type: "default", position: { x: 240, y: 140 + (h % 40) }, data: { label: "Two" }, width: 120, height: 44 },
      ],
      edges: [{ id: "e1", source: "n1", target: "n2", waypoints: [{ x: 160, y: 62 }, { x: 240, y: 162 }] }],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
    viewport: { x: 0, y: 0, zoom: 1 },
    pixelThreshold: { maxMismatchRatio: 0.01, perChannelDelta: 8 },
  };
  const fixtureFile = `xyflow/${slug}.json`;
  fs.writeFileSync(path.join(HERE, "fixtures", fixtureFile), `${JSON.stringify(fixture, null, 2)}\n`);
  const scenario = {
    schemaVersion: 1,
    id: `xyflow-${slug}-selfparity`,
    library: "xyflow",
    fixtures: [fixtureFile],
    exercises: [entry.id],
    comparators: ["model", "events", "geometry", "pixels"],
  };
  fs.writeFileSync(path.join(scenarioDir, `xyflow-${slug}.json`), `${JSON.stringify(scenario)}\n`);
}
console.log(`xyflow fixtures generated: ${examples.length} (one per examples inventory entry)`);
