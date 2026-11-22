/**
 * Diagram authoring conventions and opt-in non-blocking lints (DE-2 asks 5 & 6).
 *
 * 1. **Arrow-direction convention (ask 5):**
 *    In every directed relation, `source` is the initiator of the action and
 *    `target` is the receiver / target of the action. Because initiation is a
 *    semantic property that cannot be guessed from graph topology alone, the
 *    `arrow-direction-convention` lint is opt-in and only evaluates edges that
 *    explicitly declare initiator metadata (either via the semantic relation's
 *    `attributes.initiator` text value or via `conventions.initiators`).
 *
 * 2. **No opaque acronyms as zone tags (ask 6):**
 *    A zone tag (`kicker`) must not consist solely of an unexplained acronym;
 *    an acronym is expected with its descriptive label (e.g.
 *    `"IAM — Identity & Access Management"` or `"VPC · Réseau privé"`). The
 *    `zone-tag-opaque-acronym` lint is opt-in and non-blocking by default, and
 *    ships with a default allowlist covering the product kickers of `DLR-315`.
 *
 * Pure computation: zero DOM, zero external dependencies.
 */
import type { CanonicalArrowheadKind, Relation, SemanticDocument } from "@sentropic/diagram-core";

import type { LayoutWarning } from "./types.js";

/** Documented DS convention for directed connectors: `source` is the initiator of the action. */
export const ARROW_DIRECTION_CONVENTION = "source-is-initiator" as const;

/**
 * Default zone-tag allowlist covering existing product kickers of `DLR-315`
 * so legacy and product-scoped scenes are not broken when the lint is enabled.
 */
export const DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST: readonly string[] = [
  "H2A",
  "SENTROPIC",
  "ENGRAM",
  "DESIGN SYSTEM",
  "SENTROPIC & 3RD PARTIES",
  "SENTROPIC & TIERS",
];

/** Opt-in convention lint configuration (off and non-blocking by default). */
export interface DiagramConventionLintOptions {
  /**
   * Opt-in lint for the arrow-direction convention (`source` = initiator of
   * the action, DE-2 ask 5). Off by default; undecidable without initiator
   * metadata, so edges without declared initiator metadata emit nothing.
   */
  readonly arrowDirection?: boolean;
  /**
   * Optional initiator metadata keyed by relation occurrence id or semantic
   * relation id, mapping to the initiating entity id, occurrence id, or local id.
   */
  readonly initiators?: Readonly<Record<string, string>>;
  /**
   * Opt-in non-blocking lint for opaque acronyms used as zone tags (`kicker`)
   * without an accompanying descriptive label (DE-2 ask 6). Off by default.
   */
  readonly zoneTagAcronyms?: boolean;
  /**
   * Additional allowed zone tag values merged with
   * {@link DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST}.
   */
  readonly zoneTagAcronymAllowlist?: readonly string[];
}

function normalizeTag(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function buildAllowlist(extra?: readonly string[]): ReadonlySet<string> {
  const set = new Set<string>();
  for (const entry of DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST) set.add(normalizeTag(entry));
  if (extra !== undefined) {
    for (const entry of extra) set.add(normalizeTag(entry));
  }
  return set;
}

/**
 * Matches a single bare uppercase acronym/code token:
 * - 2 to 5 uppercase ASCII letters/digits containing at least one letter (e.g. `IAM`, `VPC`, `GCP`, `BQ`, `S3`, `K8S`, `CICD`), or
 * - an uppercase alphanumeric code with digits (e.g. `OAUTH2`, `DLR-315`, `L2A`), or
 * - slash/hyphen-joined bare acronym parts (e.g. `CI/CD`, `IAM/SSO`, `GCP-PRD`).
 */
const BARE_ACRONYM_PART = /^(?:(?=[A-Z0-9]*[A-Z])[A-Z0-9]{2,5}|[A-Z]{1,5}\d+[A-Z0-9]*)$/;

function isBareAcronymToken(token: string): boolean {
  if (token.length === 0) return false;
  // Any lowercase letter indicates a descriptive word/label, not a bare uppercase acronym.
  if (/[a-z\u00e0-\u00ff]/.test(token)) return false;
  if (!/[A-Z]/.test(token)) return false;
  const parts = token.split(/[/-]+/).filter((part) => part.length > 0);
  if (parts.length === 0) return false;
  return parts.every((part) => BARE_ACRONYM_PART.test(part) || /^\d+$/.test(part));
}

/**
 * Returns `true` when `tag` is an unexplained/opaque acronym without an
 * accompanying descriptive label, and is not covered by the allowlist
 * (defaulting to {@link DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST}).
 */
export function isOpaqueAcronymZoneTag(tag: string, allowlist?: readonly string[]): boolean {
  const trimmed = tag.trim();
  if (trimmed.length === 0) return false;
  if (buildAllowlist(allowlist).has(normalizeTag(trimmed))) return false;
  // Split on label separators (`·`, dashes surrounded by space, `:`, `|`, parens, commas, whitespace).
  // Keep internal `/` and `-` (like `CI/CD` or `DLR-315`) intact inside each token.
  const tokens = trimmed
    .split(/(?:\s+[—–-]\s+|\s*[·—–:|(),]+\s*|\s+)/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && token !== "&");
  if (tokens.length === 0) return false;
  return tokens.every(isBareAcronymToken);
}

function normalizeEndpointId(ref: string): string {
  const trimmed = ref.trim();
  if (trimmed.startsWith("entity:")) return trimmed.slice("entity:".length);
  if (trimmed.startsWith("occurrence:e.")) return trimmed.slice("occurrence:e.".length);
  if (trimmed.startsWith("occurrence:")) return trimmed.slice("occurrence:".length);
  return trimmed;
}

function matchesEndpoint(declared: string, candidates: readonly (string | undefined)[]): boolean {
  const trimmed = declared.trim();
  const normalized = normalizeEndpointId(trimmed);
  for (const candidate of candidates) {
    if (candidate === undefined) continue;
    if (candidate === trimmed || normalizeEndpointId(candidate) === normalized) return true;
  }
  return false;
}

function readInitiatorAttribute(relation: Relation | undefined): string | undefined {
  if (relation === undefined) return undefined;
  const attr = relation.attributes["initiator"];
  if (attr !== undefined && attr.kind === "text" && attr.value.trim().length > 0) {
    return attr.value.trim();
  }
  return undefined;
}

export interface ArrowDirectionEdgeInput {
  /** Occurrence id (or relation id) identifying the drawn edge. */
  readonly id: string;
  /** Semantic relation id, when backed by a document relation. */
  readonly relationId?: string;
  /** Drawn source entity ref. */
  readonly sourceEntity: string;
  /** Drawn target entity ref. */
  readonly targetEntity: string;
  /** Drawn source occurrence ref, when available. */
  readonly sourceOccurrence?: string;
  /** Drawn target occurrence ref, when available. */
  readonly targetOccurrence?: string;
  /** Semantic relation source entity ref (before fold lifting), when available. */
  readonly semanticSourceEntity?: string;
  /** Semantic relation target entity ref (before fold lifting), when available. */
  readonly semanticTargetEntity?: string;
  /** Resolved arrowhead kind; `"none"` marks an undirected edge and is skipped. */
  readonly arrowhead?: CanonicalArrowheadKind;
  /** Explicit initiator override for this edge (entity ref, occurrence ref, or local id). */
  readonly initiator?: string;
}

export interface LintArrowDirectionInput {
  readonly document?: SemanticDocument;
  readonly edges: readonly ArrowDirectionEdgeInput[];
  readonly initiators?: Readonly<Record<string, string>>;
}

/**
 * Opt-in lint verifying the arrow-direction convention (`source` = initiator of
 * the action, DE-2 ask 5). Only evaluates directed edges that explicitly
 * declare initiator metadata; returns non-blocking `info` diagnostics.
 */
export function lintArrowDirection(input: LintArrowDirectionInput): readonly LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  for (const edge of input.edges) {
    if (edge.arrowhead === "none") continue;
    const relation =
      edge.relationId !== undefined ? input.document?.relations[edge.relationId as keyof SemanticDocument["relations"]] : undefined;
    const declared =
      edge.initiator ??
      input.initiators?.[edge.id] ??
      (edge.relationId !== undefined ? input.initiators?.[edge.relationId] : undefined) ??
      readInitiatorAttribute(relation);
    if (declared === undefined || declared.trim().length === 0) continue;

    const sourceCandidates = [edge.sourceEntity, edge.sourceOccurrence, edge.semanticSourceEntity];
    const targetCandidates = [edge.targetEntity, edge.targetOccurrence, edge.semanticTargetEntity];
    if (matchesEndpoint(declared, sourceCandidates)) continue;

    const inverted = matchesEndpoint(declared, targetCandidates);
    warnings.push({
      severity: "info",
      code: "arrow-direction-convention",
      refs: [edge.id],
      message: inverted
        ? `edge ${edge.id} points from ${edge.sourceEntity} to ${edge.targetEntity}, but ${declared} is declared as initiator (convention: source = initiator)`
        : `edge ${edge.id} declares initiator ${declared} which does not match source ${edge.sourceEntity} (convention: source = initiator)`,
      details: {
        convention: ARROW_DIRECTION_CONVENTION,
        reason: inverted ? "source-not-initiator" : "initiator-not-endpoint",
        source: edge.sourceEntity,
        target: edge.targetEntity,
        initiator: declared,
      },
    });
  }
  return warnings;
}

export interface ZoneTagLintEntry {
  /** Zone occurrence or entity id. */
  readonly id: string;
  /** Zone tag / kicker text. */
  readonly tag: string | undefined;
}

export interface LintZoneTagAcronymsInput {
  readonly zones: readonly ZoneTagLintEntry[];
  readonly allowlist?: readonly string[];
}

/**
 * Opt-in non-blocking lint flagging zones whose tag (`kicker`) is a bare opaque
 * acronym without a descriptive label (DE-2 ask 6). Product kickers from
 * `DLR-315` are allowed by default.
 */
export function lintZoneTagAcronyms(input: LintZoneTagAcronymsInput): readonly LayoutWarning[] {
  const warnings: LayoutWarning[] = [];
  for (const zone of input.zones) {
    if (zone.tag === undefined) continue;
    if (!isOpaqueAcronymZoneTag(zone.tag, input.allowlist)) continue;
    warnings.push({
      severity: "info",
      code: "zone-tag-opaque-acronym",
      refs: [zone.id],
      message: `zone ${zone.id} uses opaque acronym tag "${zone.tag.trim()}" without a descriptive label`,
      details: {
        zone: zone.id,
        tag: zone.tag.trim(),
      },
    });
  }
  return warnings;
}

export interface LintDiagramConventionsInput {
  readonly options?: DiagramConventionLintOptions;
  readonly document?: SemanticDocument;
  readonly edges?: readonly ArrowDirectionEdgeInput[];
  readonly zones?: readonly ZoneTagLintEntry[];
}

/** Run the enabled opt-in convention lints; returns `[]` when no lint is opted into. */
export function lintDiagramConventions(input: LintDiagramConventionsInput): readonly LayoutWarning[] {
  const opts = input.options;
  if (opts === undefined) return [];
  const warnings: LayoutWarning[] = [];
  if (opts.arrowDirection === true && input.edges !== undefined) {
    warnings.push(
      ...lintArrowDirection({
        ...(input.document === undefined ? {} : { document: input.document }),
        edges: input.edges,
        ...(opts.initiators === undefined ? {} : { initiators: opts.initiators }),
      }),
    );
  }
  if (opts.zoneTagAcronyms === true && input.zones !== undefined) {
    warnings.push(
      ...lintZoneTagAcronyms({
        zones: input.zones,
        ...(opts.zoneTagAcronymAllowlist === undefined ? {} : { allowlist: opts.zoneTagAcronymAllowlist }),
      }),
    );
  }
  return warnings;
}
