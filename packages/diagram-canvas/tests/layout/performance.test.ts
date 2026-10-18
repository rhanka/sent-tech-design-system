/**
 * Time budget for a document of about 40 nodes in 3 nesting levels (3 groups,
 * 6 sub-containers, 40 nodes, 44 links, 4 labels, one cycle). The figure is
 * MEASURED: the median of 7 runs after one warm-up, printed, and held under a
 * budget with a wide margin so a slower CI machine does not flake. The README
 * records the measured value and the command.
 */
import { defaultProfileRegistry } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument } from "../../src/index.js";
import { buildDocument, largeDocumentSpec, measure } from "./fixtures.js";

/** Budget per layout, in ms. The measured median on the development machine is far below it (README). */
const BUDGET_MS = 1000;

describe("performance", () => {
  const spec = largeDocumentSpec();
  const document = buildDocument(spec);

  it("the fixture is the size the brief asks for: about 40 nodes in 3 nesting levels", () => {
    expect(spec.nodes.length).toBe(40);
    expect(Object.keys(spec.containers!).length).toBe(9);
    expect(spec.links.length).toBe(44);
  });

  for (const width of [8000, 1200, 360]) {
    it(`lays it out within ${BUDGET_MS} ms (target ${width} px)`, () => {
      const options = { registry: defaultProfileRegistry, measureText: measure, targetWidth: width };
      expect(layoutDocument(document, options).status).toBe("laid-out");
      const times: number[] = [];
      for (let run = 0; run < 7; run += 1) {
        const started = performance.now();
        layoutDocument(document, options);
        times.push(performance.now() - started);
      }
      times.sort((a, b) => a - b);
      const median = times[3]!;
      console.info(`layout of 40 nodes / 3 levels at ${width} px: median ${median.toFixed(1)} ms, max ${times[6]!.toFixed(1)} ms`);
      expect(median).toBeLessThan(BUDGET_MS);
    });
  }
});
