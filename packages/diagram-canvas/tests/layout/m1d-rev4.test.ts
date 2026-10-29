/**
 * M1-d review pass-4 RED probes (must fail on bf1ab3ea).
 * Visible descendants stay under their resolved placement parent when an
 * intermediate container is hidden by an authored grouping.
 * English in code.
 */
import {
  formatDiagnostics,
  m3ProfileRegistry,
  shippedExecutorBindings,
  validateView,
  type EntityOccurrence,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";
import { layoutDocument, layoutFolded } from "../../src/index.js";
import { buildDocument, measure } from "./fixtures.js";
import { asGeneric2Document, makePresentation, occurrenceOfEntity, wordWrapMeasurer } from "./m1d-fixtures.js";

function contains(
  outer: { x: number; y: number; width: number; height: number },
  inner: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** The source view with every membership cleared, so the test declares its own grouping. */
function withoutGroups(view: ViewDocument): Record<string, EntityOccurrence> {
  const stripped: Record<string, EntityOccurrence> = {};
  for (const [key, occurrence] of Object.entries(view.entityOccurrences)) {
    const { group: _dropped, ...rest } = occurrence;
    void _dropped;
    stripped[key] = rest as EntityOccurrence;
  }
  return stripped;
}

describe("REV4 placement under the resolved parent with a hidden intermediate", () => {
  it("places a visible leaf inside P when C is hidden by a group bound to collapsed X", () => {
    const document: SemanticDocument = asGeneric2Document(
      buildDocument({
        nodes: ["a", "lone"],
        containers: { P: ["C"], C: ["a"], X: [] },
        links: [["r", "a", "lone"]],
      }),
    );
    const presentation = makePresentation({
      forms: { P: "container", C: "container", X: "container", a: "card", lone: "card" },
    });
    const options = {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    };
    const source = layoutDocument(document, options);
    expect(source.status).toBe("laid-out");
    if (source.status !== "laid-out") return;
    const stripped = withoutGroups(source.view);
    const authored: ViewDocument = {
      ...source.view,
      groups: { g: { id: "g", occurrence: occurrenceOfEntity("X") } },
      entityOccurrences: {
        ...stripped,
        [occurrenceOfEntity("C")]: { ...stripped[occurrenceOfEntity("C")]!, group: "g" },
      },
    };
    expect(
      formatDiagnostics(
        validateView(authored, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const folded = layoutFolded(document, authored, { ...options, collapsed: [occurrenceOfEntity("X")] });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const parent = folded.view.entityOccurrences[occurrenceOfEntity("P")]!.geometry;
    const leaf = folded.view.entityOccurrences[occurrenceOfEntity("a")]!.geometry;
    expect(contains(parent, leaf)).toBe(true);
  });

  it("places a visible leaf inside P across two hidden intermediate containers", () => {
    const document: SemanticDocument = asGeneric2Document(
      buildDocument({
        nodes: ["a", "lone"],
        containers: { P: ["C1"], C1: ["C2"], C2: ["a"], X: [] },
        links: [["r", "a", "lone"]],
      }),
    );
    const presentation = makePresentation({
      forms: { P: "container", C1: "container", C2: "container", X: "container", a: "card", lone: "card" },
    });
    const options = {
      registry: m3ProfileRegistry,
      measureText: measure,
      targetWidth: 4000,
      presentation,
      measureLines: wordWrapMeasurer(),
      bindings: shippedExecutorBindings,
    };
    const source = layoutDocument(document, options);
    expect(source.status).toBe("laid-out");
    if (source.status !== "laid-out") return;
    const stripped = withoutGroups(source.view);
    const authored: ViewDocument = {
      ...source.view,
      groups: { g: { id: "g", occurrence: occurrenceOfEntity("X") } },
      entityOccurrences: {
        ...stripped,
        [occurrenceOfEntity("C1")]: { ...stripped[occurrenceOfEntity("C1")]!, group: "g" },
        [occurrenceOfEntity("C2")]: { ...stripped[occurrenceOfEntity("C2")]!, group: "g" },
      },
    };
    expect(
      formatDiagnostics(
        validateView(authored, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const folded = layoutFolded(document, authored, { ...options, collapsed: [occurrenceOfEntity("X")] });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(
      formatDiagnostics(
        validateView(folded.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }),
      ),
    ).toBe("");
    const parent = folded.view.entityOccurrences[occurrenceOfEntity("P")]!.geometry;
    const leaf = folded.view.entityOccurrences[occurrenceOfEntity("a")]!.geometry;
    expect(contains(parent, leaf)).toBe(true);
  });
});
