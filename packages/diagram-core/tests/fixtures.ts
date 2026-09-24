/**
 * Fixture loading. Fixtures are DATA: they are read from disk as JSON and cast
 * once, here, with the cast named. Nothing else in the tests casts, so a fixture
 * that drifts from the model shows up as a validation diagnostic rather than as a
 * type error that a test author would be tempted to silence.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { DiagnosticCode, SemanticDocument, Transaction, ViewDocument } from "../src/index.js";
import type { DiagramState } from "../src/state.js";

const here = dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = join(here, "..", "fixtures");

export interface FixtureEnvelope {
  readonly case: string;
  readonly note: string;
  readonly kind: "state" | "document" | "stored" | "transaction";
  readonly expect?: { readonly codes: readonly DiagnosticCode[] };
  readonly document?: SemanticDocument;
  readonly views?: Readonly<Record<string, ViewDocument>>;
  readonly stored?: unknown;
  readonly state?: DiagramState;
  readonly transaction?: Transaction;
}

export function readFixture(relativePath: string): FixtureEnvelope {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, relativePath), "utf8")) as FixtureEnvelope;
}

export function listFixtures(relativeDir: string): readonly string[] {
  return readdirSync(join(FIXTURES_DIR, relativeDir))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => `${relativeDir}/${name}`);
}

/** A fixture's document, or a loud failure: a missing field is a broken fixture. */
export function documentOf(fixture: FixtureEnvelope): SemanticDocument {
  if (fixture.document === undefined) throw new Error(`fixture ${fixture.case} carries no document`);
  return fixture.document;
}

export function stateOf(fixture: FixtureEnvelope): DiagramState {
  if (fixture.state !== undefined) return fixture.state;
  if (fixture.document === undefined) throw new Error(`fixture ${fixture.case} carries no state`);
  return { document: fixture.document, views: fixture.views ?? {} };
}

export function transactionOf(fixture: FixtureEnvelope): Transaction {
  if (fixture.transaction === undefined) throw new Error(`fixture ${fixture.case} carries no transaction`);
  return fixture.transaction;
}

export function expectedCodes(fixture: FixtureEnvelope): readonly DiagnosticCode[] {
  if (fixture.expect === undefined) throw new Error(`fixture ${fixture.case} declares no expected codes`);
  return fixture.expect.codes;
}

/** The distinct error codes of a run, sorted: what a fixture's `expect` compares against. */
export const distinctErrorCodes = (
  diagnostics: readonly { readonly code: DiagnosticCode; readonly severity: string }[],
): readonly DiagnosticCode[] =>
  [...new Set(diagnostics.filter((entry) => entry.severity === "error").map((entry) => entry.code))].sort();
