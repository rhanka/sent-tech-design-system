/**
 * Schema migration (SPEC 3.6).
 *
 * Three rules, and no fourth:
 *   1. A stored version is migrated ONLY by a registered, versioned function.
 *      There is no "read it anyway and hope" path.
 *   2. Every migration produces a REPORT: from, to, the operations it performed,
 *      what it could not migrate and why. The original is kept in the report, as
 *      canonical bytes plus its hash, so nothing is lost by migrating.
 *   3. An unknown MAJOR is refused for write and PRESERVED for inspection and
 *      export when it can be read at all. It is never partially interpreted.
 *
 * The version history this build knows:
 *   1.0 - first stored shape. Elements carried no `profile` field, attributes
 *         were bare JSON primitives, extensions carried `hash`.
 *   1.1 - current. Elements name their profile, attribute values carry their
 *         kind (and a quantity its unit), extensions carry `contentHash`.
 */

import type { AttributeValue, ScalarAttributeValue, ScalarSchema } from "./attributes.js";
import { canonicalise, tryCanonicalise } from "./canonical.js";
import { type Diagnostic, type DiagnosticCode, diagnostic } from "./diagnostics.js";
import {
  CURRENT_SCHEMA_VERSION,
  type Entity,
  type PreservedExtension,
  type Relation,
  type SchemaVersion,
  type SemanticDocument,
  type SemanticPort,
} from "./document.js";
import { hashContent } from "./hash.js";
import { entityTypeOf, portTypeOf, relationTypeOf, type Profile, type ProfileId, type ProfileRegistry } from "./profile.js";
import type { AttributeSchema } from "./attributes.js";

export interface MigrationOperation {
  readonly op: string;
  readonly path: string;
  readonly detail?: string;
}

export interface UnmigratedItem {
  readonly path: string;
  readonly reason: DiagnosticCode;
  readonly detail: string;
}

export interface MigrationReport {
  readonly from: SchemaVersion;
  readonly to: SchemaVersion;
  readonly operations: readonly MigrationOperation[];
  /** What the migration could not carry over, with the reason. Never empty-by-omission. */
  readonly unmigrated: readonly UnmigratedItem[];
  /** The original, kept verbatim as canonical bytes. */
  readonly originalCanonical: string;
  readonly originalHash: string;
}

/** What is kept when a document cannot be migrated: enough to inspect and export it. */
export interface PreservedStoredDocument {
  readonly schemaVersion: SchemaVersion | null;
  readonly canonical: string;
  readonly contentHash: string;
  /** `true` when the stored bytes could be read at all (an object with sane keys). */
  readonly readable: boolean;
}

export type MigrationOutcome =
  | { readonly status: "current"; readonly document: SemanticDocument }
  | { readonly status: "migrated"; readonly document: SemanticDocument; readonly report: MigrationReport }
  | {
      readonly status: "refused";
      readonly diagnostics: readonly Diagnostic[];
      readonly preserved: PreservedStoredDocument;
    };

export interface MigrateOptions {
  readonly registry: ProfileRegistry;
}

const asRecord = (value: unknown): Readonly<Record<string, unknown>> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : undefined;

function readVersion(stored: Readonly<Record<string, unknown>>): SchemaVersion | undefined {
  const version = asRecord(stored["schemaVersion"]);
  if (version === undefined) return undefined;
  const major = version["major"];
  const minor = version["minor"];
  if (!Number.isInteger(major) || !Number.isInteger(minor)) return undefined;
  return { major: major as number, minor: minor as number };
}

function preserve(stored: unknown, version: SchemaVersion | null): PreservedStoredDocument {
  const canonical = tryCanonicalise(stored, "stored");
  if (!canonical.ok) {
    // Even unreadable bytes get an identity: a caller can still report WHICH
    // document it refused.
    const fallback = JSON.stringify(String(stored));
    return { schemaVersion: version, canonical: fallback, contentHash: hashContent(fallback), readable: false };
  }
  return {
    schemaVersion: version,
    canonical: canonical.text,
    contentHash: hashContent(canonical.text),
    readable: asRecord(stored) !== undefined,
  };
}

/** Wrap one bare 1.0 value using the schema that 1.1 requires it to satisfy. */
function wrapScalar(
  schema: ScalarSchema,
  raw: unknown,
  path: string,
  operations: MigrationOperation[],
  unmigrated: UnmigratedItem[],
): ScalarAttributeValue | undefined {
  switch (schema.kind) {
    case "text":
    case "enum":
    case "date":
    case "reference": {
      if (typeof raw !== "string") {
        unmigrated.push({
          path,
          reason: "attribute-type-mismatch",
          detail: `schema expects ${schema.kind}, stored value is a ${typeof raw}`,
        });
        return undefined;
      }
      operations.push({ op: `wrap-${schema.kind}`, path });
      return { kind: schema.kind, value: raw } as ScalarAttributeValue;
    }
    case "boolean": {
      if (typeof raw !== "boolean") {
        unmigrated.push({
          path,
          reason: "attribute-type-mismatch",
          detail: `schema expects boolean, stored value is a ${typeof raw}`,
        });
        return undefined;
      }
      operations.push({ op: "wrap-boolean", path });
      return { kind: "boolean", value: raw };
    }
    case "quantity": {
      if (typeof raw !== "number" || !Number.isFinite(raw)) {
        unmigrated.push({
          path,
          reason: "attribute-type-mismatch",
          detail: `schema expects a quantity magnitude, stored value is ${JSON.stringify(raw)}`,
        });
        return undefined;
      }
      if (schema.units.length !== 1) {
        // NAMED REJECTED CASE, reached through migration: a bare number is not a
        // quantity. When the profile declares one unit the migration may pin it;
        // when it declares several, guessing would invent a business fact.
        unmigrated.push({
          path,
          reason: "quantity-unit-missing",
          detail: `stored value ${raw} carries no unit and the schema declares ${schema.units.length} units (${schema.units.join(", ")}); the migration does not guess`,
        });
        return undefined;
      }
      const unit = schema.units[0] as string;
      operations.push({ op: "wrap-quantity", path, detail: `unit pinned to ${unit} (the schema declares exactly one)` });
      return { kind: "quantity", value: raw, unit };
    }
  }
}

function migrateAttributes(
  raw: unknown,
  schemas: readonly AttributeSchema[],
  path: string,
  operations: MigrationOperation[],
  unmigrated: UnmigratedItem[],
): Readonly<Record<string, AttributeValue>> {
  const source = asRecord(raw) ?? {};
  const byName = new Map(schemas.map((schema) => [schema.name, schema] as const));
  const migrated: Record<string, AttributeValue> = {};

  for (const name of Object.keys(source).sort()) {
    const schema = byName.get(name);
    const value = source[name];
    if (schema === undefined) {
      unmigrated.push({
        path: `${path}.${name}`,
        reason: "attribute-not-in-schema",
        detail: `the effective schema does not declare ${name}; the value stays in the report's original bytes and is not promoted`,
      });
      continue;
    }
    if (schema.kind === "collection") {
      if (!Array.isArray(value)) {
        unmigrated.push({
          path: `${path}.${name}`,
          reason: "attribute-type-mismatch",
          detail: `schema expects a collection, stored value is a ${typeof value}`,
        });
        continue;
      }
      const items: ScalarAttributeValue[] = [];
      let complete = true;
      value.forEach((item, index) => {
        const wrapped = wrapScalar(schema.item, item, `${path}.${name}[${index}]`, operations, unmigrated);
        if (wrapped === undefined) complete = false;
        else items.push(wrapped);
      });
      if (!complete) continue;
      migrated[name] = { kind: "collection", items };
      continue;
    }
    const wrapped = wrapScalar(schema, value, `${path}.${name}`, operations, unmigrated);
    if (wrapped !== undefined) migrated[name] = wrapped;
  }

  return migrated;
}

function soleProfile(
  profileRefs: readonly ProfileId[],
  options: MigrateOptions,
): { readonly profile: Profile } | { readonly reason: string } {
  if (profileRefs.length !== 1) {
    return {
      reason: `schema 1.0 stored no per-element profile; the document declares ${profileRefs.length} profiles, so the owning profile cannot be derived`,
    };
  }
  const profile = options.registry.get(profileRefs[0] as ProfileId);
  if (profile === undefined) return { reason: `profile ${profileRefs[0]} is not in the registry` };
  return { profile };
}

/** 1.0 -> 1.1. The only registered migration of this build. */
function migrate1_0to1_1(
  stored: Readonly<Record<string, unknown>>,
  options: MigrateOptions,
): { readonly document: SemanticDocument; readonly operations: readonly MigrationOperation[]; readonly unmigrated: readonly UnmigratedItem[] } {
  const operations: MigrationOperation[] = [];
  const unmigrated: UnmigratedItem[] = [];

  const profileRefs = (Array.isArray(stored["profileRefs"]) ? stored["profileRefs"] : []) as readonly ProfileId[];
  const resolved = soleProfile(profileRefs, options);

  const entities: Record<string, Entity> = {};
  for (const [key, value] of Object.entries(asRecord(stored["entities"]) ?? {})) {
    const source = asRecord(value);
    if (source === undefined) {
      unmigrated.push({ path: `entities.${key}`, reason: "document-not-an-object", detail: "entity is not an object" });
      continue;
    }
    if ("reason" in resolved) {
      unmigrated.push({ path: `entities.${key}.profile`, reason: "profile-not-declared", detail: resolved.reason });
      continue;
    }
    const type = String(source["type"]);
    const declared = entityTypeOf(resolved.profile, type);
    if (declared === undefined) {
      unmigrated.push({
        path: `entities.${key}.type`,
        reason: "unknown-entity-type",
        detail: `profile ${resolved.profile.id} does not declare entity type ${type}`,
      });
      continue;
    }
    operations.push({ op: "add-profile-field", path: `entities.${key}`, detail: `profile ${resolved.profile.id}` });
    entities[key] = {
      id: key as Entity["id"],
      profile: resolved.profile.id,
      type,
      attributes: migrateAttributes(
        source["attributes"],
        declared.attributes,
        `entities.${key}.attributes`,
        operations,
        unmigrated,
      ),
    };
  }

  const ports: Record<string, SemanticPort> = {};
  for (const [key, value] of Object.entries(asRecord(stored["ports"]) ?? {})) {
    const source = asRecord(value);
    if (source === undefined || "reason" in resolved) {
      unmigrated.push({
        path: `ports.${key}`,
        reason: source === undefined ? "document-not-an-object" : "profile-not-declared",
        detail: source === undefined ? "port is not an object" : (resolved as { readonly reason: string }).reason,
      });
      continue;
    }
    const type = String(source["type"]);
    const declared = portTypeOf(resolved.profile, type);
    if (declared === undefined) {
      unmigrated.push({
        path: `ports.${key}.type`,
        reason: "unknown-port-type",
        detail: `profile ${resolved.profile.id} does not declare port type ${type}`,
      });
      continue;
    }
    operations.push({ op: "add-profile-field", path: `ports.${key}`, detail: `profile ${resolved.profile.id}` });
    ports[key] = {
      id: key as SemanticPort["id"],
      profile: resolved.profile.id,
      type,
      owner: String(source["owner"]) as SemanticPort["owner"],
      name: String(source["name"] ?? ""),
      direction: (source["direction"] ?? "inout") as SemanticPort["direction"],
      attributes: migrateAttributes(
        source["attributes"],
        declared.attributes ?? [],
        `ports.${key}.attributes`,
        operations,
        unmigrated,
      ),
    };
  }

  const relations: Record<string, Relation> = {};
  for (const [key, value] of Object.entries(asRecord(stored["relations"]) ?? {})) {
    const source = asRecord(value);
    if (source === undefined || "reason" in resolved) {
      unmigrated.push({
        path: `relations.${key}`,
        reason: source === undefined ? "document-not-an-object" : "profile-not-declared",
        detail: source === undefined ? "relation is not an object" : (resolved as { readonly reason: string }).reason,
      });
      continue;
    }
    const type = String(source["type"]);
    const declared = relationTypeOf(resolved.profile, type);
    if (declared === undefined) {
      unmigrated.push({
        path: `relations.${key}.type`,
        reason: "unknown-relation-type",
        detail: `profile ${resolved.profile.id} does not declare relation type ${type}`,
      });
      continue;
    }
    operations.push({ op: "add-profile-field", path: `relations.${key}`, detail: `profile ${resolved.profile.id}` });
    relations[key] = {
      id: key as Relation["id"],
      profile: resolved.profile.id,
      type,
      endpoints: (Array.isArray(source["endpoints"]) ? source["endpoints"] : []).map((endpoint) => {
        const record = asRecord(endpoint) ?? {};
        return { role: String(record["role"]), target: String(record["target"]) as Relation["endpoints"][number]["target"] };
      }),
      attributes: migrateAttributes(
        source["attributes"],
        declared.attributes ?? [],
        `relations.${key}.attributes`,
        operations,
        unmigrated,
      ),
    };
  }

  const extensions: PreservedExtension[] = [];
  for (const [index, value] of (Array.isArray(stored["extensions"]) ? stored["extensions"] : []).entries()) {
    const source = asRecord(value);
    if (source === undefined) {
      unmigrated.push({ path: `extensions[${index}]`, reason: "document-not-an-object", detail: "extension is not an object" });
      continue;
    }
    const legacyHash = source["hash"];
    const contentHash = typeof source["contentHash"] === "string" ? source["contentHash"] : legacyHash;
    if (typeof contentHash !== "string" || contentHash.length === 0) {
      unmigrated.push({
        path: `extensions[${index}]`,
        reason: "extension-hash-mismatch",
        detail: "extension carries neither `contentHash` nor the 1.0 `hash`; preserved content without an identity is not carried over",
      });
      continue;
    }
    if (typeof legacyHash === "string" && source["contentHash"] === undefined) {
      operations.push({ op: "rename-field", path: `extensions[${index}].hash`, detail: "hash -> contentHash" });
    }
    const source_ = source["source"];
    extensions.push({
      namespace: String(source["namespace"]),
      schemaVersion: String(source["schemaVersion"]),
      scope: (asRecord(source["scope"]) ?? { kind: "document" }) as PreservedExtension["scope"],
      validation: (source["validation"] ?? "preserved-unvalidated") as PreservedExtension["validation"],
      contentHash,
      ...(typeof source_ === "string" ? { source: source_ } : {}),
    });
  }

  operations.push({ op: "set-schema-version", path: "schemaVersion", detail: "1.0 -> 1.1" });

  const document: SemanticDocument = {
    documentId: String(stored["documentId"]) as SemanticDocument["documentId"],
    schemaVersion: { major: 1, minor: 1 },
    revision: Number.isInteger(stored["revision"]) ? (stored["revision"] as number) : 0,
    profileRefs: [...profileRefs],
    // 1.0 had no document-local type definitions.
    typeDefinitions: {},
    entities,
    relations,
    ports,
    resources: (asRecord(stored["resources"]) ?? {}) as SemanticDocument["resources"],
    extensions,
  };

  return { document, operations, unmigrated };
}

/**
 * The registered migrations, keyed by the version they read. Adding a version
 * means adding an entry here; nothing else reads a stored version.
 */
const MIGRATIONS: readonly {
  readonly from: SchemaVersion;
  readonly to: SchemaVersion;
  readonly run: (
    stored: Readonly<Record<string, unknown>>,
    options: MigrateOptions,
  ) => { readonly document: SemanticDocument; readonly operations: readonly MigrationOperation[]; readonly unmigrated: readonly UnmigratedItem[] };
}[] = [{ from: { major: 1, minor: 0 }, to: { major: 1, minor: 1 }, run: migrate1_0to1_1 }];

export const registeredMigrations = (): readonly string[] =>
  MIGRATIONS.map((entry) => `${entry.from.major}.${entry.from.minor}->${entry.to.major}.${entry.to.minor}`);

export function migrateStoredDocument(stored: unknown, options: MigrateOptions): MigrationOutcome {
  const record = asRecord(stored);
  if (record === undefined) {
    return {
      status: "refused",
      diagnostics: [
        diagnostic({ code: "document-not-an-object", path: "stored", message: "a stored document is a JSON object" }),
      ],
      preserved: preserve(stored, null),
    };
  }

  const version = readVersion(record);
  if (version === undefined) {
    return {
      status: "refused",
      diagnostics: [
        diagnostic({
          code: "schema-version-malformed",
          path: "stored.schemaVersion",
          message: `expected { major, minor } integers, got ${JSON.stringify(record["schemaVersion"])}`,
        }),
      ],
      preserved: preserve(stored, null),
    };
  }

  if (version.major !== CURRENT_SCHEMA_VERSION.major) {
    // NAMED REJECTED CASE: refused for write, preserved for inspection and
    // export. `preserved.canonical` IS the export.
    return {
      status: "refused",
      diagnostics: [
        diagnostic({
          code: "unknown-schema-major",
          path: "stored.schemaVersion",
          message: `schema major ${version.major} is unknown to this build (current ${CURRENT_SCHEMA_VERSION.major}.${CURRENT_SCHEMA_VERSION.minor}); refused for write, preserved for inspection and export`,
          details: { seenMajor: version.major, currentMajor: CURRENT_SCHEMA_VERSION.major },
        }),
      ],
      preserved: preserve(stored, version),
    };
  }

  if (version.minor === CURRENT_SCHEMA_VERSION.minor) {
    return { status: "current", document: record as unknown as SemanticDocument };
  }

  const migration = MIGRATIONS.find(
    (entry) => entry.from.major === version.major && entry.from.minor === version.minor,
  );
  if (migration === undefined) {
    return {
      status: "refused",
      diagnostics: [
        diagnostic({
          code: "schema-migration-required",
          path: "stored.schemaVersion",
          message: `no registered migration reads ${version.major}.${version.minor}; registered: ${registeredMigrations().join(", ")}`,
          details: { seenMinor: version.minor, currentMinor: CURRENT_SCHEMA_VERSION.minor },
        }),
      ],
      preserved: preserve(stored, version),
    };
  }

  const originalCanonical = canonicalise(stored, "stored");
  const result = migration.run(record, options);
  return {
    status: "migrated",
    document: result.document,
    report: {
      from: migration.from,
      to: migration.to,
      operations: result.operations,
      unmigrated: result.unmigrated,
      originalCanonical,
      originalHash: hashContent(originalCanonical),
    },
  };
}

/** The export path of a refused document: its preserved bytes, unchanged. */
export const exportPreserved = (preserved: PreservedStoredDocument): string => preserved.canonical;
