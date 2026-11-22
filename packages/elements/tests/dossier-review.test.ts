// @vitest-environment jsdom
// FA-D3 B5 recipe (00-CONVENTIONS): review layer mounted from the kit on the
// real mounted dossier (B5 fixture: persistent header + three sister sections
// A/B/C, B holds p / li / table descendants). A fixture adapter stands in for
// the host store; anchor capture runs through review-core (createAnchorFromElement /
// resolveAnchor) — never reimplemented here. Every B5 claim below is asserted
// on the layer DOM (pins, orphan list, composer) unless stated otherwise.
import { afterEach, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { baseDigest } from "@sentropic/focus/editing";
import { decodeAnchor, resolveAnchor } from "@sentropic/design-system-review-core";
import { createFixtureCommentsAdapter } from "@sentropic/design-system-review-core";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import { mountDossierReview } from "../src/element/dom/dossier-review-mount.js";
import b5 from "./fixtures/focus-artifact/b5.json";
import report from "./fixtures/focus-artifact/report.json";
import elementsPkg from "../package.json";

const currentUser = { actorId: "user-alice", kind: "human" as const, displayLabel: "Alice", color: "#2563eb" };
const target = { kind: "artifact" as const, id: "art-focus-test" };
const version = baseDigest(b5);

const cleanups: (() => void)[] = [];
function host(): HTMLElement {
  const node = document.createElement("div");
  document.body.append(node);
  return node;
}

function reviewMount(node: HTMLElement, doc: unknown) {
  const dossier = mountDossier(node);
  cleanups.push(() => dossier.destroy());
  const handle = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
  const review = mountDossierReview(node, {
    adapter: handle.adapter,
    tenant: "workspace-fixture",
    target,
    artifactVersion: version,
    currentUser,
    mode: "review",
  });
  cleanups.push(() => review.destroy());
  return { dossier, handle, review };
}

async function settleComposer(root: HTMLElement): Promise<void> {
  for (let i = 0; i < 50 && root.ownerDocument.querySelector(".st-review-composer__textarea") !== null; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function clickSubmit(root: HTMLElement, selector: string, body: string): Promise<void> {
  const clickable = root.querySelector<HTMLElement>(selector);
  expect(clickable, `missing clickable ${selector}`).not.toBeNull();
  clickable!.click();
  await tick();
  const textarea = root.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea");
  expect(textarea, "composer textarea missing after click").not.toBeNull();
  textarea!.value = body;
  textarea!.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
  const submit = root.ownerDocument.querySelector<HTMLButtonElement>('.st-review-composer__actions button[type="submit"]');
  expect(submit, "composer submit missing").not.toBeNull();
  submit!.click();
  await tick();
  // The submit path awaits the host adapter; the harness must let the
  // composer close before the next click opens a fresh session, or the
  // pending close wipes the session the next click just created.
  await settleComposer(root);
}

function buttonByText(root: HTMLElement, text: string): HTMLButtonElement | null {
  return [...root.ownerDocument.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => (button.textContent ?? "").trim() === text,
  ) ?? null;
}

async function clickButton(root: HTMLElement, text: string): Promise<void> {
  const button = buttonByText(root, text);
  expect(button, `missing button ${text}`).not.toBeNull();
  button!.click();
  await tick();
  await tick();
  // Flush adapter + list refresh macrotasks so the next action is not
  // swallowed by the thread's pending guard.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await tick();
}

async function waitForButton(root: HTMLElement, text: string): Promise<void> {
  for (let i = 0; i < 50; i++) {
    const button = buttonByText(root, text);
    if (button !== null && !button.disabled) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
    await tick();
  }
  throw new Error(`button ${text} never became enabled`);
}

async function openThreadFromPanel(root: HTMLElement, threadId: string): Promise<void> {
  const card = root.ownerDocument.querySelector<HTMLButtonElement>(
    `.st-review-panel__thread-card[data-thread-id="${threadId}"]`,
  );
  expect(card, `missing thread card ${threadId}`).not.toBeNull();
  card!.click();
  await tick();
  await tick();
}

async function submitReply(root: HTMLElement, body: string): Promise<void> {
  const textarea = root.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-thread__reply textarea, .st-review-composer__textarea");
  // CommentThread reply composer: textarea inside the thread reply block.
  const replyTextarea = root.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-thread__reply textarea") ??
    root.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea");
  expect(replyTextarea, "reply textarea missing").not.toBeNull();
  replyTextarea!.value = body;
  replyTextarea!.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
  const submit = [...root.ownerDocument.querySelectorAll<HTMLButtonElement>(".st-review-composer__actions button[type='submit'], .st-review-thread__reply button[type='submit']")]
    .find((button) => /reply/i.test(button.textContent ?? "")) ??
    root.ownerDocument.querySelector<HTMLButtonElement>(".st-review-thread__reply button[type='submit']");
  expect(submit, "reply submit missing").not.toBeNull();
  submit!.click();
  await tick();
  await settleComposer(root);
}

afterEach(() => {
  vi.useRealTimers();
  for (const dispose of cleanups.splice(0).reverse()) dispose();
  document.body.replaceChildren();
  // Clear any stale selection after the layers are gone so no
  // selectionchange handler (since unmounted) observes it.
  try {
    window.getSelection()?.removeAllRanges();
  } catch { /* jsdom without Window */ }
  delete (globalThis as Record<string, unknown>).__stDossierReview;
  vi.restoreAllMocks();
  vi.resetModules();
});

it("B5-1: clicks on h1, p, li and table descendants anchor the enclosing block with v=baseDigest", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();

  await clickSubmit(node, "h1", "General header note");
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Paragraph note");
  await clickSubmit(node, '[data-anchor-id="B"] li strong', "List note");
  await clickSubmit(node, '[data-anchor-id="B"] table td strong', "Table note");

  const rows = handle.snapshotRaw();
  expect(rows).toHaveLength(4);
  const anchors = rows.map((row) => decodeAnchor(row.target.sectionKey ?? ""));
  const aids = anchors.map((anchor) => (anchor?.t === "element" ? anchor.aid : undefined));
  expect(aids).toEqual(["focus-test", "B", "B", "B"]);
  for (const row of rows) {
    expect(row.target.sectionKey?.length ?? 0).toBeLessThanOrEqual(2048);
  }
  for (const anchor of anchors) {
    expect(anchor?.v).toBe(version);
  }
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);
});

it("hover frames the anchored block container for h1, p, li and table leaves", async () => {
  const node = host();
  const { dossier } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const root = dossier.reviewRoot!;
  // jsdom has no layout: stub block rects so the outline geometry is checkable.
  const rootRect = { x: 0, y: 0, top: 0, left: 0, width: 1000, height: 1000, bottom: 1000, right: 1000, toJSON: () => ({}) };
  const headerRect = { x: 0, y: 20, top: 20, left: 10, width: 800, height: 60, bottom: 80, right: 810, toJSON: () => ({}) };
  const blockRect = { x: 0, y: 120, top: 120, left: 10, width: 800, height: 300, bottom: 420, right: 810, toJSON: () => ({}) };
  root.getBoundingClientRect = () => rootRect as DOMRect;
  const header = root.querySelector<HTMLElement>("header")!;
  header.getBoundingClientRect = () => headerRect as DOMRect;
  const block = root.querySelector<HTMLElement>('[data-anchor-id="B"]')!;
  block.getBoundingClientRect = () => blockRect as DOMRect;

  const cases: Array<[string, HTMLElement, { top: number; left: number; width: number; height: number }]> = [
    ["h1", root.querySelector<HTMLElement>("h1")!, { top: 20, left: 10, width: 800, height: 60 }],
    ["p", root.querySelector<HTMLElement>('[data-anchor-id="B"] p strong')!, { top: 120, left: 10, width: 800, height: 300 }],
    ["li", root.querySelector<HTMLElement>('[data-anchor-id="B"] li strong')!, { top: 120, left: 10, width: 800, height: 300 }],
    ["table", root.querySelector<HTMLElement>('[data-anchor-id="B"] table td strong')!, { top: 120, left: 10, width: 800, height: 300 }],
  ];
  for (const [name, leaf, expected] of cases) {
    leaf.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    await tick();
    const outline = node.querySelector<HTMLElement>(".st-review-layer__hover-outline");
    expect(outline, `hover outline missing for ${name}`).not.toBeNull();
    expect(outline!.style.top).toBe(`${expected.top}px`);
    expect(outline!.style.left).toBe(`${expected.left}px`);
    expect(outline!.style.width).toBe(`${expected.width}px`);
    expect(outline!.style.height).toBe(`${expected.height}px`);
    // The outline must frame the anchored block, never a bare [n] pastille.
    for (const pastille of node.querySelectorAll("a")) {
      if (/^\[\d+\]$/.test(pastille.textContent ?? "")) {
        expect(pastille.matches("[data-anchor-id], [data-commentable]")).toBe(false);
      }
    }
  }
});

it("hover in the kit uses svelte 0.43.2 (later than plan 0.43.0/0.43.1) with block geometry", () => {
  // Qualification note: the plan names Svelte 0.43.0/0.43.1; the kit pins
  // 0.43.2 (published later, same hover path via data-anchor-id /
  // data-commentable and CommentLayer relativeBox). This test records the
  // consumed version next to the geometry proof above and in the browser
  // suite, so the qualification is explicit rather than assumed.
  expect((elementsPkg.dependencies as Record<string, string>)["@sentropic/design-system-svelte"]).toBe("0.43.2");
});

it("pastilles carry data-review-passthrough on the snapshot renderer (citations document)", async () => {
  const node = host();
  const dossier = mountDossier(node);
  cleanups.push(() => dossier.destroy());
  const handle = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
  const review = mountDossierReview(node, {
    adapter: handle.adapter,
    tenant: "workspace-fixture",
    target,
    artifactVersion: baseDigest(report),
    currentUser,
    mode: "review",
  });
  cleanups.push(() => review.destroy());
  dossier.render(report);
  await tick();
  const root = dossier.reviewRoot!;
  const pastilles = [...root.querySelectorAll<HTMLAnchorElement>("a")].filter((link) =>
    /^\[\d+\]$/.test(link.textContent ?? ""),
  );
  expect(pastilles.length).toBeGreaterThan(0);
  for (const pastille of pastilles) {
    expect(pastille.hasAttribute("data-review-passthrough")).toBe(true);
  }
  // Citation download and disclosure summaries keep their native role too.
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[download]")) {
    expect(link.hasAttribute("data-review-passthrough")).toBe(true);
  }
  for (const summary of root.querySelectorAll<HTMLElement>("summary")) {
    expect(summary.hasAttribute("data-review-passthrough")).toBe(true);
  }
  // Markdown links inside snapshot prose also pass through.
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[href^='https://']")) {
    expect(link.hasAttribute("data-review-passthrough")).toBe(true);
  }
});

it("B5-2: removing B orphans its thread on the layer without falling back onto C; orphan stays answerable", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const threadId = handle.snapshotRaw()[0]!.threadId;
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);

  // Replace the root without B (C takes B's position).
  dossier.render({ ...b5, sections: [b5.sections[0], b5.sections[2]] });
  await tick();
  await tick();

  // Layer partition: the B thread leaves the attached pins and enters the
  // orphan list; C carries no pin (no selector fallback onto the neighbour).
  expect(node.querySelectorAll(".st-review-layer__gutter-pin")).toHaveLength(0);
  expect(node.querySelector(".st-review-orphans__count")?.textContent?.trim()).toBe("1");
  const orphanItem = node.querySelector<HTMLElement>(`.st-review-orphans__item[data-thread-id="${threadId}"]`);
  expect(orphanItem).not.toBeNull();

  // The underlying resolution is an explicit not-found orphan with no element.
  const anchor = decodeAnchor(handle.snapshotRaw()[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("orphan");
  if (resolved.status === "orphan") expect(resolved.reason).toBe("not-found");
  expect(resolved.element).toBeNull();
  expect(dossier.reviewRoot!.querySelector('[data-anchor-id="C"]')).not.toBeNull();
  expect(dossier.reviewRoot!.querySelector('[data-anchor-id="B"]')).toBeNull();

  // Orphan stays answerable through the layer: open it from the orphan list
  // and reply in its thread view (no direct adapter.reply bypass).
  const open = orphanItem!.querySelector<HTMLButtonElement>("button");
  expect(open, "orphan open button missing").not.toBeNull();
  open!.click();
  await tick();
  await tick();
  await submitReply(node, "Follow-up on B");
  const rows = handle.snapshotRaw();
  expect(rows).toHaveLength(2);
  expect(rows[1]!.threadId).toBe(threadId);
});

it("B5-2 close: an orphan thread resolves from the orphan list in the layer", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const threadId = handle.snapshotRaw()[0]!.threadId;
  dossier.render({ ...b5, sections: [b5.sections[0], b5.sections[2]] });
  await tick();
  await tick();
  const orphanItem = node.querySelector<HTMLElement>(`.st-review-orphans__item[data-thread-id="${threadId}"]`);
  expect(orphanItem).not.toBeNull();
  const resolve = [...orphanItem!.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => (button.textContent ?? "").trim() === "Resolve",
  );
  expect(resolve, "orphan resolve missing").not.toBeNull();
  resolve!.click();
  await tick();
  await tick();
  expect(handle.snapshotRaw().every((row) => row.state === "closed")).toBe(true);
});

it("B5-3: moving B after C keeps its thread resolved by aid with no stored-anchor rewrite", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const before = handle.snapshotRaw()[0]!.target.sectionKey ?? "";

  dossier.render({ ...b5, sections: [b5.sections[0], b5.sections[2], b5.sections[1]] });
  await tick();
  await tick();

  const after = handle.snapshotRaw()[0]!.target.sectionKey ?? "";
  expect(after).toBe(before);
  // Layer partition: B stays attached (pin present, no orphan).
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  const anchor = decodeAnchor(before);
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("resolved");
  if (resolved.status === "resolved") {
    expect(resolved.strategy).toBe("aid");
    expect(resolved.element.getAttribute("data-anchor-id")).toBe("B");
  }
  expect(dossier.reviewRoot?.querySelector('[data-anchor-id="B"]')).not.toBeNull();
});

it("B5-4: the header thread survives title/revision changes and never enters the orphan list", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, "h1", "General header note");

  dossier.render({ ...b5, title: "Revised review fixture", hash: "b5-v2" });
  // Atomic root-ready: the layer must not transiently orphan on the new root.
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  await tick();
  await tick();

  const anchor = decodeAnchor(handle.snapshotRaw()[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  if (anchor?.t === "element") expect(anchor.aid).toBe("focus-test");
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("resolved");
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);
});

it("atomic root-ready: a selection in the old root is cleared on replacement", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const oldRoot = dossier.reviewRoot!;
  const paragraph = oldRoot.querySelector('[data-anchor-id="B"] p')!;
  const textNode = paragraph.firstChild!;
  const range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, Math.min(3, textNode.textContent!.length));
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  expect(selection.rangeCount).toBe(1);

  dossier.render({ ...b5, title: "Revised review fixture", hash: "b5-v2" });
  await tick();
  const next = window.getSelection()!;
  // The previous tree was detached by the re-render: its selection must go.
  const surviving = next.rangeCount > 0 ? next.getRangeAt(0).commonAncestorContainer : null;
  expect(surviving === null || !oldRoot.contains(surviving as Node)).toBe(true);
});

it("B5-6: a text selection shows the layer trigger", async () => {
  vi.useFakeTimers();
  const node = host();
  const { dossier } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const paragraph = dossier.reviewRoot!.querySelector<HTMLElement>('[data-anchor-id="B"] p');
  expect(paragraph).not.toBeNull();
  const textNode = paragraph!.firstChild!;
  const range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, textNode.textContent!.length);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
  await vi.advanceTimersByTimeAsync(200);
  await tick();
  expect(node.ownerDocument.querySelector(".st-review-layer__selection-trigger")).not.toBeNull();
  expect(node.ownerDocument.querySelector<HTMLButtonElement>(".st-review-layer__selection-trigger button")).not.toBeNull();
});

it("B5-6: submitting a text selection through the layer opens a text anchor within 2048", async () => {
  // Submits via Alt+Shift+C before the 150ms trigger settle so the trigger
  // element is never mounted: the pinned 0.43.2 trigger guard dereferences
  // the unmounted trigger on the composer's autofocus selectionchange.
  vi.useFakeTimers();
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const paragraph = dossier.reviewRoot!.querySelector<HTMLElement>('[data-anchor-id="B"] p');
  expect(paragraph).not.toBeNull();
  const textNode = paragraph!.firstChild!;
  const range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, textNode.textContent!.length);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  vi.useRealTimers();
  node.ownerDocument.dispatchEvent(
    new KeyboardEvent("keydown", { altKey: true, shiftKey: true, key: "c", bubbles: true }),
  );
  await tick();
  await tick();
  const textarea = node.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea");
  expect(textarea).not.toBeNull();
  textarea!.value = "Text range note";
  textarea!.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
  const submit = node.ownerDocument.querySelector<HTMLButtonElement>('.st-review-composer__actions button[type="submit"]');
  expect(submit).not.toBeNull();
  submit!.click();
  await tick();
  await settleComposer(node);
  const rows = handle.snapshotRaw();
  expect(rows).toHaveLength(1);
  expect(rows[0]!.target.sectionKey!.length).toBeLessThanOrEqual(2048);
  const anchor = decodeAnchor(rows[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("text");
  // Selection is cleared in afterEach (after the layers are gone).
});

it("B5-6: without an adapter the packaged entry mounts no review layer (reading unchanged)", async () => {
  document.body.replaceChildren();
  const main = document.createElement("main");
  main.setAttribute("data-st-dossier-page", "");
  main.setAttribute("aria-busy", "true");
  document.body.append(main);
  const script = document.createElement("script");
  script.setAttribute("type", "application/octet-stream");
  script.setAttribute("data-st-dossier-document", "");
  script.textContent = Buffer.from(JSON.stringify(b5)).toString("base64");
  document.body.append(script);
  delete (globalThis as Record<string, unknown>).__stDossierReview;
  await import("../src/element/dom/dossier-entry.js");
  for (let i = 0; i < 50 && document.querySelector("[data-st-dossier]") === null; i++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  expect(document.querySelector("[data-st-dossier]")).not.toBeNull();
  expect(document.querySelector(".st-review-layer")).toBeNull();
  document.body.replaceChildren();
});

it("entry gate: with an adapter the packaged entry mounts the review layer", async () => {
  document.body.replaceChildren();
  const main = document.createElement("main");
  main.setAttribute("data-st-dossier-page", "");
  main.setAttribute("aria-busy", "true");
  document.body.append(main);
  const script = document.createElement("script");
  script.setAttribute("type", "application/octet-stream");
  script.setAttribute("data-st-dossier-document", "");
  script.textContent = Buffer.from(JSON.stringify(b5)).toString("base64");
  document.body.append(script);
  const handle = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
  cleanups.push(() => {
    document.querySelector(".st-dossier-review")?.remove();
  });
  (globalThis as Record<string, unknown>).__stDossierReview = {
    adapter: handle.adapter,
    tenant: "workspace-fixture",
    target,
    currentUser,
    mode: "review",
  };
  await import("../src/element/dom/dossier-entry.js");
  for (let i = 0; i < 50 && document.querySelector(".st-review-layer") === null; i++) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  expect(document.querySelector(".st-review-layer")).not.toBeNull();
  document.body.replaceChildren();
});

it("step 5: close and reopen run through the thread panel", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const threadId = handle.snapshotRaw()[0]!.threadId;

  await openThreadFromPanel(node, threadId);
  await clickButton(node, "Resolve");
  expect(handle.snapshotRaw().every((row) => row.state === "closed")).toBe(true);

  await waitForButton(node, "Reopen");
  await clickButton(node, "Reopen");
  expect(handle.snapshotRaw().every((row) => row.state === "open")).toBe(true);
});

it("step 5: element reply runs through the thread panel composer", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const threadId = handle.snapshotRaw()[0]!.threadId;
  await openThreadFromPanel(node, threadId);
  await submitReply(node, "Thread reply");
  const rows = handle.snapshotRaw();
  expect(rows).toHaveLength(2);
  expect(rows[1]!.threadId).toBe(threadId);
  expect(rows[1]!.body).toBe("Thread reply");
});

it("step 5: a fragment opens a collapsed annex while the review layer is mounted", async () => {
  const node = host();
  const handle = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
  const dossier = mountDossier(node);
  cleanups.push(() => dossier.destroy());
  const review = mountDossierReview(node, {
    adapter: handle.adapter,
    tenant: "workspace-fixture",
    target,
    artifactVersion: baseDigest(report),
    currentUser,
    mode: "review",
  });
  cleanups.push(() => review.destroy());
  dossier.render(report);
  await tick();
  const annex = node.querySelector<HTMLDetailsElement>('[data-anchor-id="annex:measurements"]')!;
  expect(annex).not.toBeNull();
  expect(annex.open).toBe(false);
  history.replaceState(null, "", "#annex:measurements");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  await tick();
  expect(annex.open).toBe(true);
  // The annex summary keeps its native toggle role (passthrough): clicking
  // it must not open a composer.
  const summary = annex.querySelector<HTMLElement>("summary")!;
  expect(summary.hasAttribute("data-review-passthrough")).toBe(true);
  history.replaceState(null, "", "#");
});

it("one layer per host: a second mount returns the live handle", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const first = mountDossierReview(node, {
    adapter: handle.adapter,
    tenant: "workspace-fixture",
    target,
    artifactVersion: version,
    currentUser,
    mode: "review",
  });
  expect(node.querySelectorAll("[data-st-dossier-review]")).toHaveLength(1);
  expect(first.mode).toBe("review");
});

it("setMode preserves the composer draft without remounting", async () => {
  const node = host();
  const { dossier, review } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const clickable = node.querySelector<HTMLElement>('[data-anchor-id="B"] p strong')!;
  clickable.click();
  await tick();
  const textarea = node.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea")!;
  textarea.value = "Unsaved draft";
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
  const layerBefore = node.querySelector(".st-review-layer");
  review.setMode("view");
  await tick();
  review.setMode("review");
  await tick();
  const layerAfter = node.querySelector(".st-review-layer");
  expect(layerAfter).toBe(layerBefore);
  expect(node.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea")?.value).toBe(
    "Unsaved draft",
  );
});

it("mountDossier with review: artifactVersion tracks baseDigest across renders without a second layer", async () => {
  const node = host();
  const handle = createFixtureCommentsAdapter({ caller: { userId: currentUser.actorId } });
  const dossier = mountDossier(node, {
    review: {
      adapter: handle.adapter,
      tenant: "workspace-fixture",
      target,
      currentUser,
      mode: "review",
    },
  });
  cleanups.push(() => dossier.destroy());
  dossier.render(b5);
  expect(dossier.review).not.toBeNull();
  expect(dossier.review!.artifactVersion).toBe(baseDigest(b5));
  const revised = { ...b5, title: "Revised review fixture", hash: "b5-v2" };
  dossier.render(revised);
  expect(dossier.review!.artifactVersion).toBe(baseDigest(revised));
  expect(node.querySelectorAll("[data-st-dossier-review]")).toHaveLength(1);
  await tick();
});
