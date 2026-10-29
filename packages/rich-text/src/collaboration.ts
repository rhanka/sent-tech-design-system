// Pure collaboration model for live canvas editing (canvas-live CL-1M).
//
// This module is the shared seam for L0 presence/locks and L2 live editing.
// It carries types exactly as the collaboration specification writes them
// (spec `SPEC_EVOL_DS_CANVAS_LIVE_COLLAB.md` sections 5.6-5.7, 5.1-5.4,
// 4.3.2 and 6.2.1) plus pure helpers: expiry evaluation against an injected
// clock, colour validation, patch shape/size/bounds validation, read-request
// bounds validation and badge state derivation as pure data.
//
// Purity contract: no clock reads, no global state, no I/O. Every helper is
// a pure function of its arguments. In particular this module never reads a
// clock, never touches the network, never imports Yjs, ProseMirror, Tiptap,
// any framework or any DOM module. There is no structural-intent and no
// structural-revision type: split and merge are ordinary patch operations.

import type { RichTextMessages } from "./messages.js";
import type { RichTextReadiness, RichTextRepresentability } from "./model.js";

export type CollaborationActorKind = 'human' | 'agent' | 'nhi';
export interface CollaborationActor {
  actorId: string; kind: CollaborationActorKind;
  displayLabel: string; color: string;           // DS validates #RRGGBB else fallback
  activity?: { scopeRef: string; state: 'viewing'|'holding'|'planned'|'yielded'; since: string };
  /** Present iff the actor has published a caret (§5.6). Anchors, never offsets. */
  cursor?: AwarenessCursor;
}
export interface AwarenessCursor {
  fieldKey: string; paragraphId: string;
  anchor: RelativeAnchor; head: RelativeAnchor;  // anchor === head ⇒ collapsed caret
}
export interface CollaborationCapabilities {
  currentActorId: string; canAcquire: boolean; canRequestUnlock: boolean; canForceUnlock: boolean;
}
export interface LockUnitRef { scopeRef: string; unitRef?: string }
export interface LockSnapshot { unit: LockUnitRef; holder: CollaborationActor | null; expiresAt: string | null; unlockRequestedBy?: CollaborationActor | null }
export interface PresenceSnapshot {
  scopeRef: string;
  /** Co-viewers; current actor excluded by the host (B2 §5.1). */
  actors: readonly CollaborationActor[];
  /** Count including the current actor (B2 §5.1; restored in r2). */
  total: number;
}

// ── Binding identity (B2 correction). One document has many fields; a
// binding is unusable without all three coordinates. ──
export interface FieldBindingIdentity {
  documentId: string;      // host document identity (e.g. "canvas:<artifactId>")
  sessionId: string;       // host session record key for that document
  fieldKey: string;        // CanvasFieldDescriptor.key of the bound field
}
export interface LiveSessionHandle {
  readonly kind: 'live-session';
  /** The full binding identity this handle was opened for (M3: the
      handle itself carries it, including fieldKey). documentId and
      sessionId are read through identity, never as separate fields
      that could disagree with it. */
  readonly identity: FieldBindingIdentity;
  /** Release this field binding only (§5.7 lifetime rules). */
  dispose(): Promise<void>;
}

/** Opaque relative anchor. The pure DS contract never parses it.
    Host/editor encoding (the only places that parse it, §5.1.1): the
    JSON serialisation of a Yjs RelativePosition (yjs
    relativePositionToJSON / createRelativePositionFromJSON) created
    against the field's single Y.Text (its type name is
    "field:<fieldKey>"), carried as a string. An anchor is meaningful
    only together with its (binding identity, baseRevision) and the
    retained read revision that minted it (§5.6); the paragraph it
    pointed into at mint time is derived again at resolution time and
    may legitimately differ after a concurrent split or merge (§4.10). */
export type RelativeAnchor = string & { readonly __anchorBrand: unique symbol };

/** A revision of one document as observed by a read. stateVector is the
    base64url encoding of encodeStateVector(doc) at read time. */
export interface DocumentRevision {
  documentId: string;
  stateVector: string;
  schemaEpoch: string;
}

export interface AnchorRange { start: RelativeAnchor; end: RelativeAnchor }

export interface RichTextInlineMarks {
  bold?: true; italic?: true; code?: true; strike?: true; underline?: true;
  link?: string; linkTitle?: string;
}
export type InlineMarkKey = keyof RichTextInlineMarks;
export interface FullContainerMetadata {
  listKind: 'none' | 'bullet' | 'ordered';
  listDepth: number;
  listItemId?: string; listRunId?: string;
  orderedStart?: number; orderedType?: '1' | 'a' | 'A' | 'i' | 'I'; // source opener only
  listTight?: boolean; // source opener only; omitted on members/split tails
  blockquoteDepth: number;
  containerOrder: readonly ('quote' | 'list')[];
}
export type FullBlockMetadata = FullContainerMetadata & (
  | { blockKind: 'paragraph' }
  | { blockKind: 'heading'; headingLevel: 1 | 2 | 3 | 4 | 5 | 6 }
  | { blockKind: 'codeBlock'; codeLanguage: string | null }
  | { blockKind?: never } // wrapper metadata of an HR atom only
);

// The agent-edit vocabulary (§5.2–§5.3, §4.10). No numeric offset
// appears in any operation. paragraphId on text operations records the
// paragraph the range was read in (scope check + receipt reporting);
// the anchors address the operation (§5.2 R-ANCH-2). Every operation's
// fieldKey shall equal patch.binding.fieldKey.
export type AgentEditOperation =
  | { type: 'insert'; fieldKey: string; paragraphId: string; at: RelativeAnchor; text: string }
  | { type: 'insertHardBreak'; fieldKey: string; paragraphId: string; at: RelativeAnchor }
  | { type: 'delete'; fieldKey: string; paragraphId: string; range: AnchorRange }
  | { type: 'mark'; fieldKey: string; paragraphId: string; range: AnchorRange; mark: 'bold'|'italic'|'code'|'strike'|'underline'; applied: boolean }
  | { type: 'mark'; fieldKey: string; paragraphId: string; range: AnchorRange; mark: 'link'; href: string | null; title?: string | null }
  | { type: 'splitParagraph'; fieldKey: string; paragraphId: string; at: RelativeAnchor; newParagraphId: string }
  | { type: 'mergeWithPrevious'; fieldKey: string; paragraphId: string }
  | { type: 'setBlockMetadata'; fieldKey: string; paragraphId: string; metadata: FullBlockMetadata }
  | { type: 'insertHorizontalRule'; fieldKey: string; at: RelativeAnchor; newParagraphId: string }
  | { type: 'deleteHorizontalRule'; fieldKey: string; paragraphId: string; replacementParagraphId?: string };
/** Formatting provenance (§5.6 R-REV-3/R-REV-5). FormattingIntent is
    the session provenance record for one semantic mark application;
    MarkProvenanceConflict is the typed atomic refusal of a mark revert
    whose latest effective intent cannot be determined. Both are pure
    shapes; the log itself is host-side (§7.4). */
export interface FormattingIntent {
  seq: number;                           // host journal sequence
  intentId: string;
  actorId: string;
  source: { kind: 'agent-patch'; key: AgentPatchKey; operationIndex: number }
        | { kind: 'human-transaction'; transactionId: string };
  fieldKey: string;
  mark: InlineMarkKey;
  value: true | string | null;                    // true = boolean mark, string = href/title, null = removed
  range: AnchorRange;
  items: readonly { client: number; clock: number }[];
}
export interface MarkProvenanceConflict {
  kind: 'mark-provenance-conflict';
  key: AgentPatchKey;
  fieldKey: string;
  mark: InlineMarkKey;
  paragraphId?: string;
  items: readonly { client: number; clock: number }[];
  detail: string;
}
export interface AgentPatch {
  patchId: string;                       // idempotency key component (§5.4.1)
  binding: FieldBindingIdentity;         // document/session/field the patch targets
  actorId: string;
  sessionEpoch: string;                  // idempotency key component (§5.4.1)
  baseRevision: DocumentRevision;        // the read the anchors were minted at (§5.2)
  operations: readonly AgentEditOperation[];
}
/** Canonical per-operation outcome. For splitParagraph,
    resultParagraphIds is exactly [headParagraphId, tailParagraphId]
    as projected on the authoritative doc at commit time, where
    tailParagraphId is the paragraph opened by the inserted separator
    (when a concurrent separator interleaves at the same position, the
    tail is the paragraph that separator opens — the empty middle
    paragraph of §4.10 R-STR-2 — which is the canonical identity a
    caller needs to recognise the effect of its own split and to
    deduplicate same-anchor reasoning across receipts). For
    mergeWithPrevious it is [survivingParagraphId]; for text
    operations it is [paragraphId containing the resolved effect].
    Full setBlockMetadata and insertHorizontalRule return [target/new id];
    deleteHorizontalRule returns [] or [replacementParagraphId] when it
    removed the sole block and created the required empty paragraph. */
export interface AgentOperationResult {
  operationIndex: number;
  kind: AgentEditOperation['type'];
  resultParagraphIds: readonly string[];
}
export interface AgentPatchReceipt {
  /** The complete patch key (§5.6). Lookup and revert use this and
      no shorter form. */
  key: AgentPatchKey;
  status: 'applied' | 'refused';
  /** True only on an idempotent replay of the original receipt (§5.4.1). */
  duplicate?: boolean;
  /** True only for a transient rate-limited response, which is never
      durably stored (§5.3.1, §5.4.1). Absent on terminal receipts. */
  transient?: boolean;
  reason?: 'rate-limited'|'too-large'|'scope-denied'|'target-gone'|'structural-conflict'|'revoked'|'idempotency-key-reuse'|'incompatible-schema'|'mark-provenance-conflict';
  /** Present iff reason === 'mark-provenance-conflict' (§5.6 R-REV-5):
      the whole revert was refused atomically and the document is
      unchanged. */
  conflict?: MarkProvenanceConflict;
  retryAfterMs?: number;                 // present iff reason === 'rate-limited'
  stateVectorAfter?: string;
  /** Applied patches only: one entry per operation, in order. */
  operationResults?: readonly AgentOperationResult[];
  detail?: string;
}
export type AgentPatchResult = AgentPatchReceipt;

/** Authorised revert with durable linkage (B5: full key, durable inverses).
    Undoing an agent's edit is not done with a human's undo stack. Lookup
    and revert address a patch by its complete key and by nothing shorter. */
export interface AgentPatchKey {
  documentId: string; actorId: string;
  sessionEpoch: string; patchId: string;
}

export interface AgentReadRequest {
  binding: FieldBindingIdentity;         // document/session/field the read targets
  /** Field to read; defaults to binding.fieldKey. Must be in scope. */
  fieldKey?: string;
  /** Range selection. Omitted = from the field start. Anchors, when
      present, delimit by resolved position at the retained revision. */
  selector?: {
    startParagraphId?: string; endParagraphId?: string;
    startAnchor?: RelativeAnchor; endAnchor?: RelativeAnchor;
  };
  /** Additional anchor positions to mint inside the returned page
      (R-ANCH-2): at most 256 entries per request. */
  anchorRequests?: readonly { paragraphId: string; paragraphOffset: number }[];
  maxParagraphs?: number;              // caller may lower, never raise, the caps
  pageToken?: string;                  // from a previous page of the same read
  readToken?: string;                  // retained-revision token (below)
}
export type AgentInlineSegment =
  | { type: "text"; text: string;
      marks: RichTextInlineMarks;
      startAnchor: RelativeAnchor; endAnchor: RelativeAnchor }
  | { type: "hardBreak";
      anchorBefore: RelativeAnchor; anchorAfter: RelativeAnchor };
export interface AgentParagraphState {
  paragraphId: string;
  kind: "paragraph" | "horizontalRule" | "preserved";
  /** Full only: complete block/wrapper metadata, R-FULL-META-1. */
  metadata?: FullBlockMetadata;
  /** Concatenated text of the text segments (hard breaks excluded).
      Present for kind "paragraph"; empty string for an empty paragraph. */
  text?: string;
  /** Faithful inline structure in order: maximal text runs split at
      mark changes, with hard breaks as their own segments (§4.3
      R-LIN-4/R-LIN-5). An empty paragraph has zero segments. */
  segments?: readonly AgentInlineSegment[];
  preservedKind?: string;              // kind "preserved" only
  raw?: string;                        // kind "preserved" only, verbatim
  // HR has only identity, optional wrapper metadata and boundary anchors;
  // no text/segments and no generic text insert/mark/delete target.
  /** Paragraph boundary anchors (R-ANCH-2): an insert at startAnchor
      lands as the paragraph's first content; at endAnchor as its last.
      For an empty paragraph both resolve to the same linear index
      between its two delimiting separators, with associations that
      keep an insert inside the empty paragraph. */
  startAnchor: RelativeAnchor; endAnchor: RelativeAnchor;
}
export interface AgentFieldState {
  fieldKey: string;
  paragraphs: readonly AgentParagraphState[];
  /** Full only: referenced run-source records not already returned on
      their own paragraph in this page, keyed by stable listRunId.
      Includes still-referenced deleted openers; counts toward page bytes. */
  runMetadata?: Readonly<Record<string, FullBlockMetadata>>;
  /** Anchors minted for request.anchorRequests, in request order. */
  requestedAnchors?: readonly RelativeAnchor[];
  nextPageToken?: string;              // present iff the selection continues
}
export interface AgentDocumentState {
  revision: DocumentRevision;          // §5.2; anchors bind to this revision
  /** Opaque retained-read token: (binding, revision, host-retained
      snapshot handle, expiry). Present on every page. No structural
      revision exists in r3, so no baseStructuralRevision is returned
      or required anywhere (§4.10). */
  readToken: string;
  fields: readonly AgentFieldState[];
}

export interface CollaborationProvider {
  acquireLock(u: LockUnitRef): Promise<{ acquired: boolean; lock: LockSnapshot }>;
  refreshLock(u: LockUnitRef): Promise<LockSnapshot>;
  releaseLock(u: LockUnitRef): Promise<void>;
  requestUnlock(u: LockUnitRef): Promise<LockSnapshot>;
  acceptUnlock(u: LockUnitRef): Promise<LockSnapshot>;
  forceUnlock(u: LockUnitRef): Promise<void>;
  recordPresence(scopeRef: string): Promise<PresenceSnapshot>;
  leavePresence(scopeRef: string): Promise<void>;
  subscribeLock(u: LockUnitRef, cb: (s: LockSnapshot) => void): () => void;
  subscribePresence(scopeRef: string, cb: (s: PresenceSnapshot) => void): () => void;
  /** Open or join the live session for one field of one document.
      Carries the schema admission facts of §4.8.1. */
  openLiveSession?(input: {
    binding: Omit<FieldBindingIdentity, 'sessionId'> & { sessionId?: string };
    actor: CollaborationActor;
    profileId: string; schemaEpoch: string;
  }): Promise<LiveSessionHandle>;
  // AI co-editor surface (host bridge implements; DS renders the results):
  applyAgentPatch?(patch: AgentPatch): Promise<AgentPatchResult>;
  /** Bounded, paginated read minted against a retained revision (§5.6). */
  readAgentState?(request: AgentReadRequest): Promise<AgentDocumentState>;
  /** Receipt lookup by the complete patch key only (R-REV-1). */
  getPatchReceipt?(key: AgentPatchKey): Promise<AgentPatchReceipt | null>;
  readAwareness?(binding: FieldBindingIdentity): Promise<PresenceSnapshot>;
  publishAgentCursor?(input: {
    binding: FieldBindingIdentity; actorId: string;
    selection: { anchor: RelativeAnchor; head: RelativeAnchor } | null;
  }): Promise<void>;
  /** Revert by the complete patch key only (R-REV-1). No short-key form. */
  revertAgentPatch?(input: {
    key: AgentPatchKey; requestedBy: string; reason?: string;
  }): Promise<AgentPatchReceipt>;
}

// ── Controlled string / composer surface (§6.2.1). ──
// Host-valued string surface over the same RT-1 editor core (Svelte first).
// The handle is the composer analogue of RichTextEditorHandle: B1-L6 send
// safety is impossible without capture/readiness/representability, so a
// string-only callback is not a conforming surface.
export interface ComposerCaptureResult {
  /** Markdown string for the captured revision. */
  text: string;
  representability: RichTextRepresentability;
}
export interface ComposerEditorHandle {
  /** Deferred capture: resolves immediately when ready; during an IME
      composition it waits for the commit and resolves once with the
      committed text/representability; a capture pending at unmount
      rejects exactly once with RichTextCaptureUnavailable
      (IME-LOCK-1 clause 4, applied to this surface). */
  captureComposer(): Promise<ComposerCaptureResult>;
  readiness(): RichTextReadiness;      // { composing, ready } (model.ts)
}
export interface ComposerKeyEvent {
  key: string; code: string;
  shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean;
  /** Mirrors the native composition state at dispatch time and the
      surface readiness().composing fact; the host uses it to defer a
      send until the committed capture (B1-L6 witness (b)). */
  isComposing: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  readonly defaultPrevented: boolean;
}
export interface ComposerEditorProps {
  value: string;                       // Markdown string; host-owned
  profile?: "p0" | "full";           // default p0; sentropic selects full
  editable?: boolean; disabled?: boolean;
  messages: RichTextMessages;
  placeholder?: string;
  onChange?: (value: string) => void;  // string out; no document, no gesture
  onReadinessChange?: (e: RichTextReadiness) => void;
  /** Host keys (Enter/send, mention triggers) are forwarded, never consumed
      for sending by the DS. Returning true, or calling preventDefault()
      on the event, marks the key handled by the host: the DS then
      performs no default editing action for that key. The DS forwards
      keys during composition as well (flagged isComposing); it never
      suppresses forwarding to hide a composition from the host. */
  onKeyDown?: (e: ComposerKeyEvent) => boolean | void;
}

// ── Pure helpers. ──
// Every helper below is a pure function of its arguments: no clock reads,
// no global state, no I/O. Time is always an injected ISO-8601 value, so
// expiry and badge derivation stay deterministic under test.

/** Whole-patch bounds (§5.3.1, host-configurable only downward). */
export const MAX_PATCH_OPERATIONS = 50;
export const MAX_PATCH_INSERT_UNITS = 20000;
export const MAX_PATCH_SERIALIZED_BYTES = 256 * 1024;
/** Per-operation inserted code units (retained from r1). */
export const MAX_OPERATION_INSERT_UNITS = 2000;
/** Per-response read bounds (R-READ-1). */
export const MAX_READ_PARAGRAPHS = 100;
export const MAX_READ_TEXT_UNITS = 20000;
export const MAX_READ_ANCHORS = 512;
export const MAX_READ_SERIALIZED_BYTES = 256 * 1024;
/** At most 256 anchor requests per read request (R-READ-1). */
export const MAX_ANCHOR_REQUESTS = 256;
/** Full-profile value budgets (§4.3.2, R-FULL-OP-1). */
export const MAX_METADATA_BYTES = 8 * 1024;
export const MAX_ID_UNITS = 256;
export const MAX_LANGUAGE_UNITS = 128;
export const MAX_HREF_UNITS = 2048;
export const MAX_TITLE_UNITS = 1024;
export const MAX_LIST_QUOTE_DEPTH = 1999;
/** Caret/presence colour fallback (the caret extension rule, §5.1). */
export const COLLABORATION_FALLBACK_COLOR = "transparent";
const COLLABORATION_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** Validate an actor colour to `#RRGGBB`, else the fallback. Pure. */
export function validateCollaborationColor(color: string): string {
  return COLLABORATION_COLOR_PATTERN.test(color)
    ? color
    : COLLABORATION_FALLBACK_COLOR;
}

const ALLOWED_HREF_SCHEMES: ReadonlySet<string> = new Set([
  "http",
  "https",
  "mailto",
]);
const HREF_SCHEME_PATTERN = /^([A-Za-z][A-Za-z0-9+.-]*):/;

function hasDisallowedHrefChar(href: string): boolean {
  for (let index = 0; index < href.length; index += 1) {
    const code = href.charCodeAt(index);
    if (code <= 0x20 || (code >= 0x7f && code <= 0x9f) || code === 0x5c) {
      return true;
    }
  }
  return false;
}

/** One href validator (R-FULL-URL-1). Admit non-empty hrefs up to 2048
    UTF-16 units with an allowlisted scheme (`http`, `https`, `mailto`,
    case-insensitive) or a relative reference with no other scheme prefix.
    Reject controls, backslashes, leading/trailing whitespace and malformed
    URLs. Pure: the string is validated as given, after the caller decoded
    clipboard entities and tokenized the input. */
export function isAllowedHref(href: string): boolean {
  if (href.length === 0 || href.length > MAX_HREF_UNITS) {
    return false;
  }
  if (hasDisallowedHrefChar(href)) {
    return false;
  }
  let boundary = href.length;
  for (const separator of ["/", "?", "#"]) {
    const at = href.indexOf(separator);
    if (at !== -1 && at < boundary) {
      boundary = at;
    }
  }
  const scheme = HREF_SCHEME_PATTERN.exec(href.slice(0, boundary));
  if (scheme !== null) {
    return ALLOWED_HREF_SCHEMES.has(scheme[1].toLowerCase());
  }
  return true;
}

/** Byte length of a string as UTF-8, computed without any codec global. */
function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      index + 1 < text.length
    ) {
      const next = text.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/** Expiry evaluation against an injected clock. `nowIso` is the caller's
    current time as an ISO-8601 string in a single comparable calendar; a
    null expiry never expires. Pure string comparison: no clock is read. */
export function isLockExpired(
  lock: Pick<LockSnapshot, "expiresAt">,
  nowIso: string,
): boolean {
  return lock.expiresAt !== null && lock.expiresAt <= nowIso;
}

/** Build a presence snapshot from the full actor roster: `actors`
    excludes the current actor while `total` counts it (B2 §5.1). Pure. */
export function createPresenceSnapshot(input: {
  scopeRef: string;
  actors: readonly CollaborationActor[];
  currentActorId: string;
}): PresenceSnapshot {
  return {
    scopeRef: input.scopeRef,
    actors: input.actors.filter(
      (actor) => actor.actorId !== input.currentActorId,
    ),
    total: input.actors.length,
  };
}

export type PresenceBadgeRole = "holder" | "requester" | "admin" | "viewer";
export interface PresenceBadgeState {
  total: number;
  actors: readonly CollaborationActor[];
  /** False when no lock snapshot exists or the lock has expired. */
  lockActive: boolean;
  role: PresenceBadgeRole;
  canRequestUnlock: boolean;
}

/** Badge state derivation as pure data (§6.4): the holder, requester,
    admin and viewer states derive from the snapshots plus the injected
    capabilities (never from snapshots alone) and from expiry against the
    injected clock. An expired lock renders as no lock. Pure. */
export function derivePresenceBadgeState(input: {
  presence: PresenceSnapshot;
  lock: LockSnapshot | null;
  capabilities: CollaborationCapabilities;
  currentActorId: string;
  nowIso: string;
}): PresenceBadgeState {
  const lockActive =
    input.lock !== null && !isLockExpired(input.lock, input.nowIso);
  const holderId =
    lockActive && input.lock !== null
      ? (input.lock.holder?.actorId ?? null)
      : null;
  const requesterId =
    lockActive && input.lock !== null
      ? (input.lock.unlockRequestedBy?.actorId ?? null)
      : null;
  let role: PresenceBadgeRole = "viewer";
  if (holderId !== null && holderId === input.currentActorId) {
    role = "holder";
  } else if (requesterId !== null && requesterId === input.currentActorId) {
    role = "requester";
  } else if (input.capabilities.canForceUnlock) {
    role = "admin";
  }
  return {
    total: input.presence.total,
    actors: input.presence.actors,
    lockActive,
    role,
    canRequestUnlock:
      lockActive &&
      holderId !== null &&
      holderId !== input.currentActorId &&
      input.capabilities.canRequestUnlock,
  };
}

export type AgentPatchProfile = "p0" | "full";
export type PatchRefusalReason = "too-large" | "incompatible-schema" | "scope-denied";
export type PatchValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: PatchRefusalReason;
      detail: string;
      operationIndex?: number;
    };
export type ReadRequestValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "too-large" | "scope-denied" | "incompatible-schema";
      detail: string;
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isAnchorString(value: unknown): value is RelativeAnchor {
  return typeof value === "string" && value.length > 0;
}

function isSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value);
}

/** Inserted aggregate units one operation contributes to the 20 000-unit
    budget (and the 2 000-unit per-operation cap): inserted text units, one
    per inserted hard-break or separator embed, two for an HR pair, one
    for the replacement paragraph of a sole-block HR deletion. */
function insertedUnitsOf(operation: AgentEditOperation): number {
  switch (operation.type) {
    case "insert":
      return operation.text.length;
    case "insertHardBreak":
      return 1;
    case "splitParagraph":
      return 1;
    case "insertHorizontalRule":
      return 2;
    case "deleteHorizontalRule":
      return operation.replacementParagraphId !== undefined ? 1 : 0;
    default:
      return 0;
  }
}

const ADMITTED_METADATA_KEYS: ReadonlySet<string> = new Set([
  "blockKind",
  "headingLevel",
  "listKind",
  "listDepth",
  "listItemId",
  "listRunId",
  "orderedStart",
  "orderedType",
  "listTight",
  "blockquoteDepth",
  "containerOrder",
  "codeLanguage",
]);

function hasDisallowedControlChar(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }
  return false;
}

function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_UNITS
  );
}

/** Structural shape validation of one complete metadata record
    (R-FULL-META-1): known keys only, conditional attributes coherent,
    value shapes and the 8 KiB record budget. Run-source membership
    (source opener versus member) needs document state and is decided at
    bridge preflight, not here. Pure. */
export function validateFullBlockMetadata(
  record: unknown,
): PatchValidationResult {
  if (typeof record !== "object" || record === null || Array.isArray(record)) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata must be a complete record object",
    };
  }
  const entries = Object.entries(record);
  for (const [key] of entries) {
    if (!ADMITTED_METADATA_KEYS.has(key)) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: `metadata carries an unadmitted key: ${key}`,
      };
    }
  }
  const value = record as Record<string, unknown>;
  const blockKind = value["blockKind"];
  if (
    blockKind !== undefined &&
    blockKind !== "paragraph" &&
    blockKind !== "heading" &&
    blockKind !== "codeBlock"
  ) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata blockKind is not admitted",
    };
  }
  const headingLevel = value["headingLevel"];
  if (headingLevel !== undefined) {
    if (
      blockKind !== "heading" ||
      !isSafeInteger(headingLevel) ||
      headingLevel < 1 ||
      headingLevel > 6
    ) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata headingLevel requires blockKind heading and level 1..6",
      };
    }
  }
  const codeLanguage = value["codeLanguage"];
  if (codeLanguage !== undefined) {
    if (blockKind !== "codeBlock") {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata codeLanguage requires blockKind codeBlock",
      };
    }
    if (
      codeLanguage !== null &&
      (typeof codeLanguage !== "string" ||
        codeLanguage.length > MAX_LANGUAGE_UNITS ||
        hasDisallowedControlChar(codeLanguage))
    ) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata codeLanguage exceeds its budget or carries controls",
      };
    }
  }
  const listKind = value["listKind"];
  if (listKind !== "none" && listKind !== "bullet" && listKind !== "ordered") {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata listKind is not admitted",
    };
  }
  const listDepth = value["listDepth"];
  if (
    !isSafeInteger(listDepth) ||
    listDepth < 0 ||
    listDepth > MAX_LIST_QUOTE_DEPTH
  ) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata listDepth is out of range",
    };
  }
  const blockquoteDepth = value["blockquoteDepth"];
  if (
    !isSafeInteger(blockquoteDepth) ||
    blockquoteDepth < 0 ||
    blockquoteDepth > MAX_LIST_QUOTE_DEPTH
  ) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata blockquoteDepth is out of range",
    };
  }
  for (const key of ["listItemId", "listRunId"] as const) {
    if (value[key] !== undefined && !isValidId(value[key])) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: `metadata ${key} exceeds its budget`,
      };
    }
  }
  if (value["orderedStart"] !== undefined) {
    if (listKind !== "ordered" || !isSafeInteger(value["orderedStart"])) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata orderedStart requires an ordered run and a safe integer",
      };
    }
  }
  const orderedType = value["orderedType"];
  if (orderedType !== undefined) {
    if (
      listKind !== "ordered" ||
      (orderedType !== "1" &&
        orderedType !== "a" &&
        orderedType !== "A" &&
        orderedType !== "i" &&
        orderedType !== "I")
    ) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata orderedType requires an ordered run and an admitted marker",
      };
    }
  }
  if (value["listTight"] !== undefined && typeof value["listTight"] !== "boolean") {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata listTight must be a boolean",
    };
  }
  const containerOrder = value["containerOrder"];
  if (
    !Array.isArray(containerOrder) ||
    !containerOrder.every(
      (entry) => entry === "quote" || entry === "list",
    )
  ) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata containerOrder must list quote/list entries only",
    };
  }
  if (utf8ByteLength(JSON.stringify(record)) > MAX_METADATA_BYTES) {
    return {
      ok: false,
      reason: "too-large",
      detail: "metadata record exceeds 8 KiB",
    };
  }
  return { ok: true };
}

function refusePatch(
  reason: PatchRefusalReason,
  detail: string,
  operationIndex?: number,
): PatchValidationResult {
  return operationIndex === undefined
    ? { ok: false, reason, detail }
    : { ok: false, reason, detail, operationIndex };
}

function validateOperationShape(
  operation: AgentEditOperation,
  fieldKey: string,
  profile: AgentPatchProfile,
  operationIndex: number,
): PatchValidationResult {
  if (operation.fieldKey !== fieldKey) {
    return refusePatch(
      "scope-denied",
      "operation fieldKey must equal patch binding fieldKey",
      operationIndex,
    );
  }
  switch (operation.type) {
    case "insert": {
      if (!isNonEmptyString(operation.paragraphId) || !isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "insert needs paragraphId and at", operationIndex);
      }
      if (typeof operation.text !== "string") {
        return refusePatch("incompatible-schema", "insert text must be a string", operationIndex);
      }
      if (operation.text.includes("\n")) {
        return refusePatch(
          "incompatible-schema",
          "insert text must not contain raw LF",
          operationIndex,
        );
      }
      return { ok: true };
    }
    case "insertHardBreak": {
      if (!isNonEmptyString(operation.paragraphId) || !isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "insertHardBreak needs paragraphId and at", operationIndex);
      }
      return { ok: true };
    }
    case "delete": {
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "delete needs paragraphId", operationIndex);
      }
      if (!isAnchorString(operation.range?.start) || !isAnchorString(operation.range?.end)) {
        return refusePatch("incompatible-schema", "delete needs an anchor range", operationIndex);
      }
      return { ok: true };
    }
    case "mark": {
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "mark needs paragraphId", operationIndex);
      }
      if (!isAnchorString(operation.range?.start) || !isAnchorString(operation.range?.end)) {
        return refusePatch("incompatible-schema", "mark needs an anchor range", operationIndex);
      }
      if (
        operation.mark === "bold" ||
        operation.mark === "italic" ||
        operation.mark === "code"
      ) {
        if (typeof operation.applied !== "boolean") {
          return refusePatch("incompatible-schema", "boolean mark needs applied", operationIndex);
        }
        return { ok: true };
      }
      if (operation.mark === "strike" || operation.mark === "underline") {
        if (profile !== "full") {
          return refusePatch("incompatible-schema", "strike/underline are full-profile marks", operationIndex);
        }
        if (typeof operation.applied !== "boolean") {
          return refusePatch("incompatible-schema", "boolean mark needs applied", operationIndex);
        }
        return { ok: true };
      }
      if (operation.mark === "link") {
        if (profile !== "full") {
          return refusePatch("incompatible-schema", "link is a full-profile mark", operationIndex);
        }
        if (operation.href !== null) {
          if (typeof operation.href !== "string" || !isAllowedHref(operation.href)) {
            return refusePatch("incompatible-schema", "link href is not allowlisted", operationIndex);
          }
        }
        const title = operation.title;
        if (title !== undefined && title !== null) {
          if (typeof title !== "string") {
            return refusePatch("incompatible-schema", "link title must be plain text", operationIndex);
          }
          if (title.length > MAX_TITLE_UNITS) {
            return refusePatch("too-large", "link title exceeds 1024 units", operationIndex);
          }
        }
        return { ok: true };
      }
      return refusePatch("incompatible-schema", "mark key is not admitted", operationIndex);
    }
    case "splitParagraph": {
      if (!isNonEmptyString(operation.paragraphId) || !isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "splitParagraph needs paragraphId and at", operationIndex);
      }
      if (!isValidId(operation.newParagraphId)) {
        return refusePatch("incompatible-schema", "splitParagraph newParagraphId exceeds its budget", operationIndex);
      }
      return { ok: true };
    }
    case "mergeWithPrevious": {
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "mergeWithPrevious needs paragraphId", operationIndex);
      }
      return { ok: true };
    }
    case "setBlockMetadata": {
      if (profile !== "full") {
        return refusePatch("incompatible-schema", "setBlockMetadata is a full-profile operation", operationIndex);
      }
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "setBlockMetadata needs paragraphId", operationIndex);
      }
      const metadata = validateFullBlockMetadata(operation.metadata);
      if (!metadata.ok) {
        return { ...metadata, operationIndex };
      }
      return { ok: true };
    }
    case "insertHorizontalRule": {
      if (profile !== "full") {
        return refusePatch("incompatible-schema", "insertHorizontalRule is a full-profile operation", operationIndex);
      }
      if (!isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "insertHorizontalRule needs at", operationIndex);
      }
      if (!isValidId(operation.newParagraphId)) {
        return refusePatch("incompatible-schema", "insertHorizontalRule newParagraphId exceeds its budget", operationIndex);
      }
      return { ok: true };
    }
    case "deleteHorizontalRule": {
      if (profile !== "full") {
        return refusePatch("incompatible-schema", "deleteHorizontalRule is a full-profile operation", operationIndex);
      }
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "deleteHorizontalRule needs paragraphId", operationIndex);
      }
      if (
        operation.replacementParagraphId !== undefined &&
        !isValidId(operation.replacementParagraphId)
      ) {
        return refusePatch("incompatible-schema", "deleteHorizontalRule replacementParagraphId exceeds its budget", operationIndex);
      }
      return { ok: true };
    }
    default: {
      return refusePatch("incompatible-schema", "operation type is not admitted", operationIndex);
    }
  }
}

/** Patch shape/size/bounds validator (§5.3.1, R-FULL-OP-1): at most 50
    operations, at most 20 000 aggregate inserted units, at most 2 000
    inserted units per operation, at most 256 KiB serialised patch size,
    full-profile operation families and the href allowlist included. Use
    `too-large` for a size bound and `incompatible-schema` for invalid
    full shapes or an unsafe href. Counting over live state and the token
    bucket stay host-side; this pure check covers shape and size. Pure. */
export function validateAgentPatch(
  patch: AgentPatch,
  profile: AgentPatchProfile = "full",
): PatchValidationResult {
  if (
    !isNonEmptyString(patch.binding?.documentId) ||
    !isNonEmptyString(patch.binding?.sessionId) ||
    !isNonEmptyString(patch.binding?.fieldKey)
  ) {
    return refusePatch("incompatible-schema", "patch binding must carry documentId, sessionId and fieldKey");
  }
  if (
    !isNonEmptyString(patch.patchId) ||
    !isNonEmptyString(patch.actorId) ||
    !isNonEmptyString(patch.sessionEpoch)
  ) {
    return refusePatch("incompatible-schema", "patch must carry patchId, actorId and sessionEpoch");
  }
  if (
    !isNonEmptyString(patch.baseRevision?.documentId) ||
    typeof patch.baseRevision?.stateVector !== "string" ||
    typeof patch.baseRevision?.schemaEpoch !== "string"
  ) {
    return refusePatch("incompatible-schema", "patch baseRevision must carry documentId, stateVector and schemaEpoch");
  }
  if (!Array.isArray(patch.operations)) {
    return refusePatch("incompatible-schema", "patch operations must be an array");
  }
  if (patch.operations.length > MAX_PATCH_OPERATIONS) {
    return refusePatch(
      "too-large",
      `patch carries more than ${MAX_PATCH_OPERATIONS} operations`,
    );
  }
  let aggregateUnits = 0;
  for (let index = 0; index < patch.operations.length; index += 1) {
    const operation = patch.operations[index];
    const shape = validateOperationShape(
      operation,
      patch.binding.fieldKey,
      profile,
      index,
    );
    if (!shape.ok) {
      return shape;
    }
    const units = insertedUnitsOf(operation);
    if (units > MAX_OPERATION_INSERT_UNITS) {
      return refusePatch(
        "too-large",
        `operation exceeds ${MAX_OPERATION_INSERT_UNITS} inserted units`,
        index,
      );
    }
    aggregateUnits += units;
  }
  if (aggregateUnits > MAX_PATCH_INSERT_UNITS) {
    return refusePatch(
      "too-large",
      `patch exceeds ${MAX_PATCH_INSERT_UNITS} aggregate inserted units`,
    );
  }
  if (utf8ByteLength(JSON.stringify(patch)) > MAX_PATCH_SERIALIZED_BYTES) {
    return refusePatch("too-large", "patch exceeds 256 KiB serialised size");
  }
  return { ok: true };
}

/** Read-request bounds validator (R-READ-1): a caller may lower the
    paragraph cap, never raise it; at most 256 anchor requests per
    request. A request demanding more than a cap in a single response is
    refused whole as `too-large`. Pure. */
export function validateAgentReadRequest(
  request: AgentReadRequest,
): ReadRequestValidationResult {
  if (
    !isNonEmptyString(request.binding?.documentId) ||
    !isNonEmptyString(request.binding?.sessionId) ||
    !isNonEmptyString(request.binding?.fieldKey)
  ) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "read binding must carry documentId, sessionId and fieldKey",
    };
  }
  if (
    request.fieldKey !== undefined &&
    request.fieldKey !== request.binding.fieldKey
  ) {
    return {
      ok: false,
      reason: "scope-denied",
      detail: "read fieldKey must equal the binding fieldKey",
    };
  }
  if (
    request.maxParagraphs !== undefined &&
    request.maxParagraphs > MAX_READ_PARAGRAPHS
  ) {
    return {
      ok: false,
      reason: "too-large",
      detail: `read maxParagraphs exceeds ${MAX_READ_PARAGRAPHS}`,
    };
  }
  if (
    request.anchorRequests !== undefined &&
    request.anchorRequests.length > MAX_ANCHOR_REQUESTS
  ) {
    return {
      ok: false,
      reason: "too-large",
      detail: `read carries more than ${MAX_ANCHOR_REQUESTS} anchor requests`,
    };
  }
  if (request.anchorRequests !== undefined) {
    for (const entry of request.anchorRequests) {
      if (
        !isNonEmptyString(entry?.paragraphId) ||
        !isSafeInteger(entry?.paragraphOffset) ||
        entry.paragraphOffset < 0
      ) {
        return {
          ok: false,
          reason: "incompatible-schema",
          detail: "anchor requests need paragraphId and a non-negative paragraphOffset",
        };
      }
    }
  }
  return { ok: true };
}

