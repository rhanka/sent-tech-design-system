import { describe, expect, it } from "vitest";

import {
  COMMENT_STATE_UI_LABELS,
  FALLBACK_ACTOR_COLOR,
  GENERIC_AGENT_LABEL,
  assertValidAgentWriteProvenance,
  canEditOrDeleteComment,
  formatSyntheticToolCallId,
  getCommentStateLabel,
  isAgentProvenance,
  isHumanComment,
  normalizeCommentState,
  normalizeCommentTarget,
  resolveAuthorshipFromFallback,
  toLegacyWireCommentState,
  type CollaborationActor,
  type Comment,
  type CommentTarget,
  type ReviewComment,
} from "../src/index.js";

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "c-1",
    tenant: { workspaceId: "ws-1" },
    target: { kind: "artifact", id: "art-1" },
    threadId: "t-1",
    author: { id: "user-alice" },
    state: "open",
    body: "Please clarify this metric.",
    createdAt: "2026-11-19T12:00:00.000Z",
    ...overrides,
  };
}

describe("DS-1 contract vocabulary, target normalisation & state labels", () => {
  it("should expose UI label 'Resolved' for state 'closed' and 'Open' for 'open'", () => {
    expect(COMMENT_STATE_UI_LABELS).toEqual({ open: "Open", closed: "Resolved" });
    expect(getCommentStateLabel("open")).toBe("Open");
    expect(getCommentStateLabel("closed")).toBe("Resolved");
  });

  it("should map interim legacy wire state 'resolved' <-> 'closed' cleanly", () => {
    expect(normalizeCommentState("open")).toBe("open");
    expect(normalizeCommentState("closed")).toBe("closed");
    expect(normalizeCommentState("resolved")).toBe("closed");

    expect(toLegacyWireCommentState("open")).toBe("open");
    expect(toLegacyWireCommentState("closed")).toBe("resolved");
  });

  it("should normalise record+recordType:'artifact' target to kind:'artifact' dropping recordType", () => {
    const raw: CommentTarget = {
      kind: "record",
      id: "art-42",
      recordType: "artifact",
      sectionKey: "a1:abc",
    };
    const normalized = normalizeCommentTarget(raw);
    expect(normalized).toEqual({
      kind: "artifact",
      id: "art-42",
      sectionKey: "a1:abc",
    });
    expect("recordType" in normalized).toBe(false);
  });

  it("should pass through already-normalised artifact and non-artifact record targets", () => {
    expect(normalizeCommentTarget({ kind: "artifact", id: "art-1" })).toEqual({
      kind: "artifact",
      id: "art-1",
    });
    expect(
      normalizeCommentTarget({ kind: "record", id: "rec-1", recordType: "invoice" }),
    ).toEqual({
      kind: "record",
      id: "rec-1",
      recordType: "invoice",
    });
  });
});

describe("DS-1 authorship fallback (owner id + provenance)", () => {
  const alice: CollaborationActor = {
    actorId: "user-alice",
    kind: "human",
    displayLabel: "Alice",
    color: "#2563eb",
  };
  const reviewerAgent: CollaborationActor = {
    actorId: "agent-claude",
    kind: "agent",
    displayLabel: "Claude",
    color: "#7c3aed",
  };

  it("should resolve a row without provenance as a human comment with no sponsor", () => {
    const comment = makeComment({ author: { id: "user-alice" } });
    expect(isHumanComment(comment)).toBe(true);
    expect(isAgentProvenance(comment.provenance)).toBe(false);

    const authorship = resolveAuthorshipFromFallback(comment, {
      resolveHumanActor: (id) => (id === "user-alice" ? alice : undefined),
    });

    expect(authorship).toEqual({ author: alice });
    expect("sponsor" in authorship).toBe(false);
    expect("runId" in authorship).toBe(false);
  });

  it("should never infer kind from an id when provenance is absent", () => {
    const comment = makeComment({ author: { id: "agent-bot-999" } });
    const authorship = resolveAuthorshipFromFallback(comment);

    expect(authorship.author).toEqual({
      actorId: "agent-bot-999",
      kind: "human",
      displayLabel: "agent-bot-999",
      color: FALLBACK_ACTOR_COLOR,
    });
    expect("sponsor" in authorship).toBe(false);
  });

  it("should resolve an agent comment with sponsor = owner and live runId from session resolver", () => {
    const comment = makeComment({
      author: { id: "user-alice" },
      provenance: { toolCallId: "tc-101" },
    });
    expect(isHumanComment(comment)).toBe(false);
    expect(isAgentProvenance(comment.provenance)).toBe(true);

    const authorship = resolveAuthorshipFromFallback(comment, {
      resolveHumanActor: (id) => (id === "user-alice" ? alice : undefined),
      resolveAgentFromProvenance: (prov) =>
        prov.toolCallId === "tc-101"
          ? { actor: reviewerAgent, runId: "run-live-77" }
          : undefined,
    });

    expect(authorship).toEqual({
      author: reviewerAgent,
      sponsor: alice,
      runId: "run-live-77",
    });
  });

  it("should fall back to generic 'Agent' icon beside owner when agent cannot be resolved", () => {
    const comment = makeComment({
      author: { id: "user-alice" },
      provenance: { toolCallId: "agent:sess-9:1" },
    });

    const authorship = resolveAuthorshipFromFallback(comment, {
      resolveHumanActor: (id) => (id === "user-alice" ? alice : undefined),
    });

    expect(authorship.sponsor).toEqual(alice);
    expect(authorship.author.kind).toBe("agent");
    expect(authorship.author.displayLabel).toBe(GENERIC_AGENT_LABEL);
    expect(authorship.author.displayLabel).toBe("Agent");
    expect(authorship.author.actorId).not.toBe(alice.actorId);
    expect("runId" in authorship).toBe(false);
  });

  it("should not treat provenance with only runId (missing toolCallId) as valid agent provenance", () => {
    const badComment = makeComment({
      provenance: { runId: "run-only" },
    });
    expect(isAgentProvenance(badComment.provenance)).toBe(false);
    expect(isHumanComment(badComment)).toBe(true);

    expect(() =>
      assertValidAgentWriteProvenance({ runId: "run-only" }, "agent"),
    ).toThrow(/toolCallId/i);
    expect(() =>
      assertValidAgentWriteProvenance(undefined, "nhi"),
    ).toThrow(/toolCallId/i);
    expect(() =>
      assertValidAgentWriteProvenance({ toolCallId: "   " }, "agent"),
    ).toThrow(/toolCallId/i);
    expect(() =>
      assertValidAgentWriteProvenance({ toolCallId: "tc-1" }, "agent"),
    ).not.toThrow();
    expect(() =>
      assertValidAgentWriteProvenance(undefined, "human"),
    ).not.toThrow();
  });

  it("should format synthetic agent toolCallId as agent:<sessionId>:<seq>", () => {
    expect(formatSyntheticToolCallId("sess-42", 1)).toBe("agent:sess-42:1");
    expect(() => formatSyntheticToolCallId("", 1)).toThrow();
    expect(() => formatSyntheticToolCallId("sess-42", -1)).toThrow();
  });

  it("should offer edit/delete only on human comments of the current user (or admin)", () => {
    const humanOwn: ReviewComment = {
      ...makeComment({ author: { id: "user-alice" } }),
      authorship: { author: alice },
    };
    const agentSponsoredByAlice: ReviewComment = {
      ...makeComment({
        author: { id: "user-alice" },
        provenance: { toolCallId: "tc-1" },
      }),
      authorship: { author: reviewerAgent, sponsor: alice },
    };
    const otherHuman: ReviewComment = {
      ...makeComment({ author: { id: "user-bob" } }),
      authorship: {
        author: { actorId: "user-bob", kind: "human", displayLabel: "Bob", color: "#16a34a" },
      },
    };

    expect(canEditOrDeleteComment(humanOwn, alice)).toBe(true);
    expect(canEditOrDeleteComment(agentSponsoredByAlice, alice)).toBe(false);
    expect(canEditOrDeleteComment(otherHuman, alice)).toBe(false);
    expect(canEditOrDeleteComment(otherHuman, alice, { canModerate: true })).toBe(true);
  });
});
