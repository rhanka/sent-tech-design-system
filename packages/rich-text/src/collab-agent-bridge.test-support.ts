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
import {
  createRelativePositionFromJSON,
  relativePositionToJSON,
} from "yjs";
import {
  MAX_READ_ANCHORS,
  MAX_READ_PARAGRAPHS,
  MAX_READ_SERIALIZED_BYTES,
  MAX_READ_TEXT_UNITS,
  validateAgentPatch,
  validateAgentReadRequest,
  validateCollaborationColor,
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
  AgentPatchReceipt,
  AgentReadRequest,
  AwarenessCursor,
  CollaborationActor,
  FieldBindingIdentity,
  PresenceSnapshot,
  RelativeAnchor,
} from "./collaboration.js";
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
/** Host-minted agent origin form (§5.1); the double mints it the same way. */
const agentOriginFor = (actorId: string): string => `agent:${actorId}`;

/** Injected receipt store (a plain object held by the test, so a later run can
    restart the bridge over the same store; durable semantics stay CL-4c). */
export interface AgentBridgeReceiptStore {
  receipts: Record<string, AgentPatchReceipt>;
  /** Patch JSON per full key (minimal retry record; RFC 8785 canonical payload
      hashing and `idempotency-key-reuse` semantics stay CL-4c, AMB-A6). */
  payloads: Record<string, string>;
  /** R-REV-2 affected-items record per full key (applied patches only; the
      record the CL-4c revert will consume). */
  records: Record<string, AgentAffectedItemsRecord>;
}

export function createAgentBridgeReceiptStore(): AgentBridgeReceiptStore {
  return { receipts: {}, payloads: {}, records: {} };
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
      (slice-exact length plus the offset into the host item, for CL-4c). */
  deletedItems: readonly {
    client: number;
    clock: number;
    offset: number;
    length: number;
    text: string;
    isHardBreak: boolean;
  }[];
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
  constructor(
    reason: NonNullable<AgentPatchReceipt["reason"]>,
    detail: string,
    operationIndex: number | null = null,
  ) {
    super(detail);
    this.name = "BridgeRefusal";
    this.reason = reason;
    this.operationIndex = operationIndex;
  }
}

// ── Bounded read helper (R-READ-1 seam; full pagination stays CL-4b) ──

/** Mint an anchor, binding the field end with `assoc < 0` (R-ANCH-2). */
function mintAt(ytext: Y.Text, index: number): RelativeAnchor {
  return index >= ytext.length
    ? mintEndOfFieldAnchor(ytext, ytext.length)
    : mintAnchorAt(ytext, index, 0);
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
        marks: attributesToMarks(run.marks, P0_FORMAT),
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
    a preserved block when the page is still empty. */
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
  } = options;
  const pageBudget = MAX_READ_SERIALIZED_BYTES - NEXT_PAGE_TOKEN_RESERVE;
  const skeleton = {
    revision: { documentId, stateVector: retainedVector, schemaEpoch },
    readToken,
    fields: [
      {
        fieldKey,
        paragraphs: [] as AgentParagraphState[],
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
    const { segments: fullSegments } = buildTextSegments(ytext, paragraph, runs, items);
    const kind = paragraph.kind === "horizontalRule" ? "horizontalRule" : "paragraph";
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
    ? encodePageToken({ v: 1, t: readToken, s: startIdx, e: endIdx, p: resume.para, g: resume.seg, h: resume.char })
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
      const deleted: Array<{ client: number; clock: number; offset: number; length: number; text: string; isHardBreak: boolean }> = [];
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
      if (
        operation.mark !== "bold" &&
        operation.mark !== "italic" &&
        operation.mark !== "code"
      ) {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: key is not admitted in P0 (§4.11)`, operationIndex);
      }
      if (typeof operation.applied !== "boolean") {
        throw new BridgeRefusal("incompatible-schema", `operation ${operationIndex} mark: boolean mark needs applied (§5.7)`, operationIndex);
      }
      // Span inheritance (R-ANCH-4): one format operation over the resolved
      // interval, so concurrent interior text takes the mark.
      const covered: AgentItemId[] = [];
      for (const item of items) {
        if (item.kind !== "text") continue;
        if (item.start >= high || item.end <= low) continue;
        covered.push({ client: item.client, clock: item.clock, length: item.length });
      }
      if (high > low) {
        ytext.format(low, high - low, { [operation.mark]: operation.applied ? true : null });
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
function survivingBaseText(ytext: Y.Text, baseSV: Map<number, number>): Map<string, number> {
  return baseTextByParagraph(ytext, baseSV);
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
    const receipt: AgentPatchReceipt = { key, status: "refused", reason, detail };
    options.store.receipts[fullKeyString(key)] = receipt;
    options.store.payloads[fullKeyString(key)] = JSON.stringify(patch);
    return receipt;
  }

  return {
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
      // Idempotent retry (CL-4a slice, AMB-A6): the same full key with the
      // identical payload returns the original receipt with `duplicate: true`
      // and applies nothing. Canonical hashing stays CL-4c.
      const stored = options.store.receipts[keyString];
      if (stored !== undefined) {
        if (options.store.payloads[keyString] === JSON.stringify(patch)) {
          return { ...stored, key: { ...stored.key }, duplicate: true };
        }
        return {
          key,
          status: "refused",
          reason: "idempotency-key-reuse",
          detail: "full key already holds a terminal receipt for another payload (CL-4c owns canonical hashing)",
        };
      }
      // (i) Shape/size check (§5.3.1; P0 profile for this sub-lot).
      const shaped = validateAgentPatch(patch, "p0");
      if (!shaped.ok) {
        const detail =
          shaped.operationIndex === undefined
            ? `shape/size check: ${shaped.detail}`
            : `shape/size check at operation ${shaped.operationIndex}: ${shaped.detail}`;
        return refuseReceipt(patch, shaped.reason, detail);
      }
      // (ii) Scope check (B-BRIDGE-3): binding and every operation's
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
      // (v) Resulting-state validation (§5.3.1, §4.11 P0 admitted table).
      try {
        validateFieldState(scratchText, scratchMeta, P0_FORMAT);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return refuseReceipt(patch, "incompatible-schema", `preflight resulting-schema: ${detail} (§4.11)`);
      }
      // (vi) Commit: the same operations on the authoritative field in one
      // transaction under origin `agent:<actorId>` (B-BRIDGE-1).
      const stateVectorBefore = toBase64Url(Y.encodeStateVector(authDoc));
      const operationResults: AgentOperationResult[] = [];
      const affected: AgentAffectedOperation[] = [];
      const commitTarget: ApplierTarget = {
        ytext: heldBinding.text,
        ydoc: authDoc,
        fieldKey: patch.binding.fieldKey,
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
      const receipt: AgentPatchReceipt = {
        key,
        status: "applied",
        stateVectorAfter: toBase64Url(Y.encodeStateVector(authDoc)),
        operationResults,
      };
      options.store.receipts[keyString] = receipt;
      options.store.payloads[keyString] = JSON.stringify(patch);
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
  };
}

