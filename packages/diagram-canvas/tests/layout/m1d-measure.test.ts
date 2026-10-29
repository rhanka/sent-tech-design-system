/**
 * M1-d measurement witnesses (§4.6.6, §5.6): subtitle delta, line sharing and
 * toggle-reduced width. Each test asserts the emitted measurement changed
 * placement, never a bare role-call observation.
 */
import { describe, expect, it } from "vitest";

import {
  CURRENT_SCHEMA_VERSION,
  documentRef,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  type Entity,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";

import { layoutDocument } from "../../src/index.js";
import { TOGGLE_ALLOCATION } from "../../src/index.js";
import { measure } from "./fixtures.js";
import {
  buildMeasuredDocument,
  fixedLinesMeasurer,
  geometryOf,
  layMeasured,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";
import { formatDiagnostics, validateView } from "@sentropic/diagram-core";

function buildGeneric2Document(): SemanticDocument {
  const source = buildMeasuredDocument();
  const entities: Record<string, Entity> = {};
  for (const [id, entity] of Object.entries(source.entities)) {
    entities[id] = { ...(entity as Entity), profile: "generic@2" };
  }
  const relations: Record<string, Relation> = {};
  for (const [id, relation] of Object.entries(source.relations)) {
    relations[id] = { ...(relation as Relation), profile: "generic@2" };
  }
  return {
    ...source,
    profileRefs: ["generic@2"],
    entities,
    relations,
  };
}

function layMeasured2(
  document: SemanticDocument,
  presentation: ReturnType<typeof makePresentation>,
  measureLines: ReturnType<typeof wordWrapMeasurer> | ReturnType<typeof fixedLinesMeasurer>,
  extra: { collapsed?: readonly import("@sentropic/diagram-core").OccurrenceRef[] } = {},
): { view: import("@sentropic/diagram-core").ViewDocument; headers: { occurrence: import("@sentropic/diagram-core").OccurrenceRef; kicker?: { lines: readonly string[] }; title: { lines: readonly string[] }; height: number; subtitle?: { lines: readonly string[] } }[]; slots: { occurrence: import("@sentropic/diagram-core").OccurrenceRef; role: string; layout: { lines: readonly string[]; overflow: boolean; width: number } }[] } {
  const result = layoutDocument(document, {
    registry: m3ProfileRegistry,
    measureText: measure,
    targetWidth: 4000,
    presentation,
    measureLines: measureLines as never,
    bindings: shippedExecutorBindings,
    ...(extra.collapsed !== undefined ? { collapsed: extra.collapsed } : {}),
  });
  if (result.status !== "laid-out" || result.measurements === undefined) {
    throw new Error(`refused: ${JSON.stringify(result)}`);
  }
  expect(formatDiagnostics(validateView(result.view, document, { registry: m3ProfileRegistry, bindings: shippedExecutorBindings }))).toBe("");
  return {
    view: result.view,
    headers: result.measurements.headers as never,
    slots: result.measurements.slots as never,
  };
}

const presentation = makePresentation({
  forms: { C: "container", a: "card", b: "card", lone: "card" },
  texts: {
    C: {
      kicker: "Zone",
      title: "Container with a fairly long title that definitely wraps differently at full and toggle widths",
      subtitle: "first second third fourth fifth sixth",
    },
    a: { title: "Alpha with a fairly long card title that wraps at the fixed inner width", body: "alpha body text" },
    b: { title: "Beta" },
    lone: { title: "Lone" },
  },
});

describe("measured subtitle height moves the first child row", () => {
  it("gives a first-child y delta equal to the header-height delta", () => {
    const document = buildGeneric2Document();
    const one = layMeasured2(document, presentation, fixedLinesMeasurer({ subtitle: 1 }));
    const two = layMeasured2(document, presentation, fixedLinesMeasurer({ subtitle: 2 }));
    const headerOne = one.headers.find((header) => header.occurrence === occurrenceOfEntity("C"))!;
    const headerTwo = two.headers.find((header) => header.occurrence === occurrenceOfEntity("C"))!;
    expect(headerTwo.height - headerOne.height).toBe(10);
    const yOne = geometryOf(one.view, "a").y;
    const yTwo = geometryOf(two.view, "a").y;
    expect(yTwo - yOne).toBe(headerTwo.height - headerOne.height);
  });
});

describe("layout lines and emitted measurements share one result", () => {
  it("records the same lines for every slot", () => {
    const document = buildGeneric2Document();
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured2(document, presentation, measurer);
    expect(measured.headers.map((header) => header.occurrence).sort()).toEqual(
      [occurrenceOfEntity("C"), occurrenceOfEntity("a"), occurrenceOfEntity("b"), occurrenceOfEntity("lone")].sort(),
    );
    expect(
      measured.headers.flatMap((header) => [
        ...(header.kicker !== undefined ? [[header.occurrence, "kicker"] as const] : []),
        [header.occurrence, "title"] as const,
        ...(header.subtitle !== undefined ? [[header.occurrence, "subtitle"] as const] : []),
      ]),
    ).toEqual([
      [occurrenceOfEntity("C"), "kicker"],
      [occurrenceOfEntity("C"), "title"],
      [occurrenceOfEntity("C"), "subtitle"],
      [occurrenceOfEntity("a"), "title"],
      [occurrenceOfEntity("b"), "title"],
      [occurrenceOfEntity("lone"), "title"],
    ]);
    expect(measured.slots.map((slot) => [slot.occurrence, slot.role])).toEqual([
      [occurrenceOfEntity("a"), "body"],
      [occurrenceRef("r.l1"), "edge-label"],
    ]);
    const replayLines = (
      text: string,
      role: "kicker" | "title" | "subtitle" | "body" | "edge-label",
      availableWidth: number,
    ): readonly string[] =>
      wordWrapMeasurer({ charWidth: 8 })({
        text,
        role,
        availableWidth,
        allocatedLines: 2,
        folded: false,
      }).lines;
    const containerInner = geometryOf(measured.view, "C").width - 32;
    const containerTitleWidth = containerInner - TOGGLE_ALLOCATION;
    const containerTitle = "Container with a fairly long title that definitely wraps differently at full and toggle widths";
    const expectedContainerTitle = replayLines(containerTitle, "title", containerTitleWidth);
    expect(expectedContainerTitle.join(" ")).toBe(containerTitle);
    const leafTitle = "Alpha with a fairly long card title that wraps at the fixed inner width";
    const leafFull = replayLines(leafTitle, "title", 460 - 32);
    const leafReduced = replayLines(leafTitle, "title", 460 - 32 - TOGGLE_ALLOCATION);
    expect(leafFull.length).toBeGreaterThan(1);
    expect(leafFull.join(" ")).toBe(leafTitle);
    expect(leafReduced.join(" ")).toBe(leafTitle);
    expect(JSON.stringify(leafFull)).not.toBe(JSON.stringify(leafReduced));
    const emittedContainerTitle = measured.headers.find(
      (header) => header.occurrence === occurrenceOfEntity("C"),
    )!.title.lines;
    expect(emittedContainerTitle).toEqual(expectedContainerTitle);
    const emittedLeafTitle = measured.headers.find(
      (header) => header.occurrence === occurrenceOfEntity("a"),
    )!.title.lines;
    expect(emittedLeafTitle).toEqual(leafFull);
    expect(emittedLeafTitle.length).toBeGreaterThan(1);
    for (const header of measured.headers) {
      const expected = (role: "kicker" | "title" | "subtitle"): readonly string[] => {
        const text =
          header.occurrence === occurrenceOfEntity("C")
            ? role === "kicker"
              ? "Zone"
              : role === "title"
                ? containerTitle
                : "first second third fourth fifth sixth"
            : header.occurrence === occurrenceOfEntity("a") && role === "title"
              ? "Alpha with a fairly long card title that wraps at the fixed inner width"
              : role === "title"
                ? header.occurrence === occurrenceOfEntity("b")
                  ? "Beta"
                  : "Lone"
                : "";
        const width =
          header.occurrence === occurrenceOfEntity("C") && role === "title"
            ? containerTitleWidth
            : header.occurrence === occurrenceOfEntity("C")
              ? containerInner
              : 460 - 32;
        return replayLines(text, role, width);
      };
      if (header.kicker !== undefined) expect(header.kicker.lines).toEqual(expected("kicker"));
      expect(header.title.lines).toEqual(expected("title"));
      if (header.subtitle !== undefined) expect(header.subtitle.lines).toEqual(expected("subtitle"));
    }
    for (const slot of measured.slots) {
      if (slot.role === "body") {
        expect(slot.layout.lines).toEqual(replayLines("alpha body text", "body", slot.layout.width));
      } else {
        expect(slot.role).toBe("edge-label");
        expect(slot.layout.lines).toEqual(replayLines("a to lone", "edge-label", slot.layout.width));
      }
    }
  });
});

describe("toggle-bearing headers wrap at the reduced width", () => {
  it("wraps a collapsed toggle title differently at 396 versus 428 px", async () => {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    for (const local of ["C", "a", "b"] as const) {
      const ref = entityRef(local);
      entities[ref] = {
        id: ref,
        profile: "generic@2",
        type: local === "C" ? "container" : "node",
        attributes: { name: { kind: "text", value: local } },
      };
    }
    for (const child of ["a", "b"] as const) {
      const rel = relationRef(`contains.${child}`);
      relations[rel] = {
        id: rel,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef("C") },
          { role: "child", target: entityRef(child) },
        ],
        attributes: {},
      };
    }
    const collapsedDocument: SemanticDocument = {
      documentId: documentRef("rev2-witness-collapsed"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const title =
      "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau";
    const collapsedPresentation = makePresentation({
      forms: { C: "container", a: "card", b: "card" },
      texts: { C: { title }, a: { title: "Alpha" }, b: { title: "Beta" } },
    });
    const collapsedMeasurer = wordWrapMeasurer({ charWidth: 8 });
    const collapsedResult = (
      await import("../../src/index.js") as typeof import("../../src/index.js")
    ).layoutDocument(collapsedDocument, {
      registry: m3ProfileRegistry,
      measureText: (await import("./fixtures.js") as typeof import("./fixtures.js")).measure,
      targetWidth: 4000,
      presentation: collapsedPresentation,
      measureLines: collapsedMeasurer,
      bindings: shippedExecutorBindings,
      collapsed: [occurrenceOfEntity("C")],
    });
    expect(collapsedResult.status).toBe("laid-out");
    if (collapsedResult.status !== "laid-out" || collapsedResult.measurements === undefined) return;
    const collapsed = { headers: collapsedResult.measurements.headers };
    const header = collapsed.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    const reduced = wordWrapMeasurer({ charWidth: 8 })({
      text: title,
      role: "title",
      availableWidth: 396,
      allocatedLines: 2,
      folded: true,
    });
    const full = wordWrapMeasurer({ charWidth: 8 })({
      text: title,
      role: "title",
      availableWidth: 428,
      allocatedLines: 2,
      folded: true,
    });
    expect(JSON.stringify(reduced.lines)).not.toBe(JSON.stringify(full.lines));
    expect(header.title.lines).toEqual(reduced.lines);
  });
  it("uses the reduced width in the input and the emitted measurement", () => {
    const document = buildGeneric2Document();
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured2(document, presentation, measurer);
    const containerTitle = "Container with a fairly long title that definitely wraps differently at full and toggle widths";
    // Header measurements only: width probes use a far larger allocation.
    const titleCalls = measurer.calls.filter((call) => call.role === "title" && call.availableWidth < 10000);
    const containerCall = titleCalls.find((call) => call.text === containerTitle)!;
    const leafCall = titleCalls.find((call) => call.text.startsWith("Alpha with"))!;
    // The container renders a fold control, the leaf does not: the
    // container title is measured at its own inner width minus the toggle
    // allocation, the leaf at its full inner width.
    const containerInner = geometryOf(measured.view, "C").width - 32;
    expect(containerCall.availableWidth).toBe(containerInner - TOGGLE_ALLOCATION);
    expect(leafCall.availableWidth).toBe(460 - 32);
    expect(containerInner - containerCall.availableWidth).toBe(TOGGLE_ALLOCATION);
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    const replay = wordWrapMeasurer({ charWidth: 8 })({
      text: containerTitle,
      role: "title",
      availableWidth: containerCall.availableWidth,
      allocatedLines: 2,
      folded: false,
    });
    expect(replay.lines.join(" ")).toBe(containerTitle);
    expect(header.title.lines).toEqual(replay.lines);
    const leafTitle = "Alpha with a fairly long card title that wraps at the fixed inner width";
    const leafFull = wordWrapMeasurer({ charWidth: 8 })({
      text: leafTitle,
      role: "title",
      availableWidth: 460 - 32,
      allocatedLines: 2,
      folded: false,
    });
    const leafReduced = wordWrapMeasurer({ charWidth: 8 })({
      text: leafTitle,
      role: "title",
      availableWidth: 460 - 32 - TOGGLE_ALLOCATION,
      allocatedLines: 2,
      folded: false,
    });
    expect(leafFull.lines.length).toBeGreaterThan(1);
    expect(leafFull.lines.join(" ")).toBe(leafTitle);
    expect(JSON.stringify(leafFull.lines)).not.toBe(JSON.stringify(leafReduced.lines));
    const leafHeader = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("a"))!;
    expect(leafHeader.title.lines).toEqual(leafFull.lines);
  });
});
