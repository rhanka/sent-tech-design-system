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

    // Activate cluster pin -> opens cluster popover listing both threads and focuses first item
    const windowEscSpy = vi.fn();
    const onWindowKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") windowEscSpy();
    };
    window.addEventListener("keydown", onWindowKeydown);
    try {
      await fireEvent.click(clusterPin!);
      const popover = container.querySelector(".st-review-layer__cluster-popover");
      expect(popover).toBeTruthy();
      expect(popover?.textContent).toContain("First thread on shared paragraph");
      expect(popover?.textContent).toContain("Second thread on shared paragraph");

      const firstItem = popover?.querySelector(".st-review-layer__cluster-item");
      expect(document.activeElement).toBe(firstItem);

      // Escape pressed on document.activeElement closes cluster popover ONLY (no bubble to window) and restores focus to cluster pin
      await fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      expect(container.querySelector(".st-review-layer__cluster-popover")).toBeNull();
      expect(windowEscSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(clusterPin);

      // Even if focus is moved back to the cluster pin invoker while popover is open, Escape still closes popover only
      await fireEvent.click(clusterPin!);
      expect(container.querySelector(".st-review-layer__cluster-popover")).toBeTruthy();
      (clusterPin as HTMLElement).focus();
      await fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      expect(container.querySelector(".st-review-layer__cluster-popover")).toBeNull();
      expect(windowEscSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(clusterPin);
    } finally {
      window.removeEventListener("keydown", onWindowKeydown);
    }

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
    // Focus must not drop to document.body after composer submission
    expect(document.activeElement).not.toBe(document.body);
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

  it("confirms exit when switching from review to view with an unsaved draft, traps focus/Esc in alertdialog, restores focus, and supports custom composer slot", async () => {
    const root = makeArtifactRoot(`<p data-anchor-id="draft-p">Draft target.</p>`);
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = "Toggle Review";
    document.body.appendChild(toggleBtn);

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

    // Host flips mode to "view" (e.g. via external ReviewModeToggle) -> alertdialog appears and traps focus
    toggleBtn.focus();
    await rerender({ mode: "view" });
    const confirmDialog = screen.getByRole("alertdialog");
    expect(confirmDialog.textContent).toMatch(/discard/i);

    const keepBtn = screen.getByRole("button", { name: "Keep editing" });
    const discardBtn = screen.getByRole("button", { name: "Discard draft" });
    expect(document.activeElement).toBe(keepBtn);

    // Tab / Shift+Tab focus trap inside alertdialog
    await fireEvent.keyDown(keepBtn, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(discardBtn);
    await fireEvent.keyDown(discardBtn, { key: "Tab" });
    expect(document.activeElement).toBe(keepBtn);

    // Escape closes alertdialog via Keep editing without bubbling to window
    const windowEscSpy = vi.fn();
    const onWindowKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") windowEscSpy();
    };
    window.addEventListener("keydown", onWindowKeydown);
    try {
      await fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      expect(onModeChange).toHaveBeenCalledWith("review");
      expect(windowEscSpy).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("keydown", onWindowKeydown);
    }

    await rerender({ mode: "review" });
    const restoredTextarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(restoredTextarea.value).toBe("Unsaved draft content");
    expect(document.activeElement).toBe(restoredTextarea);

    // Flip to view again from toggleBtn and confirm discard -> focus restores to toggleBtn
    toggleBtn.focus();
    await rerender({ mode: "view" });
    await fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(toggleBtn));

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

  it("positions and sizes the overlay to an external rootEl offset and follows container scroll and resize", async () => {
    const scrollContainer = document.createElement("div");
    scrollContainer.style.overflow = "auto";
    document.body.appendChild(scrollContainer);

    const root = document.createElement("article");
    root.setAttribute("data-review-root", "");
    root.innerHTML = `<p data-anchor-id="offset-p">Offset paragraph target.</p>`;
    scrollContainer.appendChild(root);

    let rootRect = { top: 120, left: 80, width: 720, height: 480 };
    const toDomRect = (r: { top: number; left: number; width: number; height: number }): DOMRect =>
      ({
        x: r.left,
        y: r.top,
        top: r.top,
        left: r.left,
        right: r.left + r.width,
        bottom: r.top + r.height,
        width: r.width,
        height: r.height,
        toJSON: () => ({}),
      }) as DOMRect;

    root.getBoundingClientRect = () => toDomRect(rootRect);
    const para = root.querySelector('[data-anchor-id="offset-p"]') as HTMLElement;
    para.getBoundingClientRect = () =>
      toDomRect({ top: rootRect.top + 40, left: rootRect.left + 20, width: 680, height: 32 });
    para.scrollIntoView = vi.fn();

    const fixture = createFixture();
    const sk = encodeAnchor({
      t: "element",
      sel: "p:nth-of-type(1)",
      aid: "offset-p",
      v: "v1",
    });
    await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: sk },
      body: "Positioned pin",
    });
    const comments = await fixture.adapter.list(TENANT, TARGET);

    const { container } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
      },
    });

    // Simulate .st-review-layer sitting below the artifact with 0px height (external rootEl without children).
    const layer = container.querySelector(".st-review-layer") as HTMLElement;
    layer.getBoundingClientRect = () => toDomRect({ top: 640, left: 20, width: 0, height: 0 });

    // Trigger resize so layerRect is picked up with our stubbed non-zero geometry.
    window.dispatchEvent(new Event("resize"));

    const overlay = container.querySelector(".st-review-layer__overlay") as HTMLElement;
    await waitFor(() => {
      expect(overlay.style.top).toBe("-520px");
      expect(overlay.style.left).toBe("60px");
      expect(overlay.style.width).toBe("720px");
      expect(overlay.style.height).toBe("480px");
    });

    // Pin anchor coordinates remain relative to rootEl inside the aligned overlay, and gutter is mounted.
    const pinAnchor = container.querySelector(".st-review-layer__pin-anchor") as HTMLElement;
    expect(pinAnchor.style.top).toBe("40px");
    expect(pinAnchor.style.left).toBe("700px");
    expect(container.querySelector(".st-review-layer__gutter")).toBeTruthy();

    // Hover outline and composer also render inside the aligned overlay relative to rootEl.
    await fireEvent.pointerOver(para);
    const hoverOutline = container.querySelector(".st-review-layer__hover-outline") as HTMLElement;
    expect(hoverOutline.style.top).toBe("40px");
    expect(hoverOutline.style.left).toBe("20px");

    await fireEvent.click(para);
    const composerEl = container.querySelector(".st-review-layer__composer") as HTMLElement;
    expect(composerEl.style.top).toBe("72px");
    expect(composerEl.style.left).toBe("20px");

    // Non-bubbling scroll inside an overflow container must be captured and update overlay bounds.
    rootRect = { top: 45, left: 80, width: 720, height: 480 };
    scrollContainer.dispatchEvent(new Event("scroll", { bubbles: false }));
    await waitFor(() => {
      expect(overlay.style.top).toBe("-595px");
      expect(overlay.style.left).toBe("60px");
    });

    // Window resize updates overlay dimensions to match resized rootEl.
    rootRect = { top: 45, left: 80, width: 640, height: 540 };
    window.dispatchEvent(new Event("resize"));
    await waitFor(() => {
      expect(overlay.style.width).toBe("640px");
      expect(overlay.style.height).toBe("540px");
    });
  });

  it("keeps the floating 'Add comment' button mounted across mousedown -> selectionchange -> mouseup -> click and keyboard focus", async () => {
    const root = makeArtifactRoot(`
      <p data-anchor-id="sel-p">Select this important clause for review.</p>
    `);
    render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments: [],
        currentUser: ALICE,
      },
    });

    const selectClause = async () => {
      vi.useFakeTimers();
      const para = root.querySelector('[data-anchor-id="sel-p"]')!;
      const textNode = para.firstChild as Text;
      const range = document.createRange();
      range.setStart(textNode, 12);
      range.setEnd(textNode, 28); // "important clause"
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
      vi.advanceTimersByTime(160);
      vi.useRealTimers();
      return screen.findByRole("button", { name: "Add comment" });
    };

    // Mouse path: pointerdown + mousedown (preventDefault preserves selection) -> collapsed selectionchange -> mouseup -> click
    const addTrigger = await selectClause();
    const pointerDownEvent = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
    addTrigger.dispatchEvent(pointerDownEvent);
    expect(pointerDownEvent.defaultPrevented).toBe(true);

    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    addTrigger.dispatchEvent(mouseDownEvent);
    expect(mouseDownEvent.defaultPrevented).toBe(true);

    // Even if a browser collapses selection and dispatches selectionchange before mouseup/click, the trigger stays mounted.
    window.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event("selectionchange"));
    expect(screen.getByRole("button", { name: "Add comment" })).toBe(addTrigger);

    await fireEvent.mouseUp(addTrigger);
    expect(screen.getByRole("button", { name: "Add comment" })).toBe(addTrigger);

    await fireEvent.click(addTrigger);
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByText("important clause")).toBeTruthy();

    // Cancel composer to test keyboard focus path
    await fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByRole("textbox")).toBeNull();

    // Keyboard path: focus floating button, selection collapses on focus shift, button remains mounted and activates on click/Enter
    const kbTrigger = await selectClause();
    kbTrigger.focus();
    expect(document.activeElement).toBe(kbTrigger);
    window.getSelection()?.removeAllRanges();
    document.dispatchEvent(new Event("selectionchange"));
    expect(screen.getByRole("button", { name: "Add comment" })).toBe(kbTrigger);

    await fireEvent.click(kbTrigger);
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByText("important clause")).toBeTruthy();
  });

  it("renders distinct region anchors as separate pins at their respective rects instead of clustering them onto root", async () => {
    const root = makeArtifactRoot(`<div class="chart-canvas">Chart surface</div>`);
    const fixture = createFixture();
    const skRegionA = encodeAnchor({
      t: "region",
      rect: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
      v: "v1",
    });
    const skRegionB = encodeAnchor({
      t: "region",
      rect: { x: 0.6, y: 0.5, width: 0.25, height: 0.3 },
      v: "v1",
    });

    await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skRegionA },
      body: "Top-left chart spike",
    });
    await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skRegionB },
      body: "Bottom-right outlier",
    });
    const comments = await fixture.adapter.list(TENANT, TARGET);

    const { container } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
      },
    });

    // Must render 2 separate non-cluster pins positioned at their own region boxes (800x600 root)
    const pinAnchors = container.querySelectorAll<HTMLElement>(".st-review-layer__pin-anchor");
    expect(pinAnchors).toHaveLength(2);
    expect(container.querySelector('.st-review-layer__pins button[data-pin-variant="cluster"]')).toBeNull();
    // Region A: top = 0.1*600 = 60px, left + width = (0.1 + 0.2)*800 = 240px
    expect(pinAnchors[0]?.style.top).toBe("60px");
    expect(pinAnchors[0]?.style.left).toBe("240px");
    // Region B: top = 0.5*600 = 300px, left + width = (0.6 + 0.25)*800 = 680px
    expect(pinAnchors[1]?.style.top).toBe("300px");
    expect(pinAnchors[1]?.style.left).toBe("680px");
  });

  it("wires forwarded panel props (canModerate, onReply, onResolve, onReopen, onEditComment, onDeleteComment, onReanchor) into ThreadPanel and focuses panel heading on create", async () => {
    const root = makeArtifactRoot(`<p data-anchor-id="wired-p">Panel target paragraph.</p>`);
    const BOB: CollaborationActor = {
      actorId: "user-bob",
      kind: "human",
      displayLabel: "Bob Tremblay",
      color: "#059669",
    };
    const fixture = createFixtureCommentsAdapter({
      caller: { userId: BOB.actorId, actorKind: "human" },
      workspaceMembers: [ALICE.actorId, BOB.actorId],
      authorshipResolver: {
        resolveHumanActor: (id) => (id === ALICE.actorId ? ALICE : id === BOB.actorId ? BOB : undefined),
      },
    });

    const skOpen = encodeAnchor({ t: "element", sel: "p:nth-of-type(1)", aid: "wired-p", v: "v1" });
    const openRoot = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skOpen },
      body: "Bob's open comment",
    });
    const closedRoot = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: skOpen },
      body: "Bob's closed comment",
    });
    await fixture.adapter.setState(TENANT, closedRoot.threadId, "closed");
    const orphanRoot = await fixture.adapter.create({
      tenant: TENANT,
      target: TARGET,
      body: "Orphan comment",
    });

    const comments = await fixture.adapter.list(TENANT, TARGET);
    const onReply = vi.fn();
    const onResolve = vi.fn();
    const onReopen = vi.fn();
    const onEditComment = vi.fn();
    const onDeleteComment = vi.fn();
    const onReanchor = vi.fn();
    const onCreate = vi.fn();

    const { container, rerender } = render(CommentLayer, {
      props: {
        rootEl: root,
        mode: "review",
        target: TARGET,
        artifactVersion: "v1",
        comments,
        currentUser: ALICE,
        canModerate: true,
        panelCompact: false,
        onCreate,
        onReply,
        onResolve,
        onReopen,
        onEditComment,
        onDeleteComment,
        onReanchor,
      },
    });

    // ThreadPanel is mounted inside CommentLayer in review mode
    const panel = container.querySelector("aside.st-review-panel");
    expect(panel).toBeTruthy();

    // Orphan Re-anchor forwards onReanchor
    await fireEvent.click(screen.getByRole("button", { name: "Re-anchor" }));
    expect(onReanchor).toHaveBeenCalledWith(orphanRoot.threadId);

    // Open thread detail via ThreadPanel card -> test onReply, onResolve, and canModerate (edit/delete Bob's comment as Alice!)
    const openCard = container.querySelector<HTMLElement>(
      `.st-review-panel__thread-card[data-thread-id="${openRoot.threadId}"]`,
    )!;
    await fireEvent.click(openCard);

    // canModerate=true exposes Edit and Delete on Bob's comment even though currentUser is Alice
    const editBtn = container.querySelector('button[aria-label="Edit comment"]')!;
    expect(editBtn).toBeTruthy();
    await fireEvent.click(editBtn);
    const editBox = container.querySelector(".st-review-thread__edit-form textarea") as HTMLTextAreaElement;
    await fireEvent.input(editBox, { target: { value: "Moderated body" } });
    await fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onEditComment).toHaveBeenCalledWith(openRoot.id, "Moderated body"));

    await fireEvent.click(container.querySelector('button[aria-label="Delete comment"]')!);
    expect(onDeleteComment).toHaveBeenCalledWith(openRoot.id);

    const replyBox = container.querySelector(".st-review-thread__reply textarea") as HTMLTextAreaElement;
    await fireEvent.input(replyBox, { target: { value: "Alice reply" } });
    await fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    await waitFor(() => expect(onReply).toHaveBeenCalledWith(openRoot.threadId, "Alice reply"));

    await fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(onResolve).toHaveBeenCalledWith(openRoot.threadId);

    // Switch to closed thread -> test onReopen
    await rerender({ activeThreadId: closedRoot.threadId });
    await fireEvent.click(screen.getAllByRole("button", { name: "Reopen" })[0]!);
    expect(onReopen).toHaveBeenCalledWith(closedRoot.threadId);

    // Creating a new comment via CommentLayer focuses the integrated panel heading after submit
    await fireEvent.click(root.querySelector('[data-anchor-id="wired-p"]')!);
    const newComposerBox = container.querySelector(".st-review-layer__composer textarea") as HTMLTextAreaElement;
    await fireEvent.input(newComposerBox, { target: { value: "Brand new thread" } });
    await fireEvent.click(container.querySelector('.st-review-layer__composer button[type="submit"]')!);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      const heading = container.querySelector(".st-review-panel__heading");
      expect(document.activeElement).toBe(heading);
    });
  });
});
