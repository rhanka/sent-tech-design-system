/**
 * The focus port (§4.3 item 2, owner decision 2026-10-30): adapts
 * `@sentropic/focus/validate`'s `validateDecisionDossierDocument` to the
 * injected {@link SemanticPort} seam.
 *
 * The port is declared STRUCTURALLY (no import of `@sentropic/focus` here):
 * the validator's pure half imports nothing, and the host passes the real
 * validator it resolved — the pinned version is recorded by the
 * DecisionDossier contract's `semantic` block, and the focus port factory
 * accepts any function with the same shape. `@sentropic/focus/validate`
 * validates legacy v1 by default (`schemaVersion` absent), which is the
 * schema the catalogue embeds.
 */

import type { SemanticFinding, SemanticPort } from "./types.js";

/** One focus validation issue: `path` is focus's JSON-path style (`$.a[0].b`). */
export interface FocusValidationIssue {
  /** JSON-path-style location, e.g. `$.sections[3].id`. */
  readonly path: string;
  /** Focus's stable machine code, e.g. `duplicate_id`. */
  readonly code: string;
  readonly message: string;
}

/** The shape of `validateDecisionDossierDocument` (matched structurally). */
export type FocusValidationResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly issues: readonly FocusValidationIssue[] };

/** Any function shaped like `@sentropic/focus/validate`'s default validator. */
export type FocusValidate = (value: unknown) => FocusValidationResult;

/** Escapes one RFC 6901 token (`~` then `/`). */
function escapePointerToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

/**
 * Converts focus's JSON-path pointer (`$.sections[3].id`) to an RFC 6901
 * pointer relative to the payload (`/sections/3/id`).
 */
export function focusPathToPointer(path: string): string {
  const withoutRoot = path.startsWith("$") ? path.slice(1) : path;
  const tokens: string[] = [];
  for (const match of withoutRoot.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
    const token = match[1] ?? match[2];
    if (token !== undefined) tokens.push(escapePointerToken(token));
  }
  return tokens.length === 0 ? "" : `/${tokens.join("/")}`;
}

/** Wraps a focus validator as the injected `focus` semantic port. */
export function createFocusPort(validate: FocusValidate): SemanticPort {
  return {
    source: "focus",
    validate(payload: unknown): readonly SemanticFinding[] {
      const result = validate(payload);
      if (result.ok) return [];
      return result.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        pointer: focusPathToPointer(issue.path),
        severity: "error" as const,
      }));
    },
  };
}
