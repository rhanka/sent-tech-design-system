import { describe, expect, it } from "vitest";

import {
  countThreadsByFilter,
  countUnreadComments,
  countUnreadThreads,
  filterThreads,
  groupCommentsIntoThreads,
  isCommentUnread,
  isUnread,
  type AnchorPayload,
  type CollaborationActor,
  type ReviewComment,
} from "../src/index.js";

const ALICE: CollaborationActor = {
  actorId: "user-alice",
  kind: "human",
  displayLabel: "Alice",
  color: "#2563eb",
};

const BOB: CollaborationActor = {
  actorId: "user-bob",
  kind: "human",
  displayLabel: "Bob",
  color: "#16a34a",
};

const AGENT: CollaborationActor = {
  actorId: "agent-review",
  kind: "agent",
  displayLabel: "Reviewer Agent",
  color: "#7c3aed",
};

function makeReviewComment(overrides: Partial<ReviewComment> = {}): ReviewComment {
  return {
    id: "c-1",
    tenant: { workspaceId: "ws-1" },
    target: { kind: "artifact", id: "art-1" },
    threadId: "t-1",
    author: { id: ALICE.actorId },
    state: "open",
    body: "Initial review note",
    createdAt: "2026-11-19T10:00:00.000Z",
    authorship: { author: ALICE },
    ...overrides,
  };
}

describe("DS-1 thread grouping & anchor derivation", () => {
  it("should group flat rows by threadId in chronological order and derive closed if any row is closed", () => {
    const comments: ReviewComment[] = [
      makeReviewComment({
        id: "c-2",
        threadId: "t-1",
        createdAt: "2026-11-19T10:05:00.000Z",
        state: "closed",
        body: "Resolved in v2",
        author: { id: BOB.actorId },
        authorship: { author: BOB },
      }),
      makeReviewComment({
        id: "c-1",
        threadId: "t-1",
        createdAt: "2026-11-19T10:00:00.000Z",
        state: "open",
        body: "Root comment",
      }),
      makeReviewComment({
        id: "c-3",
        threadId: "t-2",
        createdAt: "2026-11-19T09:00:00.000Z",
        state: "open",
        body: "Earlier thread",
      }),
    ];

    const threads = groupCommentsIntoThreads(comments);
    expect(threads.map((t) => t.threadId)).toEqual(["t-2", "t-1"]);
    expect(threads[1]?.comments.map((c) => c.id)).toEqual(["c-1", "c-2"]);
    expect(threads[1]?.state).toBe("closed");
    expect(threads[0]?.state).toBe("open");
  });

  it("should derive anchor from the first chronological row carrying sectionKey, even if root lacked one or was deleted", () => {
    const fakeAnchor: AnchorPayload = {
      t: "element",
      sel: "section:nth-of-type(1) > p:nth-of-type(2)",
      v: "1",
    };

    const comments: ReviewComment[] = [
      // Row 1 has no sectionKey (e.g. legacy root or pre-propagation row)
      makeReviewComment({
        id: "c-10",
        threadId: "t-anchor",
        target: { kind: "record", id: "art-1", recordType: "artifact" },
        createdAt: "2026-11-19T10:00:00.000Z",
      }),
      // Row 2 carries sectionKey -> must be selected
      makeReviewComment({
        id: "c-11",
        threadId: "t-anchor",
        target: { kind: "artifact", id: "art-1", sectionKey: "key-first" },
        createdAt: "2026-11-19T10:02:00.000Z",
      }),
      // Row 3 carries another sectionKey -> must NOT override row 2
      makeReviewComment({
        id: "c-12",
        threadId: "t-anchor",
        target: { kind: "artifact", id: "art-1", sectionKey: "key-second" },
        createdAt: "2026-11-19T10:04:00.000Z",
      }),
    ];

    const seenKeys: string[] = [];
    const threads = groupCommentsIntoThreads(comments, {
      decodeAnchor: (key) => {
        seenKeys.push(key);
        return key === "key-first" ? fakeAnchor : null;
      },
    });

    expect(seenKeys).toEqual(["key-first"]);
    expect(threads[0]?.anchor).toEqual(fakeAnchor);
    expect(threads[0]?.sectionKey).toBe("key-first");
    expect(threads[0]?.target).toEqual({
      kind: "artifact",
      id: "art-1",
      sectionKey: "key-first",
    });
  });

  it("should mark a thread with no sectionKey on any row as orphan (anchor: null)", () => {
    const threads = groupCommentsIntoThreads([
      makeReviewComment({ id: "c-1", threadId: "t-orphan" }),
    ]);

    expect(threads[0]?.anchor).toBeNull();
    expect(threads[0]?.sectionKey).toBeUndefined();
  });
});

describe("DS-1 thread filters (all / open / resolved / mine)", () => {
  const comments: ReviewComment[] = [
    // t-open-alice: open, authored by Alice
    makeReviewComment({
      id: "c-1",
      threadId: "t-open-alice",
      state: "open",
      createdAt: "2026-11-19T10:00:00.000Z",
      author: { id: ALICE.actorId },
      authorship: { author: ALICE },
    }),
    // t-closed-bob: closed (UI label Resolved), authored by Bob
    makeReviewComment({
      id: "c-2",
      threadId: "t-closed-bob",
      state: "closed",
      createdAt: "2026-11-19T10:01:00.000Z",
      author: { id: BOB.actorId },
      authorship: { author: BOB },
    }),
    // t-agent-sponsored-by-alice: open, created_by = Alice, true author = AGENT
    makeReviewComment({
      id: "c-3",
      threadId: "t-agent-sponsored-by-alice",
      state: "open",
      createdAt: "2026-11-19T10:02:00.000Z",
      author: { id: ALICE.actorId },
      provenance: { toolCallId: "tc-9" },
      authorship: { author: AGENT, sponsor: ALICE },
    }),
  ];

  const threads = groupCommentsIntoThreads(comments);

  it("should filter all, open, resolved (state==='closed'), and mine using authorship.author.actorId", () => {
    expect(filterThreads(threads, "all", ALICE).map((t) => t.threadId)).toEqual([
      "t-open-alice",
      "t-closed-bob",
      "t-agent-sponsored-by-alice",
    ]);

    expect(filterThreads(threads, "open", ALICE).map((t) => t.threadId)).toEqual([
      "t-open-alice",
      "t-agent-sponsored-by-alice",
    ]);

    expect(filterThreads(threads, "resolved", ALICE).map((t) => t.threadId)).toEqual([
      "t-closed-bob",
    ]);

    // Critically: agent comment written under Alice's created_by id is NOT "mine" for Alice!
    expect(filterThreads(threads, "mine", ALICE).map((t) => t.threadId)).toEqual([
      "t-open-alice",
    ]);

    // And it IS "mine" for the agent itself
    expect(filterThreads(threads, "mine", AGENT).map((t) => t.threadId)).toEqual([
      "t-agent-sponsored-by-alice",
    ]);
  });

  it("should compute accurate counts across all four filter tabs", () => {
    expect(countThreadsByFilter(threads, ALICE)).toEqual({
      all: 3,
      open: 2,
      resolved: 1,
      mine: 1,
    });
  });
});

describe("DS-1 unread markers", () => {
  it("should treat comments with createdAt > lastReadAt and author !== currentUser as unread", () => {
    const aliceRoot = makeReviewComment({
      id: "c-1",
      threadId: "t-1",
      createdAt: "2026-11-19T10:00:00.000Z",
      author: { id: ALICE.actorId },
      authorship: { author: ALICE },
    });
    const agentReply = makeReviewComment({
      id: "c-2",
      threadId: "t-1",
      createdAt: "2026-11-19T10:05:00.000Z",
      author: { id: ALICE.actorId }, // written under Alice's owner id (fallback)
      provenance: { toolCallId: "tc-55" },
      authorship: { author: AGENT, sponsor: ALICE },
    });
    const bobReply = makeReviewComment({
      id: "c-3",
      threadId: "t-2",
      createdAt: "2026-11-19T10:02:00.000Z",
      author: { id: BOB.actorId },
      authorship: { author: BOB },
    });

    // Alice's own human comment is never unread for Alice, even with no lastReadAt
    expect(isCommentUnread(aliceRoot, ALICE, undefined)).toBe(false);

    // Agent reply sponsored by Alice IS unread for Alice (author.actorId !== Alice.actorId)!
    expect(isCommentUnread(agentReply, ALICE, "2026-11-19T10:00:00.000Z")).toBe(true);
    expect(isCommentUnread(agentReply, ALICE, "2026-11-19T10:05:00.000Z")).toBe(false);
    expect(isCommentUnread(agentReply, ALICE, "2026-11-19T10:06:00.000Z")).toBe(false);

    // Timezone-aware comparison: 12:05+02:00 === 10:05Z -> NOT unread
    expect(isCommentUnread(agentReply, ALICE, "2026-11-19T12:05:00.000+02:00")).toBe(false);

    const threads = groupCommentsIntoThreads([aliceRoot, agentReply, bobReply]);
    const readStateRecord = { "t-1": "2026-11-19T10:01:00.000Z" };
    const readStateMap = new Map<string, string>([
      ["t-1", "2026-11-19T10:06:00.000Z"],
      ["t-2", "2026-11-19T10:01:00.000Z"],
    ]);

    expect(isUnread(threads[0]!, ALICE, readStateRecord)).toBe(true);
    expect(countUnreadComments(threads[0]!, ALICE, readStateRecord)).toBe(1);
    expect(countUnreadThreads(threads, ALICE, readStateRecord)).toBe(2);

    expect(isUnread(threads[0]!, ALICE, readStateMap)).toBe(false);
    expect(isUnread(threads[1]!, ALICE, readStateMap)).toBe(true);
    expect(countUnreadThreads(threads, ALICE, readStateMap)).toBe(1);
  });
});
