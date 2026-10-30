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
/** Any Unicode whitespace anywhere (covers leading/trailing ASCII and
    Unicode spaces such as U+00A0 before scheme detection). */
const HREF_WHITESPACE_PATTERN = /\s/;
const HREF_PORT_PATTERN = /^\d*$/;
const HREF_HEX_GROUP_PATTERN = /^[0-9A-Fa-f]{1,4}$/;
const HREF_IPV_FUTURE_PATTERN = /^[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:.]+$/;

function hasDisallowedHrefChar(href: string): boolean {
  for (let index = 0; index < href.length; index += 1) {
    const code = href.charCodeAt(index);
    if (code <= 0x20 || (code >= 0x7f && code <= 0x9f) || code === 0x5c) {
      return true;
    }
  }
  return false;
}

/** Split text at the first "#" then the first "?" into the part before
    either marker plus the query and fragment bodies. */
function splitHierQueryFragment(text: string): {
  hier: string;
  query: string;
  fragment: string;
} {
  let hier = text;
  let fragment = "";
  const hash = hier.indexOf("#");
  if (hash !== -1) {
    fragment = hier.slice(hash + 1);
    hier = hier.slice(0, hash);
  }
  let query = "";
  const mark = hier.indexOf("?");
  if (mark !== -1) {
    query = hier.slice(mark + 1);
    hier = hier.slice(0, mark);
  }
  return { hier, query, fragment };
}

/** One path segment: a "%" starts a pct-encoded run of exactly two hex
    digits and every other unit is pchar, without ":" for a
    path-noscheme opener. */
function isValidSegment(text: string, allowColon: boolean): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index] as string;
    if (value === "%") {
      if (
        index + 2 >= text.length ||
        !isHexDigitChar(text[index + 1] as string) ||
        !isHexDigitChar(text[index + 2] as string)
      ) {
        return false;
      }
      index += 2;
    } else if (value === ":") {
      if (!allowColon) {
        return false;
      }
    } else if (
      !isUnreservedChar(value) &&
      !isSubDelimChar(value) &&
      value !== "@"
    ) {
      return false;
    }
  }
  return true;
}

/** Path-abempty per RFC 3986: empty or a run of "/" segments. */
function isValidPathAbempty(text: string): boolean {
  if (text === "") {
    return true;
  }
  if (!text.startsWith("/")) {
    return false;
  }
  const segments = text.split("/");
  for (let index = 1; index < segments.length; index += 1) {
    if (!isValidSegment(segments[index] as string, true)) {
      return false;
    }
  }
  return true;
}

/** Path-absolute per RFC 3986: "/" plus an optional segment-nz tail. */
function isValidPathAbsolute(text: string): boolean {
  if (!text.startsWith("/")) {
    return false;
  }
  if (text === "/") {
    return true;
  }
  const segments = text.slice(1).split("/");
  if (segments[0] === "") {
    return false;
  }
  for (const segment of segments) {
    if (!isValidSegment(segment, true)) {
      return false;
    }
  }
  return true;
}

/** Shared tail for path-noscheme and path-rootless: a non-empty opener
    plus *( "/" segment ). The noscheme opener refuses ":". */
function isValidRootlessTail(
  segments: readonly string[],
  allowColon: boolean,
): boolean {
  if (segments.length === 0) {
    return false;
  }
  const opener = segments[0] as string;
  if (opener === "" || !isValidSegment(opener, allowColon)) {
    return false;
  }
  for (let index = 1; index < segments.length; index += 1) {
    if (!isValidSegment(segments[index] as string, true)) {
      return false;
    }
  }
  return true;
}

/** Path-noscheme per RFC 3986: segment-nz-nc *( "/" segment ). */
function isValidPathNoscheme(text: string): boolean {
  if (text === "") {
    return false;
  }
  return isValidRootlessTail(text.split("/"), false);
}

/** Path-rootless per RFC 3986: segment-nz *( "/" segment ). */
function isValidPathRootless(text: string): boolean {
  if (text === "") {
    return false;
  }
  return isValidRootlessTail(text.split("/"), true);
}

/** Query and fragment per RFC 3986: *( pchar / "/" / "?" ) with
    pct-encoded runs of exactly two hex digits. */
function isValidQueryOrFragment(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index] as string;
    if (value === "%") {
      if (
        index + 2 >= text.length ||
        !isHexDigitChar(text[index + 1] as string) ||
        !isHexDigitChar(text[index + 2] as string)
      ) {
        return false;
      }
      index += 2;
    } else if (
      value !== "/" &&
      value !== "?" &&
      !isUnreservedChar(value) &&
      !isSubDelimChar(value) &&
      value !== ":" &&
      value !== "@"
    ) {
      return false;
    }
  }
  return true;
}

function isHexDigitChar(value: string): boolean {
  return (
    (value >= "0" && value <= "9") ||
    (value >= "a" && value <= "f") ||
    (value >= "A" && value <= "F")
  );
}

function isUnreservedChar(value: string): boolean {
  return (
    (value >= "a" && value <= "z") ||
    (value >= "A" && value <= "Z") ||
    (value >= "0" && value <= "9") ||
    value === "-" ||
    value === "." ||
    value === "_" ||
    value === "~"
  );
}

function isSubDelimChar(value: string): boolean {
  return (
    value === "!" ||
    value === "$" ||
    value === "&" ||
    value === "'" ||
    value === "(" ||
    value === ")" ||
    value === "*" ||
    value === "+" ||
    value === "," ||
    value === ";" ||
    value === "="
  );
}

/** Userinfo per RFC 3986: *( unreserved / pct-encoded / sub-delims / ":" ). */
function isValidUserinfo(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index] as string;
    if (value === "%") {
      if (
        index + 2 >= text.length ||
        !isHexDigitChar(text[index + 1] as string) ||
        !isHexDigitChar(text[index + 2] as string)
      ) {
        return false;
      }
      index += 2;
    } else if (
      !isUnreservedChar(value) &&
      !isSubDelimChar(value) &&
      value !== ":"
    ) {
      return false;
    }
  }
  return true;
}

/** Registered name per RFC 3986: *( unreserved / pct-encoded / sub-delims ). */
function isValidRegName(text: string): boolean {
  if (text.length === 0) {
    return false;
  }
  for (let index = 0; index < text.length; index += 1) {
    const value = text[index] as string;
    if (value === "%") {
      if (
        index + 2 >= text.length ||
        !isHexDigitChar(text[index + 1] as string) ||
        !isHexDigitChar(text[index + 2] as string)
      ) {
        return false;
      }
      index += 2;
    } else if (!isUnreservedChar(value) && !isSubDelimChar(value)) {
      return false;
    }
  }
  return true;
}

/** Dec-octet per RFC 3986: 0-255 with no leading zero on multi-digit octets. */
function isValidDecOctet(part: string): boolean {
  if (part.length === 0 || part.length > 3) {
    return false;
  }
  for (const value of part) {
    if (value < "0" || value > "9") {
      return false;
    }
  }
  if (part.length > 1 && part.startsWith("0")) {
    return false;
  }
  return Number(part) <= 255;
}

function isValidIPv4Address(text: string): boolean {
  const parts = text.split(".");
  if (parts.length !== 4) {
    return false;
  }
  for (const part of parts) {
    if (!isValidDecOctet(part)) {
      return false;
    }
  }
  return true;
}

function isValidIPv6Groups(groups: readonly string[]): boolean {
  for (const group of groups) {
    if (!HREF_HEX_GROUP_PATTERN.test(group)) {
      return false;
    }
  }
  return true;
}

/** IPv6 address per RFC 3986 Appendix A: all nine ABNF forms with ls32.
    A compressed address with an IPv4 tail (ls32 counts as two groups)
    carries at most five hexadecimal groups, since "::" compresses at
    least one group of an eight-group address. */
function isValidIPv6Address(address: string): boolean {
  if (address.length === 0) {
    return false;
  }
  const compressed = address.split("::");
  if (compressed.length > 2) {
    return false;
  }
  if (compressed.length === 2) {
    const headText = compressed[0] as string;
    const tailText = compressed[1] as string;
    const headGroups = headText === "" ? [] : headText.split(":");
    const tailGroups = tailText === "" ? [] : tailText.split(":");
    for (const group of headGroups) {
      if (group.includes(".") || group.length === 0) {
        return false;
      }
    }
    const tailLast = tailGroups[tailGroups.length - 1];
    const tailHead =
      tailLast !== undefined && tailLast.includes(".")
        ? tailGroups.slice(0, -1)
        : tailGroups;
    for (const group of tailHead) {
      if (group.includes(".") || group.length === 0) {
        return false;
      }
    }
    if (tailLast !== undefined && tailLast.includes(".")) {
      if (tailLast.length === 0 || !isValidIPv4Address(tailLast)) {
        return false;
      }
      const hexGroups = [...headGroups, ...tailHead];
      if (!isValidIPv6Groups(hexGroups)) {
        return false;
      }
      return hexGroups.length <= 5;
    }
    if (tailLast !== undefined && tailLast.length === 0) {
      return false;
    }
    if (!isValidIPv6Groups([...headGroups, ...tailGroups])) {
      return false;
    }
    return headGroups.length + tailGroups.length <= 7;
  }
  const groups = address.split(":");
  const last = groups[groups.length - 1] as string;
  if (last.includes(".")) {
    if (!isValidIPv4Address(last)) {
      return false;
    }
    const hexGroups = groups.slice(0, -1);
    if (hexGroups.length !== 6) {
      return false;
    }
    return isValidIPv6Groups(hexGroups);
  }
  if (groups.length !== 8) {
    return false;
  }
  return isValidIPv6Groups(groups);
}

/** Authority check for `http(s)` authorities and `//` network references
    per RFC 3986: `[ userinfo "@" ] host [ ":" port ]` where host is an
    IP-literal (`"[" IPv6 / IPvFuture "]"`), an IPv4 address or a
    registered name, and port is entirely numeric. */
function isValidHrefAuthority(authority: string): boolean {
  if (authority.length === 0) {
    return false;
  }
  if (HREF_WHITESPACE_PATTERN.test(authority)) {
    return false;
  }
  let hostport = authority;
  const at = authority.lastIndexOf("@");
  if (at !== -1) {
    if (!isValidUserinfo(authority.slice(0, at))) {
      return false;
    }
    hostport = authority.slice(at + 1);
    if (hostport.length === 0) {
      return false;
    }
  }
  if (hostport.startsWith("[")) {
    const close = hostport.indexOf("]");
    if (close === -1) {
      return false;
    }
    const literal = hostport.slice(1, close);
    const rest = hostport.slice(close + 1);
    if (rest.length > 0) {
      if (!rest.startsWith(":")) {
        return false;
      }
      if (!HREF_PORT_PATTERN.test(rest.slice(1))) {
        return false;
      }
    }
    if (literal.length === 0) {
      return false;
    }
    if (literal[0] === "v" || literal[0] === "V") {
      return HREF_IPV_FUTURE_PATTERN.test(literal);
    }
    return isValidIPv6Address(literal);
  }
  if (hostport.includes("[") || hostport.includes("]")) {
    return false;
  }
  const colon = hostport.indexOf(":");
  if (colon !== -1) {
    if (hostport.indexOf(":", colon + 1) !== -1) {
      return false;
    }
    if (!HREF_PORT_PATTERN.test(hostport.slice(colon + 1))) {
      return false;
    }
    return isValidRegName(hostport.slice(0, colon));
  }
  return isValidRegName(hostport);
}

/** Authority plus path-abempty for the "//" form: a non-empty authority
    per RFC 3986 (`userinfo`, IP-literal / IPv4address / reg-name host,
    numeric port) followed by a path-abempty tail. */
function isValidAuthorityAndPath(text: string): boolean {
  const slash = text.indexOf("/");
  const authority = slash === -1 ? text : text.slice(0, slash);
  const path = slash === -1 ? "" : text.slice(slash);
  return isValidHrefAuthority(authority) && isValidPathAbempty(path);
}

/** One href validator (R-FULL-URL-1). Admit non-empty hrefs up to 2048
    UTF-16 units as either an absolute URI with an allowlisted scheme
    (`http`, `https`, `mailto`, case-insensitive) or a relative reference,
    checked against the RFC 3986 Appendix A ABNF for `URI-reference` with
    no whitespace anywhere. Required productions: `scheme`, `hier-part`
    and `relative-part` ("//" authority with `path-abempty`,
    `path-absolute`, `path-noscheme` for relative references so a first
    segment carrying ":" refuses, `path-rootless` for mailto,
    `path-empty`), `authority` (`userinfo`, `host` as IP-literal /
    IPv4address / reg-name, `port` as digits), IP-literal (IPv6address in
    all nine ABNF forms with ls32, IPvFuture), IPv4address with dec-octet
    (no leading zero on multi-digit octets, 0-255), pct-encoded (exactly
    two hex digits), `query` and `fragment`. The `http` and `https`
    schemes additionally require a non-empty host. Pure: manual string
    scan only, no DOM and no global URL dependency, so the check does not
    vary across runtimes. The string is validated as given, after the
    caller decoded clipboard entities and tokenized the input. */
export function isAllowedHref(href: string): boolean {
  if (href.length === 0 || href.length > MAX_HREF_UNITS) {
    return false;
  }
  if (hasDisallowedHrefChar(href)) {
    return false;
  }
  if (HREF_WHITESPACE_PATTERN.test(href)) {
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
    const name = scheme[1].toLowerCase();
    if (!ALLOWED_HREF_SCHEMES.has(name)) {
      return false;
    }
    const parts = splitHierQueryFragment(href.slice(scheme[0].length));
    if (
      !isValidQueryOrFragment(parts.query) ||
      !isValidQueryOrFragment(parts.fragment)
    ) {
      return false;
    }
    if (name === "mailto") {
      return parts.hier === "" || isValidPathRootless(parts.hier);
    }
    if (!parts.hier.startsWith("//")) {
      return false;
    }
    return isValidAuthorityAndPath(parts.hier.slice(2));
  }
  if (href.startsWith("//")) {
    const parts = splitHierQueryFragment(href.slice(2));
    if (
      !isValidQueryOrFragment(parts.query) ||
      !isValidQueryOrFragment(parts.fragment)
    ) {
      return false;
    }
    return isValidAuthorityAndPath(parts.hier);
  }
  const parts = splitHierQueryFragment(href);
  if (
    !isValidQueryOrFragment(parts.query) ||
    !isValidQueryOrFragment(parts.fragment)
  ) {
    return false;
  }
  if (parts.hier === "") {
    return true;
  }
  if (parts.hier.startsWith("/")) {
    return isValidPathAbsolute(parts.hier);
  }
  return isValidPathNoscheme(parts.hier);
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

const ISO_INSTANT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:[.,](\d+))?(Z|[+-]\d{2}:?\d{2}|[+-]\d{2})?$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (
    month === 4 ||
    month === 6 ||
    month === 9 ||
    month === 11
  ) {
    return 30;
  }
  return 31;
}

/** Days since 1970-01-01 for a civil date (proleptic Gregorian). */
function daysFromCivil(year: number, month: number, day: number): number {
  const adjustedYear = month <= 2 ? year - 1 : year;
  const era = Math.floor(
    (adjustedYear >= 0 ? adjustedYear : adjustedYear - 399) / 400,
  );
  const yearOfEra = adjustedYear - era * 400;
  const monthPrime = (month + 9) % 12;
  const dayOfYear =
    Math.floor((153 * monthPrime + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

interface ParsedInstant {
  seconds: number;
  /** Raw fractional-second digits without the separator, "" when absent. */
  fraction: string;
}

/** Compare two fractional-second digit strings by numeric value. */
function compareFractions(a: string, b: string): number {
  const width = Math.max(a.length, b.length);
  const paddedA = a.padEnd(width, "0");
  const paddedB = b.padEnd(width, "0");
  if (paddedA < paddedB) {
    return -1;
  }
  if (paddedA > paddedB) {
    return 1;
  }
  return 0;
}

/** Manual ISO-8601 instant parse (no clock globals, no URI/URL globals):
    calendar date plus time plus `Z` or numeric offset, keeping the
    complete fractional-second digits for exact comparison. Null on any
    unreadable value. */
function parseIsoInstant(text: string): ParsedInstant | null {
  const match = ISO_INSTANT_PATTERN.exec(text);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const zone = match[8];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    zone === undefined
  ) {
    return null;
  }
  const fraction = match[7] ?? "";
  let offsetMinutes = 0;
  if (zone !== "Z") {
    const sign = zone[0] === "-" ? -1 : 1;
    const digits = zone.slice(1).replace(":", "");
    const padded = digits.length === 2 ? `${digits}00` : digits;
    if (padded.length !== 4) {
      return null;
    }
    const offsetHour = Number(padded.slice(0, 2));
    const offsetMinute = Number(padded.slice(2, 4));
    if (offsetHour > 23 || offsetMinute > 59) {
      return null;
    }
    offsetMinutes = sign * (offsetHour * 60 + offsetMinute);
  }
  const seconds =
    daysFromCivil(year, month, day) * 86400 +
    hour * 3600 +
    minute * 60 +
    second -
    offsetMinutes * 60;
  if (!Number.isSafeInteger(seconds)) {
    return null;
  }
  return { seconds, fraction };
}

/** Expiry evaluation against an injected clock. `nowIso` is the caller's
    current time as an ISO-8601 instant in a single comparable calendar; a
    null expiry never expires. Instants compare by time, not by spelling,
    so `12:00:00Z`, `12:00:00.000Z` and `13:00:00+01:00` are the same
    instant and expiry holds at equality. An unreadable `expiresAt` or
    `nowIso` never counts as expired: without a readable deadline or a
    readable clock there is no proof of expiry, so the lock stays active.
    Pure of its arguments; the caller injects the clock. */
export function isLockExpired(
  lock: Pick<LockSnapshot, "expiresAt">,
  nowIso: string,
): boolean {
  if (lock.expiresAt === null) {
    return false;
  }
  const expires = parseIsoInstant(lock.expiresAt);
  const now = parseIsoInstant(nowIso);
  if (expires === null || now === null) {
    return false;
  }
  if (expires.seconds !== now.seconds) {
    return expires.seconds < now.seconds;
  }
  return compareFractions(expires.fraction, now.fraction) <= 0;
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
    input.lock !== null &&
    input.lock.holder !== null &&
    !isLockExpired(input.lock, input.nowIso);
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
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      return true;
    }
  }
  return false;
}

/** Id shape versus budget: empty/non-string is a shape refusal,
    over 256 units is a size refusal. Null means the id is usable. */
function idBudgetRefusal(value: unknown): PatchRefusalReason | null {
  if (typeof value !== "string" || value.length === 0) {
    return "incompatible-schema";
  }
  if (value.length > MAX_ID_UNITS) {
    return "too-large";
  }
  return null;
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
  if (blockKind === "heading") {
    if (
      !isSafeInteger(headingLevel) ||
      (headingLevel as number) < 1 ||
      (headingLevel as number) > 6
    ) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata headingLevel requires blockKind heading and level 1..6",
      };
    }
  } else if (headingLevel !== undefined) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata headingLevel requires blockKind heading and level 1..6",
    };
  }
  const codeLanguage = value["codeLanguage"];
  if (blockKind === "codeBlock") {
    if (codeLanguage === undefined) {
      return {
        ok: false,
        reason: "incompatible-schema",
        detail: "metadata codeLanguage requires blockKind codeBlock",
      };
    }
    if (codeLanguage !== null) {
      if (typeof codeLanguage !== "string") {
        return {
          ok: false,
          reason: "incompatible-schema",
          detail: "metadata codeLanguage must be a plain string or null",
        };
      }
      if (codeLanguage.length > MAX_LANGUAGE_UNITS) {
        return {
          ok: false,
          reason: "too-large",
          detail: "metadata codeLanguage exceeds 128 units",
        };
      }
      if (hasDisallowedControlChar(codeLanguage)) {
        return {
          ok: false,
          reason: "incompatible-schema",
          detail: "metadata codeLanguage carries control characters",
        };
      }
    }
  } else if (codeLanguage !== undefined) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata codeLanguage requires blockKind codeBlock",
    };
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
  if (!isSafeInteger(listDepth) || (listDepth as number) < 0) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata listDepth is out of range",
    };
  }
  if ((listDepth as number) > MAX_LIST_QUOTE_DEPTH) {
    return {
      ok: false,
      reason: "too-large",
      detail: "metadata listDepth exceeds 1999",
    };
  }
  const blockquoteDepth = value["blockquoteDepth"];
  if (!isSafeInteger(blockquoteDepth) || (blockquoteDepth as number) < 0) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata blockquoteDepth is out of range",
    };
  }
  if ((blockquoteDepth as number) > MAX_LIST_QUOTE_DEPTH) {
    return {
      ok: false,
      reason: "too-large",
      detail: "metadata blockquoteDepth exceeds 1999",
    };
  }
  for (const key of ["listItemId", "listRunId"] as const) {
    if (value[key] !== undefined) {
      const refusal = idBudgetRefusal(value[key]);
      if (refusal !== null) {
        return {
          ok: false,
          reason: refusal,
          detail: `metadata ${key} exceeds its budget or is not a usable id`,
        };
      }
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
  const quoteCount = containerOrder.filter(
    (entry) => entry === "quote",
  ).length;
  const listCount = containerOrder.length - quoteCount;
  if (quoteCount !== (blockquoteDepth as number)) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata containerOrder quote count must equal blockquoteDepth",
    };
  }
  const expectedListCount =
    listKind === "none" ? 0 : (listDepth as number) + 1;
  if (listCount !== expectedListCount) {
    return {
      ok: false,
      reason: "incompatible-schema",
      detail: "metadata containerOrder list count must equal list depth",
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

const OPERATION_KEYS: Record<string, ReadonlySet<string>> = {
  insert: new Set(["type", "fieldKey", "paragraphId", "at", "text"]),
  insertHardBreak: new Set(["type", "fieldKey", "paragraphId", "at"]),
  delete: new Set(["type", "fieldKey", "paragraphId", "range"]),
  markBoolean: new Set([
    "type",
    "fieldKey",
    "paragraphId",
    "range",
    "mark",
    "applied",
  ]),
  markLink: new Set([
    "type",
    "fieldKey",
    "paragraphId",
    "range",
    "mark",
    "href",
    "title",
  ]),
  splitParagraph: new Set([
    "type",
    "fieldKey",
    "paragraphId",
    "at",
    "newParagraphId",
  ]),
  mergeWithPrevious: new Set(["type", "fieldKey", "paragraphId"]),
  setBlockMetadata: new Set(["type", "fieldKey", "paragraphId", "metadata"]),
  insertHorizontalRule: new Set([
    "type",
    "fieldKey",
    "at",
    "newParagraphId",
  ]),
  deleteHorizontalRule: new Set([
    "type",
    "fieldKey",
    "paragraphId",
    "replacementParagraphId",
  ]),
};

/** Closed key set per operation variant (spec 723): any key outside the
    admitted set for that variant refuses the whole patch. */
function refuseExtraOperationKey(
  operation: AgentEditOperation,
  allowed: ReadonlySet<string>,
  operationIndex: number,
): PatchValidationResult | null {
  for (const key of Object.keys(operation)) {
    if (!allowed.has(key)) {
      return refusePatch(
        "incompatible-schema",
        `operation carries an unadmitted key: ${key}`,
        operationIndex,
      );
    }
  }
  return null;
}

function validateOperationShape(
  operation: AgentEditOperation,
  fieldKey: string,
  profile: AgentPatchProfile,
  operationIndex: number,
): PatchValidationResult {
  if (
    typeof operation !== "object" ||
    operation === null ||
    Array.isArray(operation)
  ) {
    return refusePatch(
      "incompatible-schema",
      "operation must be a record object",
      operationIndex,
    );
  }
  if (operation.fieldKey !== fieldKey) {
    return refusePatch(
      "scope-denied",
      "operation fieldKey must equal patch binding fieldKey",
      operationIndex,
    );
  }
  switch (operation.type) {
    case "insert": {
      const extra = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["insert"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extra !== null) {
        return extra;
      }
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
      const extraInsertBreak = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["insertHardBreak"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraInsertBreak !== null) {
        return extraInsertBreak;
      }
      if (!isNonEmptyString(operation.paragraphId) || !isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "insertHardBreak needs paragraphId and at", operationIndex);
      }
      return { ok: true };
    }
    case "delete": {
      const extraDelete = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["delete"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraDelete !== null) {
        return extraDelete;
      }
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
        const extraBoolean = refuseExtraOperationKey(
          operation,
          OPERATION_KEYS["markBoolean"] as ReadonlySet<string>,
          operationIndex,
        );
        if (extraBoolean !== null) {
          return extraBoolean;
        }
        if (typeof operation.applied !== "boolean") {
          return refusePatch("incompatible-schema", "boolean mark needs applied", operationIndex);
        }
        return { ok: true };
      }
      if (operation.mark === "strike" || operation.mark === "underline") {
        const extraFullBoolean = refuseExtraOperationKey(
          operation,
          OPERATION_KEYS["markBoolean"] as ReadonlySet<string>,
          operationIndex,
        );
        if (extraFullBoolean !== null) {
          return extraFullBoolean;
        }
        if (profile !== "full") {
          return refusePatch("incompatible-schema", "strike/underline are full-profile marks", operationIndex);
        }
        if (typeof operation.applied !== "boolean") {
          return refusePatch("incompatible-schema", "boolean mark needs applied", operationIndex);
        }
        return { ok: true };
      }
      if (operation.mark === "link") {
        const extraLink = refuseExtraOperationKey(
          operation,
          OPERATION_KEYS["markLink"] as ReadonlySet<string>,
          operationIndex,
        );
        if (extraLink !== null) {
          return extraLink;
        }
        if (profile !== "full") {
          return refusePatch("incompatible-schema", "link is a full-profile mark", operationIndex);
        }
        if (operation.href !== null) {
          if (typeof operation.href !== "string") {
            return refusePatch("incompatible-schema", "link href is not allowlisted", operationIndex);
          }
          if (operation.href.length > MAX_HREF_UNITS) {
            return refusePatch("too-large", "link href exceeds 2048 units", operationIndex);
          }
          if (!isAllowedHref(operation.href)) {
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
      const extraUnknownMark = refuseExtraOperationKey(
        operation,
        new Set([
          "type",
          "fieldKey",
          "paragraphId",
          "range",
          "mark",
          "applied",
          "href",
          "title",
        ]),
        operationIndex,
      );
      if (extraUnknownMark !== null) {
        return extraUnknownMark;
      }
      return refusePatch("incompatible-schema", "mark key is not admitted", operationIndex);
    }
    case "splitParagraph": {
      const extraSplit = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["splitParagraph"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraSplit !== null) {
        return extraSplit;
      }
      if (!isNonEmptyString(operation.paragraphId) || !isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "splitParagraph needs paragraphId and at", operationIndex);
      }
      {
        const refusal = idBudgetRefusal(operation.newParagraphId);
        if (refusal !== null) {
          return refusePatch(refusal, "splitParagraph newParagraphId exceeds its budget or is not a usable id", operationIndex);
        }
      }
      return { ok: true };
    }
    case "mergeWithPrevious": {
      const extraMerge = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["mergeWithPrevious"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraMerge !== null) {
        return extraMerge;
      }
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "mergeWithPrevious needs paragraphId", operationIndex);
      }
      return { ok: true };
    }
    case "setBlockMetadata": {
      const extraMetadataOp = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["setBlockMetadata"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraMetadataOp !== null) {
        return extraMetadataOp;
      }
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
      const extraHr = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["insertHorizontalRule"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraHr !== null) {
        return extraHr;
      }
      if (profile !== "full") {
        return refusePatch("incompatible-schema", "insertHorizontalRule is a full-profile operation", operationIndex);
      }
      if (!isAnchorString(operation.at)) {
        return refusePatch("incompatible-schema", "insertHorizontalRule needs at", operationIndex);
      }
      {
        const refusal = idBudgetRefusal(operation.newParagraphId);
        if (refusal !== null) {
          return refusePatch(refusal, "insertHorizontalRule newParagraphId exceeds its budget or is not a usable id", operationIndex);
        }
      }
      return { ok: true };
    }
    case "deleteHorizontalRule": {
      const extraDeleteHr = refuseExtraOperationKey(
        operation,
        OPERATION_KEYS["deleteHorizontalRule"] as ReadonlySet<string>,
        operationIndex,
      );
      if (extraDeleteHr !== null) {
        return extraDeleteHr;
      }
      if (profile !== "full") {
        return refusePatch("incompatible-schema", "deleteHorizontalRule is a full-profile operation", operationIndex);
      }
      if (!isNonEmptyString(operation.paragraphId)) {
        return refusePatch("incompatible-schema", "deleteHorizontalRule needs paragraphId", operationIndex);
      }
      if (operation.replacementParagraphId !== undefined) {
        const refusal = idBudgetRefusal(operation.replacementParagraphId);
        if (refusal !== null) {
          return refusePatch(refusal, "deleteHorizontalRule replacementParagraphId exceeds its budget or is not a usable id", operationIndex);
        }
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


/** R-API-2 effective-editable input (spec §6.2). The host computes exactly
    one editing fact per surface mode and the DS enforces it locally:
    `effectiveEditable = binding ? (admittedEditable && !disabled) :
    (l0Projection && !disabled)`. This helper is that computation as pure
    data so both the host adapter and the Svelte surface share it:
    - Live / L2 surfaces (`binding` present): admission decides. A lock
      snapshot — including one held by another actor — never makes an
      admitted L2 field read-only; it stays renderable information (badge).
    - Controlled / L0 surfaces (no binding): the L0 lock snapshot projects
      onto the editing fact. Holder === current actor and unheld units stay
      editable; a lock held by another actor forces read-only.
    Expiry is evaluated only against the injected `nowIso` clock (never a
    clock read); without it a dated lock counts as active (fail closed), so a
    host holding an expired lock passes `lock: null`. Without an `actorId` a
    held lock counts as held-by-other (fail closed). Pure. */
export interface EffectiveEditableInput {
  /** Full binding identity when the surface is live (L2). Absent or null ⇒
      controlled (L0) surface. */
  binding?: FieldBindingIdentity | null;
  /** Host-admitted editing fact: the admission outcome in L2, the L0
      projection or the direct prop on controlled surfaces. Defaults true. */
  editable?: boolean;
  /** L0 lock snapshot. Information only when `binding` is present; it drives
      inertness only on controlled surfaces. */
  lock?: LockSnapshot | null;
  /** Current actor identity for the holder comparison. */
  actorId?: string | null;
  /** Form-disabled wins over every mode. */
  disabled?: boolean;
  /** Injected clock for expiry, ISO-8601. Null or absent ⇒ dated locks count
      as active. */
  nowIso?: string | null;
}

/** R-API-2 effective-editable computation (spec §6.2). Pure. */
export function computeEffectiveEditable(input: EffectiveEditableInput): boolean {
  if (input.disabled === true) return false;
  const editable = input.editable ?? true;
  if (input.binding !== undefined && input.binding !== null) return editable;
  const lock = input.lock ?? null;
  if (lock === null || lock.holder === null) return editable;
  const active =
    lock.expiresAt === null ||
    input.nowIso === undefined ||
    input.nowIso === null ||
    !isLockExpired(lock, input.nowIso);
  if (!active) return editable;
  if (input.actorId !== undefined && input.actorId !== null && lock.holder.actorId === input.actorId) {
    return editable;
  }
  return false;
}
