// 1:1 contract types mapped from sentropic `packages/comments/src/types.ts`
// and `api/src/services/canvas-live/contracts.ts` (SPEC-r5 §1, §1.1-§1.3, §2).
// The review kit invents zero wire fields.

/** Maximum encoded length of `CommentTarget.sectionKey` (SPEC-r5 §2, D3). */
export const MAX_SECTION_KEY_LENGTH = 2048;

export type CommentTargetKind = "message" | "canvas" | "artifact" | "field" | "record";

export interface CommentTarget {
  kind: CommentTargetKind;
  id: string;
  sectionKey?: string;
  recordType?: string;
}

/** Single state vocabulary matching DB literals (`comments.status`, SPEC-r6 §1.1). */
export type CommentState = "open" | "closed";

/** Display-only UI labels for `CommentState` (SPEC-r6 §1.1, §3). */
export const COMMENT_STATE_UI_LABELS: Readonly<Record<CommentState, string>> = Object.freeze({
  open: "Open",
  closed: "Resolved",
});

/** Verbatim from `api/src/services/canvas-live/contracts.ts` (SPEC-r6 §1.3). */
export type CollaborationActorKind = "human" | "agent" | "nhi";

export interface TenantContext {
  workspaceId: string;
  tenantId?: string;
  userId?: string;
}

export interface CommentProvenance {
  toolCallId?: string;
  runId?: string;
}

export interface CommentAuthor {
  id: string;
  kind?: CollaborationActorKind;
  displayLabel?: string;
}

/** Wire comment contract — 1:1 with `packages/comments/src/types.ts` `Comment`. */
export interface Comment {
  id: string;
  tenant: TenantContext;
  target: CommentTarget;
  threadId: string;
  author: CommentAuthor;
  assignedTo?: string;
  state: CommentState;
  body: string;
  provenance?: CommentProvenance;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentThreadSummary {
  threadId: string;
  target: CommentTarget;
  status: CommentState;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
}

export interface CollaborationActor {
  actorId: string;
  kind: CollaborationActorKind;
  displayLabel: string;
  color: string;
}

/** View-only authorship model produced by `CommentsAdapter` (never a wire field). */
export interface CommentAuthorship {
  author: CollaborationActor;
  sponsor?: CollaborationActor;
  runId?: string;
}

/** View-level comment consumed by review-kit components (SPEC-r5 §1.3). */
export interface ReviewComment extends Comment {
  authorship: CommentAuthorship;
}

// ── Anchor payload shapes carried inside `sectionKey` (SPEC-r5 §2) ──

export interface TextQuoteSelector {
  exact: string;
  prefix?: string;
  suffix?: string;
}

export interface TextPositionSelector {
  start: number;
  end: number;
}

export interface TextAnchorPayload {
  t: "text";
  q: TextQuoteSelector;
  pos?: TextPositionSelector;
  sel?: string;
  aid?: string;
  v: string;
}

export interface ElementAnchorPayload {
  t: "element";
  sel: string;
  aid?: string;
  v: string;
}

export interface RegionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionAnchorPayload {
  t: "region";
  rect: RegionRect;
  v: string;
}

export type AnchorPayload = TextAnchorPayload | ElementAnchorPayload | RegionAnchorPayload;

/** View-only thread model assembled by `groupCommentsIntoThreads` (SPEC-r5 §1). */
export interface ReviewThread {
  threadId: string;
  target: CommentTarget;
  comments: ReviewComment[];
  state: CommentState;
  anchor: AnchorPayload | null;
  sectionKey?: string;
  assignedTo?: string;
}

export function getCommentStateLabel(state: CommentState): string {
  return COMMENT_STATE_UI_LABELS[state];
}

/** Normalise `record` + `recordType: 'artifact'` into `kind: 'artifact'` dropping `recordType` (§1.2). */
export function normalizeCommentTarget(target: CommentTarget): CommentTarget {
  if (target.kind === "record" && target.recordType === "artifact") {
    const normalized: CommentTarget = { kind: "artifact", id: target.id };
    if (target.sectionKey !== undefined) {
      normalized.sectionKey = target.sectionKey;
    }
    return normalized;
  }
  const copy: CommentTarget = { kind: target.kind, id: target.id };
  if (target.sectionKey !== undefined) {
    copy.sectionKey = target.sectionKey;
  }
  if (target.recordType !== undefined) {
    copy.recordType = target.recordType;
  }
  return copy;
}
