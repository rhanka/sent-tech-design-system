import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFixtureCommentsAdapter,
  encodeAnchor,
  type AnchorPayload,
  type CollaborationActor,
  type CommentTarget,
  type ReviewComment,
  type ReviewThread,
} from "@sentropic/design-system-review-core";
import CommentLayer from "./lib/CommentLayer.svelte";

const TENANT = "ws-layer";
const TARGET: Pick<CommentTarget, "kind" | "id"> = { kind: "artifact", id: "art-doc-1" };

const ALICE: CollaborationActor = {
  actorId: "user-alice",
  kind: "human",
  displayLabel: "Alice Martin",
  color: "#2563eb",
};

const CLAUDE_AGENT: CollaborationActor = {
  actorId: "agent-claude",
  kind: "agent",
  displayLabel: "Claude Reviewer",
  color: "#7c3aed",
};

function makeArtifactRoot(html: string): HTMLElement {
  const root = document.createElement("article");
  root.setAttribute("data-review-root", "");
  root.innerHTML = html;
  document.body.appendChild(root);

  // Give deterministic layout boxes in jsdom so pin positioning and layoutPins are measurable.
  root.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      toJSON: () => ({}),
    }) as DOMRect;

  let yCursor = 20;
  for (const el of Array.from(root.querySelectorAll("*"))) {
    const top = yCursor;
    yCursor += 60;
    (el as HTMLElement).getBoundingClientRect = () =>
      ({
        x: 16,
        y: top,
        top,
        left: 16,
        right: 760,
        bottom: top + 40,
        width: 744,
        height: 40,
        toJSON: () => ({}),
      }) as DOMRect;
    (el as HTMLElement).scrollIntoView = vi.fn();
  }

  return root;
}

function createFixture() {
  return createFixtureCommentsAdapter({
    caller: { userId: ALICE.actorId, actorKind: "human" },
    workspaceMembers: [ALICE.actorId],
    authorshipResolver: {
      resolveHumanActor: (id) => (id === ALICE.actorId ? ALICE : undefined),
    },
  });
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  window.getSelection()?.removeAllRanges();
});

describe("DS-4: CommentLayer", () => {
  it("renders zero pins and leaves links/selection untouched in view mode; shows numbered inline + margin pins in review mode without mutating artifact DOM", async () => {
    const root = makeArtifactRoot(`
      <h1 data-anchor-id="heading-1">Executive summary</h1>
      <p data-anchor-id="para-1">Quarterly revenue target is 42M € across all regions.</p>
      <p data-anchor-id="para-2">Secondary note with <a id="ext-link" href="#details">details</a> and <span data-review-passthrough><button id="pass-btn" type="button">Expand</button></span>.</p>
    `);
    const snapshotBefore = root.innerHTML;

    const fixture = createFixture();
    const skText = encodeAnchor({
      t: "text",
      q: { exact: "42M €", prefix: "Quarterly revenue target is ", suffix: " across" },
      pos: { start: 46, end: 51 },
      aid: "para-1",
      v: "v1",
    });
    const skElem = encodeAnchor({
      t: "element",
      sel: "h1:nth-of-type(1)",
      aid: "heading-1",
      v: "v1",
    });

    // Create text thread first (para-1), then element thread on heading-1 (earlier in DOM -> index 1!)
    const tPara = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skText },
      body: "Check euro conversion.",
    });
    fixture.setCaller({
      userId: ALICE.actorId,
      actorKind: "agent",
      agentActor: CLAUDE_AGENT,
      runId: "run-7",
    });
    await fixture.adapter.reply({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skText },
      threadId: tPara.threadId,
      body: "Verified against Q4 ledger.",
      provenance: { toolCallId: "tc-layer-1" },
    });

    fixture.setCaller({ userId: ALICE.actorId, actorKind: "human" });
    const tHeading = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skElem },
      body: "Tighten title.",
    });

    const comments = await fixture.adapter.list(TENANT, TARGET);
    const onSelect = vi.fn();
    const onMarkRead = vi.fn();

    const { container, rerender } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "view",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
        onSelect,
        onMarkRead,
      },
    });

    // View mode: zero pins, link click is NOT prevented
    expect(container.querySelectorAll(".st-review-pin")).toHaveLength(0);
    const link = root.querySelector("#ext-link") as HTMLAnchorElement;
    const viewClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(viewClick);
    expect(viewClick.defaultPrevented).toBe(false);

    // Switch to Review mode
    await rerender({ mode: "review" });

    // Primary pins in document order: heading-1 is index 1, para-1 is index 2
    const primaryPins = container.querySelectorAll(
      '.st-review-layer__pins button.st-review-pin[tabindex="0"]',
    );
    expect(primaryPins).toHaveLength(2);
    expect(primaryPins[0]?.getAttribute("aria-label")).toContain("Thread 1, 1 comment");
    expect(primaryPins[1]?.getAttribute("aria-label")).toContain("Thread 2, 2 comments, 1 unread");

    // Margin gutter duplicate pins have tabindex=-1
    const marginPins = container.querySelectorAll(
      '.st-review-layer__gutter button.st-review-pin[tabindex="-1"]',
    );
    expect(marginPins).toHaveLength(2);

    // Activating pin 2 selects thread, marks read, scrolls anchor into view
    await fireEvent.click(primaryPins[1]!);
    expect(onSelect).toHaveBeenCalledWith(tPara.threadId);
    expect(onMarkRead).toHaveBeenCalledWith(tPara.threadId);

    // Review mode suppresses clicks on links outside data-review-passthrough
    const reviewLinkClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(reviewLinkClick);
    expect(reviewLinkClick.defaultPrevented).toBe(true);

    // Click inside [data-review-passthrough] is NOT suppressed
    const passBtn = root.querySelector("#pass-btn") as HTMLButtonElement;
    const passClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    passBtn.dispatchEvent(passClick);
    expect(passClick.defaultPrevented).toBe(false);

    // Artifact DOM was NEVER mutated
    expect(root.innerHTML).toBe(snapshotBefore);
    expect(tHeading.threadId).toBeTruthy();
  });

  it("clusters same-element threads and lets Esc close the cluster popover only", async () => {
    const root = makeArtifactRoot(`
      <p data-anchor-id="shared-p">Shared target paragraph.</p>
    `);
    const fixture = createFixture();
    const sk = encodeAnchor({
      t: "element",
      sel: "p:nth-of-type(1)",
      aid: "shared-p",
      v: "v1",
    });

    const c1 = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: sk },
      body: "First thread on shared paragraph",
    });
    const c2 = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: sk },
      body: "Second thread on shared paragraph",
    });
    const comments = await fixture.adapter.list(TENANT, TARGET);
    const onSelect = vi.fn();

    const { container } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
        onSelect,
      },
    });

    const clusterPin = container.querySelector('.st-review-layer__pins button[data-pin-variant="cluster"]');
    expect(clusterPin).toBeTruthy();

    // Activate cluster pin -> opens cluster popover listing both threads
    await fireEvent.click(clusterPin!);
    const popover = container.querySelector(".st-review-layer__cluster-popover");
    expect(popover).toBeTruthy();
    expect(popover?.textContent).toContain("First thread on shared paragraph");
    expect(popover?.textContent).toContain("Second thread on shared paragraph");

    // Escape closes cluster popover
    await fireEvent.keyDown(popover!, { key: "Escape" });
    expect(container.querySelector(".st-review-layer__cluster-popover")).toBeNull();

    // Reopen and pick second thread
    await fireEvent.click(clusterPin!);
    const items = container.querySelectorAll(".st-review-layer__cluster-item");
    expect(items).toHaveLength(2);
    await fireEvent.click(items[1]!);
    expect(onSelect).toHaveBeenCalledWith(c2.threadId);
    expect(c1.threadId).not.toBe(c2.threadId);
  });

  it("re-attaches moved anchors and classifies removed anchors as orphans after DOM re-render", async () => {
    const root = makeArtifactRoot(`
      <p data-anchor-id="keep-p">Anchor that moves after re-render.</p>
      <p data-anchor-id="drop-p">Anchor that will be deleted.</p>
    `);
    const fixture = createFixture();
    const skKeep = encodeAnchor({
      t: "element",
      sel: "p:nth-of-type(1)",
      aid: "keep-p",
      v: "v1",
    });
    const skDrop = encodeAnchor({
      t: "element",
      sel: "p:nth-of-type(2)",
      aid: "drop-p",
      v: "v1",
    });

    await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skKeep },
      body: "Keep me attached.",
    });
    const dropped = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skDrop },
      body: "I will become orphaned.",
    });
    const comments = await fixture.adapter.list(TENANT, TARGET);
    let latestOrphans: ReviewThread[] = [];

    const { container, rerender } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
        onOrphansChange: (orphans) => {
          latestOrphans = orphans;
        },
      },
    });

    expect(container.querySelectorAll('.st-review-layer__pins button.st-review-pin')).toHaveLength(2);
    expect(latestOrphans).toHaveLength(0);

    // Version change alone never orphans
    await rerender({ artifactVersion: "v2" });
    expect(container.querySelectorAll('.st-review-layer__pins button.st-review-pin')).toHaveLength(2);
    expect(latestOrphans).toHaveLength(0);

    // Mutate artifact DOM: insert a new heading before keep-p (shifting it) and remove drop-p
    const prepended = document.createElement("h2");
    prepended.textContent = "Inserted section";
    root.insertBefore(prepended, root.firstChild);
    root.querySelector('[data-anchor-id="drop-p"]')?.remove();

    await waitFor(() => {
      expect(container.querySelectorAll('.st-review-layer__pins button.st-review-pin')).toHaveLength(1);
      expect(latestOrphans).toHaveLength(1);
    });
    expect(latestOrphans[0]?.threadId).toBe(dropped.threadId);
    // Live region announced the orphan transition
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toMatch(/unattached|orphan/i);
  });

  it("creates comments via element click, 150ms text selection settle, and Alt+Shift+C (not while typing)", async () => {
    const root = makeArtifactRoot(`
      <p data-anchor-id="target-p">Review this exact revenue figure carefully.</p>
      <div data-commentable="card-1">Custom commentable block</div>
    `);
    const fixture = createFixture();
    let comments: ReviewComment[] = [];

    const onCreate = vi.fn(async (payload: { target: CommentTarget; sectionKey: string; body: string }) => {
      await fixture.adapter.create({
        tenant: TENANT,
        target: payload.target,
        body: payload.body,
      });
      comments = await fixture.adapter.list(TENANT, TARGET);
    });

    const { container, rerender } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v3",
        comments,
        currentUser: ALICE,
        onCreate,
      },
    });

    // 1. Element click on [data-commentable] opens composer -> submit emits onCreate with encoded a1: sectionKey
    const customBlock = root.querySelector('[data-commentable="card-1"]') as HTMLElement;
    await fireEvent.click(customBlock);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: "Nice custom block." } });
    await fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    const firstCall = onCreate.mock.calls[0]![0];
    expect(firstCall.target.kind).toBe("artifact");
    expect(firstCall.target.id).toBe("art-doc-1");
    expect(firstCall.sectionKey.startsWith("a1:")).toBe(true);
    expect(firstCall.body).toBe("Nice custom block.");

    await rerender({ comments });
    expect(container.querySelectorAll('.st-review-layer__pins button.st-review-pin')).toHaveLength(1);

    // 2. Text selection -> 150ms settle -> floating Add comment -> opens composer
    vi.useFakeTimers();
    const para = root.querySelector('[data-anchor-id="target-p"]')!;
    const textNode = para.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 12);
    range.setEnd(textNode, 32); // "exact revenue figure"
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);

    document.dispatchEvent(new Event("selectionchange"));
    // Before 150ms settle, trigger is NOT shown yet
    vi.advanceTimersByTime(100);
    expect(screen.queryByRole("button", { name: "Add comment" })).toBeNull();

    // After 150ms settle, floating Add comment trigger appears
    vi.advanceTimersByTime(60);
    vi.useRealTimers();
    const addTrigger = await screen.findByRole("button", { name: "Add comment" });
    await fireEvent.click(addTrigger);
    expect(screen.getByRole("textbox")).toBeTruthy();

    // Cancel with Escape closes composer
    await fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByRole("textbox")).toBeNull();

    // 3. Alt+Shift+C comments the active selection (ignored while typing in an input)
    const externalInput = document.createElement("input");
    document.body.appendChild(externalInput);
    externalInput.focus();
    await fireEvent.keyDown(externalInput, { key: "C", altKey: true, shiftKey: true });
    expect(container.querySelector(".st-review-layer__composer")).toBeNull();

    externalInput.blur();
    externalInput.remove();
    // Re-establish the text selection inside the artifact (focusing an <input> clears document selection).
    const selAfter = window.getSelection()!;
    selAfter.removeAllRanges();
    selAfter.addRange(range);
    await fireEvent.keyDown(document, { key: "C", altKey: true, shiftKey: true });
    expect(container.querySelector(".st-review-layer__composer")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Comment body" })).toBeTruthy();
  });

  it("confirms exit when switching from review to view with an unsaved draft and supports custom composer slot", async () => {
    const root = makeArtifactRoot(`<p data-anchor-id="draft-p">Draft target.</p>`);
    const onModeChange = vi.fn();

    const { rerender } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments: [],
        currentUser: ALICE,
        onModeChange,
      },
    });

    await fireEvent.click(root.querySelector('[data-anchor-id="draft-p"]')!);
    const textarea = screen.getByRole("textbox");
    await fireEvent.input(textarea, { target: { value: "Unsaved draft content" } });

    // Host flips mode to "view" -> confirmation dialog appears instead of silently losing draft
    await rerender({ mode: "view" });
    const confirmDialog = screen.getByRole("alertdialog");
    expect(confirmDialog.textContent).toMatch(/discard/i);

    // Keep editing restores review mode via onModeChange
    await fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(onModeChange).toHaveBeenCalledWith("review");
    await rerender({ mode: "review" });
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Unsaved draft content");

    // Flip to view again and confirm discard
    await rerender({ mode: "view" });
    await fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();

    // Custom composer snippet slot
    const customComposer = createRawSnippet(
      (params: () => { anchor: AnchorPayload; submit: (body: string) => void; cancel: () => void }) => ({
        render: () => `<div data-testid="custom-composer">${params().anchor.t}</div>`,
      }),
    );
    await rerender({ mode: "review", composer: customComposer });
    await fireEvent.click(root.querySelector('[data-anchor-id="draft-p"]')!);
    expect(screen.getByTestId("custom-composer").textContent).toBe("element");
  });
});
