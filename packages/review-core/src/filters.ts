// Thread filtering and tab counts (SPEC-r6 §3).

import type { CollaborationActor, ReviewThread } from "./types.js";

export type ThreadFilter = "all" | "open" | "resolved" | "mine";

export interface ThreadFilterCounts {
  all: number;
  open: number;
  resolved: number;
  mine: number;
}

function isThreadMine(
  thread: ReviewThread,
  currentUser: Pick<CollaborationActor, "actorId"> | undefined,
): boolean {
  if (!currentUser) return false;
  return thread.comments.some((c) => c.authorship.author.actorId === currentUser.actorId);
}

/**
 * Filters threads for All / Open / Resolved (`state === 'closed'`) / Mine.
 * Critically, "mine" evaluates `comment.authorship.author.actorId` (§3), so an
 * agent comment sponsored by the current user is NOT classified as "mine".
 */
export function filterThreads(
  threads: readonly ReviewThread[],
  filter: ThreadFilter,
  currentUser?: Pick<CollaborationActor, "actorId">,
): ReviewThread[] {
  switch (filter) {
    case "all":
      return [...threads];
    case "open":
      return threads.filter((thread) => thread.state === "open");
    case "resolved":
      return threads.filter((thread) => thread.state === "closed");
    case "mine":
      return threads.filter((thread) => isThreadMine(thread, currentUser));
  }
}

export function countThreadsByFilter(
  threads: readonly ReviewThread[],
  currentUser?: Pick<CollaborationActor, "actorId">,
): ThreadFilterCounts {
  let open = 0;
  let resolved = 0;
  let mine = 0;

  for (const thread of threads) {
    if (thread.state === "open") {
      open += 1;
    } else {
      resolved += 1;
    }
    if (isThreadMine(thread, currentUser)) {
      mine += 1;
    }
  }

  return {
    all: threads.length,
    open,
    resolved,
    mine,
  };
}
