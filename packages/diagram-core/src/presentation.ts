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

export const DIAGRAM_PRESENTATION_SCHEMA: Record<string, unknown> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "engram:diagram-presentation-schema/1",
  title: "diagram-presentation@1 contract",
  type: "object",
  properties: DIAGRAM_VALUE_PROPERTIES,
  required: DIAGRAM_VALUE_REQUIRED,
  additionalProperties: false,
};

export const DIAGRAM_PRESENTATION_SCHEMA_DIGEST: string = sha256Hex(canonicalBytes(DIAGRAM_PRESENTATION_SCHEMA));

export const DIAGRAM_PRESENTATION_SCHEMA_PIN: PresentationPin = {
  id: "diagram-presentation-schema",
  version: "1",
  contentDigest: DIAGRAM_PRESENTATION_SCHEMA_DIGEST,
};

export const DIAGRAM_PRESENTATION_CONTRACT_ID = "diagram-presentation@1" as const;
export const DIAGRAM_PRESENTATION_PROFILE_SHAPE = "mechanism-descriptor" as const;
export const DIAGRAM_PRESENTATION_ARTIFACT_KIND = "contract" as const;
export const DIAGRAM_PRESENTATION_COMPAT_VERSION = "1" as const;

export const DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR = {
  id: DIAGRAM_PRESENTATION_CONTRACT_ID,
  artifactKind: DIAGRAM_PRESENTATION_ARTIFACT_KIND,
  schemaPin: { ...DIAGRAM_PRESENTATION_SCHEMA_PIN },
  compatibilityMatrixVersion: DIAGRAM_PRESENTATION_COMPAT_VERSION,
} as const;

export const DIAGRAM_PRESENTATION_CONTRACT_CONTENT: string = sha256Hex(
  canonicalBytes({ ...DIAGRAM_PRESENTATION_CONTRACT_DESCRIPTOR }),
);

export const DIAGRAM_PRESENTATION_CONTRACT_PIN: PresentationPin = {
  id: "diagram-presentation",
  version: "1",
  contentDigest: DIAGRAM_PRESENTATION_CONTRACT_CONTENT,
};

export const DIAGRAM_PRESENTATION_BINDING = {
  artifactKind: "contract" as const,
  schemaPin: { ...DIAGRAM_PRESENTATION_SCHEMA_PIN },
  compatibilityMatrixVersion: "1" as const,
};

export const DIAGRAM_PRESENTATION_RECORD = {
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
  digests: {
    contentDigest: DIAGRAM_PRESENTATION_CONTRACT_CONTENT,
  },
  lineage: { parents: [], mappings: [], migrations: [] },
  consumers: [],
} as const;

/** Transitional executor/adapter refs, as governed by Engram (U-QUAL). */
export const DIAGRAM_PRESENTATION_COMPATIBILITY = {
  renderer: "transitional:ds-diagram-core-executor-unqualified",
  adapter: "transitional:ds-schema-adapter-unqualified",
} as const;

function adapterDigestFor(id: string, version: string): string {
  return sha256Hex(canonicalBytes({ id, version }));
}

export const DIAGRAM_PRESENTATION_ADAPTER_PIN: PresentationPin = {
  id: "ds-presentation-adapter",
  version: "1",
  contentDigest: adapterDigestFor("ds-presentation-adapter", "1"),
};

export const DIAGRAM_PRESENTATION_ADAPTER_SCHEMA_PIN: PresentationPin = {
  ...DIAGRAM_PRESENTATION_SCHEMA_PIN,
};

/** The contract ProfileId form, never a valid semantic profileRef. */
export const DIAGRAM_PRESENTATION_PROFILE_ID = "diagram-presentation@1" as const;

export function isPresentationContractProfileId(id: string): boolean {
  return id === DIAGRAM_PRESENTATION_PROFILE_ID;
}

export function isPresentationContractPin(pin: PresentationPin): boolean {
  return (
    pin.id === DIAGRAM_PRESENTATION_CONTRACT_PIN.id &&
    pin.version === DIAGRAM_PRESENTATION_CONTRACT_PIN.version &&
    pin.contentDigest === DIAGRAM_PRESENTATION_CONTRACT_PIN.contentDigest
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
