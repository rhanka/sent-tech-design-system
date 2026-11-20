import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFixtureCommentsAdapter,
  encodeAnchor,
  groupCommentsIntoThreads,
  type CollaborationActor,
  type CommentTarget,
  type ThreadFilter,
} from "@sentropic/design-system-review-core";
import ReviewModeToggle from "./lib/ReviewModeToggle.svelte";
import OrphanList from "./lib/OrphanList.svelte";
import ThreadPanel from "./lib/ThreadPanel.svelte";

const TENANT = "ws-ds5";
const TARGET: CommentTarget = { kind: "artifact", id: "art-panel-1" };

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

function createReviewFixture() {
  const humans = new Map<string, CollaborationActor>([
    [ALICE.actorId, ALICE],
    [BOB.actorId, BOB],
  ]);

  return createFixtureCommentsAdapter({
    caller: { userId: ALICE.actorId, actorKind: "human" },
    workspaceMembers: [ALICE.actorId, BOB.actorId],
    authorshipResolver: {
      resolveHumanActor: (id) => humans.get(id),
    },
  });
}

async function seedMixedThreads() {
  const fixture = createReviewFixture();
  const sk1 = encodeAnchor({
    t: "text",
    q: { exact: "Budget forecast" },
    v: "v1",
  });
  const sk2 = encodeAnchor({
    t: "element",
    sel: "section > p:nth-of-type(2)",
    aid: "sec-risks",
    v: "v1",
  });
  const sk3 = encodeAnchor({
    t: "text",
    q: { exact: "Legacy appendix" },
    v: "v1",
  });

  // 1. Open human thread by Alice (Mine = yes, Unread for Alice = no)
  const tAlice = await fixture.adapter.create({
    tenant: TENANT,
    target: { ...TARGET, sectionKey: sk1 },
    body: "Please double-check the budget forecast.",
  });

  // 2. Open agent thread sponsored by Alice (Mine for Alice = NO, Unread for Alice = YES!)
  fixture.setCaller({
    userId: ALICE.actorId,
    actorKind: "agent",
    agentActor: CLAUDE_AGENT,
    runId: "run-501",
  });
  const tAgent = await fixture.adapter.create({
    tenant: TENANT,
    target: { ...TARGET, sectionKey: sk2 },
    body: "Risk table is missing mitigation owner.",
    provenance: { toolCallId: "tc-ds5-agent-1" },
  });

  // 3. Closed thread by Bob (Resolved = yes, Mine for Alice = no, Unread for Alice = yes)
  fixture.setCaller({ userId: BOB.actorId, actorKind: "human" });
  const tResolved = await fixture.adapter.create({
    tenant: TENANT,
    target: { ...TARGET, sectionKey: sk3 },
    body: "Appendix wording updated.",
  });
  await fixture.adapter.setState(TENANT, tResolved.threadId, "closed");

  // 4. Orphan thread (no sectionKey) by Bob
  const tOrphan = await fixture.adapter.create({
    tenant: TENANT,
    target: TARGET,
    body: "Removed section comment still needs sign-off.",
  });

  const allComments = await fixture.adapter.list(TENANT, TARGET);
  const allThreads = groupCommentsIntoThreads(allComments);
  const attached = allThreads.filter((t) => t.threadId !== tOrphan.threadId);
  const orphaned = allThreads.filter((t) => t.threadId === tOrphan.threadId);

  return { fixture, attached, orphaned, ids: { tAlice, tAgent, tResolved, tOrphan } };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DS-5: ReviewModeToggle", () => {
  it("renders open count ('Review · 3'), unread indicator, aria-pressed state, and toggles mode", async () => {
    const onModeChange = vi.fn();
    const { rerender } = render(ReviewModeToggle, {
      props: {
        mode: "view",
        openCount: 3,
        unreadCount: 2,
        onModeChange,
      },
    });

    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.textContent).toContain("Review");
    expect(btn.textContent).toContain("3");
    expect(btn.querySelector(".st-review-toggle__unread")).toBeTruthy();

    await fireEvent.click(btn);
    expect(onModeChange).toHaveBeenCalledWith("review");

    await rerender({ mode: "review", openCount: 3, unreadCount: 0 });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.querySelector(".st-review-toggle__unread")).toBeNull();

    await fireEvent.click(btn);
    expect(onModeChange).toHaveBeenLastCalledWith("view");
  });

  it("does not emit onModeChange when disabled", async () => {
    const onModeChange = vi.fn();
    render(ReviewModeToggle, {
      props: { mode: "view", openCount: 1, disabled: true, onModeChange },
    });
    const btn = screen.getByRole("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await fireEvent.click(btn);
    expect(onModeChange).not.toHaveBeenCalled();
  });
});

describe("DS-5: OrphanList", () => {
  it("renders 'No longer attached', keeps orphans selectable and resolvable, and hides Re-anchor unless bound", async () => {
    const { orphaned, ids } = await seedMixedThreads();
    const onSelect = vi.fn();
    const onResolve = vi.fn();
    const onReanchor = vi.fn();

    const { rerender } = render(OrphanList, {
      props: {
        threads: orphaned,
        currentUser: ALICE,
        onSelect,
        onResolve,
      },
    });

    expect(screen.getByText("No longer attached")).toBeTruthy();
    expect(screen.getByText(/Removed section comment/)).toBeTruthy();
    // Re-anchor MUST be hidden when onReanchor is not bound (SPEC-r6 §2/§3)
    expect(screen.queryByRole("button", { name: "Re-anchor" })).toBeNull();

    // Selecting and resolving still work on orphans
    await fireEvent.click(screen.getByRole("button", { name: /Open thread/i }));
    expect(onSelect).toHaveBeenCalledWith(ids.tOrphan.threadId);

    await fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(onResolve).toHaveBeenCalledWith(ids.tOrphan.threadId);

    // Binding onReanchor reveals the Re-anchor action
    await rerender({ onReanchor });
    const reanchorBtn = screen.getByRole("button", { name: "Re-anchor" });
    await fireEvent.click(reanchorBtn);
    expect(onReanchor).toHaveBeenCalledWith(ids.tOrphan.threadId);
  });
});

describe("DS-5: ThreadPanel", () => {
  it("renders a non-modal <aside> at >=48rem (no Drawer scrim, no aria-modal) with All/Open/Resolved/Mine filters, unread markers, orphan header count, and EmptyState", async () => {
    const { attached, orphaned, ids } = await seedMixedThreads();
    const onFilterChange = vi.fn();
    const onSelect = vi.fn();
    const onMarkRead = vi.fn();
    let currentFilter: ThreadFilter = "all";

    const headerActions = createRawSnippet(() => ({
      render: () => '<button type="button" data-testid="custom-header-action">Export</button>',
    }));

    const { container, rerender } = render(ThreadPanel, {
      props: {
        threads: attached,
        orphaned,
        currentUser: ALICE,
        filter: currentFilter,
        compact: false,
        headerActions,
        onFilterChange: (next) => {
          currentFilter = next;
          onFilterChange(next);
        },
        onSelect,
        onMarkRead,
      },
    });

    // Non-modal <aside> landmark at >=48rem: NO Drawer backdrop, NO aria-modal="true"
    const aside = container.querySelector("aside.st-review-panel");
    expect(aside).toBeTruthy();
    expect(aside?.getAttribute("aria-modal")).toBeNull();
    expect(container.querySelector(".st-drawer__backdrop")).toBeNull();

    // Header actions slot + orphan count badge in header
    expect(screen.getByTestId("custom-header-action")).toBeTruthy();
    expect(container.querySelector(".st-review-panel__orphan-count")?.textContent).toContain("1");

    // Counts across 4 threads (3 attached + 1 orphan): All=4, Open=3, Resolved=1, Mine=1 (agent comment sponsored by Alice is NOT Mine!)
    const allTab = screen.getByRole("tab", { name: /All.*4/i });
    const openTab = screen.getByRole("tab", { name: /Open.*3/i });
    const resolvedTab = screen.getByRole("tab", { name: /Resolved.*1/i });
    const mineTab = screen.getByRole("tab", { name: /Mine.*1/i });
    expect(allTab).toBeTruthy();
    expect(openTab).toBeTruthy();
    expect(resolvedTab).toBeTruthy();
    expect(mineTab).toBeTruthy();

    // Agent thread sponsored by Alice is rendered with two icons AND marked unread for Alice
    const agentItem = container.querySelector(`[data-thread-id="${ids.tAgent.threadId}"]`);
    expect(agentItem?.getAttribute("data-unread")).toBe("true");
    expect(agentItem?.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Comment by Claude Reviewer, agent, on behalf of Alice Martin",
    );

    // Filter to Mine -> only Alice's human thread (NOT Claude's sponsored agent thread)
    await fireEvent.click(mineTab);
    expect(onFilterChange).toHaveBeenCalledWith("mine");
    await rerender({ filter: "mine" });
    expect(container.querySelectorAll(".st-review-panel__thread-card")).toHaveLength(1);
    expect(container.querySelector(`[data-thread-id="${ids.tAlice.threadId}"]`)).toBeTruthy();
    expect(container.querySelector(`[data-thread-id="${ids.tAgent.threadId}"]`)).toBeNull();

    // Filter to Resolved -> only Bob's closed thread, labelled "Resolved"
    await fireEvent.click(resolvedTab);
    await rerender({ filter: "resolved" });
    expect(container.querySelectorAll(".st-review-panel__thread-card")).toHaveLength(1);
    expect(container.querySelector(`[data-thread-id="${ids.tResolved.threadId}"]`)?.textContent).toContain(
      "Resolved",
    );

    // Empty state when no threads match
    await rerender({ threads: [], orphaned: [], filter: "open" });
    expect(container.querySelector(".st-empty-state")).toBeTruthy();
  });

  it("renders inside Drawer side='bottom' at <48rem and scopes Escape to the active inner layer only", async () => {
    const { attached, orphaned, ids } = await seedMixedThreads();
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const onReply = vi.fn();

    const { container, rerender } = render(ThreadPanel, {
      props: {
        threads: attached,
        orphaned,
        currentUser: ALICE,
        activeThreadId: ids.tAlice.threadId,
        compact: true,
        open: true,
        onClose,
        onSelect,
        onReply,
        onEditComment: vi.fn(),
      },
    });

    // <48rem uses Drawer with side="bottom" (modal bottom sheet)
    const drawer = container.querySelector("aside.st-drawer.st-drawer--bottom");
    expect(drawer).toBeTruthy();
    expect(drawer?.getAttribute("aria-modal")).toBe("true");

    // Open inline edit composer inside the bottom sheet and press Escape -> ONLY the edit composer closes, bottom sheet stays OPEN!
    const editBtn = container.querySelector('button[aria-label="Edit comment"]')!;
    await fireEvent.click(editBtn);
    const editTextarea = container.querySelector(".st-review-thread__edit-form textarea") as HTMLTextAreaElement;
    expect(editTextarea).toBeTruthy();

    await fireEvent.keyDown(editTextarea, { key: "Escape" });
    // Edit composer closed, Drawer STILL open, onClose NOT called!
    expect(container.querySelector(".st-review-thread__edit-form")).toBeNull();
    expect(container.querySelector("aside.st-drawer.st-drawer--bottom")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();

    // Verify heading receives focus when selecting a new thread in desktop aside mode
    await rerender({ compact: false, activeThreadId: null });
    await rerender({ compact: false, activeThreadId: ids.tAgent.threadId });
    await waitFor(() => {
      const heading = container.querySelector(".st-review-panel__heading");
      expect(document.activeElement).toBe(heading);
    });

    // Pressing Escape on the non-modal aside with an active thread returns to list (calls onSelect(null)), NOT pre-empting composers
    const aside = container.querySelector("aside.st-review-panel")!;
    await fireEvent.keyDown(aside, { key: "Escape" });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
