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
import { canonicalBytes, sha256Hex } from "./sha256.js";
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

/**
 * The imposed adapter mapping (M3 §5.3.1): legacy rows are exactly the four
 * @1 profiles, completed rows use the scoped adapter. Verification refuses a
 * row that contradicts it — in particular a `generic@2`, `archimate@2` or
 * `uml@2 → legacy` row — so no @2 execution ever silently falls back to the
 * retained native checks.
 */
const IMPOSED_ADAPTERS: Readonly<Record<string, DeclarationAdapter>> = {
  "generic@1": LEGACY_CONSTRAINTS_ADAPTER,
  "archimate@1": LEGACY_CONSTRAINTS_ADAPTER,
  "bpmn@1": LEGACY_CONSTRAINTS_ADAPTER,
  "uml@1": LEGACY_CONSTRAINTS_ADAPTER,
  "generic@2": SCOPED_CONSTRAINTS_ADAPTER,
  "archimate@2": SCOPED_CONSTRAINTS_ADAPTER,
  "uml@2": SCOPED_CONSTRAINTS_ADAPTER,
};

/** The imposed adapter for a shipped profile id, or `undefined` when none applies. */
export function imposedAdapterFor(profileId: ProfileId): DeclarationAdapter | undefined {
  return (IMPOSED_ADAPTERS as Readonly<Record<ProfileId, DeclarationAdapter | undefined>>)[profileId];
}

/**
 * The four retained @1 identities (M3 §5.3.1): the only profiles whose
 * legacy rows are admitted. Every other profile, any version, requires a
 * verified row, and a legacy row outside this set is refused.
 */
export const RETAINED_LEGACY_PROFILE_IDS = ["generic@1", "archimate@1", "bpmn@1", "uml@1"] as const;

export type RetainedLegacyProfileId = (typeof RETAINED_LEGACY_PROFILE_IDS)[number];

/** Whether this profile id is one of the four retained legacy identities. */
export function isRetainedLegacyProfileId(profileId: ProfileId): boolean {
  return (RETAINED_LEGACY_PROFILE_IDS as readonly string[]).includes(profileId);
}

/**
 * The embedded `executor-profile-bindings@1` table for shipped profiles:
 * one verifying row per profile, with its imposed adapter. Every profile
 * without an imposed mapping is a caller error, refused loudly rather than
 * guessed.
 */
export function embeddedExecutorBindings(profiles: readonly Profile[]): ExecutorProfileBindings {
  return {
    schemaVersion: "1",
    rows: profiles.map((profile) => {
      const imposed = imposedAdapterFor(profile.id);
      if (imposed === undefined) {
        throw new Error(`no imposed executor adapter for profile ${profile.id}; pass an explicit binding row`);
      }
      return bindingRowFor(profile, imposed);
    }),
  };
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

/**
 * The P-CONTENT-DIAGRAM projection (§7.3.2): the closed preimage whose
 * SHA-256 is the binding `contentDigest`. Keys in canonical (sorted) order;
 * `name`, `version` and `notes` are excluded (identity is carried by
 * `profile`), omitted limits hash as `null`, never `0` or dropped.
 */
export function contentDiagramPreimage(profile: Profile): Record<string, unknown> {
  return {
    completeness: profile.completeness,
    constraints: [...profile.constraints],
    entityTypes: [...profile.entityTypes],
    limits: {
      maxEntities: profile.limits.maxEntities ?? null,
      maxRelations: profile.limits.maxRelations ?? null,
      maxEndpointsPerRelation: profile.limits.maxEndpointsPerRelation ?? null,
    },
    portTypes: [...profile.portTypes],
    profile: profile.id,
    relationTypes: [...profile.relationTypes],
  };
}

/** SHA-256 over the P-CONTENT-DIAGRAM canonical bytes (64 hex, no prefix). */
export function contentDiagramDigest(profile: Profile): string {
  return sha256Hex(canonicalBytes(contentDiagramPreimage(profile)));
}

/**
 * The internal cache fingerprint: FNV-1a over the full declaration bytes.
 * It scopes resolver caches and never gates trust; binding pins use the
 * P-CONTENT-DIAGRAM SHA-256 above.
 */
export const digestProfile = (profile: Profile): string => hashContent(stableStringify(profile));

/** One binding row for this profile object, with its verifying digest. */
export function bindingRowFor(profile: Profile, declarationAdapter: DeclarationAdapter): ExecutorProfileBindingRow {
  return {
    profileId: profile.id,
    profilePin: { id: profile.id, version: profile.version, contentDigest: contentDiagramDigest(profile) },
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
      row.profilePin.contentDigest !== contentDiagramDigest(registered)
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
    const imposed = imposedAdapterFor(row.profileId);
    if (
      row.declarationAdapter === LEGACY_CONSTRAINTS_ADAPTER &&
      !isRetainedLegacyProfileId(row.profileId) &&
      imposed === undefined
    ) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: rowPath,
          message: `executor binding for ${row.profileId} must use ${SCOPED_CONSTRAINTS_ADAPTER}, not ${LEGACY_CONSTRAINTS_ADAPTER}`,
          refs: [],
          details: { profile: row.profileId },
        }),
      );
    }
    if (imposed !== undefined && row.declarationAdapter !== imposed) {
      diagnostics.push(
        diagnostic({
          code: "type-definition-conflict",
          path: rowPath,
          message: `executor binding for ${row.profileId} must use ${imposed}, not ${row.declarationAdapter}`,
          refs: [],
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
