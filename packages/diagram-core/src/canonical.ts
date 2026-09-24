/**
 * Canonical JSON: the byte-level identity of a document.
 *
 * It exists for one reason: SPEC 6 asks that a command followed by its inverse
 * restore the initial state BYTE FOR BYTE. That is only meaningful against a
 * serialisation that is a function of the CONTENT alone - so:
 *   - object keys are sorted by code unit, never by insertion order;
 *   - no whitespace, no trailing newline;
 *   - `undefined` members are omitted, exactly as an absent field;
 *   - a function, a symbol, a `NaN`/`Infinity`, a `BigInt` or a cycle is a
 *     REFUSAL, not a silent `null` (which is what `JSON.stringify` would do for
 *     the first two and what it throws for the last). A document is data.
 *
 * `serialiseContent` additionally normalises revisions to 0. This is a measured
 * departure from a literal reading of the acceptance criterion, and it is
 * required by the spec's own revision rule: applying a command bumps the
 * revision, and "undo is a new transaction, not a rewrite of the journal"
 * (study section 7). After command + inverse the CONTENT is identical and the
 * revision is necessarily two ahead, so the byte comparison is made on content
 * and the revision is asserted separately.
 */

import { type Diagnostic, diagnostic } from "./diagnostics.js";
import type { SemanticDocument } from "./document.js";
import type { ViewDocument } from "./view.js";
import type { DiagramState } from "./state.js";

export class CanonicalisationError extends Error {
  readonly diagnostics: readonly Diagnostic[];

  constructor(diagnostics: readonly Diagnostic[]) {
    super(`value is not canonically serialisable: ${diagnostics.map((entry) => entry.message).join("; ")}`);
    this.name = "CanonicalisationError";
    this.diagnostics = diagnostics;
  }
}

function encode(value: unknown, path: string, seen: ReadonlySet<object>, diagnostics: Diagnostic[]): string | undefined {
  if (value === null) return "null";
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number": {
      if (!Number.isFinite(value)) {
        diagnostics.push(
          diagnostic({ code: "value-not-finite", path, message: `${String(value)} is not a finite number` }),
        );
        return undefined;
      }
      // `-0` and `0` must not produce different bytes: they are the same value.
      return JSON.stringify(value === 0 ? 0 : value);
    }
    case "undefined":
      return undefined;
    case "bigint":
    case "function":
    case "symbol":
      diagnostics.push(
        diagnostic({
          code: "value-not-serialisable",
          path,
          message: `a ${typeof value} cannot be part of a document`,
          details: { valueType: typeof value },
        }),
      );
      return undefined;
    default:
      break;
  }

  const object = value as object;
  if (seen.has(object)) {
    diagnostics.push(diagnostic({ code: "value-not-serialisable", path, message: "cyclic value" }));
    return undefined;
  }
  const nested = new Set(seen).add(object);

  if (Array.isArray(object)) {
    const items = object.map((item, index) => {
      const encoded = encode(item, `${path}[${index}]`, nested, diagnostics);
      // An absent array member is `null`: an array's length IS content.
      return encoded ?? "null";
    });
    return `[${items.join(",")}]`;
  }

  const entries: string[] = [];
  for (const key of Object.keys(object as Record<string, unknown>).sort()) {
    const encoded = encode((object as Record<string, unknown>)[key], `${path}.${key}`, nested, diagnostics);
    if (encoded !== undefined) entries.push(`${JSON.stringify(key)}:${encoded}`);
  }
  return `{${entries.join(",")}}`;
}

/** Canonical bytes, or the diagnostics that make the value unserialisable. */
export function tryCanonicalise(
  value: unknown,
  path = "$",
): { readonly ok: true; readonly text: string } | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const text = encode(value, path, new Set(), diagnostics);
  if (diagnostics.length > 0 || text === undefined) {
    return {
      ok: false,
      diagnostics:
        diagnostics.length > 0
          ? diagnostics
          : [diagnostic({ code: "value-not-serialisable", path, message: "value encodes to nothing" })],
    };
  }
  return { ok: true, text };
}

/** Canonical bytes, or `CanonicalisationError`. Use where a refusal is a bug. */
export function canonicalise(value: unknown, path = "$"): string {
  const result = tryCanonicalise(value, path);
  if (!result.ok) throw new CanonicalisationError(result.diagnostics);
  return result.text;
}

export const serialiseDocument = (document: SemanticDocument): string => canonicalise(document, "document");
export const serialiseView = (view: ViewDocument): string => canonicalise(view, "view");

/** The whole state: document plus views, views keyed and therefore order-free. */
export const serialiseState = (state: DiagramState): string => canonicalise(state, "state");

/** Every revision normalised to 0. This is the comparison an inverse test makes. */
export function serialiseContent(state: DiagramState): string {
  return canonicalise(
    {
      document: { ...state.document, revision: 0 },
      views: Object.fromEntries(
        Object.entries(state.views).map(([key, view]) => [key, { ...view, revision: 0 }] as const),
      ),
    },
    "state",
  );
}

export const documentContentHashInput = (document: SemanticDocument): string =>
  canonicalise({ ...document, revision: 0 }, "document");
