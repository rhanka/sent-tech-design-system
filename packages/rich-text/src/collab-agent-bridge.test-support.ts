/**
 * Test-only headless agent-bridge double for canvas-live CL-4a (spec §5.7
 * B-BRIDGE-1/2/7, §5.2 R-ANCH-1…5, §5.3, §5.3.1 preflight atomicity, §4.10
 * receipt identities, §4.11 P0 admitted table; register AMB-D2).
 *
 * This module mirrors the §5.7 B-BRIDGE obligations so DS witnesses can run
 * headless against the in-memory double source and the CL-3c
 * Hocuspocus-backed source. It is not a production bridge, ships in no
 * package graph (excluded from `dist` by the `*.test-support.ts` tsconfig
 * rule, never imported by any shipped entry), defines no host semantics, and
 * is consumed only by the CL-4a witness files. Every rule below cites the
 * spec clause it mirrors; any divergence found later between this double and
 * the host bridge is a host-lane defect report, not a DS behaviour change.
 *
 * `applyAgentPatch` pipeline, in order (§5.3.1, §5.7): (i) `validateAgentPatch`
 * shape/size check — refusal receipt, terminal, nothing applied; (ii) scope
 * check — patch binding and every operation's field/family inside the admitted
 * set, else `scope-denied` (B-BRIDGE-3); (iii) scratch preflight — clone the
 * authoritative doc (`Y.Doc` copy via `Y.encodeStateAsUpdate`/`Y.applyUpdate`),
 * resolve every anchor against the scratch field (`tryResolveAnchorToLinear`;
 * unparseable, foreign-field type name, or unresolvable ⇒ `target-gone` for
 * the whole patch, R-ANCH-5), derive the containing paragraph by scanning
 * separator embeds, refuse a text operation resolving inside a preserved
 * segment as `scope-denied` (R-ANCH-3), refuse a delete/mark range covering a
 * separator, preserved or HR embed as `structural-conflict` (R-ANCH-4),
 * refuse whole-block replacement (B-BRIDGE-1, AMB-A4); (iv) apply sequentially
 * on the scratch field — insert at the resolved position with the anchor's
 * association (R-ANCH-3), delete by item set (R-ANCH-4), mark as one format
 * operation (span inheritance, R-ANCH-4), `insertHardBreak` as one
 * `{ hardBreak: true }` embed, `splitParagraph` as one separator embed,
 * `mergeWithPrevious` as deletion of the named paragraph's opening separator
 * (§4.10); (v) validate the scratch result (`validateFieldState` plus the
 * §4.11 P0 admitted table) — any failure refuses the whole patch with the
 * mapped reason and the authoritative doc untouched; (vi) commit — the same
 * operations on the authoritative field in one transaction under origin
 * `agent:<actorId>` (B-BRIDGE-1), canonical `operationResults` from the
 * authoritative projection at commit time (§5.7, §4.10), terminal receipt plus
 * the per-operation affected-items record (R-REV-2 shapes) written to the
 * injected store under the full key (§5.4.1; payload hashing and the token
 * bucket stay CL-4c, AMB-A6).
 *
 * The scratch run and the commit run share one operation-applier function, so
 * a patch can never commit operations one by one and stop mid-patch (§5.3.1).
 * Mark operations record their range and covered item identities here; the
 * provenance log itself is CL-4c.
 */
import * as Y from "yjs";
import { createHash } from "node:crypto";
import {
  createRelativePositionFromJSON,
  relativePositionToJSON,
} from "yjs";
import {
  latestEffectiveIntent,
  MAX_READ_ANCHORS,
  MAX_READ_PARAGRAPHS,
  MAX_READ_SERIALIZED_BYTES,
  MAX_READ_TEXT_UNITS,
  planMarkRevert,
  validateAgentPatch,
  validateAgentReadRequest,
  validateCollaborationColor,
  validateFormattingIntentDraft,
} from "./collaboration.js";
import type {
  AgentDocumentState,
  AgentEditOperation,
  AgentFieldState,
  AgentInlineSegment,
  AgentOperationResult,
  AgentParagraphState,
  AgentPatch,
  AgentPatchKey,
  AgentPatchProfile,
  AgentPatchReceipt,
  AgentReadRequest,
  AwarenessCursor,
  CollaborationActor,
  FieldBindingIdentity,
  FormattingIntent,
  FullBlockMetadata,
  InlineMarkKey,
  PresenceSnapshot,
  RelativeAnchor,
} from "./collaboration.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
} from "./editor-full-markdown.js";
import type { FormattingIntentDraft } from "./editor-collaboration.js";
import type {
  SessionMarkUndoMarkGroup,
  SessionMarkUndoOutcome,
  SessionMarkUndoPerformer,
} from "./editor-collaboration.js";
import {
  attributesToMarks,
  fieldMetaName,
  fieldTextName,
  isHardBreakValue,
  isHorizontalRuleValue,
  isPreservedValue,
  isSeparatorValue,
  validateFieldState,
} from "./collab-codec.js";
import {
  mintAnchorAt,
  mintEndOfFieldAnchor,
  tryResolveAnchorToLinear,
} from "./collab-selection.js";
import type {
  LiveSessionBinding,
  LiveSessionBindingSource,
} from "./editor-collaboration.js";
import type { RichTextFormat } from "./model.js";

const P0_FORMAT: RichTextFormat = "focus.markdown.p0@1";
/** Full-profile format of the double's full seam (R-FULL-OP-1 reads/writes). */
const FULL_PROFILE_FORMAT: RichTextFormat = "ds.markdown.full@1";
/** Host-minted agent origin form (§5.1); the double mints it the same way. */
const agentOriginFor = (actorId: string): string => `agent:${actorId}`;

/** Injected receipt store (a plain object held by the test, so a later run can
    restart the bridge over the same store; durable semantics stay CL-4c). */
export interface AgentBridgeReceiptStore {
  receipts: Record<string, AgentPatchReceipt>;
  /** Patch JSON per full key (kept for witness readability; retry identity
      is by canonical payload hash, section 5.4.1). */
  payloads: Record<string, string>;
  /** R-REV-2 affected-items record per full key (applied patches only; the
      record the CL-4c revert consumes). */
  records: Record<string, AgentAffectedItemsRecord>;
  /** Canonical payload hash per full key (section 5.4.1 payload binding). */
  payloadHashes: Record<string, string>;
  /** Ordered provenance log (store-assigned sequence, journal stand-in). */
  provenanceLog: FormattingIntent[];
  /** Next provenance sequence to assign. */
  provenanceNextSeq: number;
  /** Revert receipts per original full key (R-REV-7). */
  revertReceipts: Record<string, AgentPatchReceipt>;
  /** Session epoch presented at admission per full key (readability). */
  patchEpochs: Record<string, string>;
  /** CL-4e mark-undo stand-in (test-only, AMB-D2): transition table per
      human step, keyed by `${fieldKey}:${transactionId}`. Holds the current
      durable transition and the effective intent groups for the next
      invocation through the transition chain. */
  markUndoTransitions?: Record<
    string,
    {
      transitionId: string | null;
      effective: Array<{ mark: string; intentIds: string[] }>;
    }
  >;
  /** CL-4e mark-undo stand-in (test-only, AMB-D2): request-outcome table
      per requestId for idempotent replay and changed-payload refusal. */
  markUndoOutcomes?: Record<
    string,
    {
      outcome: {
        status: string;
        requestId: string;
        duplicate?: boolean;
        transitionId?: string | null;
        changed?: boolean;
        reason?: string;
        detail: string;
        conflict?: {
          kind: string;
          fieldKey: string;
          mark: string;
          items: Array<{ client: number; clock: number }>;
          detail: string;
        };
      };
      payload: string;
    }
  >;
  /** CL-4e mark-undo stand-in (test-only, AMB-D2): transition sequence. */
  markUndoTransitionSeq?: number;
  /** CL-4e fix 1 (test-only, AMB-D2): committed human-transaction
      envelopes per `${fieldKey}:${transactionId}`, indexed from the log as
      intents commit. Survives log truncation so a later invocation still
      evaluates against the real envelope (genuine keyless
      `mark-provenance-conflict`) instead of misreading a missing log as
      `target-gone`. */
  markUndoEnvelopes?: Record<
    string,
    {
      actorId: string;
      fieldKey: string;
      transactionId: string;
      groups: Array<{
        mark: string;
        intentIds: string[];
        items: Array<{ client: number; clock: number }>;
      }>;
    }
  >;
}

export function createAgentBridgeReceiptStore(): AgentBridgeReceiptStore {
  return {
    receipts: {},
    payloads: {},
    records: {},
    payloadHashes: {},
    provenanceLog: [],
    provenanceNextSeq: 1,
    revertReceipts: {},
    patchEpochs: {},
  };
}

/** RFC 8785 canonical JSON for the patch value classes a patch can carry
    (objects with sorted keys, arrays, strings, finite numbers, booleans,
    null). Patch bodies carry only these classes; no other class reaches the
    hash input. */
export function canonicalizeJson(value: unknown): string {
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("rich-text.canonical-hash: non-finite number is not hashable");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeJson(entry)).join(",")}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const parts: string[] = [];
    for (const key of keys) {
      parts.push(`${JSON.stringify(key)}:${canonicalizeJson((value as Record<string, unknown>)[key])}`);
    }
    return `{${parts.join(",")}}`;
  }
  throw new Error("rich-text.canonical-hash: unhashable value class");
}

/** Canonical payload body for section 5.4.1 (register AMB-C1): the hashed
    body is `{ binding, baseRevision, operations }` (operations, anchors,
    base revision and binding identity; everything except transport
    metadata). Key components (`patchId`, `actorId`, `sessionEpoch`) bind
    through the full key and are not double-counted inside the hash. */
export function canonicalPatchBody(patch: AgentPatch): unknown {
  return {
    baseRevision: patch.baseRevision,
    binding: patch.binding,
    operations: patch.operations,
  };
}

/** SHA-256 lower-hex over the RFC 8785 canonical JSON of the patch body. */
export function computePayloadHash(patch: AgentPatch): string {
  const canonical = canonicalizeJson(canonicalPatchBody(patch));
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/** Append one validated draft to the store log with the next sequence.
    Throws a typed test error on an invalid draft or a conflicting replay. */
export function appendProvenanceDraft(
  store: AgentBridgeReceiptStore,
  draft: FormattingIntentDraft,
): FormattingIntent {
  const checked = validateFormattingIntentDraft(draft);
  if (!checked.ok) {
    throw new Error(`rich-text.provenance-append: invalid draft is a test failure: ${checked.detail}`);
  }
  const existing = store.provenanceLog.find((entry) => entry.intentId === draft.intentId);
  if (existing !== undefined) {
    const withoutSeq = (value: unknown): unknown => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(value as Record<string, unknown>)) {
        if (key === "seq") continue;
        out[key] = (value as Record<string, unknown>)[key];
      }
      return out;
    };
    if (canonicalizeJson(withoutSeq(existing)) === canonicalizeJson(withoutSeq(draft))) return existing;
    throw new Error(
      "rich-text.provenance-append: same intentId with a different payload refuses (dedupe discipline)",
    );
  }
  const record: FormattingIntent = { ...(draft as object), seq: store.provenanceNextSeq } as FormattingIntent;
  store.provenanceNextSeq += 1;
  store.provenanceLog.push(record);
  return record;
}

/** Item identity in Yjs `(client, clock, length)` coordinates. */
export interface AgentItemId {
  client: number;
  clock: number;
  length: number;
}

/** R-REV-2 per-operation affected-items record (CL-4a slice). */
export interface AgentAffectedOperation {
  fieldKey: string;
  operationIndex: number;
  kind: AgentEditOperation["type"];
  /** Exact Yjs items created by this operation (text characters, embeds,
      separator; format markers included for mark operations). */
  insertedItems: readonly AgentItemId[];
  /** Base items deleted by this operation with their deleted content slice
      (slice-exact length plus the offset into the host item, with the
      recorded marks at delete time for R-REV-6 restore). */
  deletedItems: readonly {
    client: number;
    clock: number;
    offset: number;
    length: number;
    text: string;
    isHardBreak: boolean;
    marks: Record<string, unknown>;
  }[];
  /** R-REV-2 linkage: intent ids the operation recorded (mark operations). */
  markIntentIds: readonly string[];
  /** Mark name/value for mark operations (needed when the log is missing). */
  mark?: InlineMarkKey;
  markValue?: true | string | null;
  /** Full only (R-FULL-OP-1/R-FULL-OP-2): per asserted key, the mark/value
      plus the intent ids recorded for it. A `link` operation carries two
      groups (`link` and `linkTitle`); every boolean key carries one. */
  markIntents: ReadonlyArray<{
    mark: InlineMarkKey;
    value: true | string | null;
    intentIds: readonly string[];
  }> | null;
  /** Full only (R-FULL-OP-2): metadata prior/after facts for
      `setBlockMetadata` (prior null when no entry preceded). */
  metadataChange: {
    paragraphId: string;
    prior: FullBlockMetadata | null;
    after: FullBlockMetadata;
  } | null;
  /** Full only (R-R2/R-FULL-OP-2): HR atom identity paired with `separator`
      for HR insert/delete inverses (payloads rebuild from the paragraphId). */
  hrAtom: { client: number; clock: number; paragraphId: string } | null;
  /** Full only (R-FULL-OP-2): replacement paragraph created by a sole-block
      HR deletion (null otherwise). */
  replacementParagraphId: string | null;
  /** Split: the inserted separator identity and payload; merge: the deleted
      separator identity, payload and junction anchors. */
  separator: {
    client: number;
    clock: number;
    paragraphId: string;
    kind: string;
    preservedKind?: string;
  } | null;
  /** Delete/mark range as addressed, and the junction anchors delimiting a
      delete/merge inverse. Mark operations record the range plus `coveredItems`
      (the provenance log itself is CL-4c). */
  range: { start: RelativeAnchor; end: RelativeAnchor } | null;
  flanking: { before: RelativeAnchor; after: RelativeAnchor } | null;
  coveredItems: readonly AgentItemId[];
}

/** R-REV-2 affected-items record for one applied patch. */
export interface AgentAffectedItemsRecord {
  key: AgentPatchKey;
  stateVectorBefore: string;
  stateVectorAfter: string;
  operations: readonly AgentAffectedOperation[];
}

/**
 * One isolated preserved-raw chunk (§2.3 rule 2, host condition C-D7-2 E2).
 * Test-only: the page-level read path below consumes this same discipline
 * at page scale; the exported fixture pins its outputs chunk for chunk.
 */
export interface PreservedRawChunk {
  /** UTF-16 code-unit offset of this chunk in the full raw string. */
  rawOffset: number;
  /** One contiguous substring of the full raw string. */
  chunk: string;
  /** True only on the last chunk for the block. */
  rawComplete: boolean;
}

/**
 * Slice a preserved `raw` string in isolation (§2.3 rule 2): the greedy
 * largest prefix whose `JSON.stringify(chunk)` UTF-8 byte length fits
 * `chunkBudgetBytes`, shortened to the preceding surrogate-pair boundary,
 * with contiguous offsets, `rawComplete` only on the last chunk, and no
 * trailing empty chunk on an exact multiple. The serialised measure counts
 * JSON escaping (quotes included), exactly as R-READ-1 measures the
 * response. A budget smaller than the first code point still emits that
 * code point (progress over fit); the page-level caller never presents
 * such a budget with an empty page — it closes the page instead.
 */
export function slicePreservedRawForTest(raw: string, chunkBudgetBytes: number): PreservedRawChunk[] {
  const chunks: PreservedRawChunk[] = [];
  let offset = 0;
  while (offset < raw.length) {
    const rest = raw.length - offset;
    const fitted = (length: number): number =>
      Buffer.byteLength(JSON.stringify(raw.slice(offset, offset + length)), "utf8");
    // Binary search for the largest length that fits. The escaped-byte
    // measure is not monotone at a surrogate-pair boundary (a lone high
    // surrogate escapes as 6 bytes, the full pair as 4), so never probe a
    // cut between a high and a low surrogate: probe the cut after the pair
    // instead, keeping the result greedy-maximal.
    const isPairCut = (length: number): boolean =>
      length < rest &&
      raw.charCodeAt(offset + length - 1) >= 0xd800 &&
      raw.charCodeAt(offset + length - 1) <= 0xdbff &&
      raw.charCodeAt(offset + length) >= 0xdc00 &&
      raw.charCodeAt(offset + length) <= 0xdfff;
    let low = 1;
    let high = rest;
    if (fitted(1) > chunkBudgetBytes) {
      low = 1;
      high = 1;
    } else {
      while (low < high) {
        const mid = Math.floor((low + high + 1) / 2);
        const probe = isPairCut(mid) ? mid + 1 : mid;
        if (fitted(probe) <= chunkBudgetBytes) low = probe;
        else high = mid - 1;
      }
    }
    let length = low;
    // Surrogate-pair rule (§2.3 rule 2): no boundary inside a pair. Under
    // the escaped-byte measure a fitting prefix can never end mid-pair
    // (completing the pair is cheaper than the lone-high escape), so this
    // shortening is defensive only.
    const last = raw.charCodeAt(offset + length - 1) as number;
    const next = offset + length < raw.length ? (raw.charCodeAt(offset + length) as number) : -1;
    if (length >= 1 && last >= 0xd800 && last <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
      length = length > 1 ? length - 1 : 2;
    }
    length = Math.min(length, rest);
    chunks.push({
      rawOffset: offset,
      chunk: raw.slice(offset, offset + length),
      rawComplete: offset + length >= raw.length,
    });
    offset += length;
  }
  return chunks;
}

/** Refusal of the bounded read helper (R-READ-1; full pagination stays CL-4b). */
export class AgentBridgeReadRefusal extends Error {
  readonly reason: "too-large" | "scope-denied" | "target-gone" | "incompatible-schema";
  constructor(
    reason: "too-large" | "scope-denied" | "target-gone" | "incompatible-schema",
    detail: string,
  ) {
    super(`rich-text.agent-read-refused: ${detail}`);
    this.name = "AgentBridgeReadRefusal";
    this.reason = reason;
  }
}

function fullKeyString(key: AgentPatchKey): string {
  return JSON.stringify([key.documentId, key.actorId, key.sessionEpoch, key.patchId]);
}

function fullKeyOf(patch: AgentPatch): AgentPatchKey {
  return {
    documentId: patch.binding.documentId,
    actorId: patch.actorId,
    sessionEpoch: patch.sessionEpoch,
    patchId: patch.patchId,
  };
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromBase64Url(value: string): Map<number, number> {
  return Y.decodeStateVector(new Uint8Array(Buffer.from(value, "base64url")));
}

// ── Linear walk over the field sequence (R-ANCH-1 units) ──
//
// Yjs keeps the field order as the linked item list from `Y.Text._start`;
// formatting markers (`ContentFormat`) and tombstones (`ContentDeleted`) carry
// no linear width. Visible widths: one per UTF-16 code unit of a string item,
// one per embed of any kind (separator embeds included, §4.3.0).

interface WalkItem {
  client: number;
  clock: number;
  length: number;
  start: number;
  end: number;
  kind: "text" | "separator" | "hardBreak" | "preserved" | "horizontalRule";
  text: string;
  separator: { paragraphId: string; kind: string; preservedKind?: string } | null;
}

interface WalkChain {
  id: { client: number; clock: number };
  length: number;
  right: WalkChain | null;
  deleted?: boolean;
  content: { constructor: { name: string }; str?: unknown; embed?: unknown };
}

function chainStart(ytext: Y.Text): WalkChain | null {
  const start = (ytext as unknown as { _start?: WalkChain | null })._start;
  if (start === undefined) {
    throw new Error("rich-text.agent-bridge-internal: Y.Text item chain is unavailable");
  }
  return start;
}

function walkVisibleItems(ytext: Y.Text): WalkItem[] {
  const items: WalkItem[] = [];
  let position = 0;
  let chain = chainStart(ytext);
  while (chain !== null) {
    if (chain.deleted === true) {
      chain = chain.right;
      continue;
    }
    const name = chain.content?.constructor?.name;
    if (name === "ContentString") {
      const text = chain.content.str;
      if (typeof text !== "string") {
        throw new Error("rich-text.agent-bridge-internal: ContentString carries no string");
      }
      if (text.length !== chain.length) {
        throw new Error("rich-text.agent-bridge-internal: ContentString length mismatch");
      }
      items.push({
        client: chain.id.client,
        clock: chain.id.clock,
        length: chain.length,
        start: position,
        end: position + text.length,
        kind: "text",
        text,
        separator: null,
      });
      position += text.length;
    } else if (name === "ContentEmbed") {
      const value = chain.content.embed;
      if (isSeparatorValue(value)) {
        const payload = value.separator as {
          paragraphId: string;
          kind: string;
          preservedKind?: string;
        };
        items.push({
          client: chain.id.client,
          clock: chain.id.clock,
          length: 1,
          start: position,
          end: position + 1,
          kind: "separator",
          text: "",
          separator: {
            paragraphId: payload.paragraphId,
            kind: payload.kind,
            ...(payload.preservedKind === undefined ? {} : { preservedKind: payload.preservedKind }),
          },
        });
      } else if (isHardBreakValue(value)) {
        items.push({
          client: chain.id.client,
          clock: chain.id.clock,
          length: 1,
          start: position,
          end: position + 1,
          kind: "hardBreak",
          text: "",
          separator: null,
        });
      } else if (isPreservedValue(value)) {
        items.push({
          client: chain.id.client,
          clock: chain.id.clock,
          length: 1,
          start: position,
          end: position + 1,
          kind: "preserved",
          text: "",
          separator: null,
        });
      } else if (isHorizontalRuleValue(value)) {
        items.push({
          client: chain.id.client,
          clock: chain.id.clock,
          length: 1,
          start: position,
          end: position + 1,
          kind: "horizontalRule",
          text: "",
          separator: null,
        });
      } else {
        throw new Error("rich-text.agent-bridge-internal: unlisted inline embed shape in walk");
      }
      position += 1;
    } else if (name === "ContentFormat" || name === "ContentDeleted") {
      // Zero linear width: formatting markers and tombstones never advance the
      // linear index (R-LIN-4; §4.3.0).
    } else {
      throw new Error(
        `rich-text.agent-bridge-internal: unexpected shared item ${String(name)} in walk`,
      );
    }
    chain = chain.right;
  }
  return items;
}

// ── Paragraph scan and coverage ──

interface ScannedParagraph {
  paragraphId: string;
  kind: string;
  separatorIndex: number;
  contentStart: number;
  contentEnd: number;
}

/** Scan separator embeds into paragraphs (§4.3.1 item 1; R-ANCH-3). */
function scanParagraphs(items: readonly WalkItem[], fieldLength: number): ScannedParagraph[] {
  const paragraphs: ScannedParagraph[] = [];
  let current: ScannedParagraph | null = null;
  for (const item of items) {
    if (item.kind !== "separator" || item.separator === null) continue;
    if (current !== null) {
      current.contentEnd = item.start;
      paragraphs.push(current);
    }
    current = {
      paragraphId: item.separator.paragraphId,
      kind: item.separator.kind,
      separatorIndex: item.start,
      contentStart: item.start + 1,
      contentEnd: fieldLength,
    };
  }
  if (current !== null) paragraphs.push(current);
  return paragraphs;
}

/** Containing paragraph of a linear position (a separator belongs to the
    preceding paragraph, so an endAnchor resolves to its own paragraph;
    index 0 stays on the first paragraph; R-ANCH-2, R-ANCH-3, §5.7). */
function containingParagraph(
  paragraphs: readonly ScannedParagraph[],
  index: number,
): ScannedParagraph | null {
  if (paragraphs.length === 0) return null;
  if (index <= 0) return paragraphs[0] ?? null;
  for (const paragraph of paragraphs) {
    if (index >= paragraph.contentStart && index <= paragraph.contentEnd) {
      return paragraph;
    }
  }
  return null;
}

/** An item existed at the base revision iff the base state vector covers its
    full clock range (R-ANCH-4: concurrent interior items survive a delete). */
function isCoveredBy(
  baseSV: Map<number, number>,
  client: number,
  clock: number,
  length: number,
): boolean {
  return (baseSV.get(client) ?? 0) >= clock + length;
}

/** Parse an anchor and check its serialised type name against the target
    field (R-ANCH-2: a foreign-field anchor is never re-anchored, R-ANCH-5). */
function anchorTypeName(anchor: RelativeAnchor): string | null {
  try {
    const parsed = JSON.parse(anchor) as { tname?: unknown };
    return typeof parsed.tname === "string" ? parsed.tname : null;
  } catch {
    return null;
  }
}

/** Resolve one anchor against a field or throw the typed whole-patch refusal. */
function resolveAnchorOrRefuse(
  ytext: Y.Text,
  fieldKey: string,
  anchor: RelativeAnchor,
  what: string,
): number {
  if (anchorTypeName(anchor) !== fieldTextName(fieldKey)) {
    throw new BridgeRefusal(
      "target-gone",
      `${what}: anchor names another field or does not parse (R-ANCH-5)`,
    );
  }
  const resolved = tryResolveAnchorToLinear(ytext, anchor);
  if (resolved === null) {
    throw new BridgeRefusal(
      "target-gone",
      `${what}: anchor does not resolve against the current field (R-ANCH-5)`,
    );
  }
  return resolved;
}

/** Internal whole-patch refusal (one operation failing refuses the patch whole,
    §5.3.1, §5.4 atomicity). */
class BridgeRefusal extends Error {
  readonly reason: AgentPatchReceipt["reason"];
  readonly operationIndex: number | null;
  readonly conflict?: import("./collaboration.js").MarkProvenanceConflict;
  constructor(
    reason: NonNullable<AgentPatchReceipt["reason"]>,
    detail: string,
    operationIndex: number | null = null,
    conflict?: import("./collaboration.js").MarkProvenanceConflict,
  ) {
    super(detail);
    this.name = "BridgeRefusal";
    this.reason = reason;
    this.operationIndex = operationIndex;
    if (conflict !== undefined) this.conflict = conflict;
  }
}

function isNonEmptyKeyPart(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

// ── Bounded read helper (R-READ-1 seam; full pagination stays CL-4b) ──

/** Mint an anchor, binding the field end with `assoc < 0` (R-ANCH-2). */
function mintAt(ytext: Y.Text, index: number): RelativeAnchor {
  return index >= ytext.length
    ? mintEndOfFieldAnchor(ytext, ytext.length)
    : mintAnchorAt(ytext, index, 0);
}

/** Marks at one linear index from the field delta at delete time (R-REV-6).
    Reads the `toDelta` attributes covering the index; hard-break positions
    and out-of-range indexes carry no marks. */
function marksAtDelta(ytext: Y.Text, index: number): Record<string, unknown> {
  const delta = ytext.toDelta() as Array<{
    insert?: unknown;
    attributes?: Record<string, unknown>;
  }>;
  let cursor = 0;
  for (const op of delta) {
    if (typeof op.insert === "string") {
      const text = op.insert as string;
      if (index >= cursor && index < cursor + text.length) {
        return { ...(op.attributes ?? {}) };
      }
      cursor += text.length;
    } else if (op.insert !== undefined) {
      cursor += 1;
    }
  }
  return {};
}

interface DeltaOp {
  insert?: string | Record<string, unknown>;
  attributes?: Record<string, unknown>;
}

// ── Bounded reads: pagination, retained revisions, continuations and
// preserved chunking (§5.6 R-READ-1…3; CL-4b) ──
//
// Every page below is built against the retained snapshot, never live
// state (R-READ-2). Caps are enforced per response exactly as the §5.6
// read contract measures them (R-READ-1): at most MAX_READ_PARAGRAPHS
// paragraph entries (each preserved chunk entry counts as one), at most
// MAX_READ_TEXT_UNITS paragraph-offset units (text units plus each
// chunk's UTF-16 length), at most MAX_READ_ANCHORS anchors (segment,
// boundary and requested combined), and at most MAX_READ_SERIALIZED_BYTES
// as the UTF-8 byte length of `JSON.stringify(state)` — the double's
// serialised-size estimator (host condition C-D7-2, DS position). Pages
// are filled greedily in field order and cut at the first entry that
// would exceed any cap; `nextPageToken` is present exactly when the
// selection continues, including inside one paragraph or one preserved
// block (R-READ-1 last sentence plus the Task 2 sentence).

/** Read-token prefix of the double's retained reads. */
const READ_TOKEN_PREFIX = "read-token:";
/** Retained reads per double instance (the R-READ-2 bound is per
    (document, actor) in production; the double has no actor field on
    `AgentReadRequest`, so the session stands for the actor here). */
const RETAINED_READ_LIMIT = 8;
/** Retention TTL default: the R-READ-2 minimum of 5 minutes. */
const DEFAULT_RETENTION_TTL_MS = 5 * 60 * 1000;
/** Worst-case `nextPageToken` size, reserved from every page budget so a
    page stays in-cap with or without a continuation token. */
const NEXT_PAGE_TOKEN_RESERVE = 128;

/** One retained revision (R-READ-2): a cloned snapshot plus its vector. */
interface RetainedRead {
  token: string;
  doc: Y.Doc;
  stateVector: string;
  createdAt: number;
  seq: number;
}

/** Resolved read position: the retained read, the selection window and
    the intra-selection resume point (paragraph scan index, segment index,
    character offset within that segment — or consumed raw offset for a
    preserved block). */
interface ResolvedReadCursor {
  retained: RetainedRead;
  token: string;
  startIdx: number;
  endIdx: number;
  para: number;
  seg: number;
  char: number;
}

interface PageTokenPayload {
  v: 1;
  t: string;
  s: number;
  e: number;
  p: number;
  g: number;
  h: number;
  f: string;
}

/** Opaque page token: the double-internal encoding of the retained token
    plus the paragraph/segment/chunk cursor (R-READ-1). */
function encodePageToken(payload: PageTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePageToken(pageToken: string): PageTokenPayload | null {
  try {
    const payload = JSON.parse(
      Buffer.from(pageToken, "base64url").toString("utf8"),
    ) as Partial<PageTokenPayload>;
    if (payload.v !== 1 || typeof payload.t !== "string" || payload.t === "") return null;
    if (typeof payload.f !== "string" || payload.f === "") return null;
    for (const key of ["s", "e", "p", "g", "h"] as const) {
      if (!Number.isInteger(payload[key]) || (payload[key] as number) < 0) return null;
    }
    return payload as PageTokenPayload;
  } catch {
    return null;
  }
}

/** Resolve one selector anchor against the retained field text (R-ANCH-5). */
function resolveSelectorAnchor(
  ytext: Y.Text,
  fieldKey: string,
  anchor: RelativeAnchor,
  what: string,
): number {
  if (anchorTypeName(anchor) !== fieldTextName(fieldKey)) {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor names another field or does not parse (R-ANCH-5)`,
    );
  }
  const resolved = tryResolveAnchorToLinear(ytext, anchor);
  if (resolved === null) {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor does not resolve at the retained revision (R-ANCH-5)`,
    );
  }
  return resolved;
}

/** Resolve the request selector to a linear window on the retained text.
    Paragraph granularity: paragraphs overlapping the window are returned
    whole; the continuation cursor resumes mid-paragraph from there. */
function resolveReadSelection(
  ytext: Y.Text,
  fieldKey: string,
  paragraphs: readonly ScannedParagraph[],
  selector: AgentReadRequest["selector"],
): { startIdx: number; endIdx: number } {
  let startIdx = 0;
  let endIdx = ytext.length;
  if (selector?.startParagraphId !== undefined) {
    const found = paragraphs.find((entry) => entry.paragraphId === selector.startParagraphId);
    if (found === undefined) {
      throw new AgentBridgeReadRefusal(
        "target-gone",
        `selector names an unknown paragraph: ${selector.startParagraphId}`,
      );
    }
    startIdx = Math.max(startIdx, found.contentStart);
  }
  if (selector?.endParagraphId !== undefined) {
    const found = paragraphs.find((entry) => entry.paragraphId === selector.endParagraphId);
    if (found === undefined) {
      throw new AgentBridgeReadRefusal(
        "target-gone",
        `selector names an unknown paragraph: ${selector.endParagraphId}`,
      );
    }
    endIdx = Math.min(endIdx, found.contentEnd);
  }
  if (selector?.startAnchor !== undefined) {
    startIdx = Math.max(
      startIdx,
      resolveSelectorAnchor(ytext, fieldKey, selector.startAnchor, "selector startAnchor"),
    );
  }
  if (selector?.endAnchor !== undefined) {
    endIdx = Math.min(
      endIdx,
      resolveSelectorAnchor(ytext, fieldKey, selector.endAnchor, "selector endAnchor"),
    );
  }
  return { startIdx: Math.max(0, startIdx), endIdx: Math.min(ytext.length, endIdx) };
}

interface DeltaRun {
  start: number;
  end: number;
  text: string;
  marks: Record<string, unknown>;
}

/** Text runs of one retained field text, in order (R-READ-3 shapes). */
function collectDeltaRuns(ytext: Y.Text): DeltaRun[] {
  const delta = ytext.toDelta() as DeltaOp[];
  const runs: DeltaRun[] = [];
  let cursor = 0;
  for (const op of delta) {
    const insert = op.insert;
    if (typeof insert === "string") {
      runs.push({ start: cursor, end: cursor + insert.length, text: insert, marks: { ...(op.attributes ?? {}) } });
      cursor += insert.length;
    } else if (typeof insert === "object" && insert !== null) {
      cursor += 1;
    }
  }
  return runs;
}

interface BuiltSegment {
  position: number;
  end: number;
  segment: AgentInlineSegment;
}

/** Full inline segment list of a text-like paragraph on retained state,
    in field order with boundary-exact linear spans (R-READ-3). */
function buildTextSegments(
  ytext: Y.Text,
  paragraph: ScannedParagraph,
  runs: readonly DeltaRun[],
  items: readonly WalkItem[],
  format: RichTextFormat,
): { text: string; segments: BuiltSegment[] } {
  const ordered: BuiltSegment[] = [];
  let text = "";
  for (const run of runs) {
    if (run.end <= paragraph.contentStart || run.start >= paragraph.contentEnd) continue;
    const sliceStart = Math.max(run.start, paragraph.contentStart);
    const slice = run.text.slice(
      sliceStart - run.start,
      Math.min(run.text.length, paragraph.contentEnd - run.start),
    );
    if (slice === "") continue;
    text += slice;
    ordered.push({
      position: sliceStart,
      end: sliceStart + slice.length,
      segment: {
        type: "text",
        text: slice,
        marks: attributesToMarks(run.marks, format),
        startAnchor: mintAt(ytext, sliceStart),
        endAnchor: mintAt(ytext, sliceStart + slice.length),
      },
    });
  }
  for (const item of items) {
    if (item.kind !== "hardBreak") continue;
    if (item.start < paragraph.contentStart || item.start >= paragraph.contentEnd) continue;
    ordered.push({
      position: item.start,
      end: item.start + 1,
      segment: {
        type: "hardBreak",
        anchorBefore: mintAt(ytext, item.start),
        anchorAfter: mintAt(ytext, item.start + 1),
      },
    });
  }
  ordered.sort((left, right) => left.position - right.position);
  return { text, segments: ordered };
}

/** Split a text run at the largest UTF-16 prefix whose partial entry fits,
    never splitting a surrogate pair. Returns 0 only when nothing fits. */
function splitTextRunForPage(
  runText: string,
  unitsLeft: number,
  candidateBytes: (prefixLength: number) => number,
  budgetLeft: number,
): number {
  const maxByUnits = Math.min(runText.length, unitsLeft);
  let best = 0;
  if (maxByUnits <= 0) return 0;
  if (candidateBytes(maxByUnits) <= budgetLeft) {
    best = maxByUnits;
  } else {
    // Pair-aware probe (same escaped-measure non-monotonicity as the
    // isolated slicer): never probe a cut between a high and a low
    // surrogate; probe the cut after the pair instead.
    let low = 0;
    let high = maxByUnits;
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      const pairCut =
        mid < maxByUnits &&
        runText.charCodeAt(mid - 1) >= 0xd800 &&
        runText.charCodeAt(mid - 1) <= 0xdbff &&
        runText.charCodeAt(mid) >= 0xdc00 &&
        runText.charCodeAt(mid) <= 0xdfff;
      const probe = pairCut ? mid + 1 : mid;
      if (candidateBytes(probe) <= budgetLeft) low = probe;
      else high = mid - 1;
    }
    best = low;
  }
  if (best <= 0) return 0;
  // Surrogate-pair rule: no boundary inside a pair.
  const last = runText.charCodeAt(best - 1) as number;
  const next = best < runText.length ? (runText.charCodeAt(best) as number) : -1;
  if (last >= 0xd800 && last <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
    best -= 1;
  }
  return best;
}

interface PageFill {
  state: AgentDocumentState;
}

/** Build one page against the retained snapshot from the resume point.
    Greedy fill in field order; the first entry that would exceed any cap
    closes the page with `nextPageToken`, splitting inside a paragraph or
    a preserved block when the page is still empty. Full profile additionally
    returns per-paragraph metadata and the referenced run-source records of
    the selection window (`runMetadata`), both counted in the serialised
    estimator exactly like every other byte (R-READ-1, R-READ-3 full half). */
function buildReadPage(options: {
  ytext: Y.Text;
  documentId: string;
  fieldKey: string;
  schemaEpoch: string;
  retainedVector: string;
  readToken: string;
  paragraphs: ScannedParagraph[];
  items: readonly WalkItem[];
  runs: readonly DeltaRun[];
  requestedAnchors: readonly RelativeAnchor[];
  startIdx: number;
  endIdx: number;
  resume: { para: number; seg: number; char: number };
  maxEntries: number;
  /** Segment/mark conversion profile (P0 byte-stable without metadata). */
  format: RichTextFormat;
  /** Retained block-metadata map of the same snapshot revision. */
  fieldMeta: Y.Map<unknown>;
}): PageFill {
  const {
    ytext,
    documentId,
    fieldKey,
    schemaEpoch,
    retainedVector,
    readToken,
    paragraphs,
    items,
    runs,
    requestedAnchors,
    startIdx,
    endIdx,
    maxEntries,
    format,
    fieldMeta,
  } = options;
  const pageBudget = MAX_READ_SERIALIZED_BYTES - NEXT_PAGE_TOKEN_RESERVE;
  // Referenced run-source records of the selection window (R-FULL-META-2):
  // run ids referenced by a selected paragraph but not live in the field,
  // including a still-referenced deleted opener. Computed upfront so the
  // skeleton measures them toward the R-READ-1 byte cap.
  const runMetadata: Record<string, FullBlockMetadata> = {};
  if (format === FULL_PROFILE_FORMAT) {
    const liveIds = new Set(paragraphs.map((entry) => entry.paragraphId));
    const referenced = new Set<string>();
    for (const paragraph of paragraphs) {
      if (paragraph.contentEnd <= startIdx || paragraph.contentStart >= endIdx) continue;
      if (paragraph.kind !== "paragraph") continue;
      const stored = fieldMeta.get(paragraph.paragraphId) as FullBlockMetadata | undefined;
      const runId = stored?.listRunId;
      if (typeof runId === "string" && runId !== "" && !liveIds.has(runId)) {
        referenced.add(runId);
      }
    }
    for (const runId of referenced) {
      const record = fieldMeta.get(runId) as FullBlockMetadata | undefined;
      if (record !== undefined) {
        runMetadata[runId] = structuredClone(record) as FullBlockMetadata;
      }
    }
  }
  const skeleton = {
    revision: { documentId, stateVector: retainedVector, schemaEpoch },
    readToken,
    fields: [
      {
        fieldKey,
        paragraphs: [] as AgentParagraphState[],
        ...(Object.keys(runMetadata).length > 0 ? { runMetadata } : {}),
        ...(requestedAnchors.length > 0 ? { requestedAnchors: [...requestedAnchors] } : {}),
      },
    ],
  };
  const paragraphsOut: AgentParagraphState[] = [];
  let byteTotal = Buffer.byteLength(JSON.stringify(skeleton), "utf8");
  let entryCount = 0;
  let unitCount = 0;
  let anchorCount = requestedAnchors.length;
  let resume = { ...options.resume };
  let hasMore = false;

  const fitsEntry = (entry: AgentParagraphState, units: number, anchors: number): boolean => {
    const bytes = Buffer.byteLength(JSON.stringify(entry), "utf8");
    return (
      entryCount + 1 <= maxEntries &&
      unitCount + units <= MAX_READ_TEXT_UNITS &&
      anchorCount + anchors <= MAX_READ_ANCHORS &&
      byteTotal + (paragraphsOut.length > 0 ? 1 : 0) + bytes <= pageBudget
    );
  };

  const emitEntry = (entry: AgentParagraphState, units: number, anchors: number): void => {
    const bytes = Buffer.byteLength(JSON.stringify(entry), "utf8");
    byteTotal += (paragraphsOut.length > 0 ? 1 : 0) + bytes;
    paragraphsOut.push(entry);
    entryCount += 1;
    unitCount += units;
    anchorCount += anchors;
  };

  /** Emit one text-like paragraph from its resume point. Returns (via
      `closePage`) with the paragraph resuming on the next page unless the
      remaining segments were fully emitted. */
  const emitTextParagraph = (
    paragraph: ScannedParagraph,
    segFrom: number,
    charFrom: number,
    startAnchor: RelativeAnchor,
    endAnchor: RelativeAnchor,
    pageEmpty: () => boolean,
    closePage: (next: { para: number; seg: number; char: number }) => void,
    paragraphIndex: number,
  ): void => {
    const { segments: fullSegments } = buildTextSegments(ytext, paragraph, runs, items, format);
    const kind = paragraph.kind === "horizontalRule" ? "horizontalRule" : "paragraph";
    // Full read-back (R-READ-3 full half): the complete metadata record per
    // text-like paragraph and the admitted wrapper record per atom; absent
    // entries materialise the canonical defaults, never a guessed repair.
    const fullMetadata: FullBlockMetadata | undefined =
      format === FULL_PROFILE_FORMAT
        ? ((fieldMeta.get(paragraph.paragraphId) as FullBlockMetadata | undefined) ??
          ((kind === "paragraph"
            ? (structuredClone(canonicalPlainMetadata()) as FullBlockMetadata)
            : (structuredClone(canonicalHrDefaults()) as FullBlockMetadata))))
        : undefined;
    // Normalised remaining view: the first segment starts at charFrom.
    const view = fullSegments.slice(segFrom).map((built, viewIndex) => {
      if (viewIndex > 0 || charFrom === 0 || built.segment.type !== "text") return built;
      const rest = (built.segment as { text: string }).text.slice(charFrom);
      return {
        position: built.position + charFrom,
        end: built.end,
        segment: {
          ...(built.segment as { type: "text"; text: string }),
          text: rest,
          startAnchor: mintAt(ytext, built.position + charFrom),
        },
      } satisfies BuiltSegment;
    });
    const wholeEntry = (candidates: BuiltSegment[]): AgentParagraphState => {
      let text = "";
      for (const built of candidates) {
        if (built.segment.type === "text") text += built.segment.text;
      }
      return {
        paragraphId: paragraph.paragraphId,
        kind,
        ...(kind === "paragraph" ? { text } : {}),
        ...(kind === "paragraph" ? { segments: candidates.map((built) => built.segment) } : {}),
        ...(fullMetadata !== undefined ? { metadata: fullMetadata } : {}),
        startAnchor,
        endAnchor,
      };
    };
    const unitsOf = (candidates: BuiltSegment[]): number => {
      let units = 0;
      for (const built of candidates) {
        if (built.segment.type === "text") units += built.segment.text.length;
      }
      return units;
    };
    if (segFrom === 0 && charFrom === 0) {
      const entry = wholeEntry(view);
      if (fitsEntry(entry, unitsOf(view), 2 + 2 * view.length)) {
        emitEntry(entry, unitsOf(view), 2 + 2 * view.length);
        return;
      }
      if (!pageEmpty()) {
        closePage({ para: paragraphIndex, seg: 0, char: 0 });
        return;
      }
    } else {
      const entry = wholeEntry(view);
      if (fitsEntry(entry, unitsOf(view), 2 + 2 * view.length)) {
        emitEntry(entry, unitsOf(view), 2 + 2 * view.length);
        return;
      }
      // A resumed paragraph always resumes on an empty page (the fill
      // starts at the resume point), so the shrink below always applies.
    }
    // Shrink on the empty page: largest fitting segment prefix, then an
    // optional character split of the next text run.
    let low = 0;
    let high = view.length;
    const candidateFits = (count: number): boolean => {
      const candidates = view.slice(0, count);
      return fitsEntry(wholeEntry(candidates), unitsOf(candidates), 2 + 2 * candidates.length);
    };
    while (low < high) {
      const mid = Math.floor((low + high + 1) / 2);
      if (candidateFits(mid)) low = mid;
      else high = mid - 1;
    }
    let count = low;
    let partial: BuiltSegment | null = null;
    // A partial text run is one more segment: attempt the character split
    // only when its 2 anchors still fit the anchor cap; otherwise emit the
    // whole-segment prefix that already fits (candidateFits(count)).
    const anchorsForPartial = 2 + 2 * (count + 1);
    if (count < view.length && anchorCount + anchorsForPartial <= MAX_READ_ANCHORS) {
      const next = view[count] as BuiltSegment;
      if (next.segment.type === "text") {
        const runText = next.segment.text;
        const taken = view.slice(0, count);
        const unitsLeft = MAX_READ_TEXT_UNITS - unitCount - unitsOf(taken);
        const bytesLeft =
          pageBudget - byteTotal - (paragraphsOut.length > 0 ? 1 : 0) -
          Buffer.byteLength(JSON.stringify(wholeEntry(taken)), "utf8");
        const splitAt = splitTextRunForPage(
          runText,
          unitsLeft,
          (prefixLength) => {
            if (prefixLength <= 0) {
              return Buffer.byteLength(JSON.stringify(wholeEntry(taken)), "utf8");
            }
            const piece: BuiltSegment = {
              position: next.position,
              end: next.position + prefixLength,
              segment: {
                ...(next.segment as { type: "text"; text: string }),
                text: runText.slice(0, prefixLength),
                endAnchor: mintAt(ytext, next.position + prefixLength),
              },
            };
            return Buffer.byteLength(JSON.stringify(wholeEntry([...taken, piece])), "utf8");
          },
          bytesLeft,
        );
        if (splitAt > 0) {
          partial = {
            position: next.position,
            end: next.position + splitAt,
            segment: {
              ...(next.segment as { type: "text"; text: string }),
              text: runText.slice(0, splitAt),
              endAnchor: mintAt(ytext, next.position + splitAt),
            },
          };
        }
      }
    }
    if (count === 0 && partial === null) {
      // Unreachable on an empty page: a single hard-break segment always
      // fits, and a text run always yields a non-empty character prefix
      // within the unit and byte budgets. Fail closed rather than loop.
      throw new AgentBridgeReadRefusal(
        "too-large",
        "paragraph head does not fit an empty page (R-READ-1)",
      );
    }
    const emitted = partial === null ? view.slice(0, count) : [...view.slice(0, count), partial];
    const entry = wholeEntry(emitted);
    const units = unitsOf(emitted);
    const anchors = 2 + 2 * emitted.length;
    if (!fitsEntry(entry, units, anchors)) {
      throw new AgentBridgeReadRefusal(
        "too-large",
        "paragraph fragment does not fit an empty page (R-READ-1)",
      );
    }
    emitEntry(entry, units, anchors);
    if (partial === null && count === view.length) {
      return;
    }
    if (partial === null) {
      closePage({ para: paragraphIndex, seg: segFrom + count, char: 0 });
      return;
    }
    const resumeChar = (count === 0 ? charFrom : 0) + partial.segment.text.length;
    closePage({ para: paragraphIndex, seg: segFrom + count, char: resumeChar });
  };

  // An empty selection returns an empty page with no continuation.
  if (endIdx <= startIdx) {
    return {
      state: {
        revision: { documentId, stateVector: retainedVector, schemaEpoch },
        readToken,
        fields: [
          {
            fieldKey,
            paragraphs: paragraphsOut,
            ...(Object.keys(runMetadata).length > 0 ? { runMetadata } : {}),
            ...(requestedAnchors.length > 0 ? { requestedAnchors: [...requestedAnchors] } : {}),
          } satisfies AgentFieldState,
        ],
      },
    };
  }
  let first = true;
  for (let index = resume.para; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index] as ScannedParagraph;
    const empty = paragraph.contentStart === paragraph.contentEnd;
    // A paragraph is included when its content overlaps the window; an
    // empty paragraph is included when its position lies in the closed
    // window so a trailing empty paragraph reads back (R-READ-3).
    const included =
      (paragraph.contentEnd > startIdx && paragraph.contentStart < endIdx) ||
      (empty && paragraph.contentStart >= startIdx && paragraph.contentStart <= endIdx);
    if (!included) break;
    const segFrom = first ? resume.seg : 0;
    const charFrom = first ? resume.char : 0;
    first = false;
    const startAnchor = mintAt(ytext, paragraph.contentStart);
    const endAnchor = mintAt(ytext, paragraph.contentEnd);
    let closed = false;
    const closePage = (next: { para: number; seg: number; char: number }): void => {
      resume = { ...next };
      hasMore = true;
      closed = true;
    };
    const pageEmpty = (): boolean => paragraphsOut.length === 0;
    if (paragraph.kind === "preserved") {
      const raw = capturePreservedRaw(ytext, paragraph);
      const preservedKind = paragraphPreservedKind(items, paragraph);
      const from = charFrom;
      if (from === 0) {
        const whole: AgentParagraphState = {
          paragraphId: paragraph.paragraphId,
          kind: "preserved",
          preservedKind,
          raw,
          startAnchor,
          endAnchor,
        };
        if (fitsEntry(whole, raw.length, 2)) {
          emitEntry(whole, raw.length, 2);
          continue;
        }
        if (!pageEmpty()) {
          closePage({ para: index, seg: 0, char: 0 });
          break;
        }
      } else if (!pageEmpty()) {
        closePage({ para: index, seg: 0, char: from });
        break;
      }
      // Chunk on the empty page through the §2.3 slicer discipline. The
      // chunk honours every remaining cap: the serialised fit through the
      // slicer budget and the paragraph-offset units through the capped
      // input (each chunk's UTF-16 length counts toward the 20 000-unit
      // cap, so a large raw pages in unit-sized chunks).
      const emptyEntry: AgentParagraphState = {
        paragraphId: paragraph.paragraphId,
        kind: "preserved",
        preservedKind,
        raw: "",
        rawOffset: from,
        rawComplete: false,
        startAnchor,
        endAnchor,
      };
      const overhead = Buffer.byteLength(JSON.stringify(emptyEntry), "utf8") - 2;
      const remaining = pageBudget - byteTotal - (paragraphsOut.length > 0 ? 1 : 0) - overhead;
      const unitsLeft = MAX_READ_TEXT_UNITS - unitCount;
      const capped = raw.slice(from, from + Math.max(1, unitsLeft));
      const slices = slicePreservedRawForTest(capped, Math.max(remaining, 64));
      const head = slices[0] as { rawOffset: number; chunk: string; rawComplete: boolean };
      const consumedHead = from + head.chunk.length;
      const entry: AgentParagraphState = {
        paragraphId: paragraph.paragraphId,
        kind: "preserved",
        preservedKind,
        raw: head.chunk,
        rawOffset: from,
        rawComplete: consumedHead >= raw.length,
        startAnchor,
        endAnchor,
      };
      emitEntry(entry, head.chunk.length, 2);
      const consumed = from + head.chunk.length;
      if (consumed < raw.length) {
        closePage({ para: index, seg: 0, char: consumed });
        break;
      }
      continue;
    }
    emitTextParagraph(
      paragraph,
      segFrom,
      charFrom,
      startAnchor,
      endAnchor,
      pageEmpty,
      (next) => {
        closePage(next);
      },
      index,
    );
    if (closed) break;
  }

  const nextPageToken = hasMore
    ? encodePageToken({ v: 1, t: readToken, s: startIdx, e: endIdx, p: resume.para, g: resume.seg, h: resume.char, f: fieldKey })
    : undefined;
  return {
    state: {
      revision: {
        documentId,
        stateVector: retainedVector,
        schemaEpoch,
      },
      readToken,
      fields: [
        {
          fieldKey,
          paragraphs: paragraphsOut,
          ...(Object.keys(runMetadata).length > 0 ? { runMetadata } : {}),
          ...(requestedAnchors.length > 0 ? { requestedAnchors } : {}),
          ...(nextPageToken !== undefined ? { nextPageToken } : {}),
        } satisfies AgentFieldState,
      ],
    },
  };
}

/** Verbatim `raw` of a preserved segment (R-LIN-6; byte-identical splice). */
function capturePreservedRaw(ytext: Y.Text, paragraph: ScannedParagraph): string {
  const delta = ytext.toDelta() as DeltaOp[];
  let cursor = 0;
  for (const op of delta) {
    const insert = op.insert;
    if (typeof insert === "string") {
      cursor += insert.length;
      continue;
    }
    if (typeof insert === "object" && insert !== null) {
      if (
        cursor >= paragraph.contentStart &&
        cursor < paragraph.contentEnd &&
        isPreservedValue(insert)
      ) {
        return (insert.preserved as { raw: string }).raw;
      }
      cursor += 1;
    }
  }
  return "";
}

function paragraphPreservedKind(
  items: readonly WalkItem[],
  paragraph: ScannedParagraph,
): string | undefined {
  for (const item of items) {
    if (item.kind !== "separator" || item.separator === null) continue;
    if (item.separator.paragraphId === paragraph.paragraphId) {
      return item.separator.preservedKind;
    }
  }
  return undefined;
}

// ── Shared operation applier (scratch preflight and commit, §5.3.1) ──
//
// One function applies every operation kind; the scratch run and the commit run
// call it in the same order, so a patch can never commit operations one by one
// and stop mid-patch. A failing operation throws `BridgeRefusal`, which refuses
// the whole patch with the authoritative document untouched.

interface ApplierTarget {
  ytext: Y.Text;
  ydoc: Y.Doc;
  fieldKey: string;
  /** The field's block-metadata map (scratch clone or authoritative). */
  fieldMeta: Y.Map<unknown>;
  /** Segment/mark conversion profile (P0 stable; full admits the added keys). */
  format: RichTextFormat;
  baseSV: Map<number, number>;
  collect: boolean;
}

interface OpOutcome {
  result: AgentOperationResult;
  insertedChars: Array<{ paragraphId: string; chars: number }>;
  structuredIds: string[];
  record: AgentAffectedOperation | null;
}

/** Item identities created since a state vector (commit-time R-REV-2 capture). */
function newItemsSince(ydoc: Y.Doc, before: Map<number, number>): AgentItemId[] {
  const created: AgentItemId[] = [];
  for (const [client, structs] of ydoc.store.clients.entries()) {
    const known = before.get(client) ?? 0;
    for (const struct of structs as Array<{ id: { client: number; clock: number }; length: number }>) {
      if (struct.id.clock >= known) {
        created.push({ client: struct.id.client, clock: struct.id.clock, length: struct.length });
      }
    }
  }
  created.sort((left, right) => left.client - right.client || left.clock - right.clock);
  return created;
}

function snapshotVector(ydoc: Y.Doc): Map<number, number> {
  return Y.decodeStateVector(Y.encodeStateVector(ydoc));
}

/** A metadata write to a retired id is admitted only as a run-value-only
    write to a still-referenced deleted source (R-FULL-META-2, R-STR-5): the
    record carries run values for its own listRunId, the stored source record
    is still referenced by a live member, and every non-run attribute is
    unchanged. Anything else on a retired id refuses `target-gone`. */
function isRunValueOnlyWrite(
  target: ApplierTarget,
  paragraphId: string,
  next: FullBlockMetadata,
): boolean {
  if (
    next.orderedStart === undefined &&
    next.orderedType === undefined &&
    next.listTight === undefined
  ) {
    return false;
  }
  if (next.listRunId !== paragraphId) return false;
  const stored = target.fieldMeta.get(paragraphId) as FullBlockMetadata | undefined;
  if (stored === undefined || stored.listRunId !== paragraphId) return false;
  const live = scanParagraphs(walkVisibleItems(target.ytext), target.ytext.length);
  const referenced = live.some((para) => {
    if (para.paragraphId === paragraphId) return false;
    const meta = target.fieldMeta.get(para.paragraphId) as FullBlockMetadata | undefined;
    return meta?.listRunId === paragraphId;
  });
  if (!referenced) return false;
  const stripRunValues = (record: FullBlockMetadata): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (key === "orderedStart" || key === "orderedType" || key === "listTight") continue;
      out[key] = value;
    }
    return out;
  };
  return canonicalizeJson(stripRunValues(stored)) === canonicalizeJson(stripRunValues(next));
}

/** Any separator, preserved or HR embed overlapped by a range refuses the range
    operation as `structural-conflict` (R-ANCH-4). Returns the overlap kind. */
function structuralOverlap(
  items: readonly WalkItem[],
  low: number,
  high: number,
): string | null {
  for (const item of items) {
    if (item.kind !== "separator" && item.kind !== "preserved" && item.kind !== "horizontalRule") {
      continue;
    }
    if (item.start < high && item.end > low) return item.kind;
  }
  return null;
}

/** Provenance (mark, value) pairs one mark operation asserts (R-FULL-MARK-1):
    one pair per boolean key; two pairs for `link` (`link` href-or-null and
    `linkTitle` title-or-null). Null when the operation is not a mark. */
function markIntentPairs(
  operation: AgentEditOperation,
): ReadonlyArray<{ mark: InlineMarkKey; value: true | string | null }> | null {
  if (operation.type !== "mark") return null;
  if (
    operation.mark === "bold" ||
    operation.mark === "italic" ||
    operation.mark === "code" ||
    operation.mark === "strike" ||
    operation.mark === "underline"
  ) {
    return [{ mark: operation.mark, value: operation.applied ? true : null }];
  }
  if (operation.mark === "link") {
    return [
      { mark: "link", value: operation.href },
      { mark: "linkTitle", value: operation.title ?? null },
    ];
  }
  return null;
}

function emptyRecord(
  fieldKey: string,
  operationIndex: number,
  kind: AgentEditOperation["type"],
): AgentAffectedOperation {
  return {
    fieldKey,
    operationIndex,
    kind,
    insertedItems: [],
    deletedItems: [],
    separator: null,
    range: null,
    flanking: null,
    coveredItems: [],
    markIntentIds: [],
    markIntents: null,
    metadataChange: null,
    hrAtom: null,
    replacementParagraphId: null,
  };
}

function applyOneOperation(
  target: ApplierTarget,
  operation: AgentEditOperation,
  operationIndex: number,
): OpOutcome {
  const { ytext, fieldKey, baseSV, collect } = target;
  const items = walkVisibleItems(ytext);
  const paragraphs = scanParagraphs(items, ytext.length);
  const before = collect ? snapshotVector(target.ydoc) : null;
  switch (operation.type) {
    case "insert": {
      const at = resolveAnchorOrRefuse(ytext, fieldKey, operation.at, `operation ${operationIndex} insert`);
      const container = containingParagraph(scanParagraphs(walkVisibleItems(ytext), ytext.length), at);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} insert: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      if (container.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} insert: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      ytext.insert(at, operation.text);
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null && before !== null) {
        record.insertedItems = newItemsSince(target.ydoc, before);
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [container.paragraphId] },
        insertedChars: [{ paragraphId: container.paragraphId, chars: operation.text.length }],
        structuredIds: [],
        record,
      };
    }
    case "insertHardBreak": {
      const at = resolveAnchorOrRefuse(ytext, fieldKey, operation.at, `operation ${operationIndex} insertHardBreak`);
      const container = containingParagraph(scanParagraphs(walkVisibleItems(ytext), ytext.length), at);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} insertHardBreak: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      if (container.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} insertHardBreak: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      ytext.insertEmbed(at, { hardBreak: true });
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null && before !== null) {
        record.insertedItems = newItemsSince(target.ydoc, before);
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [container.paragraphId] },
        insertedChars: [],
        structuredIds: [],
        record,
      };
    }
    case "delete": {
      const start = resolveAnchorOrRefuse(ytext, fieldKey, operation.range.start, `operation ${operationIndex} delete start`);
      const end = resolveAnchorOrRefuse(ytext, fieldKey, operation.range.end, `operation ${operationIndex} delete end`);
      const low = Math.min(start, end);
      const high = Math.max(start, end);
      const overlap = structuralOverlap(items, low, high);
      if (overlap !== null) {
        throw new BridgeRefusal("structural-conflict", `operation ${operationIndex} delete: range covers a ${overlap} embed (R-ANCH-4)`, operationIndex);
      }
      // A resolved position inside a preserved segment is not text-editable
      // (R-ANCH-3); after the overlap check only the zero-width case reaches
      // here, and it still refuses `scope-denied`.
      if (containingParagraph(paragraphs, low)?.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} delete: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      // Item-set delete (R-ANCH-4): exactly the base-revision items between the
      // resolved anchors; concurrent interior items survive.
      const spans: Array<{ start: number; end: number }> = [];
      const deleted: Array<{ client: number; clock: number; offset: number; length: number; text: string; isHardBreak: boolean; marks: Record<string, unknown> }> = [];
      for (const item of items) {
        if (item.kind !== "text" && item.kind !== "hardBreak") continue;
        if (item.start >= high || item.end <= low) continue;
        if (!isCoveredBy(baseSV, item.client, item.clock, item.length)) continue;
        const sliceStart = Math.max(item.start, low);
        const sliceEnd = Math.min(item.end, high);
        if (sliceEnd <= sliceStart) continue;
        spans.push({ start: sliceStart, end: sliceEnd });
        deleted.push({
          client: item.client,
          clock: item.clock,
          offset: sliceStart - item.start,
          length: sliceEnd - sliceStart,
          text: item.kind === "text" ? item.text.slice(sliceStart - item.start, sliceEnd - item.start) : "",
          isHardBreak: item.kind === "hardBreak",
          marks: item.kind === "text" ? marksAtDelta(ytext, sliceStart) : {},
        });
      }
      spans.sort((left, right) => left.start - right.start);
      const merged: Array<{ start: number; end: number }> = [];
      for (const span of spans) {
        const last = merged[merged.length - 1];
        if (last !== undefined && span.start <= last.end) {
          last.end = Math.max(last.end, span.end);
        } else {
          merged.push({ ...span });
        }
      }
      const container = containingParagraph(paragraphs, low);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} delete: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null) {
        record.deletedItems = deleted;
        record.range = { start: operation.range.start, end: operation.range.end };
        record.flanking = { before: mintAt(ytext, low), after: mintAt(ytext, high) };
      }
      for (let index = merged.length - 1; index >= 0; index -= 1) {
        const span = merged[index] as { start: number; end: number };
        ytext.delete(span.start, span.end - span.start);
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [container.paragraphId] },
        insertedChars: [],
        structuredIds: [],
        record,
      };
    }
    case "mark": {
      const start = resolveAnchorOrRefuse(ytext, fieldKey, operation.range.start, `operation ${operationIndex} mark start`);
      const end = resolveAnchorOrRefuse(ytext, fieldKey, operation.range.end, `operation ${operationIndex} mark end`);
      const low = Math.min(start, end);
      const high = Math.max(start, end);
      const overlap = structuralOverlap(items, low, high);
      if (overlap !== null) {
        throw new BridgeRefusal("structural-conflict", `operation ${operationIndex} mark: range covers a ${overlap} embed (R-ANCH-4)`, operationIndex);
      }
      // A resolved position inside a preserved segment is not text-editable
      // (R-ANCH-3); after the overlap check only the zero-width case reaches
      // here, and it still refuses `scope-denied`.
      if (containingParagraph(paragraphs, low)?.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} mark: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      // Full keys past the P0 guard (R-FULL-MARK-1): strike/underline are
      // boolean; link formats { link: href, linkTitle: title } with an
      // omitted title clearing the title and a null href removing the link
      // (and any projected title). Other keys stay unadmitted.
      let formatValue: Record<string, unknown>;
      if (operation.mark === "strike" || operation.mark === "underline") {
        if (target.format !== FULL_PROFILE_FORMAT) {
          throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: key is not admitted in P0 (§4.11)`, operationIndex);
        }
        if (typeof operation.applied !== "boolean") {
          throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: boolean mark needs applied (§5.7)`, operationIndex);
        }
        formatValue = { [operation.mark]: operation.applied ? true : null };
      } else if (operation.mark === "link") {
        if (target.format !== FULL_PROFILE_FORMAT) {
          throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: key is not admitted in P0 (§4.11)`, operationIndex);
        }
        formatValue =
          operation.href === null
            ? { link: null, linkTitle: null }
            : { link: operation.href, linkTitle: operation.title ?? null };
      } else if (
        operation.mark === "bold" ||
        operation.mark === "italic" ||
        operation.mark === "code"
      ) {
        if (typeof operation.applied !== "boolean") {
          throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: boolean mark needs applied (§5.7)`, operationIndex);
        }
        formatValue = { [operation.mark]: operation.applied ? true : null };
      } else {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: key is not admitted (§4.11)`, operationIndex);
      }
      // Span inheritance (R-ANCH-4): one format operation over the resolved
      // interval, so concurrent interior text takes the mark. Covered items
      // expand to per-unit identities clipped to the range (R-REV-4 exact).
      const covered: AgentItemId[] = [];
      for (const item of items) {
        if (item.kind !== "text") continue;
        if (item.start >= high || item.end <= low) continue;
        const sliceStart = Math.max(item.start, low);
        const sliceEnd = Math.min(item.end, high);
        for (let pos = sliceStart; pos < sliceEnd; pos += 1) {
          covered.push({ client: item.client, clock: item.clock + (pos - item.start), length: 1 });
        }
      }
      if (high > low) {
        ytext.format(low, high - low, formatValue);
      }
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null && before !== null) {
        record.insertedItems = newItemsSince(target.ydoc, before);
        record.coveredItems = covered;
        record.range = { start: operation.range.start, end: operation.range.end };
      }
      const container = containingParagraph(paragraphs, low);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} mark: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [container.paragraphId] },
        insertedChars: [],
        structuredIds: [],
        record,
      };
    }
    case "setBlockMetadata": {
      // Live-state preflight past the pure validator (bridge-owned checks):
      // the target exists (R-ANCH-5, with the R-FULL-META-2 run-value-only
      // exception for a still-referenced deleted source) and member-carried
      // run values are refused for their target (AMB-E4). CL-4e fix 1
      // (double-only, shipped `validateFieldState` reverted): metadata
      // writes targeting a preserved block refuse `scope-denied` (R-ANCH-3,
      // a capability boundary, not a structural conflict) and wrapper-only
      // metadata (`blockKind` absent) on a text paragraph refuses
      // `incompatible-schema`; HR wrapper-only records stay admitted and
      // pass the resulting-state check below (AMB-E3).
      const live = paragraphs.find((entry) => entry.paragraphId === operation.paragraphId);
      if (live !== undefined && live.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} setBlockMetadata: preserved blocks carry no metadata (R-ANCH-3)`, operationIndex);
      }
      if (
        live !== undefined &&
        live.kind === "paragraph" &&
        (operation.metadata as { blockKind?: unknown }).blockKind === undefined
      ) {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} setBlockMetadata: text paragraph requires blockKind`, operationIndex);
      }
      if (live === undefined) {
        if (!isRunValueOnlyWrite(target, operation.paragraphId, operation.metadata)) {
          throw new BridgeRefusal("target-gone", `operation ${operationIndex} setBlockMetadata: paragraph no longer exists (R-ANCH-5)`, operationIndex);
        }
      } else if (
        (operation.metadata.orderedStart !== undefined ||
          operation.metadata.orderedType !== undefined ||
          operation.metadata.listTight !== undefined) &&
        operation.paragraphId !== operation.metadata.listRunId
      ) {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} setBlockMetadata: run values live only on their source opener (R-FULL-META-2)`, operationIndex);
      }
      const prior = (target.fieldMeta.get(operation.paragraphId) as FullBlockMetadata | undefined) ?? null;
      target.fieldMeta.set(operation.paragraphId, structuredClone(operation.metadata) as unknown);
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null) {
        record.metadataChange = {
          paragraphId: operation.paragraphId,
          prior: prior === null ? null : (structuredClone(prior) as FullBlockMetadata),
          after: structuredClone(operation.metadata) as FullBlockMetadata,
        };
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [operation.paragraphId] },
        insertedChars: [],
        structuredIds: [],
        record,
      };
    }
    case "insertHorizontalRule": {
      const at = resolveAnchorOrRefuse(ytext, fieldKey, operation.at, `operation ${operationIndex} insertHorizontalRule`);
      const container = containingParagraph(scanParagraphs(walkVisibleItems(ytext), ytext.length), at);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} insertHorizontalRule: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      if (container.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} insertHorizontalRule: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      // Block-boundary discipline (R-FULL-HR-1): a separator index or the
      // field end only. Interior paragraph text needs ordinary splits first;
      // an HR atom interior cannot split.
      const boundaries = new Set(paragraphs.map((entry) => entry.separatorIndex));
      boundaries.add(ytext.length);
      if (!boundaries.has(at)) {
        throw new BridgeRefusal("structural-conflict", `operation ${operationIndex} insertHorizontalRule: insertion point is inside paragraph text or an atom, split first (R-FULL-HR-1)`, operationIndex);
      }
      ytext.insertEmbed(at, {
        separator: { paragraphId: operation.newParagraphId, kind: "horizontalRule" },
      });
      ytext.insertEmbed(at + 1, { horizontalRule: { paragraphId: operation.newParagraphId } });
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null && before !== null) {
        const created = newItemsSince(target.ydoc, before);
        record.insertedItems = created;
        const createdKeys = new Set(created.map((entry) => `${entry.client}:${entry.clock}`));
        for (const item of walkVisibleItems(ytext)) {
          if (!createdKeys.has(`${item.client}:${item.clock}`)) continue;
          if (item.kind === "separator") {
            record.separator = {
              client: item.client,
              clock: item.clock,
              paragraphId: operation.newParagraphId,
              kind: "horizontalRule",
            };
          } else if (item.kind === "horizontalRule") {
            record.hrAtom = {
              client: item.client,
              clock: item.clock,
              paragraphId: operation.newParagraphId,
            };
          }
        }
      }
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [operation.newParagraphId] },
        insertedChars: [],
        structuredIds: [operation.newParagraphId],
        record,
      };
    }
    case "deleteHorizontalRule": {
      const separators = items.filter(
        (item) => item.kind === "separator" && item.separator !== null,
      );
      const position = separators.findIndex(
        (item) => item.separator?.paragraphId === operation.paragraphId,
      );
      if (position === -1) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} deleteHorizontalRule: paragraph no longer exists (R-ANCH-5)`, operationIndex);
      }
      const named = separators[position] as WalkItem;
      if (named.separator?.kind !== "horizontalRule") {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} deleteHorizontalRule: paragraph is not a horizontal rule (R-ANCH-5)`, operationIndex);
      }
      // The atom follows its separator immediately (R-FULL-HR-1 pair);
      // anything else fails closed instead of deleting half a pair.
      const atom = walkVisibleItems(ytext).find((item) => item.start === named.start + 1);
      if (atom?.kind !== "horizontalRule") {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} deleteHorizontalRule: HR pair is half an atom (R-FULL-HR-1)`, operationIndex);
      }
      const sole = paragraphs.length === 1;
      if (sole && operation.replacementParagraphId === undefined) {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} deleteHorizontalRule: deleting the sole block needs replacementParagraphId (R-FULL-HR-1)`, operationIndex);
      }
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null) {
        record.separator = {
          client: named.client,
          clock: named.clock,
          paragraphId: operation.paragraphId,
          kind: "horizontalRule",
        };
        record.hrAtom = {
          client: atom.client,
          clock: atom.clock,
          paragraphId: operation.paragraphId,
        };
        record.flanking = { before: mintAt(ytext, named.start), after: mintAt(ytext, named.start + 2) };
        record.replacementParagraphId = operation.replacementParagraphId ?? null;
      }
      ytext.delete(named.start, 2);
      // A supplied replacement on a non-sole deletion is inert (shape-valid
      // per the validator; the pair is simply removed).
      if (sole) {
        ytext.insertEmbed(named.start, {
          separator: { paragraphId: operation.replacementParagraphId as string, kind: "paragraph" },
        });
      }
      return {
        result: {
          operationIndex,
          kind: operation.type,
          resultParagraphIds: sole ? [operation.replacementParagraphId as string] : [],
        },
        insertedChars: [],
        structuredIds: sole ? [operation.replacementParagraphId as string] : [],
        record,
      };
    }
    case "splitParagraph": {
      const at = resolveAnchorOrRefuse(ytext, fieldKey, operation.at, `operation ${operationIndex} splitParagraph`);
      const container = containingParagraph(scanParagraphs(walkVisibleItems(ytext), ytext.length), at);
      if (container === null) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} splitParagraph: no containing paragraph (R-ANCH-5)`, operationIndex);
      }
      if (container.kind === "preserved") {
        throw new BridgeRefusal("scope-denied", `operation ${operationIndex} splitParagraph: preserved content is not text-editable (R-ANCH-3)`, operationIndex);
      }
      ytext.insertEmbed(at, {
        separator: { paragraphId: operation.newParagraphId, kind: "paragraph" },
      });
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      let separator: NonNullable<AgentAffectedOperation["separator"]> = {
        client: 0,
        clock: 0,
        paragraphId: operation.newParagraphId,
        kind: "paragraph",
      };
      if (collect && before !== null) {
        const created = newItemsSince(target.ydoc, before);
        if (record !== null) record.insertedItems = created;
        const createdKeys = new Set(created.map((entry) => `${entry.client}:${entry.clock}`));
        for (const item of walkVisibleItems(ytext)) {
          if (
            item.kind === "separator" &&
            item.separator?.paragraphId === operation.newParagraphId &&
            createdKeys.has(`${item.client}:${item.clock}`)
          ) {
            separator = {
              client: item.client,
              clock: item.clock,
              paragraphId: operation.newParagraphId,
              kind: "paragraph",
            };
            break;
          }
        }
      }
      if (record !== null) record.separator = separator;
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [container.paragraphId, operation.newParagraphId] },
        insertedChars: [],
        structuredIds: [container.paragraphId, operation.newParagraphId],
        record,
      };
    }
    case "mergeWithPrevious": {
      const separators = items.filter(
        (item) => item.kind === "separator" && item.separator !== null,
      );
      const position = separators.findIndex(
        (item) => item.separator?.paragraphId === operation.paragraphId,
      );
      if (position === -1) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} mergeWithPrevious: paragraph no longer exists (R-ANCH-5, §4.10)`, operationIndex);
      }
      const named = separators[position] as WalkItem;
      if (position === 0) {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} mergeWithPrevious: first paragraph has no predecessor (§4.10)`, operationIndex);
      }
      if (named.separator?.kind === "preserved") {
        throw new BridgeRefusal("target-gone", `operation ${operationIndex} mergeWithPrevious: preserved block is not a merge target (§4.10)`, operationIndex);
      }
      const survivor = (separators[position - 1] as WalkItem).separator?.paragraphId as string;
      const record = collect ? emptyRecord(fieldKey, operationIndex, operation.type) : null;
      if (record !== null) {
        record.separator = {
          client: named.client,
          clock: named.clock,
          paragraphId: operation.paragraphId,
          kind: named.separator?.kind ?? "paragraph",
          ...(named.separator?.preservedKind === undefined ? {} : { preservedKind: named.separator.preservedKind }),
        };
        record.flanking = { before: mintAt(ytext, named.start), after: mintAt(ytext, named.start + 1) };
      }
      ytext.delete(named.start, 1);
      return {
        result: { operationIndex, kind: operation.type, resultParagraphIds: [survivor] },
        insertedChars: [],
        structuredIds: [survivor, operation.paragraphId],
        record,
      };
    }
    default: {
      const kind = (operation as AgentEditOperation).type;
      throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex}: family "${kind}" is not admitted in P0 (§4.11)`, operationIndex);
    }
  }
}

/** Base-revision text volume per paragraph (whole-block baseline, AMB-A4). */
function baseTextByParagraph(ytext: Y.Text, baseSV: Map<number, number>): Map<string, number> {
  const items = walkVisibleItems(ytext);
  const paragraphs = scanParagraphs(items, ytext.length);
  const volumes = new Map<string, number>();
  for (const item of items) {
    if (item.kind !== "text") continue;
    if (!isCoveredBy(baseSV, item.client, item.clock, item.length)) continue;
    const container = containingParagraph(paragraphs, item.start);
    if (container === null) continue;
    volumes.set(container.paragraphId, (volumes.get(container.paragraphId) ?? 0) + item.text.length);
  }
  return volumes;
}

/** Surviving base-revision text volume per paragraph on the scratch result. */
function survivingBaseText(ytext: Y.Text, baseSV: Map<string, number>): Map<string, number> {
  return baseTextByParagraph(ytext, baseSV);
}

export interface RevertInverseStats {
  restoredOps: number;
  satisfiedOps: number;
  restoredItems: number;
  keptLaterItems: number;
  satisfiedItems: number;
}

/** Durable inverse construction (R-REV-6, extended R-FULL-OP-2): preflighted
    whole on a scratch clone and applied as one transaction under
    revert:<requestedBy>. Metadata restores only while the patch write is
    still effective (a later map winner is kept); HR inverses act only on the
    recorded pair; mark plans run per asserted key through the log. */
function applyRevertInverse(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  record: AgentAffectedItemsRecord,
  log: readonly FormattingIntent[],
  key: AgentPatchKey,
  requestedBy: string,
  appendIntent?: (draft: FormattingIntentDraft) => void,
): RevertInverseStats {
  const stats: RevertInverseStats = {
    restoredOps: 0,
    satisfiedOps: 0,
    restoredItems: 0,
    keptLaterItems: 0,
    satisfiedItems: 0,
  };
  const pendingDrafts: FormattingIntentDraft[] = [];
  const operations = [...record.operations].sort((a, b) => b.operationIndex - a.operationIndex);
  for (const operation of operations) {
    if (operation.kind === "setBlockMetadata") {
      const change = operation.metadataChange;
      if (change === null) {
        throw new BridgeRefusal("target-gone", `revert of metadata ${operation.operationIndex}: missing metadata facts (R-REV-2)`, operation.operationIndex);
      }
      // Effectiveness (AMB-E2): the live entry decides. Equal to the
      // recorded after record means the patch write is still effective
      // (restore the prior); different means a later winner is kept.
      const liveEntry = fieldMeta.get(change.paragraphId) as FullBlockMetadata | undefined;
      if (liveEntry === undefined) {
        if (change.prior === null) {
          stats.satisfiedOps += 1;
          continue;
        }
        throw new BridgeRefusal("target-gone", `revert of metadata ${operation.operationIndex}: map entry is gone while a prior record exists (R-ANCH-5)`, operation.operationIndex);
      }
      if (canonicalizeJson(liveEntry) === canonicalizeJson(change.after)) {
        if (change.prior === null) {
          fieldMeta.delete(change.paragraphId);
        } else {
          fieldMeta.set(change.paragraphId, structuredClone(change.prior) as unknown);
        }
        stats.restoredOps += 1;
        continue;
      }
      stats.keptLaterItems += 1;
      continue;
    } else if (operation.kind === "insertHorizontalRule") {
      const separator = operation.separator;
      const atom = operation.hrAtom;
      if (separator === null || atom === null) {
        throw new BridgeRefusal("target-gone", `revert of HR insert ${operation.operationIndex}: missing pair facts (R-REV-2)`, operation.operationIndex);
      }
      const live = walkVisibleItems(ytext);
      const foundSeparator = live.find(
        (item) => item.kind === "separator" && item.client === separator.client && item.clock === separator.clock,
      );
      const foundAtom = live.find(
        (item) => item.kind === "horizontalRule" && item.client === atom.client && item.clock === atom.clock,
      );
      if (foundSeparator === undefined && foundAtom === undefined) {
        // An already-deleted pair is satisfied.
        stats.satisfiedOps += 1;
        continue;
      }
      if (foundSeparator === undefined || foundAtom === undefined) {
        throw new BridgeRefusal("target-gone", `revert of HR insert ${operation.operationIndex}: half a pair refuses fail-closed (R-FULL-HR-1)`, operation.operationIndex);
      }
      // A later actor's atom or text is untouched: only the recorded pair
      // deletes, higher index first.
      const higher = Math.max(foundSeparator.start, foundAtom.start);
      const lower = Math.min(foundSeparator.start, foundAtom.start);
      ytext.delete(higher, 1);
      ytext.delete(lower, 1);
      stats.restoredOps += 1;
      continue;
    } else if (operation.kind === "deleteHorizontalRule") {
      const separator = operation.separator;
      const atom = operation.hrAtom;
      if (separator === null || atom === null || operation.flanking === null) {
        throw new BridgeRefusal("target-gone", `revert of HR delete ${operation.operationIndex}: missing pair or junction facts (R-REV-2)`, operation.operationIndex);
      }
      if (operation.replacementParagraphId !== null) {
        const live = walkVisibleItems(ytext);
        const replacement = live.find(
          (item) =>
            item.kind === "separator" &&
            item.separator?.paragraphId === operation.replacementParagraphId,
        );
        if (replacement !== undefined) {
          const paragraphs = scanParagraphs(live, ytext.length);
          const replacementPara = paragraphs.find(
            (entry) => entry.paragraphId === operation.replacementParagraphId,
          );
          if (replacementPara !== undefined && replacementPara.contentStart === replacementPara.contentEnd) {
            // Still empty: remove the replacement and restore the pair.
            ytext.delete(replacement.start, 1);
            ytext.insertEmbed(replacement.start, {
              separator: { paragraphId: separator.paragraphId, kind: "horizontalRule" },
            });
            ytext.insertEmbed(replacement.start + 1, {
              horizontalRule: { paragraphId: separator.paragraphId },
            });
            stats.restoredOps += 1;
            continue;
          }
          if (replacementPara !== undefined) {
            // A later human typed there: retain that paragraph and its id,
            // restore the HR as a separate adjacent block (never human text
            // inside the HR segment, R-FULL-OP-2).
            ytext.insertEmbed(replacement.start, {
              separator: { paragraphId: separator.paragraphId, kind: "horizontalRule" },
            });
            ytext.insertEmbed(replacement.start + 1, {
              horizontalRule: { paragraphId: separator.paragraphId },
            });
            stats.restoredOps += 1;
            continue;
          }
          // The replacement separator itself is gone: fall through to the
          // flanking junction below.
        }
      }
      const before = tryResolveAnchorToLinear(ytext, operation.flanking.before);
      const after = tryResolveAnchorToLinear(ytext, operation.flanking.after);
      if (before === null || after === null) {
        throw new BridgeRefusal("target-gone", `revert of HR delete ${operation.operationIndex}: junction unresolvable (R-ANCH-5)`, operation.operationIndex);
      }
      ytext.insertEmbed(before, {
        separator: { paragraphId: separator.paragraphId, kind: "horizontalRule" },
      });
      ytext.insertEmbed(before + 1, {
        horizontalRule: { paragraphId: separator.paragraphId },
      });
      stats.restoredOps += 1;
      continue;
    } else if (operation.kind === "insert" || operation.kind === "insertHardBreak") {
      const wanted = new Set<string>();
      for (const item of operation.insertedItems) {
        for (let offset = 0; offset < item.length; offset += 1) {
          wanted.add(`${item.client}:${item.clock + offset}`);
        }
      }
      const indexes: number[] = [];
      for (const item of walkVisibleItems(ytext)) {
        if (item.kind !== "text" && item.kind !== "hardBreak" && item.kind !== "separator") continue;
        if (item.kind === "text") {
          for (let offset = 0; offset < item.length; offset += 1) {
            if (wanted.has(`${item.client}:${item.clock + offset}`)) {
              indexes.push(item.start + offset);
            }
          }
        } else {
          if (wanted.has(`${item.client}:${item.clock}`)) indexes.push(item.start);
        }
      }
      if (indexes.length === 0) {
        stats.satisfiedOps += 1;
        continue;
      }
      indexes.sort((a, b) => b - a);
      let runStart: number | null = null;
      let runEnd: number | null = null;
      const runs: Array<{ start: number; end: number }> = [];
      for (const index of indexes) {
        if (runStart === null || runEnd === null || index !== runEnd - 1) {
          if (runStart !== null && runEnd !== null) runs.push({ start: runStart, end: runEnd });
          runStart = index;
          runEnd = index + 1;
        } else {
          runStart = index;
        }
      }
      if (runStart !== null && runEnd !== null) runs.push({ start: runStart, end: runEnd });
      for (const run of runs) ytext.delete(run.start, run.end - run.start);
      stats.restoredOps += 1;
    } else if (operation.kind === "delete") {
      if (operation.flanking === null) {
        throw new BridgeRefusal("target-gone", `revert of delete ${operation.operationIndex}: missing flanking anchors (R-ANCH-5)`, operation.operationIndex);
      }
      const before = tryResolveAnchorToLinear(ytext, operation.flanking.before);
      const after = tryResolveAnchorToLinear(ytext, operation.flanking.after);
      if (before === null || after === null) {
        throw new BridgeRefusal("target-gone", `revert of delete ${operation.operationIndex}: flanking anchor unresolvable (R-ANCH-5)`, operation.operationIndex);
      }
      let cursor = before;
      for (const slice of operation.deletedItems) {
        if (slice.isHardBreak) {
          ytext.insertEmbed(cursor, { hardBreak: true });
          cursor += 1;
        } else {
          const recorded = { ...(slice.marks ?? {}) } as Record<string, unknown>;
          const active = cursor > 0 ? marksAtDelta(ytext, cursor - 1) : {};
          // Defence in depth (CL-4c rev3): the recorded marks alone decide
          // the restored formatting; the explicit negations below keep that
          // true even if insertion inheritance semantics change. Yjs
          // insertion already prevents the inheritance, so the junction
          // witness is a guard only — non-discriminating under mutation,
          // with no RED claimed for this site.
          for (const key of Object.keys(active)) {
            if (!Object.prototype.hasOwnProperty.call(recorded, key) && active[key] !== null && active[key] !== undefined) {
              recorded[key] = null;
            }
          }
          ytext.insert(cursor, slice.text, recorded);
          cursor += slice.text.length;
        }
      }
      stats.restoredOps += 1;
    } else if (operation.kind === "splitParagraph") {
      const separator = operation.separator;
      if (separator === null) {
        throw new BridgeRefusal("target-gone", `revert of split ${operation.operationIndex}: missing separator record`, operation.operationIndex);
      }
      const found = walkVisibleItems(ytext).find(
        (item) => item.kind === "separator" && item.client === separator.client && item.clock === separator.clock,
      );
      if (found === undefined) {
        stats.satisfiedOps += 1;
        continue;
      }
      ytext.delete(found.start, 1);
      stats.restoredOps += 1;
    } else if (operation.kind === "mergeWithPrevious") {
      const separator = operation.separator;
      if (separator === null || operation.flanking === null) {
        throw new BridgeRefusal("target-gone", `revert of merge ${operation.operationIndex}: missing separator or flanking`, operation.operationIndex);
      }
      const before = tryResolveAnchorToLinear(ytext, operation.flanking.before);
      const after = tryResolveAnchorToLinear(ytext, operation.flanking.after);
      if (before === null || after === null) {
        throw new BridgeRefusal("target-gone", `revert of merge ${operation.operationIndex}: junction unresolvable (R-ANCH-5)`, operation.operationIndex);
      }
      const payload: { paragraphId: string; kind: string; preservedKind?: string } = {
        paragraphId: separator.paragraphId,
        kind: separator.kind,
      };
      if (separator.preservedKind !== undefined) payload.preservedKind = separator.preservedKind;
      ytext.insertEmbed(before, { separator: payload });
      stats.restoredOps += 1;
    } else if (operation.kind === "mark") {
      // Per-key planning (R-FULL-OP-2): one (mark, intentIds) group per
      // asserted key — a `link` operation plans `link` and `linkTitle`
      // inside the one revert transaction, and a conflict in either refuses
      // the whole revert. Legacy records (no markIntents) plan one group.
      const groups: Array<{ mark: InlineMarkKey; intentIds: string[] }> =
        operation.markIntents !== null && operation.markIntents.length > 0
          ? operation.markIntents.map((entry) => ({ mark: entry.mark, intentIds: [...entry.intentIds] }))
          : [
              {
                mark: (operation.mark ??
                  log.find((entry) => operation.markIntentIds.includes(entry.intentId))?.mark ??
                  "bold") as InlineMarkKey,
                intentIds: [...operation.markIntentIds],
              },
            ];
      if (
        operation.markIntents === null &&
        operation.mark === null &&
        log.find((entry) => operation.markIntentIds.includes(entry.intentId))?.mark === undefined
      ) {
        throw new BridgeRefusal(
          "mark-provenance-conflict",
          `revert of mark ${operation.operationIndex}: covering intent absent (R-REV-5)`,
          operation.operationIndex,
          { kind: "mark-provenance-conflict", key, fieldKey: operation.fieldKey, mark: "bold", items: [], detail: "patch intent missing from log (R-REV-5)" },
        );
      }
      const live = new Set<string>();
      const liveList: Array<{ client: number; clock: number }> = [];
      for (const item of walkVisibleItems(ytext)) {
        if (item.kind !== "text") continue;
        for (let offset = 0; offset < item.length; offset += 1) {
          const pair = `${item.client}:${item.clock + offset}`;
          if (!live.has(pair)) {
            live.add(pair);
            liveList.push({ client: item.client, clock: item.clock + offset });
          }
        }
      }
      // Phase 1: plan every group. A conflict in any group refuses the whole
      // revert with no partial application (no ytext write happens here).
      const planned: Array<{
        mark: InlineMarkKey;
        plan: Extract<ReturnType<typeof planMarkRevert>, { ok: true }>;
      }> = [];
      for (const group of groups) {
        const plan = planMarkRevert(log, {
          key,
          fieldKey: operation.fieldKey,
          mark: group.mark,
          intentIds: group.intentIds,
          liveItems: liveList,
        });
        if (plan.ok === false) {
          throw new BridgeRefusal("mark-provenance-conflict", plan.conflict.detail, operation.operationIndex, plan.conflict);
        }
        const diverged: Array<{ client: number; clock: number }> = [];
        for (const decision of plan.decisions) {
          if (decision.action === "satisfied") continue;
          const at = linearIndexOfUnitIn(ytext, decision.item.client, decision.item.clock);
          if (at === null) continue;
          const current = (marksAtDelta(ytext, at)[group.mark] as true | string | undefined) ?? null;
          const latest = latestEffectiveIntent(log.filter((entry) => entry.fieldKey === operation.fieldKey), decision.item, group.mark);
          if (latest.ok === false || (latest.ok === true && latest.found === false)) {
            diverged.push(decision.item);
            continue;
          }
          if (latest.ok === true && latest.found === true) {
            const expected = (latest.intent.value as true | string | null | undefined) ?? null;
            const same = JSON.stringify(current) === JSON.stringify(expected);
            if (same === false) diverged.push(decision.item);
          }
        }
        if (diverged.length > 0) {
          throw new BridgeRefusal(
            "mark-provenance-conflict",
            `revert of mark ${operation.operationIndex}: live marks diverge from the logged latest intent (unlogged formatting without a sink, R-REV-5)`,
            operation.operationIndex,
            { kind: "mark-provenance-conflict", key, fieldKey: operation.fieldKey, mark: group.mark, items: diverged, detail: "live marks diverge from the logged latest intent (unlogged formatting without a sink, R-REV-5)" },
          );
        }
        planned.push({ mark: group.mark, plan });
      }
      // Phase 2: apply the restores of every group in linear runs.
      let groupIndex = 0;
      for (const { mark: markKey, plan } of planned) {
        const byValue = new Map<string, { value: true | string | null; units: Array<{ client: number; clock: number }> }>();
        for (const decision of plan.decisions) {
          if (decision.action === "restore") {
            stats.restoredItems += 1;
            const valueKey = JSON.stringify(decision.value);
            let valueGroup = byValue.get(valueKey);
            if (valueGroup === undefined) {
              valueGroup = { value: decision.value, units: [] };
              byValue.set(valueKey, valueGroup);
            }
            valueGroup.units.push(decision.item);
          } else if (decision.action === "kept-later") {
            stats.keptLaterItems += 1;
          } else {
            stats.satisfiedItems += 1;
          }
        }
        for (const valueGroup of byValue.values()) {
          const indexes: number[] = [];
          for (const unit of valueGroup.units) {
            const at = linearIndexOfUnitIn(ytext, unit.client, unit.clock);
            if (at !== null) indexes.push(at);
          }
          indexes.sort((a, b) => a - b);
          let runStart: number | null = null;
          let runLength = 0;
          const runs: Array<{ start: number; length: number }> = [];
          for (const at of indexes) {
            if (runStart === null || at !== runStart + runLength) {
              if (runStart !== null) runs.push({ start: runStart, length: runLength });
              runStart = at;
              runLength = 1;
            } else {
              runLength += 1;
            }
          }
          if (runStart !== null) runs.push({ start: runStart, length: runLength });
          for (const run of runs) {
            ytext.format(run.start, run.length, { [markKey]: valueGroup.value });
          }
          if (appendIntent !== undefined && valueGroup.units.length > 0) {
            pendingDrafts.push({
              intentId: `revert:${requestedBy}:${key.patchId}:${operation.operationIndex}:${groupIndex}`,
              actorId: requestedBy,
              source: { kind: "agent-patch", key, operationIndex: operation.operationIndex },
              fieldKey: operation.fieldKey,
              mark: markKey,
              value: valueGroup.value,
              range: operation.range ?? { start: "" as never, end: "" as never },
              items: valueGroup.units,
            });
          }
          groupIndex += 1;
        }
      }
      stats.restoredOps += 1;
    }
  }
  if (appendIntent !== undefined) {
    for (const draft of pendingDrafts) {
      if (draft.range.start === "" || draft.range.end === "") continue;
      appendIntent(draft);
    }
  }
  return stats;
}

function linearIndexOfUnitIn(ytext: Y.Text, client: number, clock: number): number | null {
  for (const item of walkVisibleItems(ytext)) {
    if (item.kind !== "text") continue;
    if (item.client !== client) continue;
    const offset = clock - item.clock;
    if (offset < 0 || offset >= item.length) continue;
    return item.start + offset;
  }
  return null;
}

// ── The headless bridge double ──

export interface AgentBridgeDoubleOptions {
  source: LiveSessionBindingSource;
  documentId: string;
  sessionId: string;
  /** Admitted fields of the double's scope (B-BRIDGE-3). */
  fieldKeys: readonly string[];
  /** Admitted operation families of the double's scope (P0 subset, B-BRIDGE-3). */
  families: readonly AgentEditOperation["type"][];
  /** Validation/read profile of the double (test-only witness seam, AMB-E1):
      `"p0"` behaves byte-identically to the merged double; `"full"` admits
      the full families through the same scratch/commit pipeline. */
  profile?: AgentPatchProfile;
  /** Injected receipt store (survives bridge restart; durability stays CL-4c). */
  store: AgentBridgeReceiptStore;
  schemaEpoch?: string;
  /** Optional monotonic clock in milliseconds (retention TTL + expiry).
      Defaults to `Date.now`. */
  now?: () => number;
  /** Retained-read TTL in milliseconds (R-READ-2). Defaults to the
      R-READ-2 minimum of 5 minutes. */
  retentionTtlMs?: number;
}

export interface AgentBridgeDouble {
  /** Bounded read minting anchors against the current state (§5.6 seam). */
  readState(request: AgentReadRequest): AgentDocumentState;
  /** Full §5.3.1 pipeline; headless (no editor mounted), one transaction. */
  applyPatch(patch: AgentPatch): Promise<AgentPatchReceipt>;
  /** Receipt lookup by the complete patch key only (R-REV-1). */
  getReceipt(key: AgentPatchKey): AgentPatchReceipt | null;
  /** Revert by the complete patch key only (R-REV-1). */
  revertPatch(input: { key: AgentPatchKey; requestedBy: string; reason?: string }): Promise<AgentPatchReceipt>;
  /** Store-backed provenance sink for human drafts (journal stand-in). */
  sink: {
    recordFormattingIntent(intent: FormattingIntentDraft): void;
    getOrderedLog(): readonly FormattingIntent[];
  };
  /**
   * Admit one agent actor through the bridge (§5.1): registers on the
   * source registry, allocates one awareness client id (stable for the
   * double instance, never shared between agents) and records kind
   * `agent` in the double's own admission record. Returns the client id.
   */
  admitAgentActor(actor: { actorId: string; displayLabel: string; color: string }): number;
  /**
   * §5.1.1 adapter: publish the actor's caret (opaque `RelativeAnchor`
   * strings in, relative-position JSON objects on the wire, `fieldKey`
   * from the binding identity). Refuses whole with a typed
   * `AgentBridgeReadRefusal` (`scope-denied` for an unregistered actor,
   * `target-gone` for an unparseable or foreign-field anchor) and touches
   * no awareness field on refusal. This refusal shape is the double's
   * mirror of the port's `Promise<void>` refusal (register AMB-B5).
   */
  publishAgentCursor(input: {
    binding: FieldBindingIdentity;
    actorId: string;
    selection: { anchor: RelativeAnchor; head: RelativeAnchor } | null;
  }): void;
  /**
   * §5.6 reader: the presence snapshot over the session awareness, with
   * cursors converted to opaque `AwarenessCursor` strings and
   * `paragraphId` derived by resolving both ends against the field at
   * read time. Numeric offsets are never stored or returned.
   */
  readAwareness(binding: FieldBindingIdentity): PresenceSnapshot;
}

interface HeldField {
  fieldKey: string;
  text: Y.Text;
  fieldMeta: Y.Map<unknown>;
}

// ── Awareness adapter (§5.1.1, §5.6 cursor publication; CL-4b) ──
//
// The double drives the session awareness headless through the merged
// registry seams (`registerActor`/`admittedActorOf`). It allocates one
// awareness client id per agent actor (stable for the double instance,
// never shared between two agents) and records actor kind in its own
// admission record (`agent` for actors admitted through the bridge,
// `human` otherwise) — the merged registry seam carries no kind, and
// extending `LiveSessionBindingSource` for it is STOP in this sub-lot
// (AMB-D5 belongs to CL-4c).

type SessionAwareness = LiveSessionBinding["awareness"];

/** Opaque anchor parsed and validated as a relative position for one field. */
function parseAgentAnchor(
  anchor: RelativeAnchor,
  fieldKey: string,
  what: string,
): ReturnType<typeof relativePositionToJSON> {
  let json: unknown;
  try {
    json = JSON.parse(anchor) as unknown;
  } catch {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor does not parse as a relative position (R-ANCH-5)`,
    );
  }
  if (typeof json !== "object" || json === null) {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor does not parse as a relative position (R-ANCH-5)`,
    );
  }
  let rpos: ReturnType<typeof createRelativePositionFromJSON>;
  try {
    rpos = createRelativePositionFromJSON(json as never);
  } catch {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor does not parse as a relative position (R-ANCH-5)`,
    );
  }
  if (rpos.tname !== fieldTextName(fieldKey)) {
    throw new AgentBridgeReadRefusal(
      "target-gone",
      `${what}: anchor names another field (R-ANCH-5)`,
    );
  }
  return relativePositionToJSON(rpos);
}

/** Paragraph containing a resolved linear index on live field state: the
    separator belongs to the preceding paragraph (R-ANCH-3). */
function awarenessParagraphIdAt(ytext: Y.Text, index: number): string | null {
  const paragraphs = scanParagraphs(walkVisibleItems(ytext), ytext.length);
  for (const paragraph of paragraphs) {
    if (index >= paragraph.contentStart && index < paragraph.contentEnd) {
      return paragraph.paragraphId;
    }
  }
  let previous: string | null = null;
  for (const paragraph of paragraphs) {
    if (paragraph.contentStart > index) break;
    previous = paragraph.paragraphId;
  }
  return previous;
}

/** Notify the session awareness of a double-driven state change, so the
    shipped decoration plugin recomputes (renderer liveness in tests). */
function emitAwarenessChange(awareness: SessionAwareness, clientId: number, added: boolean): void {
  (
    awareness as unknown as { emit: (name: string, args: unknown[]) => void }
  ).emit("change", [{ added: added ? [clientId] : [], updated: added ? [] : [clientId], removed: [] }, "test"]);
}

export function createAgentBridgeDouble(options: AgentBridgeDoubleOptions): AgentBridgeDouble {
  const schemaEpoch = options.schemaEpoch ?? "test:schema-epoch:1";
  const profile: AgentPatchProfile = options.profile ?? "p0";
  const activeFormat: RichTextFormat = profile === "full" ? FULL_PROFILE_FORMAT : P0_FORMAT;
  const admittedFields = new Set(options.fieldKeys);
  const admittedFamilies = new Set<string>(options.families);
  const held = new Map<string, HeldField>();
  let sessionAwareness: SessionAwareness | null = null;
  for (const fieldKey of options.fieldKeys) {
    const binding = options.source.resolveBinding({
      documentId: options.documentId,
      sessionId: options.sessionId,
      fieldKey,
    });
    const ydoc = binding.text.doc;
    if (ydoc === null) {
      throw new Error("rich-text.agent-bridge-setup: field text has no doc");
    }
    if (sessionAwareness === null) sessionAwareness = binding.awareness;
    held.set(fieldKey, { fieldKey, text: binding.text, fieldMeta: binding.fieldMeta });
  }
  if (sessionAwareness === null) {
    throw new Error("rich-text.agent-bridge-setup: admitted field set is empty");
  }
  const awareness: SessionAwareness = sessionAwareness;
  const agentKinds = new Map<string, "agent">();
  const actorClients = new Map<string, number>();
  let nextClientId = 0x20000000;
  // Every actor registered on the source while this double lives, so a
  // registered actor without any awareness state still reads as present.
  // The merged seam carries no kind and cannot be enumerated, so the
  // double observes registrations by wrapping the source method on its
  // own per-test instance (test-only; the source shape is unchanged).
  const registeredIds = new Set<string>();
  const sourceRegister = options.source.registerActor;
  if (sourceRegister !== undefined) {
    // Every double wraps from its creation onward; chained wrappers each
    // record into their own set, so registrations are observed by every
    // live double. Agents admitted before a double exists are recorded
    // through `admitAgentActor` below.
    const inner = sourceRegister.bind(options.source);
    options.source.registerActor = (
      actor: { actorId: string; displayLabel: string; color: string },
      awarenessClientId?: number,
    ): void => {
      registeredIds.add(actor.actorId);
      inner(actor, awarenessClientId);
    };
  }

  /** One awareness client id per actor, stable for the double instance. */
  function clientIdFor(actorId: string): number {
    const known = actorClients.get(actorId);
    if (known !== undefined) return known;
    let candidate = nextClientId;
    const states = awareness.getStates();
    while (states.has(candidate) || candidate === awareness.clientID) {
      candidate += 1;
    }
    nextClientId = candidate + 1;
    actorClients.set(actorId, candidate);
    return candidate;
  }

  function admittedRecord(actorId: string): { displayLabel: string; color: string } {
    const record = options.source.admittedActorOf?.(actorId) ?? null;
    if (record === null) {
      throw new AgentBridgeReadRefusal(
        "scope-denied",
        `actor is not admitted in this session: ${actorId} (§5.1)`,
      );
    }
    return record;
  }

  /** Convert one wire cursor to its opaque snapshot form, resolving both
      ends against the live field at read time. An end that no longer
      resolves — or a cursor naming a field outside the admitted set —
      carries no cursor in the snapshot (never a numeric offset). */
  function readCursorAt(
    cursor: { fieldKey: string; anchor: unknown; head: unknown },
  ): AwarenessCursor | undefined {
    if (typeof cursor.fieldKey !== "string") return undefined;
    const target = held.get(cursor.fieldKey);
    if (target === undefined) return undefined;
    if (typeof cursor.anchor !== "object" || cursor.anchor === null) return undefined;
    if (typeof cursor.head !== "object" || cursor.head === null) return undefined;
    const anchorString = JSON.stringify(cursor.anchor);
    const headString = JSON.stringify(cursor.head);
    const anchorIndex = tryResolveAnchorToLinear(target.text, anchorString as RelativeAnchor);
    const headIndex = tryResolveAnchorToLinear(target.text, headString as RelativeAnchor);
    if (anchorIndex === null || headIndex === null) return undefined;
    const paragraphId = awarenessParagraphIdAt(target.text, anchorIndex);
    if (paragraphId === null) return undefined;
    return {
      fieldKey: cursor.fieldKey,
      paragraphId,
      anchor: anchorString as RelativeAnchor,
      head: headString as RelativeAnchor,
    };
  }
  const authDoc = ((): Y.Doc => {
    const first = held.values().next();
    if (first.done === true) {
      throw new Error("rich-text.agent-bridge-setup: admitted field set is empty");
    }
    const doc = (first.value as HeldField).text.doc;
    if (doc === null) {
      throw new Error("rich-text.agent-bridge-setup: field text has no doc");
    }
    return doc;
  })();
  const clockNow = options.now ?? Date.now;
  const retentionTtlMs = options.retentionTtlMs ?? DEFAULT_RETENTION_TTL_MS;
  let readSeq = 0;
  let retainSeq = 0;
  const retainedReads = new Map<string, RetainedRead>();

  function heldField(fieldKey: string): HeldField {
    const found = held.get(fieldKey);
    if (found === undefined) {
      throw new AgentBridgeReadRefusal("scope-denied", `field is outside the admitted set: ${fieldKey}`);
    }
    return found;
  }

  function refuseReceipt(
    patch: AgentPatch,
    reason: NonNullable<AgentPatchReceipt["reason"]>,
    detail: string,
  ): AgentPatchReceipt {
    const key = fullKeyOf(patch);
    const keyString = fullKeyString(key);
    const receipt: AgentPatchReceipt = { key, status: "refused", reason, detail };
    options.store.receipts[keyString] = receipt;
    options.store.payloads[keyString] = JSON.stringify(patch);
    options.store.payloadHashes[keyString] = computePayloadHash(patch);
    options.store.patchEpochs[keyString] = patch.sessionEpoch;
    return receipt;
  }

  function isRevoked(actorId: string): boolean {
    if (!actorClients.has(actorId) && !registeredIds.has(actorId)) return false;
    return options.source.admittedActorOf?.(actorId) == null;
  }

  const buckets = new Map<string, { tokens: number; lastMs: number }>();
  const BUCKET_CAPACITY = 50;
  const BUCKET_REFILL_PER_MS = 20 / 1000;

  function bucketRefuse(actorId: string, cost: number): { refused: true; retryAfterMs: number } | { refused: false } {
    const nowMs = clockNow();
    let entry = buckets.get(actorId);
    if (entry === undefined) {
      entry = { tokens: BUCKET_CAPACITY, lastMs: nowMs };
      buckets.set(actorId, entry);
    }
    const elapsed = Math.max(0, nowMs - entry.lastMs);
    entry.tokens = Math.min(BUCKET_CAPACITY, entry.tokens + elapsed * BUCKET_REFILL_PER_MS);
    entry.lastMs = nowMs;
    if (entry.tokens >= cost) return { refused: false };
    const retryAfterMs = Math.max(1, Math.ceil((cost - entry.tokens) / BUCKET_REFILL_PER_MS));
    return { refused: true, retryAfterMs };
  }

  function bucketDebit(actorId: string, cost: number): void {
    const nowMs = clockNow();
    let entry = buckets.get(actorId);
    if (entry === undefined) {
      entry = { tokens: BUCKET_CAPACITY, lastMs: nowMs };
      buckets.set(actorId, entry);
    }
    const elapsed = Math.max(0, nowMs - entry.lastMs);
    entry.tokens = Math.min(BUCKET_CAPACITY, entry.tokens + elapsed * BUCKET_REFILL_PER_MS);
    entry.lastMs = nowMs;
    entry.tokens -= cost;
  }

  function agentIntentId(patch: AgentPatch, operationIndex: number): string {
    return `${patch.actorId}:${patch.sessionEpoch}:${patch.patchId}:${operationIndex}`;
  }

  function expandedCoveredUnits(
    ytext: Y.Text,
    low: number,
    high: number,
  ): Array<{ client: number; clock: number }> {
    const out: Array<{ client: number; clock: number }> = [];
    for (const item of walkVisibleItems(ytext)) {
      if (item.kind !== "text") continue;
      if (item.start >= high || item.end <= low) continue;
      const sliceStart = Math.max(item.start, low);
      const sliceEnd = Math.min(item.end, high);
      for (let pos = sliceStart; pos < sliceEnd; pos += 1) {
        out.push({ client: item.client, clock: item.clock + (pos - item.start) });
      }
    }
    return out;
  }

  function liveUnitSet(ytext: Y.Text): Set<string> {
    const live = new Set<string>();
    for (const item of walkVisibleItems(ytext)) {
      if (item.kind !== "text") continue;
      for (let offset = 0; offset < item.length; offset += 1) {
        live.add(`${item.client}:${item.clock + offset}`);
      }
    }
    return live;
  }

  function linearIndexOfUnit(ytext: Y.Text, client: number, clock: number): number | null {
    for (const item of walkVisibleItems(ytext)) {
      if (item.kind !== "text") continue;
      if (item.client !== client) continue;
      const offset = clock - item.clock;
      if (offset < 0 || offset >= item.length) continue;
      return item.start + offset;
    }
    return null;
  }

  if (options.store.payloadHashes === undefined) options.store.payloadHashes = {};
  if (options.store.provenanceLog === undefined) options.store.provenanceLog = [];
  if (options.store.provenanceNextSeq === undefined) options.store.provenanceNextSeq = 1;
  if (options.store.revertReceipts === undefined) options.store.revertReceipts = {};
  if (options.store.patchEpochs === undefined) options.store.patchEpochs = {};

  const bridgeSink = {
    recordFormattingIntent(intent: FormattingIntentDraft): void {
      appendProvenanceDraft(options.store, intent);
    },
    getOrderedLog(): readonly FormattingIntent[] {
      return options.store.provenanceLog;
    },
  };

  return {
    sink: bridgeSink,
    readState(request: AgentReadRequest): AgentDocumentState {
      // (i) Request caps and binding/field scope (R-READ-1): a request that
      // itself demands more than a cap is refused whole as `too-large`
      // with no page returned and no anchors minted.
      const checked = validateAgentReadRequest(request);
      if (!checked.ok) {
        throw new AgentBridgeReadRefusal(
          checked.reason,
          `read refused: ${checked.detail}`,
        );
      }
      if (
        request.binding.documentId !== options.documentId ||
        request.binding.sessionId !== options.sessionId
      ) {
        throw new AgentBridgeReadRefusal("target-gone", "read binding does not resolve in this session");
      }
      const fieldKey = request.fieldKey ?? request.binding.fieldKey;
      heldField(fieldKey);
      // (ii) Retained revision (R-READ-2): first-page requests clone the
      // authoritative state into an in-memory retained snapshot; later
      // pages carrying `pageToken` (or the bare `readToken`) slice that
      // snapshot, never live state. Evicted, expired or unknown tokens
      // refuse `target-gone` for the whole read.
      const nowMs = clockNow();
      for (const [token, retained] of retainedReads) {
        if (nowMs - retained.createdAt >= retentionTtlMs) retainedReads.delete(token);
      }
      const liveRetained = (token: string): RetainedRead => {
        const retained = retainedReads.get(token);
        if (retained === undefined) {
          throw new AgentBridgeReadRefusal(
            "target-gone",
            "retained read is evicted or expired; re-read from the start (R-READ-2)",
          );
        }
        return retained;
      };
      let cursor: ResolvedReadCursor;
      const firstPage = request.pageToken === undefined;
      if (request.pageToken !== undefined) {
        const payload = decodePageToken(request.pageToken);
        if (payload === null) {
          throw new AgentBridgeReadRefusal("target-gone", "page token does not decode (R-READ-2)");
        }
        if (payload.f !== fieldKey) {
          throw new AgentBridgeReadRefusal("target-gone", "page token names another field (R-READ-2)");
        }
        if (request.readToken !== undefined && request.readToken !== payload.t) {
          throw new AgentBridgeReadRefusal("target-gone", "page token and read token disagree (R-READ-2)");
        }
        const retained = liveRetained(payload.t);
        cursor = {
          retained,
          token: payload.t,
          startIdx: payload.s,
          endIdx: payload.e,
          para: payload.p,
          seg: payload.g,
          char: payload.h,
        };
      } else if (request.readToken !== undefined) {
        // A live token without a page re-reads the selection from the
        // start against the same retained revision.
        const retained = liveRetained(request.readToken);
        const ytext = retained.doc.getText(fieldTextName(fieldKey));
        const items = walkVisibleItems(ytext);
        const paragraphs = scanParagraphs(items, ytext.length);
        const selection = resolveReadSelection(ytext, fieldKey, paragraphs, request.selector);
        cursor = {
          retained,
          token: request.readToken,
          startIdx: selection.startIdx,
          endIdx: selection.endIdx,
          para: 0,
          seg: 0,
          char: 0,
        };
      } else {
        const snapshot = new Y.Doc();
        Y.applyUpdate(snapshot, Y.encodeStateAsUpdate(authDoc));
        readSeq += 1;
        retainSeq += 1;
        const readToken = `${READ_TOKEN_PREFIX}${readSeq}`;
        const retained: RetainedRead = {
          token: readToken,
          doc: snapshot,
          stateVector: toBase64Url(Y.encodeStateVector(snapshot)),
          createdAt: nowMs,
          seq: retainSeq,
        };
        retainedReads.set(readToken, retained);
        while (retainedReads.size > RETAINED_READ_LIMIT) {
          let oldest: string | null = null;
          let oldestSeq = Number.POSITIVE_INFINITY;
          for (const [token, entry] of retainedReads) {
            if (entry.seq < oldestSeq) {
              oldestSeq = entry.seq;
              oldest = token;
            }
          }
          if (oldest === null) break;
          retainedReads.delete(oldest);
        }
        const ytext = retained.doc.getText(fieldTextName(fieldKey));
        const items = walkVisibleItems(ytext);
        const paragraphs = scanParagraphs(items, ytext.length);
        const selection = resolveReadSelection(ytext, fieldKey, paragraphs, request.selector);
        cursor = {
          retained,
          token: readToken,
          startIdx: selection.startIdx,
          endIdx: selection.endIdx,
          para: 0,
          seg: 0,
          char: 0,
        };
      }
      // (iii) Selection and requested anchors, minted in request order
      // against the retained snapshot on the first page only.
      const ytext = cursor.retained.doc.getText(fieldTextName(fieldKey));
      const scanItems = walkVisibleItems(ytext);
      const scanParagraphsList = scanParagraphs(scanItems, ytext.length);
      const runs = collectDeltaRuns(ytext);
      let requestedAnchors: readonly RelativeAnchor[] = [];
      if (firstPage && request.anchorRequests !== undefined && request.anchorRequests.length > 0) {
        const minted: RelativeAnchor[] = [];
        for (const anchorRequest of request.anchorRequests) {
          const paragraph = scanParagraphsList.find((entry) => entry.paragraphId === anchorRequest.paragraphId);
          if (paragraph === undefined) {
            throw new AgentBridgeReadRefusal(
              "target-gone",
              `anchor request names an unknown paragraph: ${anchorRequest.paragraphId}`,
            );
          }
          const linear = Math.min(paragraph.contentStart + anchorRequest.paragraphOffset, paragraph.contentEnd);
          minted.push(mintAt(ytext, linear));
        }
        requestedAnchors = minted;
      }
      // `maxParagraphs` is a lower-only cap (R-READ-1); the validator
      // refuses over-cap values, and the page holds at least one entry.
      const maxEntries = Math.max(
        1,
        Math.min(MAX_READ_PARAGRAPHS, request.maxParagraphs ?? MAX_READ_PARAGRAPHS),
      );
      // (iv)–(vi) Page construction under every R-READ-1 cap with
      // continuations inside paragraphs and preserved blocks.
      return buildReadPage({
        ytext,
        documentId: options.documentId,
        fieldKey,
        schemaEpoch,
        retainedVector: cursor.retained.stateVector,
        readToken: cursor.token,
        paragraphs: scanParagraphsList,
        items: scanItems,
        runs,
        requestedAnchors,
        startIdx: cursor.startIdx,
        endIdx: cursor.endIdx,
        resume: { para: cursor.para, seg: cursor.seg, char: cursor.char },
        maxEntries,
        format: activeFormat,
        fieldMeta: cursor.retained.doc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>,
      }).state;
    },

    admitAgentActor(actor: { actorId: string; displayLabel: string; color: string }): number {
      if (options.source.registerActor === undefined || options.source.admittedActorOf === undefined) {
        throw new Error("rich-text.agent-bridge-admit: source carries no admitted-actor registry");
      }
      const clientId = clientIdFor(actor.actorId);
      options.source.registerActor(
        { actorId: actor.actorId, displayLabel: actor.displayLabel, color: actor.color },
        clientId,
      );
      registeredIds.add(actor.actorId);
      agentKinds.set(actor.actorId, "agent");
      return clientId;
    },

    publishAgentCursor(input: {
      binding: FieldBindingIdentity;
      actorId: string;
      selection: { anchor: RelativeAnchor; head: RelativeAnchor } | null;
    }): void {
      // `fieldKey` comes from the binding identity, never from
      // agent-supplied text (§5.1.1).
      if (
        input.binding.documentId !== options.documentId ||
        input.binding.sessionId !== options.sessionId
      ) {
        throw new AgentBridgeReadRefusal("target-gone", "cursor binding does not resolve in this session");
      }
      const heldBinding = held.get(input.binding.fieldKey);
      if (heldBinding === undefined) {
        throw new AgentBridgeReadRefusal(
          "scope-denied",
          `cursor field is outside the admitted set: ${input.binding.fieldKey}`,
        );
      }
      const record = admittedRecord(input.actorId);
      // Validate everything before touching any awareness field: the
      // refusal leaves the whole session awareness untouched.
      let cursor: { fieldKey: string; anchor: unknown; head: unknown } | null = null;
      if (input.selection !== null) {
        const anchor = parseAgentAnchor(input.selection.anchor, heldBinding.fieldKey, "cursor anchor");
        const head = parseAgentAnchor(input.selection.head, heldBinding.fieldKey, "cursor head");
        cursor = { fieldKey: heldBinding.fieldKey, anchor, head };
      }
      // On success, set on that actor's registry participant only: the
      // actor id, the user identity (registry display label rendered as
      // text, validated colour), and the cursor as relative-position JSON
      // objects — no top-level `anchor`/`head` awareness field is ever set.
      const clientId = clientIdFor(input.actorId);
      const had = awareness.getStates().has(clientId);
      awareness.getStates().set(clientId, {
        actorId: input.actorId,
        user: { name: record.displayLabel, color: validateCollaborationColor(record.color) },
        cursor,
      });
      emitAwarenessChange(awareness, clientId, !had);
    },

    readAwareness(binding: FieldBindingIdentity): PresenceSnapshot {
      if (binding.documentId !== options.documentId || binding.sessionId !== options.sessionId) {
        throw new AgentBridgeReadRefusal("target-gone", "awareness binding does not resolve in this session");
      }
      // Presence is document-scoped (`scopeRef` is the document id); the
      // field key only scopes cursor resolution below.
      const seen = new Map<string, { cursor?: { fieldKey: string; anchor: unknown; head: unknown } | null }>();
      for (const [clientId, state] of awareness.getStates()) {
        const actorId = (state as { actorId?: unknown }).actorId;
        if (typeof actorId !== "string") continue;
        const record = options.source.admittedActorOf?.(actorId);
        // An unregistered awareness state contributes no actor entry.
        if (record == null) continue;
        // Full-pair rule (mirrors the renderer): a client claiming
        // another actor's id contributes nothing under the claimed
        // identity when the registry pairs that actor with a client id.
        if (record.awarenessClientId !== undefined && record.awarenessClientId !== clientId) continue;
        const cursor = (state as { cursor?: unknown }).cursor;
        if (cursor !== null && cursor !== undefined) {
          if (typeof cursor !== "object") continue;
          seen.set(actorId, { cursor: cursor as { fieldKey: string; anchor: unknown; head: unknown } });
        } else if (!seen.has(actorId)) {
          seen.set(actorId, {});
        }
      }
      // A registered actor without any awareness state still reads as
      // present, without a caret — including actors the double observed
      // registering on the source and agents admitted through the bridge.
      for (const actorId of registeredIds) {
        if (options.source.admittedActorOf?.(actorId) == null) continue;
        if (!seen.has(actorId)) seen.set(actorId, {});
      }
      for (const actorId of agentKinds.keys()) {
        if (options.source.admittedActorOf?.(actorId) == null) continue;
        if (!seen.has(actorId)) seen.set(actorId, {});
      }
      const actors: PresenceSnapshot["actors"] = [];
      for (const [actorId, entry] of seen) {
        const record = options.source.admittedActorOf?.(actorId);
        if (record === null || record === undefined) continue;
        let cursor: AwarenessCursor | undefined;
        if (entry.cursor !== undefined && entry.cursor !== null) {
          cursor = readCursorAt(entry.cursor);
        }
        actors.push({
          actorId,
          kind: agentKinds.get(actorId) ?? "human",
          displayLabel: record.displayLabel,
          color: validateCollaborationColor(record.color),
          ...(cursor !== undefined ? { cursor } : {}),
        });
      }
      actors.sort((left, right) => (left.actorId < right.actorId ? -1 : left.actorId > right.actorId ? 1 : 0));
      return { scopeRef: options.documentId, actors, total: actors.length };
    },

    async applyPatch(patch: AgentPatch): Promise<AgentPatchReceipt> {
      const key = fullKeyOf(patch);
      const keyString = fullKeyString(key);
      // (0) Full key and canonical payload hash (section 5.4.1, AMB-C1).
      const payloadHash = computePayloadHash(patch);
      // (1) Durable lookup (section 5.4.1): same hash replays the original
      // receipt verbatim with duplicate:true and applies nothing; a different
      // hash refuses terminal idempotency-key-reuse without overwriting.
      const stored = options.store.receipts[keyString];
      if (stored !== undefined) {
        if (options.store.payloadHashes[keyString] === payloadHash) {
          return { ...stored, key: { ...stored.key }, duplicate: true };
        }
        return {
          key,
          status: "refused",
          reason: "idempotency-key-reuse",
          detail: "full key already holds a terminal receipt for another payload (section 5.4.1)",
        };
      }
      // (2) Shape/size check (section 5.3.1; double profile, AMB-E1).
      const shaped = validateAgentPatch(patch, profile);
      if (!shaped.ok) {
        const detail =
          shaped.operationIndex === undefined
            ? `shape/size check: ${shaped.detail}`
            : `shape/size check at operation ${shaped.operationIndex}: ${shaped.detail}`;
        return refuseReceipt(patch, shaped.reason, detail);
      }
      // (3) Scope check (B-BRIDGE-3): binding and every operation's
      // field/family inside the admitted set.
      if (
        patch.binding.documentId !== options.documentId ||
        patch.binding.sessionId !== options.sessionId
      ) {
        return refuseReceipt(patch, "target-gone", "patch binding does not resolve in this session (R-ANCH-5)");
      }
      if (!admittedFields.has(patch.binding.fieldKey)) {
        return refuseReceipt(patch, "scope-denied", `field is outside the admitted set: ${patch.binding.fieldKey} (B-BRIDGE-3)`);
      }
      for (let index = 0; index < patch.operations.length; index += 1) {
        const operation = patch.operations[index] as AgentEditOperation;
        if (!admittedFamilies.has(operation.type)) {
          return refuseReceipt(
            patch,
            "scope-denied",
            `operation ${index}: family "${operation.type}" is outside the admitted set (B-BRIDGE-3)`,
          );
        }
      }
      // (4) Revocation seam (section 5.5, B-BRIDGE-5): an actor revoked
      // through the source registry refuses terminal revoked with no debit.
      if (isRevoked(patch.actorId)) {
        return refuseReceipt(patch, "revoked", `actor is revoked in this session: ${patch.actorId} (B-BRIDGE-5)`);
      }
      // (5) Token bucket (section 5.3.1, AMB-C2/AMB-D4): transient only,
      // stored nowhere, binds no hash, records no intent.
      const cost = patch.operations.length;
      const bucket = bucketRefuse(patch.actorId, cost);
      if (bucket.refused === true) {
        return {
          key,
          status: "refused",
          reason: "rate-limited",
          transient: true,
          retryAfterMs: bucket.retryAfterMs,
          detail: `token bucket has no capacity for cost ${cost} (section 5.3.1)`,
        };
      }
      const heldBinding = heldField(patch.binding.fieldKey);
      let baseSV: Map<number, number>;
      try {
        baseSV = fromBase64Url(patch.baseRevision.stateVector);
      } catch {
        return refuseReceipt(patch, "target-gone", "baseRevision stateVector does not decode (R-ANCH-5)");
      }
      // (iii) Scratch preflight (§5.3.1): clone the authoritative doc and run
      // every operation against the scratch field.
      const scratchDoc = new Y.Doc();
      Y.applyUpdate(scratchDoc, Y.encodeStateAsUpdate(authDoc));
      const scratchText = scratchDoc.getText(fieldTextName(patch.binding.fieldKey));
      const scratchMeta = scratchDoc.getMap(fieldMetaName(patch.binding.fieldKey)) as Y.Map<unknown>;
      const scratchTarget: ApplierTarget = {
        ytext: scratchText,
        ydoc: scratchDoc,
        fieldKey: patch.binding.fieldKey,
        fieldMeta: scratchMeta,
        format: activeFormat,
        baseSV,
        collect: false,
      };
      const baseline = baseTextByParagraph(scratchText, baseSV);
      const insertedChars = new Map<string, number>();
      const structured = new Set<string>();
      try {
        for (let index = 0; index < patch.operations.length; index += 1) {
          const outcome = applyOneOperation(
            scratchTarget,
            patch.operations[index] as AgentEditOperation,
            index,
          );
          for (const entry of outcome.insertedChars) {
            insertedChars.set(
              entry.paragraphId,
              (insertedChars.get(entry.paragraphId) ?? 0) + entry.chars,
            );
          }
          for (const id of outcome.structuredIds) structured.add(id);
        }
      } catch (error) {
        if (error instanceof BridgeRefusal) {
          const detail =
            error.operationIndex === null
              ? `preflight: ${error.message}`
              : `preflight at operation ${error.operationIndex}: ${error.message}`;
          return refuseReceipt(patch, error.reason ?? "target-gone", detail);
        }
        throw error;
      }
      // Whole-block replacement is not expressible (B-BRIDGE-1, AMB-A4): on the
      // scratch result, per affected paragraph, the patch deletes every
      // base-revision text item of that paragraph and inserts text into it.
      const surviving = survivingBaseText(scratchText, baseSV);
      for (const [paragraphId, chars] of insertedChars) {
        if (chars <= 0 || structured.has(paragraphId)) continue;
        if ((baseline.get(paragraphId) ?? 0) > 0 && (surviving.get(paragraphId) ?? 0) === 0) {
          return refuseReceipt(
            patch,
            "structural-conflict",
            `preflight: patch replaces the whole text of paragraph "${paragraphId}" (B-BRIDGE-1)`,
          );
        }
      }
      // (v) Resulting-state validation (§5.3.1, §4.11 admitted table of the
      // double profile — decides the HR-target metadata refusal, AMB-E3).
      try {
        validateFieldState(scratchText, scratchMeta, activeFormat);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return refuseReceipt(patch, "incompatible-schema", `preflight resulting-schema: ${detail} (§4.11)`);
      }
      // (6) Scratch preflight and resulting-schema validation (section 5.3.1).
      // (7) Commit in one transaction under origin agent:<actorId>, then store
      // receipt, hash, affected-items record and agent intents together in the
      // store object (the double stand-in for the host transaction boundary).
      bucketDebit(patch.actorId, cost);
      const stateVectorBefore = toBase64Url(Y.encodeStateVector(authDoc));
      const operationResults: AgentOperationResult[] = [];
      const affected: AgentAffectedOperation[] = [];
      const commitTarget: ApplierTarget = {
        ytext: heldBinding.text,
        ydoc: authDoc,
        fieldKey: patch.binding.fieldKey,
        fieldMeta: heldBinding.fieldMeta,
        format: activeFormat,
        baseSV,
        collect: true,
      };
      authDoc.transact(() => {
        for (let index = 0; index < patch.operations.length; index += 1) {
          const outcome = applyOneOperation(
            commitTarget,
            patch.operations[index] as AgentEditOperation,
            index,
          );
          operationResults.push(outcome.result);
          if (outcome.record !== null) affected.push(outcome.record);
        }
      }, agentOriginFor(patch.actorId));
      for (let index = 0; index < patch.operations.length; index += 1) {
        const operation = patch.operations[index] as AgentEditOperation;
        if (operation.type !== "mark") continue;
        const record = affected.find((entry) => entry.operationIndex === index);
        if (record === undefined) continue;
        // One draft per asserted key (R-FULL-MARK-1 linkage): a boolean key
        // records one intent; a `link` operation records two (`link` with the
        // href-or-null value, `linkTitle` with the title-or-null value — an
        // omitted title clears the title, a null href clears both).
        const pairs = markIntentPairs(operation);
        if (pairs === null) continue;
        const units = expandedCoveredUnits(
          heldBinding.text,
          Math.min(
            resolveAnchorOrRefuse(heldBinding.text, patch.binding.fieldKey, operation.range.start, "intent"),
            resolveAnchorOrRefuse(heldBinding.text, patch.binding.fieldKey, operation.range.end, "intent"),
          ),
          Math.max(
            resolveAnchorOrRefuse(heldBinding.text, patch.binding.fieldKey, operation.range.start, "intent"),
            resolveAnchorOrRefuse(heldBinding.text, patch.binding.fieldKey, operation.range.end, "intent"),
          ),
        );
        const intentIds: string[] = [];
        for (const pair of pairs) {
          const intentId =
            pairs.length === 1 ? agentIntentId(patch, index) : `${agentIntentId(patch, index)}:${pair.mark}`;
          appendProvenanceDraft(options.store, {
            intentId,
            actorId: patch.actorId,
            source: { kind: "agent-patch", key, operationIndex: index },
            fieldKey: patch.binding.fieldKey,
            mark: pair.mark,
            value: pair.value,
            range: { start: operation.range.start, end: operation.range.end },
            items: units,
          });
          intentIds.push(intentId);
        }
        record.markIntentIds = intentIds;
        record.markIntents = pairs.map((pair, pairIndex) => ({
          mark: pair.mark,
          value: pair.value,
          intentIds: [intentIds[pairIndex] as string],
        }));
        record.mark = operation.mark as InlineMarkKey;
        record.markValue = pairs[0]?.value ?? null;
      }
      const receipt: AgentPatchReceipt = {
        key,
        status: "applied",
        stateVectorAfter: toBase64Url(Y.encodeStateVector(authDoc)),
        operationResults,
      };
      options.store.receipts[keyString] = receipt;
      options.store.payloads[keyString] = JSON.stringify(patch);
      options.store.payloadHashes[keyString] = payloadHash;
      options.store.patchEpochs[keyString] = patch.sessionEpoch;
      options.store.records[keyString] = {
        key,
        stateVectorBefore,
        stateVectorAfter: receipt.stateVectorAfter as string,
        operations: affected,
      };
      return receipt;
    },

    getReceipt(key: AgentPatchKey): AgentPatchReceipt | null {
      return options.store.receipts[fullKeyString(key)] ?? null;
    },

    async revertPatch(input: { key: AgentPatchKey; requestedBy: string; reason?: string }): Promise<AgentPatchReceipt> {
      const key = input.key as AgentPatchKey;
      if (
        typeof key !== "object" ||
        key === null ||
        !isNonEmptyKeyPart(key.documentId) ||
        !isNonEmptyKeyPart(key.actorId) ||
        !isNonEmptyKeyPart(key.sessionEpoch) ||
        !isNonEmptyKeyPart(key.patchId)
      ) {
        return {
          key: { documentId: "", actorId: "", sessionEpoch: "", patchId: "" },
          status: "refused",
          reason: "target-gone",
          detail: "revert key is incomplete (R-REV-1: full key only)",
        };
      }
      const keyString = fullKeyString(key);
      const stored = options.store.receipts[keyString];
      if (stored === undefined) {
        return { key, status: "refused", reason: "target-gone", detail: "unknown patch key (R-REV-1)" };
      }
      const existingRevert = options.store.revertReceipts[keyString];
      if (existingRevert !== undefined) {
        return { ...existingRevert, key: { ...existingRevert.key }, duplicate: true };
      }
      const record = options.store.records[keyString];
      if (record === undefined) {
        return { key, status: "refused", reason: "target-gone", detail: "no durable affected-items record (R-REV-2)" };
      }
      if (key.documentId !== options.documentId || key.actorId === undefined) {
        return { key, status: "refused", reason: "target-gone", detail: "revert key resolves outside this session" };
      }
      const targetField = record.operations[0]?.fieldKey ?? null;
      if (targetField === null || !held.has(targetField)) {
        return { key, status: "refused", reason: "target-gone", detail: "revert field is outside the admitted set" };
      }
      const fieldKey = targetField as string;
      const entry = held.get(fieldKey);
      if (entry === undefined) {
        return { key, status: "refused", reason: "target-gone", detail: "revert field is outside the admitted set" };
      }
      const ytext = entry.text;
      const fieldDoc = ytext.doc as Y.Doc;
      const scratchDoc = new Y.Doc();
      Y.applyUpdate(scratchDoc, Y.encodeStateAsUpdate(fieldDoc));
      const scratchText = scratchDoc.getText(fieldTextName(fieldKey));
      const scratchMeta = scratchDoc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>;
      try {
        applyRevertInverse(scratchText, scratchMeta, record, options.store.provenanceLog, key, input.requestedBy);
      } catch (error) {
        if (error instanceof BridgeRefusal) {
          const receipt: AgentPatchReceipt = {
            key,
            status: "refused",
            reason: error.reason ?? "target-gone",
            detail: error.message,
            ...(error.reason === "mark-provenance-conflict" && error.conflict !== undefined
              ? { conflict: error.conflict }
              : {}),
          };
          options.store.revertReceipts[keyString] = receipt;
          return receipt;
        }
        throw error;
      }
      const revertOrigin = `revert:${input.requestedBy}`;
      let stats: RevertInverseStats | null = null;
      fieldDoc.transact(() => {
        stats = applyRevertInverse(ytext, entry.fieldMeta, record, options.store.provenanceLog, key, input.requestedBy, (draft) =>
          appendProvenanceDraft(options.store, draft),
        );
      }, revertOrigin);
      const done = stats as unknown as RevertInverseStats;
      const receipt: AgentPatchReceipt = {
        key,
        status: "applied",
        stateVectorAfter: toBase64Url(Y.encodeStateVector(fieldDoc)),
        detail: `revert applied: restored ops ${done.restoredOps}, satisfied ops ${done.satisfiedOps}, restored items ${done.restoredItems}, kept-later ${done.keptLaterItems}, satisfied items ${done.satisfiedItems} (R-REV-7)`,
      };
      options.store.revertReceipts[keyString] = receipt;
      return receipt;
    },
  };
}

/**
 * CL-4e mark-undo performer stand-in (test-only, register AMB-D2).
 * Wraps the double store's ordered `provenanceLog`, the keyless-capable
 * `planMarkRevert`, a transition table and a request-outcome table held in
 * the same injected store, and the format-application machinery
 * `revertPatch` already uses, driven by the §3.2 input instead of a patch
 * key. It proves the DS contract shape, not the host execution.
 */
export interface MarkUndoStandInOptions {
  source: LiveSessionBindingSource;
  documentId: string;
  sessionId: string;
  fieldKeys: readonly string[];
  store: AgentBridgeReceiptStore;
  actorId: string;
}

/** Test handle over the mark-undo performer stand-in (CL-4e fix 1):
    native D-C4c/D-C5 controls — commit holds, outcome holds and manual
    echo — so witnesses drive lag and echo orders through the stand-in
    itself, never through a test-only gating wrapper. */
export interface MarkUndoStandIn extends SessionMarkUndoPerformer {
  /** Withhold the original transaction's commit: invocations naming it
      stay pending (never `target-gone` on lag alone) until released. */
  holdTransactionCommit(transactionId: string): void;
  releaseTransactionCommit(transactionId: string): void;
  /** Withhold evaluated outcomes: the echo still applies synchronously,
      the promise stays pending until released (echo-before-response). */
  holdOutcomes(): void;
  releaseOutcomes(): void;
  /** Manual echo: outcomes return immediately with no shared transact;
      `flushEcho` delivers the queued format transactions afterwards
      (response-before-echo). */
  setEchoMode(mode: "auto" | "manual"): void;
  flushEcho(): void;
  /** Sink wrapper indexing committed human envelopes in real time (so a
      later log truncation still evaluates against the real envelope),
      then forwarding to the wrapped sink. */
  wrapSink(sink: { recordFormattingIntent(intent: unknown): void }): {
    recordFormattingIntent(intent: unknown): void;
  };
}

export function createMarkUndoPerformerStandIn(
  options: MarkUndoStandInOptions,
): MarkUndoStandIn {
  const { source, documentId, sessionId, fieldKeys, store, actorId } = options;
  if (store.markUndoTransitions === undefined) store.markUndoTransitions = {};
  if (store.markUndoOutcomes === undefined) store.markUndoOutcomes = {};
  if (store.markUndoTransitionSeq === undefined) store.markUndoTransitionSeq = 0;
  if (store.markUndoEnvelopes === undefined) store.markUndoEnvelopes = {};
  // D-C4c lag: original transactions whose commit is withheld.
  const uncommitted = new Set<string>();
  const commitWaiters = new Map<string, Array<() => void>>();
  // Echo-before-response: evaluated outcomes withheld at delivery.
  let outcomesHeld = false;
  const outcomeWaiters: Array<() => void> = [];
  // Response-before-echo: format transactions queued for `flushEcho`.
  let echoMode: "auto" | "manual" = "auto";
  const pendingEchoes: Array<() => void> = [];
  const held = new Map<string, LiveSessionBinding>();
  for (const fieldKey of fieldKeys) {
    held.set(
      fieldKey,
      source.resolveBinding({ documentId, sessionId, fieldKey }),
    );
  }
  const transitionKeyFor = (fieldKey: string, transactionId: string): string =>
    `${fieldKey}:${transactionId}`;
  const liveUnitsOf = (
    ytext: Y.Text,
  ): Array<{ client: number; clock: number }> => {
    const live = new Set<string>();
    const list: Array<{ client: number; clock: number }> = [];
    for (const item of walkVisibleItems(ytext)) {
      if (item.kind !== "text") continue;
      for (let offset = 0; offset < item.length; offset += 1) {
        const pair = `${item.client}:${item.clock + offset}`;
        if (!live.has(pair)) {
          live.add(pair);
          list.push({ client: item.client, clock: item.clock + offset });
        }
      }
    }
    return list;
  };
  const noteEnvelopeIntent = (intent: {
    actorId: string;
    intentId: string;
    source: { kind: string; transactionId?: string };
    fieldKey: string;
    mark: string;
    items: Array<{ client: number; clock: number }>;
  }): void => {
    if (intent.source?.kind !== "human-transaction") return;
    const transactionId = intent.source.transactionId;
    if (typeof transactionId !== "string") return;
    if (store.markUndoEnvelopes === undefined) store.markUndoEnvelopes = {};
    const key = transitionKeyFor(intent.fieldKey, transactionId);
    let envelope = store.markUndoEnvelopes[key];
    if (envelope === undefined) {
      envelope = { actorId: intent.actorId, fieldKey: intent.fieldKey, transactionId, groups: [] };
      store.markUndoEnvelopes[key] = envelope;
    }
    let group = envelope.groups.find((entry) => entry.mark === intent.mark);
    if (group === undefined) {
      group = { mark: intent.mark, intentIds: [], items: [] };
      envelope.groups.push(group);
    }
    if (!group.intentIds.includes(intent.intentId)) group.intentIds.push(intent.intentId);
    const seen = new Set(group.items.map((item) => `${item.client}:${item.clock}`));
    for (const item of intent.items) {
      const pair = `${item.client}:${item.clock}`;
      if (!seen.has(pair)) {
        seen.add(pair);
        group.items.push({ client: item.client, clock: item.clock });
      }
    }
  };
  const indexEnvelopeFor = (fieldKey: string, transactionId: string): void => {
    for (const intent of store.provenanceLog) {
      if (intent.fieldKey !== fieldKey) continue;
      if (intent.source.kind !== "human-transaction") continue;
      if ((intent.source as { transactionId: string }).transactionId !== transactionId) continue;
      noteEnvelopeIntent(intent as {
        actorId: string;
        intentId: string;
        source: { kind: string; transactionId?: string };
        fieldKey: string;
        mark: string;
        items: Array<{ client: number; clock: number }>;
      });
    }
  };
  const indexAllEnvelopes = (): void => {
    const seen = new Set<string>();
    for (const intent of store.provenanceLog) {
      if (intent.source.kind !== "human-transaction") continue;
      if (!held.has(intent.fieldKey)) continue;
      const transactionId = (intent.source as { transactionId: string }).transactionId;
      const key = transitionKeyFor(intent.fieldKey, transactionId);
      if (seen.has(key)) continue;
      seen.add(key);
      indexEnvelopeFor(intent.fieldKey, transactionId);
    }
  };
  indexAllEnvelopes();
  const standIn: MarkUndoStandIn = {
    async requestMarkUndo(input: {
      fieldKey: string;
      transactionId: string;
      requestId: string;
      commandTransactionId: string;
      expectedTransitionId: string | null;
      direction: "undo" | "redo";
      marks: readonly SessionMarkUndoMarkGroup[];
    }): Promise<SessionMarkUndoOutcome> {
      const fieldKey = input.fieldKey;
      const entry = held.get(fieldKey);
      if (entry === undefined) {
        return {
          status: "refused",
          requestId: input.requestId,
          duplicate: false,
          transitionId: null,
          reason: "scope-denied",
          detail: "mark-undo field is outside the admitted set",
        };
      }
      const payload = JSON.stringify({
        fieldKey: input.fieldKey,
        transactionId: input.transactionId,
        commandTransactionId: input.commandTransactionId,
        expectedTransitionId: input.expectedTransitionId,
        direction: input.direction,
        marks: input.marks,
      });
      // Durable delivery: every evaluated outcome is stored under its
      // requestId before it resolves; when outcomes are held the promise
      // stays pending while the echo is already applied.
      const deliver = async (
        outcome: SessionMarkUndoOutcome,
      ): Promise<SessionMarkUndoOutcome> => {
        const table = store.markUndoOutcomes;
        if (table !== undefined) {
          table[input.requestId] = {
            outcome: outcome as unknown as (typeof table)[string]["outcome"],
            payload,
          };
        }
        if (outcomesHeld) {
          await new Promise<void>((resolve) => {
            outcomeWaiters.push(resolve);
          });
        }
        return outcome;
      };
      const storedOutcome = store.markUndoOutcomes?.[input.requestId];
      if (storedOutcome !== undefined) {
        if (storedOutcome.payload === payload) {
          const replayed = storedOutcome.outcome as unknown as SessionMarkUndoOutcome;
          if (replayed.status === "applied") {
            return { ...replayed, requestId: input.requestId, duplicate: true };
          }
          if (replayed.status === "refused") {
            return { ...replayed, requestId: input.requestId, duplicate: true };
          }
          return { ...replayed, requestId: input.requestId };
        }
        const currentKey = transitionKeyFor(input.fieldKey, input.transactionId);
        const currentTransition = store.markUndoTransitions?.[currentKey]?.transitionId ?? null;
        return {
          status: "refused",
          requestId: input.requestId,
          duplicate: false,
          transitionId: currentTransition,
          reason: "idempotency-key-reuse",
          detail: "same requestId with a changed payload refuses without replacing the outcome",
        };
      }
      const ytext = entry.text;
      const fieldMeta = entry.fieldMeta;
      const log = store.provenanceLog;
      // Committed envelopes, indexed as intents commit (at creation and on
      // every call) and surviving log truncation: a later invocation still
      // evaluates against the real envelope (genuine keyless
      // `mark-provenance-conflict`) instead of misreading a missing log as
      // `target-gone`.
      indexEnvelopeFor(input.fieldKey, input.transactionId);
      // D-C4c: the original transaction is not yet committed — the promise
      // stays pending until its committed disposition is known; lag alone
      // never resolves as `target-gone`.
      if (uncommitted.has(input.transactionId)) {
        await new Promise<void>((resolve) => {
          const list = commitWaiters.get(input.transactionId) ?? [];
          list.push(resolve);
          commitWaiters.set(input.transactionId, list);
        });
      }
      const envelope = store.markUndoEnvelopes?.[transitionKeyFor(input.fieldKey, input.transactionId)];
      const recorded: Array<{ actorId: string; mark: string; intentId: string }> = [];
      if (envelope !== undefined) {
        for (const group of envelope.groups) {
          for (const intentId of group.intentIds) {
            recorded.push({ actorId: envelope.actorId, mark: group.mark, intentId });
          }
        }
      }
      if (recorded.length === 0) {
        const outcome: SessionMarkUndoOutcome = {
          status: "refused",
          requestId: input.requestId,
          duplicate: false,
          transitionId: null,
          reason: "target-gone",
          detail: "unknown human transaction after settled ingress (no recorded intent)",
        };
        return deliver(outcome);
      }
      for (const intent of recorded) {
        if (intent.actorId !== actorId) {
          const outcome: SessionMarkUndoOutcome = {
            status: "refused",
            requestId: input.requestId,
            duplicate: false,
            transitionId: null,
            reason: "scope-denied",
            detail: "another actor's intent ids refuse scope-denied",
          };
          return deliver(outcome);
        }
      }
      const recordedByMark = new Map<string, string[]>();
      for (const intent of recorded) {
        const list = recordedByMark.get(intent.mark) ?? [];
        list.push(intent.intentId);
        recordedByMark.set(intent.mark, list);
      }
      const receivedByMark = new Map<string, string[]>();
      for (const group of input.marks) {
        receivedByMark.set(group.mark, [...group.intentIds]);
      }
      if (recordedByMark.size !== receivedByMark.size) {
        const outcome: SessionMarkUndoOutcome = {
          status: "refused",
          requestId: input.requestId,
          duplicate: false,
          transitionId: store.markUndoTransitions?.[transitionKeyFor(input.fieldKey, input.transactionId)]?.transitionId ?? null,
          reason: "scope-denied",
          detail: "mark groups do not correspond exactly to the recorded transaction",
        };
        return deliver(outcome);
      }
      for (const [mark, ids] of recordedByMark) {
        const received = receivedByMark.get(mark);
        if (received === undefined || received.length !== ids.length || !ids.every((id) => received.includes(id))) {
          const outcome: SessionMarkUndoOutcome = {
            status: "refused",
            requestId: input.requestId,
            duplicate: false,
            transitionId: store.markUndoTransitions?.[transitionKeyFor(input.fieldKey, input.transactionId)]?.transitionId ?? null,
            reason: "scope-denied",
            detail: "mark groups do not correspond exactly to the recorded transaction",
          };
          return deliver(outcome);
        }
      }
      const tKey = transitionKeyFor(input.fieldKey, input.transactionId);
      let slot = store.markUndoTransitions?.[tKey];
      if (slot === undefined) {
        slot = {
          transitionId: null,
          effective: [...receivedByMark.entries()].map(([mark, intentIds]) => ({
            mark,
            intentIds: [...intentIds],
          })),
        };
        if (store.markUndoTransitions !== undefined) store.markUndoTransitions[tKey] = slot;
      }
      if (input.expectedTransitionId !== slot.transitionId) {
        const outcome: SessionMarkUndoOutcome = {
          status: "refused",
          requestId: input.requestId,
          duplicate: false,
          transitionId: slot.transitionId,
          reason: "step-out-of-date",
          detail: "expected transition does not match the durable step transition",
        };
        return deliver(outcome);
      }
      const liveList = liveUnitsOf(ytext);
      const planned: Array<{
        mark: string;
        plan: Extract<ReturnType<typeof planMarkRevert>, { ok: true }>;
      }> = [];
      for (const group of slot.effective) {
        const plan = planMarkRevert(log, {
          fieldKey: input.fieldKey,
          mark: group.mark as InlineMarkKey,
          intentIds: group.intentIds,
          liveItems: liveList,
        });
        if (plan.ok === false) {
          const conflict = plan.conflict;
          const outcome: SessionMarkUndoOutcome = {
            status: "refused",
            requestId: input.requestId,
            duplicate: false,
            transitionId: slot.transitionId,
            reason: "mark-provenance-conflict",
            detail: conflict.detail,
            conflict: {
              kind: "mark-provenance-conflict",
              fieldKey: conflict.fieldKey,
              mark: conflict.mark,
              ...(conflict.paragraphId !== undefined ? { paragraphId: conflict.paragraphId } : {}),
              items: [...conflict.items],
              detail: conflict.detail,
            },
          };
          return deliver(outcome);
        }
        planned.push({ mark: group.mark, plan });
      }
      let restoredCount = 0;
      let keptLaterCount = 0;
      let satisfiedCount = 0;
      for (const { plan } of planned) {
        for (const decision of plan.decisions) {
          if (decision.action === "restore") restoredCount += 1;
          else if (decision.action === "kept-later") keptLaterCount += 1;
          else satisfiedCount += 1;
        }
      }
      if (restoredCount === 0) {
        const nextSeq = (store.markUndoTransitionSeq ?? 0) + 1;
        store.markUndoTransitionSeq = nextSeq;
        const transitionId = `markundo:trans:${input.fieldKey}:${input.transactionId}:${nextSeq}`;
        slot.transitionId = transitionId;
        // CL-4e fix 1: a no-op undo produces no restore intents, so the
        // transition chain carries no linkage forward — a later redo of
        // this step is a no-op too instead of re-planning over the
        // original intents (host §4.3: redo targets the undo's restores).
        slot.effective = [];
        const outcome: SessionMarkUndoOutcome = {
          status: "applied",
          requestId: input.requestId,
          duplicate: false,
          transitionId,
          changed: false,
          detail: `mark undo ${input.direction} recorded with no material change (kept-later ${keptLaterCount}, satisfied ${satisfiedCount})`,
        };
        return deliver(outcome);
      }
      const byMarkValue = new Map<
        string,
        { mark: string; value: true | string | null; units: Array<{ client: number; clock: number }>; range: unknown }
      >();
      const rangeByMark = new Map<string, unknown>();
      for (const intent of log) {
        if (intent.fieldKey !== input.fieldKey) continue;
        if (!rangeByMark.has(intent.mark)) rangeByMark.set(intent.mark, intent.range);
      }
      for (const { mark, plan } of planned) {
        const byValue = new Map<string, { value: true | string | null; units: Array<{ client: number; clock: number }> }>();
        for (const decision of plan.decisions) {
          if (decision.action !== "restore") continue;
          const valueKey = JSON.stringify(decision.value);
          let valueGroup = byValue.get(valueKey);
          if (valueGroup === undefined) {
            valueGroup = { value: decision.value, units: [] };
            byValue.set(valueKey, valueGroup);
          }
          valueGroup.units.push(decision.item);
        }
        for (const valueGroup of byValue.values()) {
          const key = `${mark}:${JSON.stringify(valueGroup.value)}`;
          byMarkValue.set(key, {
            mark,
            value: valueGroup.value,
            units: valueGroup.units,
            range: rangeByMark.get(mark) ?? { start: "anchor:a", end: "anchor:b" },
          });
        }
      }
      const revertOrigin = `revert:${actorId}`;
      const fieldDoc = ytext.doc as Y.Doc;
      const pendingDrafts: FormattingIntentDraft[] = [];
      void pendingDrafts;
      const newRestoreByMark = new Map<string, string[]>();
      const restoreDescriptors: Array<{
        mark: string;
        value: true | string | null;
        units: Array<{ client: number; clock: number }>;
        range: unknown;
        intentId: string;
      }> = [];
      let restoreIndex = 0;
      for (const { mark, value, units, range } of byMarkValue.values()) {
        const intentId = `markundo:restore:${input.commandTransactionId}:${mark}:${restoreIndex}`;
        restoreIndex += 1;
        restoreDescriptors.push({ mark, value, units, range, intentId });
        const list = newRestoreByMark.get(mark) ?? [];
        list.push(intentId);
        newRestoreByMark.set(mark, list);
      }
      slot.effective = [...newRestoreByMark.entries()].map(([mark, intentIds]) => ({
        mark,
        intentIds: [...intentIds],
      }));
      // The committed echo: the format transaction under the non-local
      // `revert:<actor>` origin plus its restore intents. In manual echo
      // mode the outcome returns first and the echo waits for `flushEcho`
      // (response-before-echo); otherwise it applies synchronously.
      const deliverEcho = (): void => {
        fieldDoc.transact(() => {
          for (const { mark, value, units } of byMarkValue.values()) {
            const indexes: number[] = [];
            for (const unit of units) {
              const at = linearIndexOfUnitIn(ytext, unit.client, unit.clock);
              if (at !== null) indexes.push(at);
            }
            indexes.sort((a, b) => a - b);
            let runStart: number | null = null;
            let runLength = 0;
            const runs: Array<{ start: number; length: number }> = [];
            for (const at of indexes) {
              if (runStart === null || at !== runStart + runLength) {
                if (runStart !== null) runs.push({ start: runStart, length: runLength });
                runStart = at;
                runLength = 1;
              } else {
                runLength += 1;
              }
            }
            if (runStart !== null) runs.push({ start: runStart, length: runLength });
            for (const run of runs) {
              ytext.format(run.start, run.length, { [mark]: value });
            }
          }
        }, revertOrigin);
        for (const { mark, value, units, range, intentId } of restoreDescriptors) {
          appendProvenanceDraft(store, {
            intentId,
            actorId,
            source: { kind: "human-transaction", transactionId: input.commandTransactionId },
            fieldKey: input.fieldKey,
            mark: mark as InlineMarkKey,
            value,
            range: range as never,
            items: units,
          });
        }
      };
      const nextSeq = (store.markUndoTransitionSeq ?? 0) + 1;
      store.markUndoTransitionSeq = nextSeq;
      const transitionId = `markundo:trans:${input.fieldKey}:${input.transactionId}:${nextSeq}`;
      slot.transitionId = transitionId;
      const outcome: SessionMarkUndoOutcome = {
        status: "applied",
        requestId: input.requestId,
        duplicate: false,
        transitionId,
        changed: true,
        detail: `mark undo ${input.direction} applied: restored ${restoredCount}, kept-later ${keptLaterCount}, satisfied ${satisfiedCount}`,
      };
      if (echoMode === "manual") {
        pendingEchoes.push(deliverEcho);
        return deliver(outcome);
      }
      deliverEcho();
      return deliver(outcome);
    },
    holdTransactionCommit(transactionId: string): void {
      uncommitted.add(transactionId);
    },
    releaseTransactionCommit(transactionId: string): void {
      uncommitted.delete(transactionId);
      const waiters = commitWaiters.get(transactionId) ?? [];
      commitWaiters.delete(transactionId);
      for (const resolve of waiters) resolve();
    },
    holdOutcomes(): void {
      outcomesHeld = true;
    },
    releaseOutcomes(): void {
      outcomesHeld = false;
      const waiters = outcomeWaiters.splice(0, outcomeWaiters.length);
      for (const resolve of waiters) resolve();
    },
    setEchoMode(mode: "auto" | "manual"): void {
      echoMode = mode;
    },
    flushEcho(): void {
      const queued = pendingEchoes.splice(0, pendingEchoes.length);
      for (const echo of queued) echo();
    },
    wrapSink(sink: { recordFormattingIntent(intent: unknown): void }): {
      recordFormattingIntent(intent: unknown): void;
    } {
      return {
        recordFormattingIntent(intent: unknown): void {
          try {
            const draft = intent as {
              intentId: string;
              actorId: string;
              source: { kind: string; transactionId?: string };
              fieldKey: string;
              mark: string;
              items: Array<{ client: number; clock: number }>;
            };
            // Index the draft itself (it appends to the log only when the
            // wrapped sink runs below).
            if (draft !== null && typeof draft === "object" && held.has(draft.fieldKey)) {
              noteEnvelopeIntent(draft);
            }
          } catch {
            // Envelope indexing never breaks recording.
          }
          sink.recordFormattingIntent(intent);
        },
      };
    },
  };
  return standIn;
}

