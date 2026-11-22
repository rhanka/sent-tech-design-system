// @vitest-environment jsdom
// FA-D3 B5 recipe (00-CONVENTIONS): review layer mounted from the kit on the
// real mounted dossier (B5 fixture: persistent header + three sister sections
// A/B/C, B holds p / li / table descendants). A fixture adapter stands in for
// the host store; anchor capture runs through review-core (createAnchorFromElement /
// resolveAnchor) — never reimplemented here. Every B5 claim below is asserted
// on the layer DOM (pins, orphan list, composer) unless stated otherwise.
import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tick } from "svelte";
import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { createAnchorFromElement, decodeAnchor, resolveAnchor } from "@sentropic/design-system-review-core";
import { createFixtureCommentsAdapter } from "@sentropic/design-system-review-core";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import { mountDossierReview } from "../src/element/dom/dossier-review-mount.js";
import { buildDossierViews } from "../src/ports/dossier-views.js";
import b5 from "./fixtures/focus-artifact/b5.json";
import decisionV2 from "./fixtures/focus-artifact/decision-v2.json";
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

function reviewMount(node: HTMLElement) {
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
  const { dossier, handle } = reviewMount(node);
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
    const key = row.target.sectionKey ?? "";
    expect(key).toMatch(/^a1:[A-Za-z0-9_-]+$/);
    expect(Buffer.byteLength(key, "utf8")).toBeLessThanOrEqual(2048);
  }
  for (const anchor of anchors) {
    expect(anchor?.v).toBe(version);
  }
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);
});

it("hover frames the anchored block container for h1, p, li and table leaves", async () => {
  const node = host();
  const { dossier } = reviewMount(node);
  dossier.render(b5);
  await tick();
  const root = dossier.reviewRoot!;
  // jsdom has no layout: stub distinct non-zero rects for containers AND inner
  // leaves so framing the container vs framing the leaf is unmistakable.
  const rect = (top: number, left: number, width: number, height: number) =>
    ({ x: left, y: top, top, left, width, height, bottom: top + height, right: left + width, toJSON: () => ({}) }) as DOMRect;
  root.getBoundingClientRect = () => rect(0, 0, 1000, 1000);
  const header = root.querySelector<HTMLElement>("header")!;
  header.getBoundingClientRect = () => rect(20, 10, 800, 60);
  const block = root.querySelector<HTMLElement>('[data-anchor-id="B"]')!;
  block.getBoundingClientRect = () => rect(120, 10, 800, 300);
  const h1 = root.querySelector<HTMLElement>("h1")!;
  const p = root.querySelector<HTMLElement>('[data-anchor-id="B"] p')!;
  const pLeaf = root.querySelector<HTMLElement>('[data-anchor-id="B"] p strong')!;
  const li = root.querySelector<HTMLElement>('[data-anchor-id="B"] li')!;
  const liLeaf = root.querySelector<HTMLElement>('[data-anchor-id="B"] li strong')!;
  const table = root.querySelector<HTMLElement>('[data-anchor-id="B"] table')!;
  const tableLeaf = root.querySelector<HTMLElement>('[data-anchor-id="B"] table td strong')!;
  h1.getBoundingClientRect = () => rect(42, 10, 400, 28);
  p.getBoundingClientRect = () => rect(125, 12, 600, 24);
  pLeaf.getBoundingClientRect = () => rect(125, 80, 90, 20);
  li.getBoundingClientRect = () => rect(160, 24, 500, 22);
  liLeaf.getBoundingClientRect = () => rect(160, 90, 90, 20);
  table.getBoundingClientRect = () => rect(200, 12, 420, 80);
  tableLeaf.getBoundingClientRect = () => rect(240, 16, 70, 20);

  const cases: Array<[string, HTMLElement, HTMLElement, { top: number; left: number; width: number; height: number }]> = [
    ["h1", h1, header, { top: 20, left: 10, width: 800, height: 60 }],
    ["p", pLeaf, block, { top: 120, left: 10, width: 800, height: 300 }],
    ["li", liLeaf, block, { top: 120, left: 10, width: 800, height: 300 }],
    ["table", tableLeaf, block, { top: 120, left: 10, width: 800, height: 300 }],
  ];
  for (const [name, leaf, container, expected] of cases) {
    // Primary 0.43.0/0.43.1/0.43.2 hover path: closest("[data-commentable]")
    // must hit the anchored container directly, never an inner element.
    expect(leaf.closest("[data-commentable]"), `${name} closest [data-commentable]`).toBe(container);
    expect(leaf.matches("[data-anchor-id], [data-commentable]")).toBe(false);
    leaf.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    await tick();
    const outline = node.querySelector<HTMLElement>(".st-review-layer__hover-outline");
    expect(outline, `hover outline missing for ${name}`).not.toBeNull();
    expect(outline!.style.top).toBe(`${expected.top}px`);
    expect(outline!.style.left).toBe(`${expected.left}px`);
    expect(outline!.style.width).toBe(`${expected.width}px`);
    expect(outline!.style.height).toBe(`${expected.height}px`);
  }
});

it("hover qualification records svelte 0.43.2 (plan names 0.43.0/0.43.1) with nested review-core 0.1.0", () => {
  // Qualification note: the plan names Svelte 0.43.0/0.43.1; the kit pins
  // 0.43.2 (published later, identical closest("[data-commentable]") primary
  // hover path, and still pinning review-core 0.1.0 transitively so the 0.1.1
  // alias remains load-bearing).
  expect((elementsPkg.dependencies as Record<string, string>)["@sentropic/design-system-svelte"]).toBe("0.43.2");
  const installedSvelte = JSON.parse(
    readFileSync(join(process.cwd(), "node_modules/@sentropic/design-system-svelte/package.json"), "utf8"),
  ) as { version: string; dependencies: Record<string, string> };
  expect(installedSvelte.version).toBe("0.43.2");
  expect(installedSvelte.dependencies["@sentropic/design-system-review-core"]).toBe("0.1.0");
});

it("pastilles, markdown links, downloads and summaries pass through clicks and never carry anchors on snapshot renderer", async () => {
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
  const views = buildDossierViews(decisionV2, {});
  dossier.render(decisionV2, views === undefined ? undefined : {
    views,
    manifest: {
      contract: "focus-dossier/1", document: { digest: views.documentDigest }, renderer: { digest: views.rendererDigest },
      derived: [{ path: "views.json", digest: baseDigest(views),
        bytes: new TextEncoder().encode(canonicalJson(views)).length, mimeType: "application/json" }],
    },
  });
  await tick();
  const root = dossier.reviewRoot!;
  const pastilles = [...root.querySelectorAll<HTMLAnchorElement>("a")].filter((link) =>
    /^\[\d+\]$/.test(link.textContent ?? ""),
  );
  const optionPastilles = [...root.querySelectorAll<HTMLAnchorElement>('[data-option-card] a')].filter((link) =>
    /^\[\d+\]$/.test(link.textContent ?? ""),
  );
  const downloads = [...root.querySelectorAll<HTMLAnchorElement>("a[download]")];
  const summaries = [...root.querySelectorAll<HTMLElement>("summary")];
  const markdownLinks = [...root.querySelectorAll<HTMLAnchorElement>("a[href^='https://']")];

  expect(pastilles.length).toBeGreaterThan(0);
  expect(optionPastilles.length).toBeGreaterThan(0);
  expect(downloads.length).toBeGreaterThan(0);
  expect(summaries.length).toBeGreaterThan(0);
  expect(markdownLinks.length).toBeGreaterThan(0);

  for (const pastille of pastilles) {
    expect(pastille.matches("[data-anchor-id], [data-commentable]")).toBe(false);
    expect(pastille.hasAttribute("data-review-passthrough")).toBe(true);
  }
  // Hovering a [n] pastille must NOT produce a hover outline.
  pastilles[0]!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
  await tick();
  expect(node.querySelector(".st-review-layer__hover-outline")).toBeNull();

  // Clicking passthrough elements in review mode must NOT be suppressed by
  // CommentLayer and must NOT open a comment composer.
  for (const element of [pastilles[0]!, optionPastilles[0]!, downloads[0]!, summaries[0]!, markdownLinks[0]!]) {
    expect(element.hasAttribute("data-review-passthrough")).toBe(true);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    expect(element.dispatchEvent(click), `click suppressed on ${element.outerHTML}`).toBe(true);
    expect(click.defaultPrevented, `defaultPrevented on ${element.outerHTML}`).toBe(false);
    await tick();
    expect(node.ownerDocument.querySelector(".st-review-composer__textarea")).toBeNull();
  }
});

it("fallback renderer glossary summary passes through clicks in review mode", async () => {
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
  // A prose block without "In short:" fails Focus presentation validation and
  // exercises the fallback DOM renderer (focus-renderer.ts).
  const legacyDoc = {
    ...b5,
    readability: {
      ...b5.readability,
      glossary: [{ term: "Anchor", definition: "Stable block identifier." }],
    },
    sections: [{ kind: "prose", id: "A", targetRef: "focus-test", markdown: "Legacy prose without summary lead." }],
  };
  dossier.render(legacyDoc);
  await tick();
  const summary = dossier.reviewRoot!.querySelector<HTMLElement>(".st-dossier__readability summary");
  expect(summary).not.toBeNull();
  expect(summary!.hasAttribute("data-review-passthrough")).toBe(true);
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(summary!.dispatchEvent(click)).toBe(true);
  expect(click.defaultPrevented).toBe(false);
  await tick();
  expect(node.ownerDocument.querySelector(".st-review-composer__textarea")).toBeNull();
});

it("B5-2: removing B orphans its thread on the layer without falling back onto C; orphan stays answerable", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, "h1", "Header note");
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const bRow = handle.snapshotRaw()[1]!;
  const threadId = bRow.threadId;
  expect(node.querySelectorAll(".st-review-layer__gutter-pin")).toHaveLength(2);

  // Replace the root without B (C takes B's position).
  dossier.render({ ...b5, sections: [b5.sections[0], b5.sections[2]] });
  await tick();
  await tick();

  // Layer partition: only the header pin stays attached; B leaves the pins
  // and enters the orphan list; C carries no pin (no selector fallback).
  const pins = [...node.querySelectorAll<HTMLElement>(".st-review-layer__gutter-pin")];
  expect(pins).toHaveLength(1);
  const pinKeys = [...node.querySelectorAll<HTMLElement>(".st-review-layer__pins [data-pin-section-key]")]
    .map((pin) => decodeAnchor(pin.getAttribute("data-pin-section-key") ?? ""))
    .map((anchor) => (anchor?.t === "element" ? anchor.aid : undefined));
  expect(pinKeys).toEqual(["focus-test"]);
  expect(node.querySelector(".st-review-orphans__count")?.textContent?.trim()).toBe("1");
  const orphanItem = node.querySelector<HTMLElement>(`.st-review-orphans__item[data-thread-id="${threadId}"]`);
  expect(orphanItem).not.toBeNull();

  // The underlying resolution is an explicit not-found orphan with no element
  // and no selector fallback strategy.
  const anchor = decodeAnchor(bRow.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("orphan");
  if (resolved.status === "orphan") expect(resolved.reason).toBe("not-found");
  expect("strategy" in resolved).toBe(false);
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
  expect(rows).toHaveLength(3);
  expect(rows[2]!.threadId).toBe(threadId);
});

it("B5-2 close: an orphan thread resolves from the orphan list in the layer", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node);
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
  const { dossier, handle } = reviewMount(node);
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

it("B5-4: the header thread survives title, revision and block-order changes with zero transient orphans", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, "h1", "General header note");

  let sawOrphan = false;
  let layerDetached = false;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const removed of record.removedNodes) {
        if (removed instanceof Element && removed.matches("[data-st-dossier-review]")) {
          layerDetached = true;
        }
      }
    }
    if (node.querySelector(".st-review-orphans, .st-review-orphans__count, .st-review-orphans__item") !== null) {
      sawOrphan = true;
    }
  });
  observer.observe(node, { childList: true, subtree: true });

  // Change title, revision/hash AND reverse block order ([C, B, A]).
  dossier.render({
    ...b5,
    title: "Revised review fixture",
    hash: "b5-v2",
    sections: [b5.sections[2], b5.sections[1], b5.sections[0]],
  });
  // Synchronous check immediately after st-dossier-ready (before Svelte tick).
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  await tick();
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  observer.disconnect();

  expect(sawOrphan).toBe(false);
  expect(layerDetached).toBe(false);
  expect(
    Array.from(dossier.reviewRoot!.querySelectorAll<HTMLElement>(":scope > [data-anchor-id]"), (el) => el.dataset.anchorId),
  ).toEqual(["focus-test", "C", "B", "A"]);
  const anchor = decodeAnchor(handle.snapshotRaw()[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  if (anchor?.t === "element") expect(anchor.aid).toBe("focus-test");
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("resolved");
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  expect(node.querySelectorAll(".st-review-layer__gutter-pin")).toHaveLength(1);
});

it("atomic root-ready: old-root selection is cleared and old-root observers are detached on replacement", async () => {
  const node = host();
  const { dossier } = reviewMount(node);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, "h1", "General header note");
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

  dossier.render({
    ...b5,
    title: "Revised review fixture",
    hash: "b5-v2",
    sections: [b5.sections[0], b5.sections[2], b5.sections[1]],
  });
  await tick();
  await tick();
  const next = window.getSelection()!;
  // The previous tree was detached by the re-render: its selection must go.
  const surviving = next.rangeCount > 0 ? next.getRangeAt(0).commonAncestorContainer : null;
  expect(surviving === null || !oldRoot.contains(surviving as Node)).toBe(true);

  // Old-root observer cleanup: mutating the detached old root must not affect
  // the live layer's resolution on the new root.
  oldRoot.querySelector("header")?.remove();
  oldRoot.querySelector('[data-anchor-id="B"]')?.remove();
  oldRoot.replaceChildren();
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await tick();
  expect(node.querySelector(".st-review-orphans__count")).toBeNull();
  expect(node.querySelectorAll(".st-review-layer__gutter-pin")).toHaveLength(2);
});

it("B5-6: a text selection shows the layer trigger", async () => {
  vi.useFakeTimers();
  const node = host();
  const { dossier } = reviewMount(node);
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
  const { dossier, handle } = reviewMount(node);
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
  expect(Buffer.byteLength(rows[0]!.target.sectionKey!, "utf8")).toBeLessThanOrEqual(2048);
  const anchor = decodeAnchor(rows[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("text");
  // Selection is cleared in afterEach (after the layers are gone).
});

it("B5-6 control: legacy anchors without aid retain selector fallback while Focus anchors carry aid", async () => {
  const node = host();
  const { dossier } = reviewMount(node);
  dossier.render(b5);
  await tick();
  const root = dossier.reviewRoot!;
  const blockB = root.querySelector<HTMLElement>('[data-anchor-id="B"]')!;
  const captured = createAnchorFromElement(root, blockB, version)!;
  expect(captured.aid).toBe("B");
  const { aid: _omitted, ...legacyAnchor } = captured;
  const legacy = resolveAnchor(root, legacyAnchor, { artifactVersion: version });
  expect(legacy.status).toBe("resolved");
  if (legacy.status === "resolved") {
    expect(legacy.strategy).toBe("selector");
    expect(legacy.element).toBe(blockB);
  }
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
  const { dossier, handle } = reviewMount(node);
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
  const { dossier, handle } = reviewMount(node);
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

it("step 5: clicking a fragment link opens a collapsed annex while the review layer is mounted", async () => {
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
  dossier.render(report);
  await tick();
  const annex = node.querySelector<HTMLDetailsElement>('[data-anchor-id="annex:measurements"]')!;
  expect(annex).not.toBeNull();
  expect(annex.open).toBe(false);
  // Clicking an in-dossier citation pastille must not be suppressed by CommentLayer.
  const pastille = node.querySelector<HTMLAnchorElement>('a.focus-citation[href="#shared-input"]')!;
  expect(pastille).not.toBeNull();
  const pastilleClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(pastille.dispatchEvent(pastilleClick)).toBe(true);
  expect(pastilleClick.defaultPrevented).toBe(false);
  expect(node.ownerDocument.querySelector(".st-review-composer__textarea")).toBeNull();
  // Clicking a fragment link targeting the collapsed annex in review mode must
  // pass through without opening a composer, and the kit opens the annex.
  const annexLink = node.ownerDocument.createElement("a");
  annexLink.href = "#annex%3Ameasurements";
  annexLink.setAttribute("data-review-passthrough", "");
  annexLink.textContent = "Measurements annex";
  dossier.reviewRoot!.querySelector('[data-anchor-id="p1"]')!.append(annexLink);
  history.replaceState(null, "", "#annex%3Ameasurements");
  const annexClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(annexLink.dispatchEvent(annexClick)).toBe(true);
  expect(annexClick.defaultPrevented).toBe(false);
  await tick();
  expect(annex.open).toBe(true);
  expect(document.activeElement).toBe(annex);
  expect(node.ownerDocument.querySelector(".st-review-composer__textarea")).toBeNull();
  // The annex summary keeps its native toggle role (passthrough): clicking
  // it must not be suppressed or open a composer.
  const summary = annex.querySelector<HTMLElement>("summary")!;
  expect(summary.hasAttribute("data-review-passthrough")).toBe(true);
  const summaryClick = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(summary.dispatchEvent(summaryClick)).toBe(true);
  expect(summaryClick.defaultPrevented).toBe(false);
  expect(node.ownerDocument.querySelector(".st-review-composer__textarea")).toBeNull();
  history.replaceState(null, "", "#");
});

it("one layer per host: a second mount returns the live handle", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node);
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

it("setMode triggers confirmDiscardOpen and preserves the composer draft without remounting", async () => {
  const node = host();
  const { dossier, review } = reviewMount(node);
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
  expect(node.ownerDocument.querySelector('[role="alertdialog"]')).not.toBeNull();
  expect(node.querySelector(".st-review-layer")).toBe(layerBefore);
  review.setMode("review");
  await tick();
  expect(node.ownerDocument.querySelector('[role="alertdialog"]')).toBeNull();
  const layerAfter = node.querySelector(".st-review-layer");
  expect(layerAfter).toBe(layerBefore);
  expect(node.ownerDocument.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea")?.value).toBe(
    "Unsaved draft",
  );
});

it("mountDossier with review: artifactVersion tracks baseDigest across renders and stamps new anchors", async () => {
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
  await tick();
  expect(dossier.review).not.toBeNull();
  expect(dossier.review!.artifactVersion).toBe(baseDigest(b5));
  const revised = { ...b5, title: "Revised review fixture", hash: "b5-v2" };
  dossier.render(revised);
  await tick();
  const revisedDigest = baseDigest(revised);
  expect(dossier.review!.artifactVersion).toBe(revisedDigest);
  expect(node.querySelectorAll("[data-st-dossier-review]")).toHaveLength(1);
  // Creating a comment after the re-render stamps the updated baseDigest as v.
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Revised note");
  const rows = handle.snapshotRaw();
  expect(rows).toHaveLength(1);
  expect(decodeAnchor(rows[0]!.target.sectionKey ?? "")?.v).toBe(revisedDigest);
});

it("mountDossier with review: a rejected R6 document neither leaks a layer nor mutates artifactVersion", async () => {
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
  const colliding = {
    ...b5,
    sections: b5.sections.map((section) => (section.id === "B" ? { ...section, id: b5.ref } : section)),
  };
  expect(() => dossier.render(colliding)).toThrow(/focus-anchor-equals-document-ref/);
  expect(dossier.reviewRoot).toBeNull();
  expect(dossier.review).toBeNull();
  expect(node.querySelector("[data-st-dossier-review]")).toBeNull();

  dossier.render(b5);
  await tick();
  const initialDigest = baseDigest(b5);
  expect(dossier.review!.artifactVersion).toBe(initialDigest);
  expect(() => dossier.render(colliding)).toThrow(/focus-anchor-equals-document-ref/);
  expect(dossier.review!.artifactVersion).toBe(initialDigest);
});
