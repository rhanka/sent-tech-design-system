import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import {
  ReviewAdapterError,
  createFixtureCommentsAdapter,
  encodeAnchor,
  formatSyntheticToolCallId,
  groupCommentsIntoThreads,
  type CollaborationActor,
  type CommentTarget,
  type ReviewComment,
} from "@sentropic/design-system-review-core";
import CommentAuthorship from "./lib/CommentAuthorship.svelte";
import CommentPin from "./lib/CommentPin.svelte";
import CommentComposer from "./lib/CommentComposer.svelte";
import CommentThread from "./lib/CommentThread.svelte";
import {
  formatAnchorLabel,
  isResolutionReply,
  parseCommentBody,
  parseCommentRefs,
  sanitizeActorColor,
} from "./lib/review-markdown.js";

const TENANT = "ws-review";
const TARGET: CommentTarget = { kind: "artifact", id: "art-spec-1" };

const ALICE: CollaborationActor = {
  actorId: "user-alice",
  kind: "human",
  displayLabel: "Alice Martin",
  color: "#2563eb",
};

const BOB: CollaborationActor = {
  actorId: "user-bob",
  kind: "human",
  displayLabel: "Bob Tremblay",
  color: "#059669",
};

const CLAUDE_AGENT: CollaborationActor = {
  actorId: "agent-claude",
  kind: "agent",
  displayLabel: "Claude Reviewer",
  color: "#7c3aed",
};

const NHI_BOT: CollaborationActor = {
  actorId: "nhi-ci",
  kind: "nhi",
  displayLabel: "Policy Bot",
  color: "#0284c7",
};

function createReviewFixture() {
  const humanById = new Map<string, CollaborationActor>([
    [ALICE.actorId, ALICE],
    [BOB.actorId, BOB],
  ]);

  return createFixtureCommentsAdapter({
    caller: { userId: ALICE.actorId, actorKind: "human" },
    workspaceMembers: [ALICE.actorId, BOB.actorId],
    authorshipResolver: {
      resolveHumanActor: (id) => humanById.get(id),
    },
  });
}

describe("DS-3: review-markdown helpers (safe markdown-lite, Ref chips, resolution record)", () => {
  it("keeps raw HTML as escaped literal text and rejects unsafe link protocols", () => {
    const parsed = parseCommentBody(
      '<script>alert("xss")</script> **bold** `code` [bad](javascript:alert(1)) [ok](https://example.com/doc)',
    );
    expect(parsed.blocks.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(parsed.blocks);
    expect(serialized).toContain('<script>alert(\\"xss\\")</script>');
    expect(serialized).not.toContain('"href":"javascript:');
    expect(serialized).toContain('"href":"https://example.com/doc"');
  });

  it("extracts Ref: decision and Ref: track trailers into chips", () => {
    const body = "Promoted after team sign-off.\n\nRef: decision:dec-42\nRef: track:TRK-108";
    const refs = parseCommentRefs(body);
    expect(refs).toEqual([
      { kind: "decision", id: "dec-42", raw: "Ref: decision:dec-42" },
      { kind: "track", id: "TRK-108", raw: "Ref: track:TRK-108" },
    ]);
    const parsed = parseCommentBody(body);
    expect(parsed.refs).toHaveLength(2);
    expect(JSON.stringify(parsed.blocks)).toContain("Promoted after team sign-off.");
    expect(JSON.stringify(parsed.blocks)).not.toContain("Ref: decision:dec-42");
  });

  it("detects resolution replies matching 'Resolved in <version|commit>'", () => {
    expect(isResolutionReply("Resolved in v2.4.0")).toEqual({ version: "v2.4.0" });
    expect(isResolutionReply("Resolved in 8a6923aa8\n\nFixed typo.")).toEqual({
      version: "8a6923aa8",
    });
    expect(isResolutionReply("Still investigating this edge case.")).toBeNull();
  });

  it("formats anchor labels clamped to <= 140 chars and sanitizes actor colors", () => {
    const longQuote = "a".repeat(200);
    const label = formatAnchorLabel(
      { t: "text", q: { exact: longQuote }, v: "1" },
      140,
    );
    expect(label.length).toBeLessThanOrEqual(140);
    expect(label.endsWith("…")).toBe(true);
    expect(formatAnchorLabel({ t: "element", sel: "section > p:nth-of-type(2)", aid: "sec-intro", v: "1" })).toBe(
      "#sec-intro",
    );
    expect(formatAnchorLabel(null)).toBe("Unattached");

    expect(sanitizeActorColor("#7c3aed")).toBe("#7c3aed");
    expect(sanitizeActorColor("red; background-image: url(evil)")).toBe("#64748b");
  });
});

describe("DS-3: CommentAuthorship (two-icon stack on AvatarGroup, single role=img)", () => {
  it("renders a single avatar and accessible label for a human author", () => {
    const { container } = render(CommentAuthorship, {
      props: { author: ALICE },
    });

    const imgRoles = container.querySelectorAll('[role="img"]');
    expect(imgRoles).toHaveLength(1);
    expect(imgRoles[0]?.getAttribute("aria-label")).toBe("Comment by Alice Martin");
    expect(imgRoles[0]?.classList.contains("st-avatarGroup")).toBe(true);

    const vignettes = container.querySelectorAll(".st-review-authorship__vignette");
    expect(vignettes).toHaveLength(1);
    expect(vignettes[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(container.textContent).toContain("Alice Martin");
    expect(container.textContent).not.toContain("on behalf of");
  });

  it("renders two icons (agent + sponsoring owner) under one role=img with inner vignettes aria-hidden", () => {
    const { container } = render(CommentAuthorship, {
      props: { author: CLAUDE_AGENT, sponsor: ALICE },
    });

    const imgRoles = container.querySelectorAll('[role="img"]');
    expect(imgRoles).toHaveLength(1);
    expect(imgRoles[0]?.getAttribute("aria-label")).toBe(
      "Comment by Claude Reviewer, agent, on behalf of Alice Martin",
    );

    const vignettes = container.querySelectorAll(".st-review-authorship__vignette");
    expect(vignettes).toHaveLength(2);
    expect(vignettes[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(vignettes[0]?.getAttribute("data-actor-kind")).toBe("agent");
    expect(vignettes[1]?.getAttribute("aria-hidden")).toBe("true");
    expect(vignettes[1]?.getAttribute("data-actor-kind")).toBe("sponsor");

    expect(container.textContent).toContain("Claude Reviewer");
    expect(container.textContent).toContain("on behalf of Alice Martin");
  });

  it("renders NHI actor kind badge and two-icon fallback after clearing live sessions", async () => {
    const fixture = createReviewFixture();
    const sectionKey = encodeAnchor({ t: "element", sel: "p:nth-of-type(1)", aid: "p-1", v: "1" });
    fixture.setCaller({
      userId: ALICE.actorId,
      actorKind: "nhi",
      agentActor: NHI_BOT,
      runId: "run-99",
    });
    const created = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey },
      body: "Automated check passed.",
      provenance: { toolCallId: formatSyntheticToolCallId("sess-1", 1) },
    });

    const { container, rerender } = render(CommentAuthorship, {
      props: {
        author: created.authorship.author,
        sponsor: created.authorship.sponsor,
      },
    });
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Comment by Policy Bot, nhi, on behalf of Alice Martin",
    );

    // Reload simulation: clear live sessions -> generic "Agent" + sponsoring owner
    fixture.clearLiveSessions();
    const listed = await fixture.adapter.list(TENANT, TARGET);
    await rerender({
      author: listed[0]!.authorship.author,
      sponsor: listed[0]!.authorship.sponsor,
    });
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Comment by Agent, agent, on behalf of Alice Martin",
    );
    expect(container.querySelectorAll(".st-review-authorship__vignette")).toHaveLength(2);
  });
});

describe("DS-3: CommentPin", () => {
  it("renders document order index, unread dot, count, and fires onActivate", async () => {
    const onActivate = vi.fn();
    render(CommentPin, {
      props: {
        index: 2,
        count: 3,
        unread: true,
        active: true,
        label: "Thread 2, 3 comments, 1 unread, on 'Budget'",
        variant: "inline",
        onActivate,
      },
    });

    const btn = screen.getByRole("button", {
      name: "Thread 2, 3 comments, 1 unread, on 'Budget'",
    });
    expect(btn.getAttribute("tabindex")).toBe("0");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.getAttribute("data-unread")).toBe("true");
    expect(btn.getAttribute("data-resolved")).toBe("false");
    expect(btn.textContent).toContain("2");
    expect(btn.querySelector(".st-review-pin__unread-dot")).toBeTruthy();

    await fireEvent.click(btn);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("renders resolved check state and sets tabindex=-1 on margin duplicates", () => {
    const { container } = render(CommentPin, {
      props: {
        index: 4,
        count: 1,
        resolved: true,
        label: "Thread 4, 1 comment, resolved, on 'Intro'",
        variant: "margin",
      },
    });

    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("tabindex")).toBe("-1");
    expect(btn.getAttribute("data-resolved")).toBe("true");
    expect(btn.classList.contains("st-review-pin--resolved")).toBe(true);
    expect(btn.querySelector("svg")).toBeTruthy();
  });
});

describe("DS-3: CommentComposer", () => {
  it("rejects empty body inline with role=alert and submits via Cmd/Ctrl+Enter", async () => {
    const onSubmit = vi.fn();
    render(CommentComposer, {
      props: {
        author: ALICE,
        autofocus: true,
        onSubmit,
      },
    });

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(document.activeElement).toBe(textarea);

    // Attempt empty submit
    await fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toMatch(/empty/i);

    // Regular Enter inserts newline, does NOT submit
    await fireEvent.input(textarea, { target: { value: "Line 1" } });
    await fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();

    // Ctrl+Enter submits
    await fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Line 1"));
  });

  it("cancels on Escape with stopPropagation so outer layer is not pre-empted, and traps Tab focus", async () => {
    const onCancel = vi.fn();
    const outerKeydown = vi.fn();
    const wrapper = document.createElement("div");
    wrapper.addEventListener("keydown", outerKeydown);
    document.body.appendChild(wrapper);

    try {
      render(CommentComposer, {
        target: wrapper,
        props: {
          author: ALICE,
          autofocus: true,
          trapFocus: true,
          onCancel,
        },
      });

      const textarea = screen.getByRole("textbox");
      const submitBtn = screen.getByRole("button", { name: "Comment" });

      // Shift+Tab from first focusable wraps to last
      await fireEvent.keyDown(textarea, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(submitBtn);

      // Tab from last focusable wraps back to textarea
      await fireEvent.keyDown(submitBtn, { key: "Tab" });
      expect(document.activeElement).toBe(textarea);

      // Escape cancels and does NOT bubble to outer wrapper
      outerKeydown.mockClear();
      await fireEvent.keyDown(textarea, { key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(outerKeydown).not.toHaveBeenCalled();
    } finally {
      wrapper.remove();
    }
  });

  it("rejects over-cap anchor inline and surfaces async 400 cap rejections preserving draft", async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(CommentComposer, {
      props: {
        author: ALICE,
        anchorError: "Selection anchor exceeds the 2048-character limit.",
        onSubmit,
      },
    });

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: "Valid text" } });
    await fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("2048");

    // Simulate server 400 rejection on submit -> draft preserved + role=alert
    const failingSubmit = vi.fn().mockRejectedValue(
      new ReviewAdapterError("SECTION_KEY_TOO_LONG", 400, "sectionKey exceeds 2048 characters."),
    );
    await rerender({
      author: ALICE,
      anchorError: null,
      onSubmit: failingSubmit,
    });
    await fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("2048"));
    expect(textarea.value).toBe("Valid text");
  });
});

describe("DS-3: CommentThread integrated with port-shaped fixture adapter", () => {
  it("renders quote, Open/Resolved pill, two-icon agent reply, run link, Ref chips, and resolution record", async () => {
    const fixture = createReviewFixture();
    const sectionKey = encodeAnchor({
      t: "text",
      q: { exact: "Quarterly revenue target", prefix: "The ", suffix: " is due." },
      pos: { start: 4, end: 28 },
      v: "v1",
    });

    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey },
      body: "Please verify **Q4** `<script>alert(1)</script>` numbers.",
    });

    // Sponsored agent replies with live runId + Ref trailer + resolution record
    fixture.setCaller({
      userId: ALICE.actorId,
      actorKind: "agent",
      agentActor: CLAUDE_AGENT,
      runId: "run-42",
    });
    await fixture.adapter.reply({
      tenant: TENANT,
      target: { ...TARGET, sectionKey },
      threadId: root.threadId,
      body: "Resolved in v1.4.2\n\nVerified against ledger.\n\nRef: decision:dec-12\nRef: track:TRK-77",
      provenance: { toolCallId: "tc-agent-1" },
    });

    // Non-creator participant (Bob) resolves the thread via threadId
    fixture.setCaller({ userId: BOB.actorId, actorKind: "human" });
    await fixture.adapter.setState(TENANT, root.threadId, "closed");

    const comments = await fixture.adapter.list(TENANT, TARGET);
    const [thread] = groupCommentsIntoThreads(comments);
    expect(thread).toBeDefined();

    const onReopen = vi.fn();
    const { container } = render(CommentThread, {
      props: {
        thread: thread!,
        currentUser: ALICE,
        onReopen,
        onEditComment: vi.fn(),
        onDeleteComment: vi.fn(),
      },
    });

    // Anchor quote + "Resolved" label (NEVER "Closed")
    expect(container.textContent).toContain("Quarterly revenue target");
    expect(container.querySelector(".st-review-thread__state")?.textContent?.trim()).toBe("Resolved");

    // Raw HTML escaped (no script tags created!)
    expect(container.querySelectorAll("script")).toHaveLength(0);
    expect(container.textContent).toContain("<script>alert(1)</script>");
    expect(container.querySelector("strong")?.textContent).toBe("Q4");

    // Two authorship blocks: 1 icon for Alice's root, 2 icons for Claude on behalf of Alice
    const authorshipImgs = container.querySelectorAll('.st-review-authorship [role="img"]');
    expect(authorshipImgs).toHaveLength(2);
    expect(authorshipImgs[0]?.getAttribute("aria-label")).toBe("Comment by Alice Martin");
    expect(authorshipImgs[1]?.getAttribute("aria-label")).toBe(
      "Comment by Claude Reviewer, agent, on behalf of Alice Martin",
    );

    // Run link rendered for live runId
    const runLink = container.querySelector(".st-review-thread__run-link");
    expect(runLink?.textContent).toContain("run-42");

    // Resolution record + Ref link chips
    expect(container.querySelector('[data-resolution-record="true"]')).toBeTruthy();
    const chips = container.querySelectorAll(".st-review-ref-chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]?.textContent).toContain("decision:dec-12");
    expect(chips[1]?.textContent).toContain("track:TRK-77");

    // Own-only edit/delete offered ONLY on Alice's human root comment, NOT on Claude's agent reply under Alice's owner id!
    const editButtons = container.querySelectorAll('button[aria-label="Edit comment"]');
    expect(editButtons).toHaveLength(1);
    const deleteButtons = container.querySelectorAll('button[aria-label="Delete comment"]');
    expect(deleteButtons).toHaveLength(1);

    // Closed thread shows resolved placeholder and Reopen button
    expect(container.textContent).toContain("Comment resolved. Reopen to reply.");
    expect(screen.queryByRole("textbox")).toBeNull();
    await fireEvent.click(screen.getAllByRole("button", { name: "Reopen" })[0]!);
    expect(onReopen).toHaveBeenCalledWith(root.threadId);
  });

  it("supports reply, edit, delete, optional reanchor visibility, slot override, and optimistic rollback with role=alert", async () => {
    const fixture = createReviewFixture();
    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: TARGET, // no sectionKey -> orphan thread
      body: "Initial orphan comment",
    });

    const loadThread = async () => {
      const comments = await fixture.adapter.list(TENANT, TARGET);
      return groupCommentsIntoThreads(comments)[0]!;
    };

    let currentThread = await loadThread();
    const onReanchor = vi.fn();

    const { rerender, container } = render(CommentThread, {
      props: {
        thread: currentThread,
        currentUser: ALICE,
        onReply: async (threadId, body) => {
          await fixture.adapter.reply({ tenant: TENANT, target: currentThread.target, threadId, body });
          currentThread = await loadThread();
          await rerender({ thread: currentThread });
        },
        onEditComment: async (commentId, body) => {
          await fixture.adapter.edit(TENANT, commentId, body);
          currentThread = await loadThread();
          await rerender({ thread: currentThread });
        },
        onDeleteComment: async (commentId) => {
          await fixture.adapter.remove(TENANT, commentId);
        },
        onResolve: async (threadId) => {
          await fixture.adapter.setState(TENANT, threadId, "closed");
          currentThread = await loadThread();
          await rerender({ thread: currentThread });
        },
      },
    });

    // Re-anchor hidden when onReanchor is unbound
    expect(screen.queryByRole("button", { name: "Re-anchor" })).toBeNull();

    // Bind onReanchor -> shown for orphaned thread
    await rerender({ thread: currentThread, onReanchor });
    const reanchorBtn = screen.getByRole("button", { name: "Re-anchor" });
    await fireEvent.click(reanchorBtn);
    expect(onReanchor).toHaveBeenCalledWith(root.threadId);

    // Reply via thread composer
    const replyBox = screen.getByRole("textbox");
    await fireEvent.input(replyBox, { target: { value: "Follow-up reply" } });
    await fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    await waitFor(() => expect(container.textContent).toContain("Follow-up reply"));

    // Edit own root comment
    const editButtons = container.querySelectorAll('button[aria-label="Edit comment"]');
    await fireEvent.click(editButtons[0]!);
    const editTextarea = container.querySelector(".st-review-thread__edit-form textarea") as HTMLTextAreaElement;
    expect(editTextarea.value).toBe("Initial orphan comment");
    await fireEvent.input(editTextarea, { target: { value: "Updated root comment" } });
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(container.textContent).toContain("Updated root comment");
      expect(container.textContent).toContain("edited");
    });

    // Optimistic rollback with role=alert when adapter rejects resolve (caller lacks comment right)
    fixture.setCaller({ userId: BOB.actorId, actorKind: "human", canComment: false });
    await fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/comment right/i));
    // State rolled back to Open
    expect(container.querySelector(".st-review-thread__state")?.textContent?.trim()).toBe("Open");

    // Slot override for commentBody
    const customBody = createRawSnippet((params: () => { comment: ReviewComment }) => ({
      render: () => `<div data-testid="custom-body">${params().comment.id}</div>`,
    }));
    await rerender({ thread: currentThread, commentBody: customBody });
    expect(container.querySelector('[data-testid="custom-body"]')?.textContent).toBe(root.id);
  });
});
