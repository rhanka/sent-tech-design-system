/**
 * Schema migration (SPEC 3.6).
 *
 * What is asserted: only a registered function migrates; the report names what
 * it did AND what it could not carry over, with a reason each; the original is
 * kept verbatim with its hash; an unknown major is refused for write and stays
 * inspectable and exportable; and the migrated document is then VALID, which is
 * the only reason to migrate at all.
 */
import { describe, expect, it } from "vitest";

import {
  CURRENT_SCHEMA_VERSION,
  defaultProfileRegistry,
  exportPreserved,
  formatDiagnostics,
  hashContent,
  migrateStoredDocument,
  registeredMigrations,
  validateDocument,
} from "../src/index.js";
import { readFixture } from "./fixtures.js";

const registry = defaultProfileRegistry;

describe("the 1.0 -> 1.1 migration", () => {
  const fixture = readFixture("stored/schema-1-0-document.json");
  const outcome = migrateStoredDocument(fixture.stored, { registry });

  it("is the only registered migration, and it ran", () => {
    expect(registeredMigrations()).toEqual(["1.0->1.1"]);
    expect(outcome.status).toBe("migrated");
  });

  it("produces a document at the current version whose ONLY remaining diagnostic is the one the report explains", () => {
    if (outcome.status !== "migrated") throw new Error("unreachable");
    expect(outcome.document.schemaVersion).toEqual(CURRENT_SCHEMA_VERSION);

    // MEASURED, AND DELIBERATE: a migration is not a repair. `entity:legacy-other`
    // stored `name: 42` where the schema declares text; the value could not be
    // carried over, and `name` is REQUIRED, so the migrated document is valid
    // everywhere except there. The migration does not invent a name, and it does
    // not refuse the whole document either - it migrates what it can, says what
    // it could not, and leaves the element unwritable until a host decides.
    const diagnostics = validateDocument(outcome.document, { registry });
    expect(diagnostics.map((entry) => ({ code: entry.code, path: entry.path }))).toEqual([
      { code: "attribute-required-missing", path: "entities.entity:legacy-other.attributes.name" },
    ]);
    // The same element and attribute appear in the report, with the reason.
    expect(outcome.report.unmigrated.some((item) => item.path === "entities.entity:legacy-other.attributes.name")).toBe(
      true,
    );

    // Everything else IS writable: dropping that one element leaves a clean
    // document, which is what "migrated what it could" means concretely.
    const withoutBrokenElement = {
      ...outcome.document,
      entities: Object.fromEntries(
        Object.entries(outcome.document.entities).filter(([key]) => key !== "entity:legacy-other"),
      ),
    };
    expect(formatDiagnostics(validateDocument(withoutBrokenElement, { registry }))).toBe("");
  });

  it("wraps bare values with their kind, and pins a unit only when the schema declares one", () => {
    if (outcome.status !== "migrated") throw new Error("unreachable");
    const node = outcome.document.entities["entity:legacy-node"];
    expect(node?.profile).toBe("generic@1");
    expect(node?.attributes["name"]).toEqual({ kind: "text", value: "Legacy node" });
    expect(node?.attributes["state"]).toEqual({ kind: "enum", value: "active" });
    expect(node?.attributes["pinned"]).toEqual({ kind: "boolean", value: true });
    expect(node?.attributes["createdAt"]).toEqual({ kind: "date", value: "2026-01-15" });
    expect(node?.attributes["owner"]).toEqual({ kind: "reference", value: "entity:legacy-root" });
    expect(node?.attributes["tags"]).toEqual({
      kind: "collection",
      items: [
        { kind: "text", value: "legacy" },
        { kind: "text", value: "migrated" },
      ],
    });
    // `weight` declares exactly one unit, so the migration pins it and says so.
    expect(node?.attributes["weight"]).toEqual({ kind: "quantity", value: 4, unit: "unit" });
    const pinned = outcome.report.operations.find((operation) => operation.path.endsWith("attributes.weight"));
    expect(pinned?.detail).toContain("unit pinned to unit");
  });

  it("lists every item it could not carry over, with its reason", () => {
    if (outcome.status !== "migrated") throw new Error("unreachable");
    expect(outcome.report.unmigrated).toEqual([
      {
        path: "entities.entity:legacy-node.attributes.colour",
        reason: "attribute-not-in-schema",
        detail:
          "the effective schema does not declare colour; the value stays in the report's original bytes and is not promoted",
      },
      {
        path: "entities.entity:legacy-node.attributes.duration",
        reason: "quantity-unit-missing",
        detail:
          "stored value 120 carries no unit and the schema declares 3 units (s, min, h); the migration does not guess",
      },
      {
        path: "entities.entity:legacy-node.attributes.state_typo",
        reason: "attribute-not-in-schema",
        detail:
          "the effective schema does not declare state_typo; the value stays in the report's original bytes and is not promoted",
      },
      {
        path: "entities.entity:legacy-other.attributes.name",
        reason: "attribute-type-mismatch",
        detail: "schema expects text, stored value is a number",
      },
    ]);
    // An unmigrated attribute is ABSENT from the migrated document; it is not
    // half-converted, and it is not silently defaulted.
    expect(outcome.document.entities["entity:legacy-node"]?.attributes["duration"]).toBeUndefined();
    expect(outcome.document.entities["entity:legacy-other"]?.attributes["name"]).toBeUndefined();
  });

  it("renames the 1.0 extension hash field, and keeps the hash value", () => {
    if (outcome.status !== "migrated") throw new Error("unreachable");
    expect(outcome.report.operations).toContainEqual({
      op: "rename-field",
      path: "extensions[0].hash",
      detail: "hash -> contentHash",
    });
    expect(outcome.document.extensions[0]?.contentHash).toBe("fnv1a64:aaaabbbbccccdddd");
    // It stays `preserved-unvalidated`: a migration does not promote imported
    // content to a business fact (decision D3-C).
    expect(outcome.document.extensions[0]?.validation).toBe("preserved-unvalidated");
  });

  it("keeps the original, verbatim and hashed", () => {
    if (outcome.status !== "migrated") throw new Error("unreachable");
    expect(outcome.report.from).toEqual({ major: 1, minor: 0 });
    expect(outcome.report.to).toEqual({ major: 1, minor: 1 });
    expect(outcome.report.originalCanonical).toContain('"colour":"red"');
    expect(outcome.report.originalCanonical).toContain('"duration":120');
    expect(outcome.report.originalHash).toBe(hashContent(outcome.report.originalCanonical));
  });
});

describe("refusals", () => {
  it("refuses an unknown major for write and keeps it exportable", () => {
    const fixture = readFixture("rejected/07-unknown-schema-major.json");
    const outcome = migrateStoredDocument(fixture.stored, { registry });
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("unknown-schema-major");
    expect(outcome.diagnostics[0]?.details).toEqual({ seenMajor: 2, currentMajor: 1 });
    expect(outcome.preserved.schemaVersion).toEqual({ major: 2, minor: 0 });
    // The export path: the preserved canonical bytes, unchanged and hashable.
    const exported = exportPreserved(outcome.preserved);
    expect(exported).toBe(outcome.preserved.canonical);
    expect(hashContent(exported)).toBe(outcome.preserved.contentHash);
    expect(JSON.parse(exported)).toEqual(fixture.stored);
  });

  it("refuses a minor no registered migration reads", () => {
    const outcome = migrateStoredDocument(
      { documentId: "document:x", schemaVersion: { major: 1, minor: 7 }, profileRefs: ["generic@1"] },
      { registry },
    );
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("schema-migration-required");
    expect(outcome.diagnostics[0]?.message).toContain("registered: 1.0->1.1");
  });

  it("refuses bytes that are not a document at all, and still names them", () => {
    const outcome = migrateStoredDocument("not a document", { registry });
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("document-not-an-object");
    expect(outcome.preserved.readable).toBe(false);
    expect(outcome.preserved.contentHash).toMatch(/^fnv1a64:[0-9a-f]{16}$/);
  });

  it("refuses a malformed schema version rather than assuming one", () => {
    const outcome = migrateStoredDocument({ documentId: "document:x", schemaVersion: "1.1" }, { registry });
    expect(outcome.status).toBe("refused");
    if (outcome.status !== "refused") throw new Error("unreachable");
    expect(outcome.diagnostics[0]?.code).toBe("schema-version-malformed");
  });

  it("reports a document already at the current version as current, untouched", () => {
    const fixture = readFixture("valid/generic-state.json");
    const outcome = migrateStoredDocument(fixture.document, { registry });
    expect(outcome.status).toBe("current");
    if (outcome.status !== "current") throw new Error("unreachable");
    expect(outcome.document).toEqual(fixture.document);
  });
});
