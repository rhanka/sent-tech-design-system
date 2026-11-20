// Thread grouping and `ReviewThread.anchor` derivation (SPEC-r5 §1, §3).

import { decodeAnchor } from "./anchor-codec.js";
import {
  normalizeCommentTarget,
  type AnchorPayload,
  type CommentState,
  type CommentTarget,
  type ReviewComment,
  type ReviewThread,
} from "./types.js";

export type AnchorDecoder = (sectionKey: string) => AnchorPayload | null;

export interface GroupThreadsOptions {
  /**
   * Decoder used to derive `ReviewThread.anchor` from the first chronological
   * row carrying `target.sectionKey`.
   */
  decodeAnchor?: AnchorDecoder;
}

export function compareIsoTimestamps(a: string, b: string): number {
  const parsedA = Date.parse(a);
  const parsedB = Date.parse(b);
  if (Number.isFinite(parsedA) && Number.isFinite(parsedB) && parsedA !== parsedB) {
    return parsedA - parsedB;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Groups flat `ReviewComment[]` rows by `threadId` into chronological `ReviewThread[]`
 * view models (SPEC-r5 §1):
 * - Comments within each thread are sorted chronologically by `createdAt`.
 * - Thread `state` is `'closed'` if any row in the thread is `'closed'`, else `'open'`.
 * - `anchor` is derived from the `target.sectionKey` of the FIRST row in chronological
 *   order that carries one (not specifically the root row), so deleting the root row
 *   retains the anchor as long as a reply carries it. No row carrying one -> `null` (orphan).
 */
export function groupCommentsIntoThreads(
  comments: readonly ReviewComment[],
  options?: GroupThreadsOptions,
): ReviewThread[] {
  if (comments.length === 0) {
    return [];
  }

  const byThread = new Map<string, Array<{ comment: ReviewComment; order: number }>>();
  comments.forEach((comment, order) => {
    const bucket = byThread.get(comment.threadId);
    if (bucket) {
      bucket.push({ comment, order });
    } else {
      byThread.set(comment.threadId, [{ comment, order }]);
    }
  });

  const decoder = options?.decodeAnchor ?? decodeAnchor;
  const threads: Array<{ thread: ReviewThread; earliestAt: string }> = [];

  for (const [threadId, entries] of byThread) {
    entries.sort((left, right) => {
      const timeCmp = compareIsoTimestamps(left.comment.createdAt, right.comment.createdAt);
      return timeCmp !== 0 ? timeCmp : left.order - right.order;
    });

    const sortedComments = entries.map((entry) => entry.comment);
    const firstComment = sortedComments[0]!;
    const state: CommentState = sortedComments.some((c) => c.state === "closed")
      ? "closed"
      : "open";

    let rawSectionKey: string | undefined;
    for (const row of sortedComments) {
      const candidate = row.target.sectionKey;
      if (typeof candidate === "string" && candidate.length > 0) {
        rawSectionKey = candidate;
        break;
      }
    }

    const baseTarget = normalizeCommentTarget(firstComment.target);
    const target: CommentTarget = { kind: baseTarget.kind, id: baseTarget.id };
    if (baseTarget.recordType !== undefined) {
      target.recordType = baseTarget.recordType;
    }
    if (rawSectionKey !== undefined) {
      target.sectionKey = rawSectionKey;
    }

    let assignedTo: string | undefined;
    for (let i = sortedComments.length - 1; i >= 0; i--) {
      const candidate = sortedComments[i]!.assignedTo;
      if (typeof candidate === "string" && candidate.length > 0) {
        assignedTo = candidate;
        break;
      }
    }

    const anchor: AnchorPayload | null =
      rawSectionKey !== undefined && decoder ? decoder(rawSectionKey) : null;

    const thread: ReviewThread = {
      threadId,
      target,
      comments: sortedComments,
      state,
      anchor,
    };
    if (rawSectionKey !== undefined) {
      thread.sectionKey = rawSectionKey;
    }
    if (assignedTo !== undefined) {
      thread.assignedTo = assignedTo;
    }

    threads.push({ thread, earliestAt: firstComment.createdAt });
  }

  threads.sort((left, right) => {
    const timeCmp = compareIsoTimestamps(left.earliestAt, right.earliestAt);
    if (timeCmp !== 0) return timeCmp;
    return left.thread.threadId < right.thread.threadId
      ? -1
      : left.thread.threadId > right.thread.threadId
        ? 1
        : 0;
  });

  return threads.map((entry) => entry.thread);
}
