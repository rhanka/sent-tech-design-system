/**
 * The nine named rejected cases of SPEC 3.7.
 *
 * Each case is a fixture, and each assertion is about the DIAGNOSTIC, not merely
 * about the failure: the fixture declares the distinct error codes it must
 * produce, and the test compares the whole set. A fixture that starts producing
 * a second code - because a check leaked, or because the fixture drifted - fails
 * here instead of quietly widening what "refused" means.
 */
import { describe, expect, it } from "vitest";

import { defaultProfileRegistry, migrateStoredDocument, applyTransaction, validateDocument } from "../src/index.js";
import { distinctErrorCodes, expectedCodes, listFixtures, readFixture, stateOf, transactionOf } from "./fixtures.js";

const registry = defaultProfileRegistry;

/** The nine, by name and by file. A missing entry fails the coverage test below. */
const NINE_CASES = [
  ["dangling-reference", "rejected/01-dangling-reference.json"],
  ["reference-type-mismatch", "rejected/02-reference-type-mismatch.json"],
  ["hierarchy-cycle", "rejected/03-hierarchy-cycle.json"],
  ["attribute-not-in-schema", "rejected/04-attribute-not-in-schema.json"],
  ["quantity-unit-missing", "rejected/05-quantity-unit-missing.json"],
  ["collection-bound-exceeded", "rejected/06-collection-bound-exceeded.json"],
  ["unknown-schema-major", "rejected/07-unknown-schema-major.json"],
  ["revision-conflict", "rejected/08-revision-conflict.json"],
  ["extension-unsupported", "rejected/09-extension-unsupported.json"],
] as const;

describe("the nine named rejected cases", () => {
  it("has a fixture for each of the nine, and no orphan fixture", () => {
    const files = listFixtures("rejected");
    expect(files).toEqual(NINE_CASES.map(([, file]) => file));
  });

  for (const [name, file] of NINE_CASES) {
    it(`${name}: refused, with its own diagnostic`, () => {
      const fixture = readFixture(file);
      expect(fixture.case).toBe(name);

      if (fixture.kind === "document") {
        const diagnostics = validateDocument(stateOf(fixture).document, { registry });
        expect(distinctErrorCodes(diagnostics)).toEqual(expectedCodes(fixture));
        return;
      }

      if (fixture.kind === "stored") {
        const outcome = migrateStoredDocument(fixture.stored, { registry });
        expect(outcome.status).toBe("refused");
        if (outcome.status !== "refused") throw new Error("unreachable");
        expect(distinctErrorCodes(outcome.diagnostics)).toEqual(expectedCodes(fixture));
        // Refused for write, PRESERVED for inspection and export.
        expect(outcome.preserved.readable).toBe(true);
        expect(outcome.preserved.canonical).toContain("document:future");
        expect(outcome.preserved.contentHash).toMatch(/^fnv1a64:[0-9a-f]{16}$/);
        return;
      }

      if (fixture.kind === "transaction") {
        const state = stateOf(fixture);
        const before = JSON.stringify(state);
        const outcome = applyTransaction(state, transactionOf(fixture), { registry });
        expect(outcome.status).toBe("rejected");
        if (outcome.status !== "rejected") throw new Error("unreachable");
        expect(distinctErrorCodes(outcome.diagnostics)).toEqual(expectedCodes(fixture));
        const conflict = outcome.diagnostics.find((entry) => entry.code === "revision-conflict");
        // The two revisions are IN the diagnostic: a host can present the
        // conflict instead of inventing a merge.
        expect(conflict?.details).toEqual({ expected: 5, seen: 4 });
        // A refused transaction leaves the caller's state untouched.
        expect(JSON.stringify(state)).toBe(before);
        return;
      }

      throw new Error(`fixture kind ${fixture.kind} has no handler`);
    });
  }
});

describe("adjacent refusals the nine cases do not cover", () => {
  it("refuses a relation endpoint whose role the type does not declare", () => {
    const fixture = readFixture("rejected/01-dangling-reference.json");
    const document = stateOf(fixture).document;
    const broken = {
      ...document,
      entities: {
        ...document.entities,
        "entity:alpha": {
          ...(document.entities["entity:alpha"] as NonNullable<(typeof document.entities)[string]>),
          attributes: { name: { kind: "text", value: "Alpha" } as const },
        },
      },
      relations: {
        "relation:bad": {
          id: "relation:bad" as never,
          profile: "generic@1" as const,
          type: "link",
          endpoints: [{ role: "origin", target: "entity:alpha" as never }],
          attributes: {},
        },
      },
    };
    const codes = distinctErrorCodes(validateDocument(broken, { registry }));
    expect(codes).toContain("endpoint-role-unknown");
    // ... and the cardinality of the two declared roles is reported as well:
    // `link` requires exactly one source and one target.
    expect(codes).toContain("endpoint-cardinality-violation");
  });
});
