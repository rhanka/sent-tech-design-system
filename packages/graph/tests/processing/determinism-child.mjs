// Determinism probe child: computes the force-fa2 layout for a JSON graph with
// the BUILT package and prints the positions array. Used by
// register-adapter.test.ts to prove two distinct processes agree byte for byte.
import { readFileSync } from "node:fs";

import { buildRenderGraphBuffers } from "../../dist/index.js";
import { forceFa2Layout } from "../../dist/processing/index.js";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("usage: determinism-child.mjs <input.json>");
  process.exit(2);
}

const input = JSON.parse(readFileSync(inputPath, "utf8"));
const graph = buildRenderGraphBuffers({
  nodes: input.nodes.map((id) => ({ id })),
  edges: input.edges,
});
const out = forceFa2Layout(graph, { iterations: input.iterations });
process.stdout.write(JSON.stringify(Array.from(out)));
