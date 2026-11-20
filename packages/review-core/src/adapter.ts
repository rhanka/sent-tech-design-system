// `CommentsAdapter` — the sole kit <-> host/store seam (SPEC-r5 §1.4).

import type {
  CommentProvenance,
  CommentState,
  CommentTarget,
  CommentThreadSummary,
  ReviewComment,
} from "./types.js";

export type ReviewAdapterErrorCode =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "SECTION_KEY_TOO_LONG"
  | "PROVENANCE_TOOL_CALL_ID_REQUIRED"
  | "INVALID_ASSIGNEE"
  | "INVALID_BODY"
  | "INVALID_TARGET";

export class ReviewAdapterError extends Error {
  readonly code: ReviewAdapterErrorCode;
  readonly status: number;

  constructor(code: ReviewAdapterErrorCode, status: number, message: string) {
    super(message);
    this.name = "ReviewAdapterError";
    this.code = code;
    this.status = status;
  }
}

export interface CreateCommentInput {
  tenant: string;
  target: CommentTarget;
  body: string;
  provenance?: CommentProvenance;
}

export interface ReplyCommentInput {
  tenant: string;
  target: CommentTarget;
  threadId: string;
  body: string;
  provenance?: CommentProvenance;
}

/**
 * Sole kit <-> store seam (SPEC-r5 §1.4).
 * Hosts bind this interface to cluster-mesh HTTP/MCP; every verb carries `tenant`,
 * thread-level verbs (`setState`, `assign`, `reanchor`) are keyed by `threadId`,
 * and row-level verbs (`edit`, `remove`) are keyed by `commentId`.
 */
export interface CommentsAdapter {
  list(tenant: string, target: CommentTarget): Promise<ReviewComment[]>;
  threadSummaries?(tenant: string, target: CommentTarget): Promise<CommentThreadSummary[]>;
  create(input: CreateCommentInput): Promise<ReviewComment>;
  reply(input: ReplyCommentInput): Promise<ReviewComment>;
  edit(tenant: string, commentId: string, body: string): Promise<ReviewComment>;
  setState(tenant: string, threadId: string, state: CommentState): Promise<void>;
  remove(tenant: string, commentId: string): Promise<void>;
  assign(tenant: string, threadId: string, assigneeId: string | null): Promise<void>;
  reanchor?(tenant: string, threadId: string, sectionKey: string): Promise<void>;
  subscribe?(
    tenant: string,
    target: CommentTarget,
    cb: (comments: ReviewComment[]) => void,
  ): () => void;
  onCommentCreated?: (cb: (comment: ReviewComment) => void) => () => void;
}
