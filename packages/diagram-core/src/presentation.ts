/**
 * diagram-presentation@1 — typed presentation fragment (M3 §3.2).
 *
 * A G0 contract artifact, profileShape mechanism-descriptor, artifactKind
 * contract. Contract/schema bytes are governed once by Engram and executed by
 * the generic DS view validator. No third semantic profile shape is
 * introduced. Folds, measurement, layout hints, archimate@2/uml@2 and
 * migrations belong to later lots and are not started here.
 */

import { canonicalBytes, sha256Hex } from "./sha256.js";
import { contentDiagramDigest } from "./bindings.js";
import type { Profile } from "./profile.js";
import type { EntityRef, OccurrenceRef } from "./refs.js";

/** G0 pin: equality means equality of id, version and contentDigest. */
export interface PresentationPin {
  readonly id: string;
  readonly version: string;
  readonly contentDigest: string;
}

export type StrokeStyle = "solid" | "dashed";
export type DiagramForm = "card" | "container" | "legend" | "legend-key";

export interface PresentationText {
  readonly title?: string;
  readonly kicker?: string;
  readonly body?: string;
  readonly detail?: string;
  readonly subtitle?: string;
  readonly footer?: string;
}

export interface EntityPresentation {
  readonly form: DiagramForm;
  readonly text: PresentationText;
  readonly icon?: string;
  readonly categoryRef?: EntityRef;
}

export interface LegendPresentation {
  readonly order: readonly EntityRef[];
}

export interface CategoryTokenBinding {
  readonly legendRef: EntityRef;
  readonly category: string;
  readonly token: string;
}

export interface DiagramPresentation {
  readonly contractPin: PresentationPin;
  readonly entities: Readonly<Record<string, EntityPresentation>>;
  readonly legends: Readonly<Record<string, LegendPresentation>>;
  readonly categoryTokens: readonly CategoryTokenBinding[];
}

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

const KEY_GRAMMAR = { type: "string", minLength: 1, maxLength: 40, pattern: "^[a-z][a-z0-9-]*$" };
const TOKEN_GRAMMAR = {
  type: "string",
  minLength: 1,
  maxLength: 80,
  pattern: "^[a-z][a-z0-9-]*(\\.[a-z][a-z0-9-]*)*$",
};
const ICON_GRAMMAR = { type: "string", minLength: 1, maxLength: 40, pattern: "^[a-z][a-z0-9-]*$" };

const PRESENTATION_TEXT_BASE = {
  type: "object",
  properties: {
    title: { type: "string", maxLength: 200 },
    kicker: { type: "string", maxLength: 80 },
    body: { type: "string", maxLength: 400 },
    detail: { type: "string", maxLength: 400 },
    subtitle: { type: "string", maxLength: 600 },
    footer: { type: "string", maxLength: 120 },
  },
  additionalProperties: false,
};

const ENTITY_PRESENTATION_SCHEMA = {
  type: "object",
  properties: {
    form: { enum: ["card", "container", "legend", "legend-key"] },
    text: PRESENTATION_TEXT_BASE,
    icon: ICON_GRAMMAR,
    categoryRef: { type: "string", minLength: 1 },
  },
  required: ["form", "text"],
  additionalProperties: false,
  allOf: [
    {
      if: { properties: { form: { const: "legend-key" } }, required: ["form"] },
      then: {
        properties: { text: { type: "object", properties: { title: { type: "string", maxLength: 120 } } } },
      },
    },
  ],
};

const DIAGRAM_VALUE_PROPERTIES = {
  contractPin: {
    type: "object",
    properties: {
      id: { const: "diagram-presentation" },
      version: { const: "1" },
      contentDigest: { type: "string", pattern: "^[0-9a-f]{64}$" },
    },
    required: ["id", "version", "contentDigest"],
    additionalProperties: false,
  },
  entities: { type: "object", additionalProperties: ENTITY_PRESENTATION_SCHEMA },
  legends: {
    type: "object",
    additionalProperties: {
      type: "object",
      properties: {
        order: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
      },
      required: ["order"],
      additionalProperties: false,
    },
  },
  categoryTokens: {
    type: "array",
    items: {
      type: "object",
      properties: {
        legendRef: { type: "string", minLength: 1 },
        category: KEY_GRAMMAR,
        token: TOKEN_GRAMMAR,
      },
      required: ["legendRef", "category", "token"],
      additionalProperties: false,
    },
  },
};

const DIAGRAM_VALUE_REQUIRED = ["contractPin", "entities", "legends", "categoryTokens"];

const PRIVATE_PRESENTATION_SCHEMA: Record<string, unknown> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "engram:diagram-presentation-schema/1",
  title: "diagram-presentation@1 contract",
  type: "object",
  properties: DIAGRAM_VALUE_PROPERTIES,
  required: [...DIAGRAM_VALUE_REQUIRED],
  additionalProperties: false,
};
deepFreezeValue(PRIVATE_PRESENTATION_SCHEMA);

export const DIAGRAM_PRESENTATION_SCHEMA: Record<string, unknown> = frozenCopy(PRIVATE_PRESENTATION_SCHEMA);

export const DIAGRAM_PRESENTATION_SCHEMA_DIGEST: string = sha256Hex(canonicalBytes(PRIVATE_PRESENTATION_SCHEMA));

const PRIVATE_PRESENTATION_SCHEMA_PIN: PresentationPin = {
  id: "diagram-presentation-schema",
  version: "1",
  contentDigest: DIAGRAM_PRESENTATION_SCHEMA_DIGEST,
};
deepFreezeValue(PRIVATE_PRESENTATION_SCHEMA_PIN);

export const DIAGRAM_PRESENTATION_SCHEMA_PIN: PresentationPin = frozenCopy(PRIVATE_PRESENTATION_SCHEMA_PIN);

export const DIAGRAM_PRESENTATION_CONTRACT_ID = "diagram-presentation@1" as const;
export const DIAGRAM_PRESENTATION_PROFILE_SHAPE = "mechanism-descriptor" as const;
export const DIAGRAM_PRESENTATION_ARTIFACT_KIND = "contract" as const;
export const DIAGRAM_PRESENTATION_COMPAT_VERSION = "1" as const;

const PRIVATE_CONTRACT_DESCRIPTOR = {
  id: DIAGRAM_PRESENTATION_CONTRACT_ID,
  artifactKind: DIAGRAM_PRESENTATION_ARTIFACT_KIND,
  schemaPin: { ...PRIVATE_PRESENTATION_SCHEMA_PIN },
  compatibilityMatrixVersion: DIAGRAM_PRESENTATION_COMPAT_VERSION,
};
deepFreezeValue(PRIVATE_CONTRACT_DESCRIPTOR);

export const DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR = frozenCopy(PRIVATE_CONTRACT_DESCRIPTOR);

export const DIAGRAM_PRESENTATION_CONTRACT_CONTENT: string = sha256Hex(
  canonicalBytes(PRIVATE_CONTRACT_DESCRIPTOR),
);

const PRIVATE_CONTRACT_PIN: PresentationPin = {
  id: "diagram-presentation",
  version: "1",
  contentDigest: DIAGRAM_PRESENTATION_CONTRACT_CONTENT,
};
deepFreezeValue(PRIVATE_CONTRACT_PIN);

export const DIAGRAM_PRESENTATION_CONTRACT_PIN: PresentationPin = frozenCopy(PRIVATE_CONTRACT_PIN);

const PRIVATE_BINDING = {
  artifactKind: "contract" as const,
  schemaPin: { ...PRIVATE_PRESENTATION_SCHEMA_PIN },
  compatibilityMatrixVersion: "1" as const,
};
deepFreezeValue(PRIVATE_BINDING);

export const DIAGRAM_PRESENTATION_BINDING = frozenCopy(PRIVATE_BINDING);

/** Governed lot corpus reference, transcribed from Engram (U-ID/U-QUAL). */
export const DIAGRAM_PRESENTATION_CORPUS_REF = "engram:diagram-lot-corpus/1" as const;
/**
 * Governed lot corpus digest over the eight pinned fixture rows of
 * Engram 636fa9d6 diagram-registry.ts LOT_CORPUS_FIXTURES.
 */
export const DIAGRAM_PRESENTATION_CORPUS_DIGEST =
  "e946288de536075611c25e7b5e6078ea3def433b66d7a6ea60c1eb20cfebcf6e" as const;

function pinsDigestForLayers(layers: readonly PresentationPin[]): string {
  return sha256Hex(
    canonicalBytes({
      deltaDigest: null,
      layers: layers.map((pin) => ({
        contentDigest: pin.contentDigest,
        id: pin.id,
        version: pin.version,
      })),
      mappingDigest: null,
      ruleSheets: [],
    }),
  );
}

export const DIAGRAM_PRESENTATION_PINS_DIGEST: string = pinsDigestForLayers([PRIVATE_CONTRACT_PIN]);

const PRIVATE_RECORD = {
  namespace: "diagram",
  id: "diagram-presentation",
  version: "1",
  owner: "engram",
  lifecycle: "draft",
  completeness: "complete",
  visibility: "public",
  profileShape: DIAGRAM_PRESENTATION_PROFILE_SHAPE,
  artifactKind: DIAGRAM_PRESENTATION_ARTIFACT_KIND,
  profileRef: {
    canonicalRef: "engram:diagram-presentation@1",
    contentDigest: DIAGRAM_PRESENTATION_CONTRACT_CONTENT,
  },
  corpusRef: {
    ref: DIAGRAM_PRESENTATION_CORPUS_REF,
    digest: DIAGRAM_PRESENTATION_CORPUS_DIGEST,
  },
  digests: {
    contentDigest: DIAGRAM_PRESENTATION_CONTRACT_CONTENT,
    pinsDigest: DIAGRAM_PRESENTATION_PINS_DIGEST,
    resultEvidence: { evidenceState: "unresolved" },
  },
  lineage: { parents: [], mappings: [], migrations: [] },
  consumers: [],
} as const;
deepFreezeValue(PRIVATE_RECORD);

export const DIAGRAM_PRESENTATION_RECORD = frozenCopy(PRIVATE_RECORD);

/** Transitional executor/adapter refs, as governed by Engram (U-QUAL). */
const PRIVATE_COMPATIBILITY = {
  renderer: "transitional:ds-diagram-core-executor-unqualified",
  adapter: "transitional:ds-schema-adapter-unqualified",
} as const;
deepFreezeValue(PRIVATE_COMPATIBILITY);

export const DIAGRAM_PRESENTATION_COMPATIBILITY = frozenCopy(PRIVATE_COMPATIBILITY);

/**
 * Resolved contract catalog entry used by application authentication.
 * The packaged entry carries the governed transitional adapter reference,
 * which is not a pinned reference, so application refuses while
 * qualification stays unresolved. Tests supply their own entry with a
 * real pinned adapter over actual bytes.
 */
export interface PresentationContractCatalog {
  readonly compatibilityAdapter: string;
  readonly adapterBytes: string | undefined;
  readonly schemaPin: PresentationPin;
}

const PRIVATE_PACKAGED_CATALOG_SNAPSHOT: PresentationContractCatalog = {
  compatibilityAdapter: PRIVATE_COMPATIBILITY.adapter,
  adapterBytes: undefined,
  schemaPin: { ...PRIVATE_PRESENTATION_SCHEMA_PIN },
};
deepFreezeValue(PRIVATE_PACKAGED_CATALOG_SNAPSHOT);

export const DIAGRAM_PRESENTATION_PACKAGED_CATALOG: PresentationContractCatalog = frozenCopy(
  PRIVATE_PACKAGED_CATALOG_SNAPSHOT,
);

/** Parse an exact pinned adapter reference `id@version#sha256=<digest>`. */
export function parsePinnedAdapterReference(ref: string): PresentationPin | undefined {
  const match = /^(.+)@([^#]+)#sha256=([0-9a-f]{64})$/.exec(ref);
  if (match === null) return undefined;
  const id = match[1] as string;
  const version = match[2] as string;
  const contentDigest = match[3] as string;
  if (id.length === 0 || version.length === 0) return undefined;
  return { id, version, contentDigest };
}

/** The contract ProfileId form, never a valid semantic profileRef. */
export const DIAGRAM_PRESENTATION_PROFILE_ID = "diagram-presentation@1" as const;

export function isPresentationContractProfileId(id: string): boolean {
  return id === DIAGRAM_PRESENTATION_PROFILE_ID;
}

export function isPresentationContractPin(pin: PresentationPin): boolean {
  return (
    pin.id === PRIVATE_CONTRACT_PIN.id &&
    pin.version === PRIVATE_CONTRACT_PIN.version &&
    pin.contentDigest === PRIVATE_CONTRACT_PIN.contentDigest
  );
}

export function isPresentationSchemaPin(pin: PresentationPin): boolean {
  return (
    pin.id === PRIVATE_PRESENTATION_SCHEMA_PIN.id &&
    pin.version === PRIVATE_PRESENTATION_SCHEMA_PIN.version &&
    pin.contentDigest === PRIVATE_PRESENTATION_SCHEMA_PIN.contentDigest
  );
}

/** G0 family pin for a DS profile (explicit native/pin mapping, §7.4.2). */
export function familyPinForProfile(profile: Profile): PresentationPin {
  const shortId = profile.id.includes("@") ? profile.id.slice(0, profile.id.indexOf("@")) : profile.id;
  return {
    id: shortId,
    version: `${profile.version}.0.0`,
    contentDigest: contentDiagramDigest(profile),
  };
}

export function presentationPinsEqual(left: PresentationPin, right: PresentationPin): boolean {
  return left.id === right.id && left.version === right.version && left.contentDigest === right.contentDigest;
}

/** Application digest: SHA-256 of RFC 8785 of the full presentation.diagram value. */
export function presentationDigestOf(diagram: DiagramPresentation): string {
  return sha256Hex(canonicalBytes(diagram as unknown as Record<string, unknown>));
}
