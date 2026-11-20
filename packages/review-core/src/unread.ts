// Unread rules over host-held read state (SPEC-r5 §2, §3).

import { compareIsoTimestamps } from "./threads.js";
import type { CollaborationActor, ReviewComment, ReviewThread } from "./types.js";

/** Host-held map of `threadId -> lastReadAt` ISO timestamp for the current user. */
export type ThreadReadState =
  | Readonly<Record<string, string | undefined>>
  | ReadonlyMap<string, string>;

function resolveLastReadAt(
  threadId: string,
  readState: ThreadReadState | string | null | undefined,
): string | undefined {
  if (readState === undefined || readState === null) {
    return undefined;
  }
  if (typeof readState === "string") {
    return readState.length > 0 ? readState : undefined;
  }
  if (readState instanceof Map) {
    const value = readState.get(threadId);
    return typeof value === "string" && value.length > 0 ? value : undefined;
  }
  const value = (readState as Readonly<Record<string, string | undefined>>)[threadId];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Unread rule (SPEC-r5 §3):
 * `createdAt > lastReadAt && authorship.author.actorId !== currentUser.actorId`.
 * Self-authored comments are never unread; sponsored agent comments have a distinct
 * `authorship.author.actorId` and therefore DO appear unread to the owner.
 */
export function isCommentUnread(
  comment: ReviewComment,
  currentUser: Pick<CollaborationActor, "actorId">,
  lastReadAt?: string | null,
): boolean {
  if (comment.authorship.author.actorId === currentUser.actorId) {
    return false;
  }
  if (lastReadAt === undefined || lastReadAt === null || lastReadAt.length === 0) {
    return true;
  }
  return compareIsoTimestamps(comment.createdAt, lastReadAt) > 0;
}

/** True iff the thread contains at least one unread comment for `currentUser`. */
export function isUnread(
  thread: ReviewThread,
  currentUser: Pick<CollaborationActor, "actorId">,
  readState?: ThreadReadState | string | null,
): boolean {
  const lastReadAt = resolveLastReadAt(thread.threadId, readState);
  return thread.comments.some((comment) => isCommentUnread(comment, currentUser, lastReadAt));
}

export function countUnreadComments(
  thread: ReviewThread,
  currentUser: Pick<CollaborationActor, "actorId">,
  readState?: ThreadReadState | string | null,
): number {
  const lastReadAt = resolveLastReadAt(thread.threadId, readState);
  let count = 0;
  for (const comment of thread.comments) {
    if (isCommentUnread(comment, currentUser, lastReadAt)) {
      count += 1;
    }
  }
  return count;
}

export function countUnreadThreads(
  threads: readonly ReviewThread[],
  currentUser: Pick<CollaborationActor, "actorId">,
  readState?: ThreadReadState | string | null,
): number {
  let count = 0;
  for (const thread of threads) {
    if (isUnread(thread, currentUser, readState)) {
      count += 1;
    }
  }
  return count;
}
