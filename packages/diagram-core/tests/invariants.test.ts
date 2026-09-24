/**
 * The eight invariants of the study (section 4.2), one named test each
 * (acceptance criterion 5).
 *
 * Six are enforced by this package and asserted here. TWO belong to later lots -
 * projection (7) and the world-to-pixel transform contract (8, second half) -
 * and their tests assert what this package DOES enforce plus the fact that it
 * exposes no API that would let a caller believe it covers the rest. A deferred
 * invariant with no marker is how a gap becomes an implicit claim.
 */
import { describe, expect, it } from "vitest";

import * as core from "../src/index.js";
import {
  GENERIC_PROFILE_ID,
  applyCommand,
  defaultProfileRegistry,
  entityRef,
  formatDiagnostics,
  occurrenceRef,
  occurrencesInGroup,
  occurrencesOfEntity,
  portRef,
  relationRef,
  serialiseContent,
  validateDocument,
  validateState,
  viewRef,
  type DiagramState,
  type SemanticDocument,
} from "../src/index.js";
import { distinctErrorCodes, readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;
const base: DiagramState = stateOf(readFixture("valid/generic-state.json"));

describe("invariant 1 - stable ids, resolved references, no silent pruning", () => {
  it("refuses a dangling reference instead of dropping the edge", () => {
    const fixture = readFixture("rejected/01-dangling-reference.json");
    expect(distinctErrorCodes(validateDocument(stateOf(fixture).document, { registry }))).toEqual([
      "dangling-reference",
    ]);
  });

  it("refuses a record whose key is not the element's own id", () => {
    const document: SemanticDocument = {
      ...base.document,
      entities: {
        "entity:not-the-id": {
          id: entityRef("alpha-2"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: { kind: "text", value: "Alpha 2" } },
        },
      },
      relations: {},
      ports: {},
      extensions: [],
    };
    expect(distinctErrorCodes(validateDocument(document, { registry }))).toContain("record-key-mismatch");
  });

  it("refuses the same occurrence id in two of a view's three maps", () => {
    const view = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const clash: DiagramState = {
      document: base.document,
      views: {
        "view:main": {
          ...view,
          portOccurrences: {
            ...view.portOccurrences,
            "occurrence:alpha-1": {
              id: occurrenceRef("alpha-1"),
              port: portRef("alpha-out"),
              ownerOccurrence: occurrenceRef("alpha-1"),
              side: "east",
              order: 0,
              anchor: 0.5,
            },
          },
        },
      },
    };
    expect(distinctErrorCodes(validateState(clash, { registry }))).toContain("duplicate-id");
  });
});

describe("invariant 2 - occurrences are drawings, the entity is the fact", () => {
  it("draws one entity twice in a view and once in another", () => {
    const main = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const detail = base.views["view:detail"] as NonNullable<(typeof base.views)[string]>;
    expect(occurrencesOfEntity(main, entityRef("alpha"))).toHaveLength(2);
    expect(occurrencesOfEntity(detail, entityRef("alpha"))).toHaveLength(1);
  });

  it("removing one drawing leaves the entity and the other drawing untouched", () => {
    const outcome = applyCommand(
      base,
      { kind: "remove-occurrence", view: viewRef("main"), occurrence: occurrenceRef("alpha-2") },
      { commandId: "cmd:i2", baseRevision: base.document.revision },
      { registry },
    );
    if (outcome.status !== "applied") throw new Error(formatDiagnostics(outcome.diagnostics));
    expect(outcome.state.document.entities["entity:alpha"]).toEqual(base.document.entities["entity:alpha"]);
    const main = outcome.state.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    expect(occurrencesOfEntity(main, entityRef("alpha")).map((occurrence) => occurrence.id)).toEqual([
      "occurrence:alpha-1",
    ]);
  });

  it("deleting the entity requires an explicit policy for occurrences, relations and ports", () => {
    const outcome = applyCommand(
      base,
      { kind: "delete-entity", entity: entityRef("gamma") } as unknown as core.Command,
      { commandId: "cmd:i2b", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("delete-policy-required");
  });
});

describe("invariant 3 - containment, hierarchy and visual grouping are distinct", () => {
  it("refuses a cycle in a relation type declared a tree", () => {
    const fixture = readFixture("rejected/03-hierarchy-cycle.json");
    const diagnostics = validateDocument(stateOf(fixture).document, { registry });
    expect(distinctErrorCodes(diagnostics)).toEqual(["hierarchy-cycle"]);
    // The diagnostic carries the cycle, not just the verdict.
    expect(diagnostics[0]?.refs).toContain("entity:c1");
    expect(diagnostics[0]?.message).toContain("->");
  });

  it("accepts a business cycle through a relation type that declares no hierarchy", () => {
    const document: SemanticDocument = {
      ...base.document,
      typeDefinitions: {},
      entities: {
        "entity:a": {
          id: entityRef("a"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: { kind: "text", value: "A" } },
        },
        "entity:b": {
          id: entityRef("b"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: { kind: "text", value: "B" } },
        },
      },
      ports: {},
      relations: {
        "relation:a-b": {
          id: relationRef("a-b"),
          profile: GENERIC_PROFILE_ID,
          type: "link",
          endpoints: [
            { role: "source", target: entityRef("a") },
            { role: "target", target: entityRef("b") },
          ],
          attributes: {},
        },
        "relation:b-a": {
          id: relationRef("b-a"),
          profile: GENERIC_PROFILE_ID,
          type: "link",
          endpoints: [
            { role: "source", target: entityRef("b") },
            { role: "target", target: entityRef("a") },
          ],
          attributes: {},
        },
      },
      resources: {},
      extensions: [],
    };
    expect(formatDiagnostics(validateDocument(document, { registry }))).toBe("");
  });

  it("groups drawings without implying containment", () => {
    const main = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const grouped = occurrencesInGroup(main, "group:cluster").map((occurrence) => occurrence.entity);
    expect(grouped).toEqual(["entity:alpha", "entity:beta"]);
    // alpha and beta are both children of root in the containment tree; the
    // visual group holds neither root nor the relation that contains them.
    const containment = Object.values(base.document.relations).filter((relation) => relation.type === "contains");
    expect(containment).toHaveLength(2);
    expect(grouped).not.toContain("entity:root");
  });
});

describe("invariant 4 - semantic and geometric ports are linked by occurrence", () => {
  it("refuses a port drawing bound to an occurrence of another entity", () => {
    const view = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const wrong: DiagramState = {
      document: base.document,
      views: {
        "view:main": {
          ...view,
          portOccurrences: {
            ...view.portOccurrences,
            "occurrence:alpha-out-1": {
              ...(view.portOccurrences["occurrence:alpha-out-1"] as NonNullable<
                (typeof view.portOccurrences)[string]
              >),
              ownerOccurrence: occurrenceRef("beta-1"),
            },
          },
        },
      },
    };
    expect(distinctErrorCodes(validateState(wrong, { registry }))).toContain("port-owner-mismatch");
  });

  it("keeps side, order and anchor explicit on the drawing, not on the semantic port", () => {
    const view = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const drawing = view.portOccurrences["occurrence:alpha-out-1"] as NonNullable<
      (typeof view.portOccurrences)[string]
    >;
    expect(drawing.side).toBe("east");
    expect(drawing.order).toBe(0);
    expect(drawing.anchor).toBe(0.5);
    const semantic = base.document.ports["port:alpha-out"] as NonNullable<(typeof base.document.ports)[string]>;
    expect(Object.keys(semantic).sort()).toEqual([
      "attributes",
      "direction",
      "id",
      "name",
      "owner",
      "profile",
      "type",
    ]);
  });

  it("keeps a relation's endpoints as roles and business ids, never as two index numbers", () => {
    const relation = base.document.relations["relation:flow"] as NonNullable<
      (typeof base.document.relations)[string]
    >;
    expect(relation.endpoints).toEqual([
      { role: "source", target: "port:alpha-out" },
      { role: "target", target: "port:beta-in" },
    ]);
    const drawing = (base.views["view:main"] as NonNullable<(typeof base.views)[string]>).relationOccurrences[
      "occurrence:flow-1"
    ];
    // The drawing names the ROLE it draws, so it can be matched back to the
    // relation's own endpoint rather than to a position in an array.
    expect(drawing?.endpoints.map((endpoint) => endpoint.role)).toEqual(["source", "target"]);
  });
});

describe("invariant 5 - a stored schema is migrated only by a versioned function", () => {
  it("names its registered migrations and refuses an unknown major for write", () => {
    expect(core.registeredMigrations()).toEqual(["1.0->1.1"]);
    const outcome = core.migrateStoredDocument(
      { documentId: "document:x", schemaVersion: { major: 9, minor: 0 } },
      { registry },
    );
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("unknown-schema-major");
    // Kept for inspection and export - the detail asserted in migrate.test.ts.
    expect(outcome.preserved.canonical.length).toBeGreaterThan(0);
  });
});

describe("invariant 6 - a validated command yields state, effects and an inverse or a reason", () => {
  it("returns the three, and never a partial success", () => {
    const outcome = applyCommand(
      base,
      { kind: "delete-view", view: viewRef("detail") },
      { commandId: "cmd:i6", baseRevision: base.document.revision },
      { registry },
    );
    if (outcome.status !== "applied") throw new Error(formatDiagnostics(outcome.diagnostics));
    expect(outcome.state.views["view:detail"]).toBeUndefined();
    expect(outcome.effects).toContainEqual({ kind: "view-deleted", view: "view:detail" });
    expect(outcome.inverse.kind).toBe("invertible");
    // The refusal side is asserted in commands-inverse.test.ts (stale revision,
    // refused command inside a batch, invalid final state).
    expect(serialiseContent(base)).toBe(serialiseContent(stateOf(readFixture("valid/generic-state.json"))));
  });
});

describe("invariant 7 - projection: NOT COVERED BY THIS LOT", () => {
  it("exposes no projection API, so nothing here can be mistaken for one", () => {
    // WRITTEN JUSTIFICATION (acceptance criterion 5). Invariant 7 is about a
    // PROJECTION: it must report the elements it excluded and why, keep an
    // origin -> projection -> result map, and never infer business conformance
    // from a rendered geometry. Projection belongs to GD-M2-PROCESSING (already
    // landed in @sentropic/graph, where `LayoutOutcome.inverse` carries the
    // origin -> projected index -> result correspondence) and to GD-M2-CANVAS.
    // This package produces no projection and no geometry of its own, so the
    // only thing it can do for this invariant is NOT to pretend: no export of
    // this barrel projects, flattens or lays anything out.
    const suspicious = Object.keys(core).filter((name) => /^(project|layout|scene|render|flatten)/i.test(name));
    expect(suspicious).toEqual([]);
  });
});

describe("invariant 8 - finite values and explicit units; ONE transform contract deferred", () => {
  it("refuses a non-finite geometry value", () => {
    const view = base.views["view:main"] as NonNullable<(typeof base.views)[string]>;
    const occurrence = view.entityOccurrences["occurrence:alpha-1"] as NonNullable<
      (typeof view.entityOccurrences)[string]
    >;
    const broken: DiagramState = {
      document: base.document,
      views: {
        "view:main": {
          ...view,
          entityOccurrences: {
            ...view.entityOccurrences,
            "occurrence:alpha-1": {
              ...occurrence,
              geometry: { ...occurrence.geometry, x: Number.POSITIVE_INFINITY },
            },
          },
        },
      },
    };
    expect(distinctErrorCodes(validateState(broken, { registry }))).toContain("value-not-finite");
  });

  it("refuses a quantity without its unit", () => {
    const fixture = readFixture("rejected/05-quantity-unit-missing.json");
    expect(distinctErrorCodes(validateDocument(stateOf(fixture).document, { registry }))).toEqual([
      "quantity-unit-missing",
    ]);
  });

  it("stores no transform and claims no world-to-pixel contract", () => {
    // WRITTEN JUSTIFICATION (acceptance criterion 5). The second half of
    // invariant 8 - a single world -> view -> CSS pixel -> device pixel contract,
    // with parent/child transforms composed identically for rendering, selection
    // and export - is a RENDERING contract. It belongs to GD-M2-CANVAS and to
    // the renderer already in @sentropic/graph. This package persists a camera
    // (three numbers) and finite geometry, and deliberately exposes no transform
    // composition, no devicePixelRatio and no hit testing: a model that carried
    // half a transform contract would be the worst of both.
    const suspicious = Object.keys(core).filter((name) => /transform|devicePixel|hitTest|matrix/i.test(name));
    expect(suspicious).toEqual([]);
    const presentation = (base.views["view:main"] as NonNullable<(typeof base.views)[string]>).presentation;
    expect(Object.keys(presentation.camera).sort()).toEqual(["x", "y", "zoom"]);
  });
});
