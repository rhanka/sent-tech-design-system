/**
 * Determinism (L-R6, AC-L8 "laying out the same document twice gives the same
 * geometry"): the canonical bytes of the produced view (`serialiseView`, sorted
 * keys, no whitespace) are compared, not a summary of them.
 */
import { defaultProfileRegistry, serialiseView } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument } from "../../src/index.js";
import { buildDocument, lay, largeDocumentSpec, measure, shuffled } from "./fixtures.js";

const document = buildDocument(largeDocumentSpec());

describe("determinism", () => {
  for (const width of [8000, 1200, 360]) {
    it(`the same document laid out twice gives byte-identical canonical output (target ${width} px)`, () => {
      const once = serialiseView(lay(document, width).view);
      const twice = serialiseView(lay(document, width).view);
      expect(twice).toBe(once);
    });

    it(`shuffling the entity, relation and contains records changes nothing (target ${width} px)`, () => {
      const reference = serialiseView(lay(document, width).view);
      for (const seed of [1, 7, 42, 2026]) {
        const copy = shuffled(document, seed);
        // The shuffle is real: insertion order differs from the reference,
        // for entities and for relations (the `contains.*` nesting records
        // among them).
        expect(Object.keys(copy.entities)).not.toEqual(Object.keys(document.entities));
        expect(Object.keys(copy.relations)).not.toEqual(Object.keys(document.relations));
        expect(Object.keys(copy.relations).filter((key) => key.startsWith("relation:contains."))).not.toEqual(
          Object.keys(document.relations).filter((key) => key.startsWith("relation:contains.")),
        );
        expect(serialiseView(lay(copy, width).view)).toBe(reference);
      }
    });
  }

  it("the fit and the warnings are deterministic too", () => {
    const run = () => layoutDocument(shuffled(document, 3), { registry: defaultProfileRegistry, measureText: measure, targetWidth: 8000 });
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });
});
