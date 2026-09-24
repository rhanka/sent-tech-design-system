/**
 * Commands, transactions and inverses (SPEC 3.5, acceptance criterion 6).
 *
 * THE ROUND TRIP, AND WHAT IT COMPARES
 * For every one of the eighteen commands: apply it, replay the returned inverse
 * as a NEW transaction, and compare the canonical CONTENT bytes with the initial
 * ones. `serialiseContent` normalises revisions; the revision itself is asserted
 * separately to be exactly two ahead.
 *
 * That split is a measured departure from a literal reading of the criterion
 * ("octet pour octet sur la serialisation du document") and it is forced by the
 * spec's own revision rule: a command bumps the revision and "undo est une
 * nouvelle transaction contre l'etat actuel, pas une reecriture du journal"
 * (study section 7). A serialisation including the revision could therefore never
 * match after an undo, whatever the implementation. Comparing content bytes and
 * asserting the revision arithmetic keeps both halves of the contract checkable.
 */
import { describe, expect, it } from "vitest";

import {
  COMMAND_KINDS,
  GENERIC_PROFILE_ID,
  applyCommand,
  applyInverse,
  applyTransaction,
  createView,
  defaultProfileRegistry,
  documentRef,
  entityRef,
  formatDiagnostics,
  hashContent,
  occurrenceRef,
  portRef,
  relationRef,
  resourceRef,
  serialiseContent,
  viewRef,
  type Command,
  type CommandKind,
  type DiagramState,
} from "../src/index.js";
import { readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;
const base: DiagramState = stateOf(readFixture("valid/generic-state.json"));

function roundTrip(state: DiagramState, command: Command): void {
  const before = serialiseContent(state);
  const applied = applyCommand(
    state,
    command,
    { commandId: `cmd:${command.kind}`, baseRevision: state.document.revision, author: "test" },
    { registry },
  );
  if (applied.status !== "applied") {
    throw new Error(`${command.kind} was refused:\n${formatDiagnostics(applied.diagnostics)}`);
  }
  expect(applied.state.document.revision).toBe(state.document.revision + 1);
  expect(applied.effects.at(-1)).toEqual({
    kind: "revision-bumped",
    from: state.document.revision,
    to: state.document.revision + 1,
  });
  // The command changed something: an inverse test that compared an untouched
  // state with itself would pass vacuously.
  expect(serialiseContent(applied.state)).not.toBe(before);

  expect(applied.inverse.kind).toBe("invertible");
  const undone = applyInverse(applied.state, applied.inverse, { commandId: `undo:${command.kind}` }, { registry });
  if (undone.status !== "applied") {
    throw new Error(`the inverse of ${command.kind} was refused:\n${formatDiagnostics(undone.diagnostics)}`);
  }
  expect(serialiseContent(undone.state)).toBe(before);
  expect(undone.state.document.revision).toBe(state.document.revision + 2);
  // The caller's state was never mutated.
  expect(serialiseContent(state)).toBe(before);
}

const CASES: readonly { readonly kind: CommandKind; readonly command: Command; readonly note: string }[] = [
  {
    kind: "create-entity",
    note: "a new node; its inverse is a cascading delete, which at that point has nothing to cascade over",
    command: {
      kind: "create-entity",
      entity: {
        id: entityRef("delta"),
        profile: GENERIC_PROFILE_ID,
        type: "node",
        attributes: { name: { kind: "text", value: "Delta" } },
      },
    },
  },
  {
    kind: "update-entity-attributes",
    note: "sets one attribute and REMOVES another; the inverse carries the previous value and a null for the key that did not exist",
    command: {
      kind: "update-entity-attributes",
      entity: entityRef("beta"),
      attributes: { state: { kind: "enum", value: "retired" }, pinned: null },
    },
  },
  {
    kind: "delete-entity",
    note: "cascades over the hyperrelation that names it and over its drawing; the inverse restores all three",
    command: {
      kind: "delete-entity",
      entity: entityRef("gamma"),
      policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" },
    },
  },
  {
    kind: "create-relation",
    note: "entity-to-entity link, both endpoints allowed by the role declaration",
    command: {
      kind: "create-relation",
      relation: {
        id: relationRef("alpha-beta"),
        profile: GENERIC_PROFILE_ID,
        type: "link",
        endpoints: [
          { role: "source", target: entityRef("alpha") },
          { role: "target", target: entityRef("beta") },
        ],
        attributes: {},
      },
    },
  },
  {
    kind: "update-relation",
    note: "drops one member of the hyperrelation AND patches its label; the inverse restores both",
    command: {
      kind: "update-relation",
      // `relation:triple` is not drawn in any view. Re-pointing a relation that
      // IS drawn is refused, on purpose: its relation occurrence would then
      // attach to occurrences that no longer draw its endpoints
      // (`occurrence-endpoint-mismatch`), which is the drawing and the model
      // disagreeing - see the dedicated test below.
      relation: relationRef("triple"),
      endpoints: [
        { role: "member", target: entityRef("alpha") },
        { role: "member", target: entityRef("beta") },
      ],
      attributes: { label: { kind: "text", value: "two-way" } },
    },
  },
  {
    kind: "delete-relation",
    note: "a containment relation with no drawing",
    command: { kind: "delete-relation", relation: relationRef("root-beta"), policy: { occurrences: "cascade" } },
  },
  {
    kind: "create-port",
    note: "a semantic port on an entity that has none yet",
    command: {
      kind: "create-port",
      port: {
        id: portRef("gamma-out"),
        profile: GENERIC_PROFILE_ID,
        type: "port",
        owner: entityRef("gamma"),
        name: "out",
        direction: "out",
        attributes: {},
      },
    },
  },
  {
    kind: "update-port",
    note: "renames a port and flips its direction",
    command: { kind: "update-port", port: portRef("beta-in"), name: "inbound", direction: "inout" },
  },
  {
    kind: "delete-port",
    note: "cascades over the relation that ends on it, over its own drawing and over the relation drawing attached to it",
    command: {
      kind: "delete-port",
      port: portRef("alpha-out"),
      policy: { occurrences: "cascade", relations: "cascade" },
    },
  },
  {
    kind: "create-occurrence",
    note: "a THIRD drawing of an entity that is already drawn twice",
    command: {
      kind: "create-occurrence",
      view: viewRef("main"),
      occurrence: {
        of: "entity",
        occurrence: {
          id: occurrenceRef("beta-2"),
          entity: entityRef("beta"),
          geometry: { x: 600, y: 40, width: 160, height: 80 },
        },
      },
    },
  },
  {
    kind: "move-occurrence",
    note: "geometry placement on an entity occurrence",
    command: {
      kind: "move-occurrence",
      view: viewRef("main"),
      occurrence: occurrenceRef("alpha-1"),
      placement: { kind: "geometry", geometry: { x: 12, y: 12, width: 160, height: 80 } },
    },
  },
  {
    kind: "remove-occurrence",
    note: "removes ONE drawing; the entity and its other drawing are untouched",
    command: { kind: "remove-occurrence", view: viewRef("main"), occurrence: occurrenceRef("alpha-2") },
  },
  {
    kind: "create-view",
    note: "a second view over the same document",
    command: {
      kind: "create-view",
      view: createView({ viewId: viewRef("third"), semanticDocumentId: documentRef("d1") }),
    },
  },
  {
    kind: "delete-view",
    note: "deletes drawings only; the inverse restores the whole view document",
    command: { kind: "delete-view", view: viewRef("detail") },
  },
  {
    kind: "attach-resource",
    note: "a referenced resource descriptor; nothing fetches, parses or executes it",
    command: {
      kind: "attach-resource",
      resource: {
        id: resourceRef("diagram-png"),
        uri: "sentropic://resource/diagram-png",
        mediaType: "image/png",
        contentHash: hashContent("not the real bytes, and never fetched"),
        byteLength: 4096,
      },
    },
  },
  {
    kind: "detach-resource",
    note: "no policy is needed: an attribute still pointing at it would make the final state invalid",
    command: { kind: "detach-resource", resource: resourceRef("spec") },
  },
  {
    kind: "apply-preserved-extension",
    note: "preserved-unvalidated content WITH its source retained and its hash matching",
    command: {
      kind: "apply-preserved-extension",
      extension: {
        namespace: "https://example.invalid/vendor/style",
        schemaVersion: "1",
        scope: { kind: "document" },
        validation: "preserved-unvalidated",
        contentHash: hashContent("<vendor:style fill=\"none\"/>"),
        source: "<vendor:style fill=\"none\"/>",
      },
    },
  },
  {
    kind: "remove-preserved-extension",
    note: "the eighteenth command, which exists so the seventeenth has an inverse",
    command: {
      kind: "remove-preserved-extension",
      namespace: "https://example.invalid/vendor/layout",
      schemaVersion: "3",
      scope: { kind: "entity", target: entityRef("alpha") },
    },
  },
];

describe("every command of the lot has an inverse that restores the initial content", () => {
  it("the table covers every command kind, and no other", () => {
    expect([...new Set(CASES.map((entry) => entry.kind))].sort()).toEqual([...COMMAND_KINDS].sort());
    expect(COMMAND_KINDS).toHaveLength(18);
  });

  for (const entry of CASES) {
    it(`${entry.kind}: ${entry.note}`, () => {
      roundTrip(base, entry.command);
    });
  }

  it("a port placement and a waypoint placement round-trip too", () => {
    roundTrip(base, {
      kind: "move-occurrence",
      view: viewRef("main"),
      occurrence: occurrenceRef("alpha-out-1"),
      placement: { kind: "port", side: "north", order: 3, anchor: 0.25 },
    });
    roundTrip(base, {
      kind: "move-occurrence",
      view: viewRef("main"),
      occurrence: occurrenceRef("flow-1"),
      placement: { kind: "waypoints", waypoints: [{ x: 1, y: 2 }] },
    });
    // Clearing a route hint: an ABSENT waypoint list is restored as absent, not
    // as an empty array - the two are different bytes.
    roundTrip(base, {
      kind: "move-occurrence",
      view: viewRef("main"),
      occurrence: occurrenceRef("flow-1"),
      placement: { kind: "waypoints" },
    });
  });

  it("a multi-command transaction inverts in reverse order, byte for byte", () => {
    const fixture = readFixture("sequences/command-inverse-sequence.json");
    const state = stateOf(fixture);
    const transaction = fixture.transaction;
    if (transaction === undefined) throw new Error("fixture carries no transaction");
    const before = serialiseContent(state);

    const applied = applyTransaction(state, transaction, { registry });
    if (applied.status !== "applied") throw new Error(formatDiagnostics(applied.diagnostics));
    expect(applied.commandId).toBe("cmd:sequence");
    expect(applied.state.document.revision).toBe(8);
    if (applied.inverse.kind !== "invertible") throw new Error("expected an invertible outcome");
    // Four commands in, four inverse commands out, and the first of them undoes
    // the LAST command applied.
    expect(applied.inverse.commands).toHaveLength(4);
    expect(applied.inverse.commands[0]?.kind).toBe("detach-resource");
    expect(applied.inverse.commands.at(-1)?.kind).toBe("delete-entity");

    const undone = applyInverse(applied.state, applied.inverse, { commandId: "undo:sequence" }, { registry });
    if (undone.status !== "applied") throw new Error(formatDiagnostics(undone.diagnostics));
    expect(serialiseContent(undone.state)).toBe(before);
    expect(undone.state.document.revision).toBe(9);
  });
});

describe("refusals of the transaction layer", () => {
  it("refuses a stale revision and names both revisions", () => {
    const outcome = applyCommand(
      base,
      { kind: "delete-view", view: viewRef("detail") },
      { commandId: "cmd:stale", baseRevision: base.document.revision - 1 },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("revision-conflict");
    expect(outcome.diagnostics[0]?.details).toEqual({ expected: 4, seen: 3 });
  });

  it("applies nothing when one command of a transaction is refused", () => {
    const before = serialiseContent(base);
    const outcome = applyTransaction(
      base,
      {
        commandId: "cmd:partial",
        baseRevision: base.document.revision,
        commands: [
          {
            kind: "create-entity",
            entity: {
              id: entityRef("epsilon"),
              profile: GENERIC_PROFILE_ID,
              type: "node",
              attributes: { name: { kind: "text", value: "Epsilon" } },
            },
          },
          { kind: "delete-view", view: viewRef("does-not-exist") },
        ],
      },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("target-missing");
    expect(serialiseContent(base)).toBe(before);
  });

  it("refuses a transaction whose FINAL state would be invalid", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "create-entity",
        entity: {
          id: entityRef("zeta"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          // `colour` is not in generic@1's schema for `node`.
          attributes: { name: { kind: "text", value: "Zeta" }, colour: { kind: "text", value: "red" } },
        },
      },
      { commandId: "cmd:invalid-final", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics.map((entry) => entry.code)).toContain("attribute-not-in-schema");
  });

  it("refuses to delete an entity without an explicit policy", () => {
    const outcome = applyCommand(
      base,
      // The type makes `policy` mandatory; this is the untrusted-input path, so
      // the runtime says the same thing the compiler does.
      { kind: "delete-entity", entity: entityRef("gamma") } as unknown as Command,
      { commandId: "cmd:no-policy", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("delete-policy-required");
  });

  it("refuses a delete whose policy says refuse, and names what blocks it", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "delete-entity",
        entity: entityRef("root"),
        policy: { occurrences: "cascade", relations: "refuse", ports: "cascade" },
      },
      { commandId: "cmd:refuse", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("delete-policy-refused");
    expect(outcome.diagnostics[0]?.details).toEqual({ relations: 2 });
    expect(outcome.diagnostics[0]?.refs).toContain("relation:root-alpha");
  });

  it("refuses a placement that does not fit the occurrence kind", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "move-occurrence",
        view: viewRef("main"),
        occurrence: occurrenceRef("alpha-1"),
        placement: { kind: "port", side: "north", order: 0, anchor: 0 },
      },
      { commandId: "cmd:wrong-placement", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("placement-kind-mismatch");
    expect(outcome.diagnostics[0]?.details).toEqual({ expected: "geometry", seen: "port" });
  });

  it("refuses to apply an unsupported extension, and keeps saying why", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "apply-preserved-extension",
        extension: {
          namespace: "https://example.invalid/vendor/unsupported",
          schemaVersion: "7",
          scope: { kind: "document" },
          validation: "unsupported",
          contentHash: hashContent("whatever"),
        },
      },
      { commandId: "cmd:unsupported", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("extension-unsupported");
  });
});

describe("what a cascade does NOT decide", () => {
  it("refuses to delete an entity a typed reference attribute still points at", () => {
    // `entity:alpha` carries `owner -> entity:root`. The delete policy governs
    // occurrences, relations and ports; it says nothing about the attribute
    // graph, so the transaction refuses itself on the final state rather than
    // leaving a dangling typed reference behind. A reference disposition
    // ("clear the attribute", "refuse", "reassign") is not in this lot - see
    // README, "What is not covered yet".
    const outcome = applyCommand(
      base,
      {
        kind: "delete-entity",
        entity: entityRef("root"),
        policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" },
      },
      { commandId: "cmd:cascade-root", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect(outcome.diagnostics.map((entry) => entry.code)).toEqual(["dangling-reference"]);
    expect(outcome.diagnostics[0]?.path).toBe("entities.entity:alpha.attributes.owner");
  });

  it("refuses to re-point a relation that a view still draws", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "update-relation",
        relation: relationRef("flow"),
        endpoints: [
          { role: "source", target: entityRef("alpha") },
          { role: "target", target: entityRef("beta") },
        ],
      },
      { commandId: "cmd:repoint-drawn", baseRevision: base.document.revision },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") throw new Error("unreachable");
    expect([...new Set(outcome.diagnostics.map((entry) => entry.code))]).toEqual(["occurrence-endpoint-mismatch"]);
  });
});

describe("the documented reason an inverse may be absent", () => {
  it("returns non-invertible, with the budget in the reason, instead of an unbounded undo entry", () => {
    const outcome = applyCommand(
      base,
      {
        kind: "delete-entity",
        entity: entityRef("beta"),
        policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" },
      },
      { commandId: "cmd:budget", baseRevision: base.document.revision },
      // The cascade needs 1 entity + 1 port + 3 relations + 3 occurrences = 8
      // inverse commands; the budget allows seven.
      { registry, inverseBudget: 7 },
    );
    expect(outcome.status).toBe("applied");
    if (outcome.status !== "applied") throw new Error("unreachable");
    expect(outcome.inverse.kind).toBe("non-invertible");
    if (outcome.inverse.kind !== "non-invertible") throw new Error("unreachable");
    expect(outcome.inverse.code).toBe("inverse-budget-exceeded");
    expect(outcome.inverse.reason).toContain("8 commands");
    expect(outcome.inverse.reason).toContain("budget of 7");

    // Replaying a non-invertible outcome is refused, with that same reason.
    const undone = applyInverse(outcome.state, outcome.inverse, { commandId: "undo:budget" }, { registry });
    expect(undone.status).toBe("rejected");
    if (undone.status !== "rejected") throw new Error("unreachable");
    expect(undone.diagnostics[0]?.code).toBe("inverse-budget-exceeded");
  });

  it("the same cascade under the default budget IS invertible", () => {
    roundTrip(base, {
      kind: "delete-entity",
      entity: entityRef("beta"),
      policy: { occurrences: "cascade", relations: "cascade", ports: "cascade" },
    });
  });
});
