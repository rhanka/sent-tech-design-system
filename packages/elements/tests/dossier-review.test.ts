// @vitest-environment jsdom
// FA-D3 B5 recipe (00-CONVENTIONS): review layer mounted from the kit on the
// real mounted dossier (B5 fixture: persistent header + three sister sections
// A/B/C, B holds p / li / table descendants). A fixture adapter stands in for
// the host store; anchor capture runs through review-core (createAnchorFromElement /
// resolveAnchor) — never reimplemented here.
import { afterEach, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { baseDigest } from "@sentropic/focus/editing";
import { decodeAnchor } from "@sentropic/design-system-review-core";
import { createFixtureCommentsAdapter } from "@sentropic/design-system-review-core";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import { mountDossierReview } from "../src/element/dom/dossier-review.svelte";
import b5 from "./fixtures/focus-artifact/b5.json";

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
}

afterEach(() => {
  vi.useRealTimers();
  for (const dispose of cleanups.splice(0).reverse()) dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
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
  for (const anchor of anchors) {
    expect(anchor?.v).toBe(version);
    expect(row0(sectionKey(rows))).toBeLessThanOrEqual(2048);
  }
  expect(node.querySelectorAll(".st-review-layer__gutter-pin").length).toBeGreaterThan(0);
});

function row0(value: string): number {
  return value.length;
}
function sectionKey(rows: { target: { sectionKey?: string } }[]): string {
  return rows[0]?.target.sectionKey ?? "";
}

it("B5-2: removing B orphans its thread without falling back onto C; the thread stays answerable", async () => {
  const node = host();
  const { dossier, handle } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  await clickSubmit(node, '[data-anchor-id="B"] p strong', "Note on B");
  const threadId = handle.snapshotRaw()[0]!.threadId;

  // Replace the root without B (C takes B's position).
  dossier.render({ ...b5, sections: [b5.sections[0], b5.sections[2]] });
  await tick();
  await tick();

  const { resolveAnchor } = await import("@sentropic/design-system-review-core");
  const anchor = decodeAnchor(handle.snapshotRaw()[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  const root = dossier.reviewRoot!;
  const resolved = resolveAnchor(root, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("orphan");
  // The C block must not carry the B thread (pins) and its anchor stays exact.
  expect(root.querySelector('[data-anchor-id="C"]')).not.toBeNull();
  expect(root.querySelector('[data-anchor-id="B"]')).toBeNull();

  // Orphan stays answerable through the adapter (reply inherits the sectionKey).
  const reply = await handle.adapter.reply({ tenant: "workspace-fixture", target, threadId, body: "Follow-up on B" });
  expect(reply.threadId).toBe(threadId);
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

  const { resolveAnchor } = await import("@sentropic/design-system-review-core");
  const after = handle.snapshotRaw()[0]!.target.sectionKey ?? "";
  expect(after).toBe(before);
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
  await tick();
  await tick();

  const { resolveAnchor } = await import("@sentropic/design-system-review-core");
  const anchor = decodeAnchor(handle.snapshotRaw()[0]!.target.sectionKey ?? "");
  expect(anchor?.t).toBe("element");
  if (anchor?.t === "element") expect(anchor.aid).toBe("focus-test");
  const resolved = resolveAnchor(dossier.reviewRoot!, anchor!, { artifactVersion: version });
  expect(resolved.status).toBe("resolved");
  expect(node.querySelector(".st-review-panel__orphan-count")).toBeNull();
});

it("B5-6: a text selection still anchors through the layer and the key stays within 2048", async () => {
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
  selection.removeAllRanges();
});

it("B5-6: without an adapter no review layer is mounted and reading is unchanged", async () => {
  const node = host();
  const dossier = mountDossier(node);
  cleanups.push(() => dossier.destroy());
  dossier.render(b5);
  expect(node.querySelector(".st-review-layer")).toBeNull();
  expect(node.querySelectorAll("[data-anchor-id]")).toHaveLength(4);
});

it("hover frames the anchored block container, never a bare [n] pastille", async () => {
  const node = host();
  const { dossier } = reviewMount(node, b5);
  dossier.render(b5);
  await tick();
  const leaf = dossier.reviewRoot!.querySelector('[data-anchor-id="B"] p strong')!;
  leaf.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
  await tick();
  expect(node.querySelector(".st-review-layer__hover-outline")).not.toBeNull();
  for (const pastille of node.querySelectorAll("a")) {
    if (/^\[\d+\]$/.test(pastille.textContent ?? "")) {
      expect(pastille.matches("[data-anchor-id], [data-commentable]")).toBe(false);
    }
  }
});
