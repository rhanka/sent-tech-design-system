/**
 * Header-driven container width (M3 §4.6.2 order (a)): an expanded
 * container sized by its unwrapped header reserves the full
 * TOGGLE_ALLOCATION, so the Step-3 header measurement sees exactly the
 * unwrapped width — the header stays on one line and raises no
 * zone-overflow. The width formulas in `measured.ts` derive from
 * `measure.ts` (CONTENT_INSET / TOGGLE_ALLOCATION), never from local
 * literals.
 */
import { describe, expect, it } from "vitest";

import { CONTENT_INSET, FIXED_CARD_WIDTH, TOGGLE_ALLOCATION } from "../../src/index.js";
import {
  asGeneric2Document,
  buildMeasuredDocument,
  geometryOf,
  layMeasured2,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

describe("header-driven container width reserves TOGGLE_ALLOCATION", () => {
  it("sizes an expanded container to unwrapped header + 2 × CONTENT_INSET + TOGGLE_ALLOCATION", () => {
    expect(TOGGLE_ALLOCATION).toBe(66);
    const document = asGeneric2Document(buildMeasuredDocument());
    // DC-2a re-pin (AC-2): the two children pack on one row, so the
    // child-driven width is 460 + 24 + 460 + 2 × 16 = 976, no longer 492.
    // The title is lengthened to stay header-driven: 119 characters at
    // 8 px/char = 952 px unwrapped; with the insets and the toggle
    // reservation the header-driven width (1050) beats 976.
    const title = Array.from({ length: 24 }, () => "word").join(" ");
    const presentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: {
        C: { title },
        a: { title: "Alpha" },
        b: { title: "Beta" },
        lone: { title: "Lone" },
      },
    });
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured2(document, presentation, measurer);
    const unwrapped = title.length * 8;
    const width = geometryOf(measured.view, "C").width;
    expect(width).toBeGreaterThan(FIXED_CARD_WIDTH);
    expect(width).toBe(unwrapped + 2 * CONTENT_INSET + TOGGLE_ALLOCATION);
    // Step 3 measures the header at inner − TOGGLE_ALLOCATION, i.e. exactly
    // the unwrapped width: one line, no overflow, no zone-overflow warning.
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"));
    expect(header).toBeDefined();
    expect(header?.title.lines).toEqual([title]);
    expect(header?.overflow).toBe(false);
    expect(measured.warnings.filter((warning) => warning.code === "zone-overflow")).toEqual([]);
    const titleCall = measurer.calls
      .filter((call) => call.role === "title" && call.availableWidth < 10000)
      .find((call) => call.text === title);
    expect(titleCall).toBeDefined();
    expect(titleCall?.availableWidth).toBe(width - 2 * CONTENT_INSET - TOGGLE_ALLOCATION);
    expect(titleCall?.availableWidth).toBe(unwrapped);
  });
});
