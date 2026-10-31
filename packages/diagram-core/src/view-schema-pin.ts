/**
 * diagram-view-schema@1/@2 private frozen record (DS share of Engram lots 3 and 4).
 *
 * Both schemas are vendored as data: the exact JSON values of the Engram
 * canonical files, each with its Pin
 * `{ id: "diagram-view-schema", version: "1" | "2", contentDigest }`,
 * deeply frozen. The digests are measured through the DS canonical bytes
 * (`sha256Hex(canonicalBytes(schema))`), the same procedure as Engram
 * `govern` (graphify@310a9270 `src/ontology-guardian/diagram-schemas.ts`).
 *
 * Resolution is by exact pin only: @2 and @1 both resolve, @1 exact-pin-only
 * (no "latest", no fallback, no reverse migration). Refusals are typed
 * values, never throws. Transitional and partial references are refused.
 *
 * This module is private: it is beside the presentation catalog and is NOT
 * exported from the package entry (`src/index.ts`).
 */

import { canonicalBytes, sha256Hex } from "./sha256.js";

/** G0 pin: equality means equality of id, version and contentDigest. */
export interface ViewSchemaPin {
  readonly id: string;
  readonly version: string;
  readonly contentDigest: string;
}

export type ViewSchemaVersion = "1" | "2";

export const DIAGRAM_VIEW_SCHEMA_ID = "diagram-view-schema" as const;

function deepCloneValue<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return (value as readonly unknown[]).map((item) => deepCloneValue(item)) as unknown as T;
  }
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    out[key] = deepCloneValue(source[key]);
  }
  return out as unknown as T;
}

function deepFreezeValue<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Object.isFrozen(value)) return value;
  const target = value as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    const child = target[key];
    if (child !== null && typeof child === "object") {
      deepFreezeValue(child);
    }
  }
  return Object.freeze(value);
}

function frozenCopy<T>(value: T): T {
  return deepFreezeValue(deepCloneValue(value));
}

const PRIVATE_V1_SCHEMA: Record<string, unknown> = {"$id":"engram:diagram-view-schema/1","$schema":"https://json-schema.org/draft/2020-12/schema","additionalProperties":false,"properties":{"entityOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"entity":{"type":"string"},"geometry":{"additionalProperties":false,"properties":{"height":{"type":"number"},"width":{"type":"number"},"x":{"type":"number"},"y":{"type":"number"}},"required":["x","y","width","height"],"type":"object"},"group":{"type":"string"},"id":{"type":"string"},"z":{"type":"number"}},"required":["id","entity","geometry"],"type":"object"},"type":"object"},"filters":{"items":{"anyOf":[{"additionalProperties":false,"properties":{"id":{"type":"string"},"kind":{"const":"entity-type"},"mode":{"enum":["include","exclude"]},"types":{"items":{"type":"string"},"type":"array"}},"required":["id","kind","types","mode"],"type":"object"},{"additionalProperties":false,"properties":{"id":{"type":"string"},"kind":{"const":"relation-type"},"mode":{"enum":["include","exclude"]},"types":{"items":{"type":"string"},"type":"array"}},"required":["id","kind","types","mode"],"type":"object"},{"additionalProperties":false,"properties":{"attribute":{"type":"string"},"id":{"type":"string"},"kind":{"const":"attribute-equals"},"mode":{"enum":["include","exclude"]},"value":{"type":"string"}},"required":["id","kind","attribute","value","mode"],"type":"object"}]},"type":"array"},"groups":{"additionalProperties":{"additionalProperties":false,"properties":{"collapsed":{"type":"boolean"},"id":{"type":"string"},"label":{"type":"string"},"occurrence":{"type":"string"}},"required":["id"],"type":"object"},"type":"object"},"portOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"anchor":{"maximum":1,"minimum":0,"type":"number"},"id":{"type":"string"},"order":{"type":"number"},"ownerOccurrence":{"type":"string"},"port":{"type":"string"},"side":{"enum":["north","east","south","west"]}},"required":["id","port","ownerOccurrence","side","order","anchor"],"type":"object"},"type":"object"},"presentation":{"additionalProperties":false,"properties":{"camera":{"additionalProperties":false,"properties":{"x":{"type":"number"},"y":{"type":"number"},"zoom":{"type":"number"}},"required":["x","y","zoom"],"type":"object"},"diagram":{"additionalProperties":false,"properties":{"categoryTokens":{"items":{"additionalProperties":false,"properties":{"category":{"maxLength":40,"minLength":1,"pattern":"^[a-z][a-z0-9-]*$","type":"string"},"legendRef":{"minLength":1,"type":"string"},"token":{"maxLength":80,"minLength":1,"pattern":"^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*)*$","type":"string"}},"required":["legendRef","category","token"],"type":"object"},"type":"array"},"contractPin":{"additionalProperties":false,"properties":{"contentDigest":{"pattern":"^[0-9a-f]{64}$","type":"string"},"id":{"const":"diagram-presentation"},"version":{"const":"1"}},"required":["id","version","contentDigest"],"type":"object"},"entities":{"additionalProperties":{"additionalProperties":false,"allOf":[{"if":{"properties":{"form":{"const":"legend-key"}},"required":["form"]},"then":{"properties":{"text":{"properties":{"title":{"maxLength":120,"type":"string"}},"type":"object"}}}}],"properties":{"categoryRef":{"minLength":1,"type":"string"},"form":{"enum":["card","container","legend","legend-key"]},"icon":{"maxLength":40,"minLength":1,"pattern":"^[a-z][a-z0-9-]*$","type":"string"},"text":{"additionalProperties":false,"properties":{"body":{"maxLength":400,"type":"string"},"detail":{"maxLength":400,"type":"string"},"footer":{"maxLength":120,"type":"string"},"kicker":{"maxLength":80,"type":"string"},"subtitle":{"maxLength":600,"type":"string"},"title":{"maxLength":200,"type":"string"}},"type":"object"}},"required":["form","text"],"type":"object"},"type":"object"},"legends":{"additionalProperties":{"additionalProperties":false,"properties":{"order":{"items":{"minLength":1,"type":"string"},"type":"array","uniqueItems":true}},"required":["order"],"type":"object"},"type":"object"}},"required":["contractPin","entities","legends","categoryTokens"],"type":"object"},"grid":{"additionalProperties":false,"properties":{"size":{"type":"number"},"snap":{"type":"boolean"}},"required":["size","snap"],"type":"object"},"theme":{"type":"string"}},"required":["camera"],"type":"object"},"relationOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"endpoints":{"items":{"additionalProperties":false,"dependentRequired":{"semanticTarget":["sourceOccurrence"],"sourceOccurrence":["semanticTarget"]},"properties":{"occurrence":{"type":"string"},"role":{"type":"string"},"semanticTarget":{"type":"string"},"sourceOccurrence":{"type":"string"}},"required":["role","occurrence"],"type":"object"},"type":"array"},"id":{"type":"string"},"relation":{"type":"string"},"strokeStyle":{"enum":["solid","dashed"]},"waypoints":{"items":{"additionalProperties":false,"properties":{"x":{"type":"number"},"y":{"type":"number"}},"required":["x","y"],"type":"object"},"type":"array"}},"required":["id","relation","endpoints"],"type":"object"},"type":"object"},"revision":{"minimum":0,"type":"integer"},"semanticDocumentId":{"type":"string"},"summaryLabels":{"additionalProperties":{"additionalProperties":false,"properties":{"id":{"type":"string"},"label":{"minLength":1,"type":"string"},"relationIds":{"items":{"type":"string"},"minItems":1,"type":"array"},"sourceOccurrence":{"type":"string"},"strokeStyle":{"enum":["solid","dashed"]},"targetOccurrence":{"type":"string"}},"required":["sourceOccurrence","targetOccurrence","label","relationIds"],"type":"object"},"type":"object"},"viewId":{"type":"string"}},"required":["viewId","semanticDocumentId","revision","entityOccurrences","relationOccurrences","portOccurrences","groups","filters","presentation"],"type":"object"};
deepFreezeValue(PRIVATE_V1_SCHEMA);

export const DIAGRAM_VIEW_SCHEMA_V1: Record<string, unknown> = frozenCopy(PRIVATE_V1_SCHEMA);

export const DIAGRAM_VIEW_SCHEMA_V1_DIGEST: string = sha256Hex(canonicalBytes(PRIVATE_V1_SCHEMA));

const PRIVATE_V1_PIN: ViewSchemaPin = {
  id: DIAGRAM_VIEW_SCHEMA_ID,
  version: "1",
  contentDigest: DIAGRAM_VIEW_SCHEMA_V1_DIGEST,
};
deepFreezeValue(PRIVATE_V1_PIN);

export const DIAGRAM_VIEW_SCHEMA_V1_PIN: ViewSchemaPin = frozenCopy(PRIVATE_V1_PIN);

const PRIVATE_V2_SCHEMA: Record<string, unknown> = {"$id":"engram:diagram-view-schema/2","$schema":"https://json-schema.org/draft/2020-12/schema","additionalProperties":false,"properties":{"entityOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"entity":{"type":"string"},"geometry":{"additionalProperties":false,"properties":{"height":{"type":"number"},"width":{"type":"number"},"x":{"type":"number"},"y":{"type":"number"}},"required":["x","y","width","height"],"type":"object"},"group":{"type":"string"},"id":{"type":"string"},"z":{"type":"number"}},"required":["id","entity","geometry"],"type":"object"},"type":"object"},"filters":{"items":{"anyOf":[{"additionalProperties":false,"properties":{"id":{"type":"string"},"kind":{"const":"entity-type"},"mode":{"enum":["include","exclude"]},"types":{"items":{"type":"string"},"type":"array"}},"required":["id","kind","types","mode"],"type":"object"},{"additionalProperties":false,"properties":{"id":{"type":"string"},"kind":{"const":"relation-type"},"mode":{"enum":["include","exclude"]},"types":{"items":{"type":"string"},"type":"array"}},"required":["id","kind","types","mode"],"type":"object"},{"additionalProperties":false,"properties":{"attribute":{"type":"string"},"id":{"type":"string"},"kind":{"const":"attribute-equals"},"mode":{"enum":["include","exclude"]},"value":{"type":"string"}},"required":["id","kind","attribute","value","mode"],"type":"object"}]},"type":"array"},"groups":{"additionalProperties":{"additionalProperties":false,"properties":{"collapsed":{"type":"boolean"},"id":{"type":"string"},"label":{"type":"string"},"occurrence":{"type":"string"}},"required":["id"],"type":"object"},"type":"object"},"portOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"anchor":{"maximum":1,"minimum":0,"type":"number"},"id":{"type":"string"},"order":{"type":"number"},"ownerOccurrence":{"type":"string"},"port":{"type":"string"},"side":{"enum":["north","east","south","west"]}},"required":["id","port","ownerOccurrence","side","order","anchor"],"type":"object"},"type":"object"},"presentation":{"additionalProperties":false,"properties":{"camera":{"additionalProperties":false,"properties":{"x":{"type":"number"},"y":{"type":"number"},"zoom":{"type":"number"}},"required":["x","y","zoom"],"type":"object"},"diagram":{"additionalProperties":false,"properties":{"categoryTokens":{"items":{"additionalProperties":false,"properties":{"category":{"maxLength":40,"minLength":1,"pattern":"^[a-z][a-z0-9-]*$","type":"string"},"legendRef":{"minLength":1,"type":"string"},"token":{"maxLength":80,"minLength":1,"pattern":"^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*)*$","type":"string"}},"required":["legendRef","category","token"],"type":"object"},"type":"array"},"contractPin":{"additionalProperties":false,"properties":{"contentDigest":{"pattern":"^[0-9a-f]{64}$","type":"string"},"id":{"const":"diagram-presentation"},"version":{"const":"1"}},"required":["id","version","contentDigest"],"type":"object"},"entities":{"additionalProperties":{"additionalProperties":false,"allOf":[{"if":{"properties":{"form":{"const":"legend-key"}},"required":["form"]},"then":{"properties":{"text":{"properties":{"title":{"maxLength":120,"type":"string"}},"type":"object"}}}}],"properties":{"categoryRef":{"minLength":1,"type":"string"},"form":{"enum":["card","container","legend","legend-key"]},"icon":{"maxLength":40,"minLength":1,"pattern":"^[a-z][a-z0-9-]*$","type":"string"},"text":{"additionalProperties":false,"properties":{"body":{"maxLength":400,"type":"string"},"detail":{"maxLength":400,"type":"string"},"footer":{"maxLength":120,"type":"string"},"kicker":{"maxLength":80,"type":"string"},"subtitle":{"maxLength":600,"type":"string"},"title":{"maxLength":200,"type":"string"}},"type":"object"}},"required":["form","text"],"type":"object"},"type":"object"},"legends":{"additionalProperties":{"additionalProperties":false,"properties":{"order":{"items":{"minLength":1,"type":"string"},"type":"array","uniqueItems":true}},"required":["order"],"type":"object"},"type":"object"}},"required":["contractPin","entities","legends","categoryTokens"],"type":"object"},"grid":{"additionalProperties":false,"properties":{"size":{"type":"number"},"snap":{"type":"boolean"}},"required":["size","snap"],"type":"object"},"theme":{"type":"string"}},"required":["camera"],"type":"object"},"relationOccurrences":{"additionalProperties":{"additionalProperties":false,"properties":{"endpoints":{"items":{"additionalProperties":false,"dependentRequired":{"semanticTarget":["sourceOccurrence"],"sourceOccurrence":["semanticTarget"]},"properties":{"occurrence":{"type":"string"},"role":{"type":"string"},"semanticTarget":{"type":"string"},"sourceOccurrence":{"type":"string"}},"required":["role","occurrence"],"type":"object"},"type":"array"},"id":{"type":"string"},"relation":{"type":"string"},"strokeStyle":{"enum":["solid","dashed"]},"waypoints":{"items":{"additionalProperties":false,"properties":{"x":{"type":"number"},"y":{"type":"number"}},"required":["x","y"],"type":"object"},"type":"array"}},"required":["id","relation","endpoints"],"type":"object"},"type":"object"},"revision":{"minimum":0,"type":"integer"},"semanticDocumentId":{"type":"string"},"summaryLabels":{"additionalProperties":{"additionalProperties":false,"properties":{"id":{"type":"string"},"label":{"type":"string"},"relationIds":{"items":{"type":"string"},"minItems":1,"type":"array"},"relationOccurrences":{"items":{"type":"string"},"type":"array"},"sourceOccurrence":{"type":"string"},"strokeStyle":{"enum":["solid","dashed"]},"targetOccurrence":{"type":"string"}},"required":["id","sourceOccurrence","targetOccurrence","label","relationIds"],"type":"object"},"type":"object"},"viewId":{"type":"string"}},"required":["viewId","semanticDocumentId","revision","entityOccurrences","relationOccurrences","portOccurrences","groups","filters","presentation"],"type":"object"};
deepFreezeValue(PRIVATE_V2_SCHEMA);

export const DIAGRAM_VIEW_SCHEMA_V2: Record<string, unknown> = frozenCopy(PRIVATE_V2_SCHEMA);

export const DIAGRAM_VIEW_SCHEMA_V2_DIGEST: string = sha256Hex(canonicalBytes(PRIVATE_V2_SCHEMA));

const PRIVATE_V2_PIN: ViewSchemaPin = {
  id: DIAGRAM_VIEW_SCHEMA_ID,
  version: "2",
  contentDigest: DIAGRAM_VIEW_SCHEMA_V2_DIGEST,
};
deepFreezeValue(PRIVATE_V2_PIN);

export const DIAGRAM_VIEW_SCHEMA_V2_PIN: ViewSchemaPin = frozenCopy(PRIVATE_V2_PIN);

export function viewSchemaPinsEqual(left: ViewSchemaPin, right: ViewSchemaPin): boolean {
  return left.id === right.id && left.version === right.version && left.contentDigest === right.contentDigest;
}

export type ViewSchemaRefusalCode =
  | "pin-absent"
  | "pin-null"
  | "pin-malformed"
  | "unknown-schema-id"
  | "unknown-schema-version"
  | "schema-digest-mismatch"
  | "schema-bytes-unavailable"
  | "transitional-reference-refused"
  | "partial-reference-refused";

export interface ViewSchemaRefusal {
  readonly code: ViewSchemaRefusalCode;
}

export type ViewSchemaResolution =
  | {
      readonly ok: true;
      readonly version: ViewSchemaVersion;
      readonly pin: ViewSchemaPin;
      readonly schema: Record<string, unknown>;
    }
  | { readonly ok: false; readonly refusal: ViewSchemaRefusal };

const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const ALLOWED_PIN_KEYS = new Set(["id", "version", "contentDigest"]);

/**
 * Exact-key shape gate, mirroring `isWellFormedPin` in
 * `presentation-apply.ts`: only own enumerable data properties named `id`,
 * `version` or `contentDigest` are allowed. Subsets stay admissible here so
 * the transitional/partial refusals below keep their cases; anything else
 * (extra key, symbol key, non-enumerable property, accessor) is malformed.
 */
function hasOnlyAllowedOwnDataKeys(record: Record<string, unknown>): boolean {
  const ownKeys = Reflect.ownKeys(record);
  if (ownKeys.some((key) => typeof key !== "string" || !ALLOWED_PIN_KEYS.has(key))) return false;
  const descriptors = Object.getOwnPropertyDescriptors(record);
  return (ownKeys as string[]).every((key) => {
    const descriptor = descriptors[key];
    return descriptor !== undefined && descriptor.enumerable === true && "value" in descriptor;
  });
}

/**
 * Resolve a view schema by exact pin only. Never throws: every failure is a
 * typed refusal. No "latest", no fallback, no reverse migration.
 */
export function resolveViewSchema(pin: unknown): ViewSchemaResolution {
  try {
    if (pin === undefined) return { ok: false, refusal: { code: "pin-absent" } };
    if (pin === null) return { ok: false, refusal: { code: "pin-null" } };
    if (typeof pin === "string") {
      if (pin.startsWith("transitional:")) return { ok: false, refusal: { code: "transitional-reference-refused" } };
      return { ok: false, refusal: { code: "partial-reference-refused" } };
    }
    if (!isPlainRecord(pin)) return { ok: false, refusal: { code: "pin-malformed" } };
    // Shape first: an extra, symbol, non-enumerable or accessor own property
    // is malformed even when `id` looks transitional or partial. Subsets of
    // the allowed keys fall through to the transitional/partial refusals.
    if (!hasOnlyAllowedOwnDataKeys(pin)) return { ok: false, refusal: { code: "pin-malformed" } };
    const id = pin["id"];
    const version = pin["version"];
    const contentDigest = pin["contentDigest"];
    if (typeof id === "string" && id.startsWith("transitional:")) {
      return { ok: false, refusal: { code: "transitional-reference-refused" } };
    }
    if (id === undefined || version === undefined || contentDigest === undefined) {
      if (typeof id === "string" || typeof version === "string" || typeof contentDigest === "string") {
        return { ok: false, refusal: { code: "partial-reference-refused" } };
      }
      return { ok: false, refusal: { code: "pin-malformed" } };
    }
    if (typeof id !== "string" || typeof version !== "string" || typeof contentDigest !== "string") {
      return { ok: false, refusal: { code: "pin-malformed" } };
    }
    if (!DIGEST_PATTERN.test(contentDigest)) return { ok: false, refusal: { code: "pin-malformed" } };
    if (id !== DIAGRAM_VIEW_SCHEMA_ID) return { ok: false, refusal: { code: "unknown-schema-id" } };
    if (version !== "1" && version !== "2") return { ok: false, refusal: { code: "unknown-schema-version" } };
    const expected = version === "1" ? DIAGRAM_VIEW_SCHEMA_V1_DIGEST : DIAGRAM_VIEW_SCHEMA_V2_DIGEST;
    if (contentDigest !== expected) return { ok: false, refusal: { code: "schema-digest-mismatch" } };
    if (version === "1") {
      if (DIAGRAM_VIEW_SCHEMA_V1 === undefined) return { ok: false, refusal: { code: "schema-bytes-unavailable" } };
      return { ok: true, version: "1", pin: frozenCopy(DIAGRAM_VIEW_SCHEMA_V1_PIN), schema: DIAGRAM_VIEW_SCHEMA_V1 };
    }
    if (DIAGRAM_VIEW_SCHEMA_V2 === undefined) return { ok: false, refusal: { code: "schema-bytes-unavailable" } };
    return { ok: true, version: "2", pin: frozenCopy(DIAGRAM_VIEW_SCHEMA_V2_PIN), schema: DIAGRAM_VIEW_SCHEMA_V2 };
  } catch {
    return { ok: false, refusal: { code: "pin-malformed" } };
  }
}
