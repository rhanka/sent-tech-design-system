/**
 * The `executor-profile-bindings@1` compatibility carrier (M3 §5.3.1).
 *
 * A package-contained, hash-bound table mapping each profile id to the
 * declaration adapter the executor must run for it: `legacy-constraints@1`
 * (the pinned native @1 declaration/endpoint checks and native stage
 * ordering) or `scoped-constraints@1` (the shared M3 mechanisms: resolver,
 * family roles, scoped uniqueness, generic constraints, scalar extensions).
 *
 * The table is an asset, never a declaration field: no closed record gains a
 * field for it. A missing row or a digest mismatch refuses the run; the
 * executor never guesses an adapter from the absence of a scope.
 */

import { type Diagnostic, diagnostic } from "./diagnostics.js";
import { hashContent } from "./hash.js";
import type { Profile, ProfileId, ProfileRegistry } from "./profile.js";

/** Which declaration/endpoint checks the executor runs for one profile. */
export type DeclarationAdapter = "legacy-constraints@1" | "scoped-constraints@1";

export const LEGACY_CONSTRAINTS_ADAPTER: DeclarationAdapter = "legacy-constraints@1";
export const SCOPED_CONSTRAINTS_ADAPTER: DeclarationAdapter = "scoped-constraints@1";

/** Pin equality means equality of id, version AND contentDigest, never a label. */
export interface ProfilePin {
  readonly id: string;
  readonly version: number;
  readonly contentDigest: string;
}

export interface ExecutorProfileBindingRow {
  readonly profileId: ProfileId;
  /** Rows are unique by `ProfileId`; a pin verifies bytes, never chooses between duplicates. */
  readonly profilePin: ProfilePin;
  readonly declarationAdapter: DeclarationAdapter;
}

export interface ExecutorProfileBindings {
  readonly schemaVersion: "1";
  readonly rows: readonly ExecutorProfileBindingRow[];
}

/** Key-sorted serialisation: a digest over declaration bytes, never over labels. */
export function stableStringify(value: unknown): string {
  if (value === null) return "null";
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "boolean":
      return value ? "true" : "false";
    case "number":
      if (!Number.isFinite(value)) throw new Error("stableStringify: non-finite number");
      return JSON.stringify(value === 0 ? 0 : value);
    case "undefined":
      return "null";
    default:
      break;
  }
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(",")}}`;
  }
  throw new Error(`stableStringify: unsupported ${typeof value}`);
}

/** The content digest a binding pin must carry for this profile object. */
export const digestProfile = (profile: Profile): string => hashContent(stableStringify(profile));

/** One binding row for this profile object, with its verifying digest. */
export function bindingRowFor(profile: Profile, declarationAdapter: DeclarationAdapter): ExecutorProfileBindingRow {
  return {
    profileId: profile.id,
    profilePin: { id: profile.id, version: profile.version, contentDigest: digestProfile(profile) },
    declarationAdapter,
  };
}

/**
 * Verify the table before any document check runs. Every finding refuses the
 * run on its own: verification diagnostics are returned instead of document
 * diagnostics, never merged with them.
 */
export function verifyExecutorBindings(
  bindings: ExecutorProfileBindings,
  registry: ProfileRegistry,
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (bindings.schemaVersion !== "1") {
    return [
      diagnostic({
        code: "type-definition-conflict",
        path: "bindings.schemaVersion",
        message: `executor bindings schema version ${JSON.stringify(bindings.schemaVersion)} is not readable by this build`,
        details: { seen: String(bindings.schemaVersion) },
      }),
    ];
  }
  const seen = new Set<string>();
  bindings.rows.forEach((row, index) => {
    const rowPath = `bindings.rows[${index}]`;
    if (seen.has(row.profileId)) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: rowPath,
          message: `executor binding for profile ${row.profileId} is declared twice`,
          details: { profile: row.profileId },
        }),
      );
      return;
    }
    seen.add(row.profileId);
    const registered = registry.get(row.profileId);
    if (registered === undefined) {
      diagnostics.push(
        diagnostic({
          code: "unknown-profile",
          path: rowPath,
          message: `executor binding names profile ${row.profileId}, which is not in the registry`,
          details: { profile: row.profileId },
        }),
      );
      return;
    }
    if (
      row.declarationAdapter !== LEGACY_CONSTRAINTS_ADAPTER &&
      row.declarationAdapter !== SCOPED_CONSTRAINTS_ADAPTER
    ) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: `${rowPath}.declarationAdapter`,
          message: `executor binding for ${row.profileId} names an unknown adapter`,
          details: { profile: row.profileId },
        }),
      );
      return;
    }
    if (
      row.profilePin.id !== registered.id ||
      row.profilePin.version !== registered.version ||
      row.profilePin.contentDigest !== digestProfile(registered)
    ) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: rowPath,
          message: `binding for ${row.profileId} does not match the registered bytes`,
          details: { profile: row.profileId },
        }),
      );
    }
  });
  return diagnostics;
}

/** The adapter for one profile id, or `undefined` when no row selects one. */
export function adapterFor(
  bindings: ExecutorProfileBindings | undefined,
  profileId: ProfileId,
): DeclarationAdapter | undefined {
  if (bindings === undefined) return LEGACY_CONSTRAINTS_ADAPTER;
  return bindings.rows.find((row) => row.profileId === profileId)?.declarationAdapter;
}
