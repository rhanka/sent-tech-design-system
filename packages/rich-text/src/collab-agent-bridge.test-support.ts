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
import { validateAgentPatch, validateAgentReadRequest } from "./collaboration.js";
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
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
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

/** Build one in-caps page for a small witness field (§5.6 R-READ-3 shapes). */
function buildAgentState(
  ytext: Y.Text,
  fieldMeta: Y.Map<unknown>,
  ydoc: Y.Doc,
  documentId: string,
  fieldKey: string,
  schemaEpoch: string,
  readToken: string,
  anchorRequests: readonly { paragraphId: string; paragraphOffset: number }[] | undefined,
): AgentDocumentState {
  const items = walkVisibleItems(ytext);
  const fieldLength = ytext.length;
  const paragraphs = scanParagraphs(items, fieldLength);
  if (paragraphs.length > 100) {
    throw new AgentBridgeReadRefusal("too-large", "field exceeds one page (CL-4b owns pagination)");
  }
  const delta = ytext.toDelta() as DeltaOp[];
  interface Run {
    start: number;
    end: number;
    text: string;
    marks: Record<string, unknown>;
  }
  const runs: Run[] = [];
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
  const states: AgentParagraphState[] = [];
  let anchorCount = 0;
  for (const paragraph of paragraphs) {
    if (paragraph.kind === "preserved") {
      const rawItem = items.find(
        (item) => item.kind === "preserved" && item.start >= paragraph.contentStart && item.start < paragraph.contentEnd,
      );
      void rawItem;
      const preserved = capturePreservedRaw(ytext, paragraph);
      states.push({
        paragraphId: paragraph.paragraphId,
        kind: "preserved",
        preservedKind: paragraphPreservedKind(items, paragraph),
        raw: preserved,
        startAnchor: mintAt(ytext, paragraph.contentStart),
        endAnchor: mintAt(ytext, paragraph.contentEnd),
      });
      anchorCount += 2;
      continue;
    }
    const ordered: Array<{ position: number; segment: AgentInlineSegment }> = [];
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
        segment: {
          type: "text",
          text: slice,
          marks: attributesToMarks(run.marks, P0_FORMAT),
          startAnchor: mintAt(ytext, sliceStart),
          endAnchor: mintAt(ytext, sliceStart + slice.length),
        },
      });
      anchorCount += 2;
    }
    for (const item of items) {
      if (item.kind !== "hardBreak") continue;
      if (item.start < paragraph.contentStart || item.start >= paragraph.contentEnd) continue;
      ordered.push({
        position: item.start,
        segment: {
          type: "hardBreak",
          anchorBefore: mintAt(ytext, item.start),
          anchorAfter: mintAt(ytext, item.start + 1),
        },
      });
      anchorCount += 2;
    }
    ordered.sort((left, right) => left.position - right.position);
    states.push({
      paragraphId: paragraph.paragraphId,
      kind: "paragraph",
      text,
      segments: ordered.map((entry) => entry.segment),
      startAnchor: mintAt(ytext, paragraph.contentStart),
      endAnchor: mintAt(ytext, paragraph.contentEnd),
    });
    anchorCount += 2;
  }
  const requestedAnchors: RelativeAnchor[] = [];
  for (const request of anchorRequests ?? []) {
    const paragraph = paragraphs.find((entry) => entry.paragraphId === request.paragraphId);
    if (paragraph === undefined) {
      throw new AgentBridgeReadRefusal("target-gone", `anchor request names an unknown paragraph: ${request.paragraphId}`);
    }
    const linear = Math.min(paragraph.contentStart + request.paragraphOffset, paragraph.contentEnd);
    requestedAnchors.push(mintAt(ytext, linear));
    anchorCount += 1;
  }
  if (anchorCount > 512) {
    throw new AgentBridgeReadRefusal("too-large", "page exceeds 512 anchors");
  }
  void fieldMeta;
  return {
    revision: {
      documentId,
      stateVector: toBase64Url(Y.encodeStateVector(ydoc)),
      schemaEpoch,
    },
    readToken,
    fields: [
      {
        fieldKey,
        paragraphs: states,
        ...(requestedAnchors.length > 0 ? { requestedAnchors } : {}),
      } satisfies AgentFieldState,
    ],
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
}

export interface AgentBridgeDouble {
  /** Bounded read minting anchors against the current state (§5.6 seam). */
  readState(request: AgentReadRequest): AgentDocumentState;
  /** Full §5.3.1 pipeline; headless (no editor mounted), one transaction. */
  applyPatch(patch: AgentPatch): Promise<AgentPatchReceipt>;
  /** Receipt lookup by the complete patch key only (R-REV-1). */
  getReceipt(key: AgentPatchKey): AgentPatchReceipt | null;
}

interface HeldField {
  fieldKey: string;
  text: Y.Text;
  fieldMeta: Y.Map<unknown>;
}

export function createAgentBridgeDouble(options: AgentBridgeDoubleOptions): AgentBridgeDouble {
  const schemaEpoch = options.schemaEpoch ?? "test:schema-epoch:1";
  const admittedFields = new Set(options.fieldKeys);
  const admittedFamilies = new Set<string>(options.families);
  const held = new Map<string, HeldField>();
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
    held.set(fieldKey, { fieldKey, text: binding.text, fieldMeta: binding.fieldMeta });
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
  let readSeq = 0;
  const retained = new Map<string, string>();

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
      const heldBinding = heldField(fieldKey);
      readSeq += 1;
      const readToken = `read-token:${readSeq}`;
      const state = buildAgentState(
        heldBinding.text,
        heldBinding.fieldMeta,
        authDoc,
        options.documentId,
        fieldKey,
        schemaEpoch,
        readToken,
        request.anchorRequests as readonly { paragraphId: string; paragraphOffset: number }[] | undefined,
      );
      retained.set(readToken, state.revision.stateVector);
      return state;
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

