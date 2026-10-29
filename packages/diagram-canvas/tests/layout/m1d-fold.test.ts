/**
 * M1-d folding witnesses (§5.6 layout half): fold→measure→place→route from the
 * retained source through the M1-c projection, never incrementally.
 */
import { defaultProfileRegistry, serialiseView } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { layoutDocument, layoutFolded } from "../../src/index.js";
import { measure } from "./fixtures.js";
import {
  asGeneric2Document,
  buildMeasuredDocument,
  geometryOf,
  layMeasured,
  layMeasured2,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

const presentation = makePresentation({
  forms: { C: "card", a: "card", b: "card", lone: "card" },
  texts: {
    C: { kicker: "Zone", title: "Container" },
    a: { title: "Alpha" },
    b: { title: "Beta" },
    lone: { title: "Lone" },
  },
});

describe("fold, measure, place, route", () => {
  it("restores the exact drawing with an empty collapse", () => {
    const document = buildMeasuredDocument();
    const measurer = wordWrapMeasurer();
    const direct = layMeasured(document, presentation, measurer);
    const folded = layoutFolded(document, direct.view, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
    });
    if (folded.status !== "laid-out") throw new Error(`refused: ${JSON.stringify(folded)}`);
    expect(serialiseView(folded.view)).toBe(serialiseView(direct.view));
  });

  it("gives equal drawings across fold, unfold and refold", () => {
    const document = buildMeasuredDocument();
    const source = layMeasured(document, presentation, wordWrapMeasurer());
    const options = {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
    };
    const foldedOnce = layoutFolded(document, source.view, {
      ...options,
      collapsed: [occurrenceOfEntity("C")],
    });
    const unfolded = layoutFolded(
      document,
      foldedOnce.status === "laid-out" ? foldedOnce.view : source.view,
      { ...options, measureLines: wordWrapMeasurer() },
    );
    const foldedTwice = layoutFolded(
      document,
      unfolded.status === "laid-out" ? unfolded.view : source.view,
      { ...options, collapsed: [occurrenceOfEntity("C")], measureLines: wordWrapMeasurer() },
    );
    if (foldedOnce.status !== "laid-out" || foldedTwice.status !== "laid-out") {
      throw new Error("fold refused");
    }
    expect(serialiseView(foldedTwice.view)).toBe(serialiseView(foldedOnce.view));
    const collapsed = geometryOf(foldedOnce.view, "C");
    expect(collapsed).toMatchObject({ width: 460, height: 200 });
  });

  it("keeps the document revision on every fold", () => {
    const document = buildMeasuredDocument();
    const source = layMeasured(document, presentation, wordWrapMeasurer());
    const folded = layoutFolded(document, source.view, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      collapsed: [occurrenceOfEntity("C")],
    });
    if (folded.status !== "laid-out") throw new Error("fold refused");
    expect(folded.view.revision).toBe(document.revision);
    expect(folded.view.semanticDocumentId).toBe(document.documentId);
  });

  it("exposes the folded and expanded header forms as distinct inputs", () => {
    const document = asGeneric2Document(buildMeasuredDocument());
    const foldedPresentation = makePresentation({
      forms: { C: "container", a: "card", b: "card", lone: "card" },
      texts: {
        C: { kicker: "Zone", title: "Container" },
        a: { title: "Alpha" },
        b: { title: "Beta" },
        lone: { title: "Lone" },
      },
    });
    const seen: { folded: boolean; text: string }[] = [];
    const spy = wordWrapMeasurer();
    const recording = ((request: Parameters<typeof spy>[0]) => {
      if (request.role === "title" && request.text === "Container" && request.availableWidth <= 460 - 32) {
        seen.push({ folded: request.folded, text: request.text });
      }
      return spy(request);
    }) as typeof spy;
    layMeasured2(document, foldedPresentation, recording, { collapsed: [occurrenceOfEntity("C")] });
    expect(seen.map((entry) => entry.folded)).toEqual([true]);
    seen.length = 0;
    layMeasured2(document, foldedPresentation, recording);
    expect(seen.map((entry) => entry.folded)).toEqual([false]);
  });

  it("leaves the compatibility path untouched without presentation", () => {
    const document = buildMeasuredDocument();
    const legacy = layoutDocument(document, {
      registry: defaultProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
    });
    if (legacy.status !== "laid-out") throw new Error("legacy refused");
    expect("measurements" in legacy).toBe(false);
  });
});
