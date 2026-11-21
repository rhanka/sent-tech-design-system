// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { renderHtml } from "@sentropic/focus";
import { assertFocusDocument, assertFocusForPresentation } from "@sentropic/focus/validate";
import { mountDossier, type DossierReadyDetail } from "../src/element/dom/dossier-mount.js";
import b5 from "./fixtures/focus-artifact/b5.json";
import decisionV1 from "./fixtures/focus-artifact/decision-v1.json";
import decisionV2 from "./fixtures/focus-artifact/decision-v2.json";
import report from "./fixtures/focus-artifact/report.json";

const cleanups: (() => void)[] = [];
function host(): HTMLElement {
  const node = document.createElement("div");
  document.body.append(node);
  return node;
}

function mount(node: HTMLElement) {
  const dossier = mountDossier(node);
  cleanups.push(() => dossier.destroy());
  return dossier;
}

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose();
  document.body.replaceChildren();
  history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

it.each([
  { doc: decisionV1, ids: ["p1", "q1", "os1", "opt-a", "opt-b", "o1", "diagram-1"], calls: 0, actions: 2 },
  {
    doc: decisionV2,
    ids: ["p1", "q1", "os1", "opt-a", "opt-b", "o1", "diagram-1", "shared-input", "single-build",
      "preview-citation", "build-log", "preview", "build-evidence", "annex:measurements"],
    calls: 8,
    actions: 2,
  },
  {
    doc: report,
    ids: ["p1", "shared-input", "single-build", "preview-citation", "build-log", "preview", "build-evidence",
      "annex:measurements"],
    calls: 5,
    actions: 0,
  },
])("renders $doc.title with one commentable anchor per definition", ({ doc, ids, calls, actions }) => {
  const node = host();
  const selected = vi.fn();
  node.addEventListener("st-intent", selected);
  mount(node).render(doc);
  expect.soft(node.querySelector("header h1")?.textContent).toBe(doc.title);
  expect.soft(Array.from(node.querySelectorAll<HTMLElement>("[data-anchor-id]"), (element) => element.dataset.anchorId))
    .toEqual([doc.ref, ...ids]);
  const owner = new DOMParser().parseFromString(renderHtml(assertFocusDocument(doc), {
    renderMarkdown: () => "",
    sanitizeHtml: (html) => html,
  }), "text/html");
  const ownerReadability = owner.querySelector(".focus-readability");
  const renderedReadability = node.querySelector("header + section");
  const readabilityText = (section: Element | null) =>
    Array.from(section?.children ?? [], (child) => [child.localName, child.textContent]);
  expect.soft(readabilityText(renderedReadability)).toEqual(readabilityText(ownerReadability));
  expect.soft(node.querySelectorAll("[data-commentable]")).toHaveLength(ids.length + 1);
  for (const element of node.querySelectorAll("[data-anchor-id]")) {
    expect(element.hasAttribute("data-commentable")).toBe(true);
  }
  const badges = [...node.querySelectorAll("a")].filter((link) => /^\[\d+\]$/.test(link.textContent ?? ""));
  expect.soft(badges).toHaveLength(calls);
  for (const badge of badges) {
    expect(badge.matches("[data-anchor-id], [data-commentable]")).toBe(false);
    expect(node.querySelectorAll(`[data-anchor-id="${decodeURIComponent(badge.hash.slice(1))}"]`)).toHaveLength(1);
  }
  if ("sources" in doc) {
    expect.soft(node.querySelector('[data-anchor-id="build-log"]')?.textContent).toContain("Build log");
    expect.soft(node.querySelector('img[alt="Rendered preview"]')?.getAttribute("src")).toMatch(/^data:image\/png;base64,/);
    expect.soft(node.querySelector('[data-anchor-id="annex:measurements"] td')?.textContent).toBe("Builds");
    expect.soft(node.querySelectorAll("a[download]")).toHaveLength(doc.sources.length);
  }
  const controls = node.querySelectorAll<HTMLButtonElement>("[data-option-id]");
  expect(controls).toHaveLength(actions);
  if (actions > 0) {
    expect(node.textContent).toContain("Identify every existing rendering path.");
    expect(node.textContent).toContain("ecosystem:overview");
    const ownerLabels = Array.from(owner.querySelectorAll(".focus-option > strong"), (label) => label.textContent);
    expect(Array.from(controls, (control) => control.querySelector(".st-dossier__optionLabel")?.textContent))
      .toEqual(ownerLabels);
    for (const control of controls) control.click();
    expect(selected.mock.calls.map(([event]) => event.detail)).toEqual(["opt-a", "opt-b"].map((target) => ({
      event: "intent", name: "choose-option", target, context: {},
    })));
    expect(Array.from(controls, (control) => control.getAttribute("aria-pressed"))).toEqual(["false", "true"]);
  }
});

it("accepts the B5 fixture at the Focus presentation gate", () => {
  expect(() => assertFocusForPresentation(b5)).not.toThrow();
});

it("announces one completed light DOM root per render", () => {
  const node = host();
  const dossier = mount(node);
  const roots: HTMLElement[] = [];
  const ready = vi.fn((event: Event) => {
    const { reviewRoot } = (event as CustomEvent<DossierReadyDetail>).detail;
    roots.push(reviewRoot);
    const sectionB = reviewRoot.querySelector('[data-anchor-id="B"]');
    return {
      connected: reviewRoot.isConnected && reviewRoot.getRootNode() === document && reviewRoot.parentElement === node,
      current: dossier.reviewRoot === reviewRoot && node.childElementCount === 1,
      title: reviewRoot.querySelector("header h1")?.textContent,
      anchors: Array.from(reviewRoot.querySelectorAll<HTMLElement>("[data-anchor-id][data-commentable]"), (element) =>
        element.dataset.anchorId),
      descendants: ["p strong", "li strong", "table td strong"].map((selector) => sectionB?.querySelector(selector)?.textContent),
    };
  });
  node.addEventListener("st-dossier-ready", ready);
  expect(dossier.reviewRoot).toBeNull();
  dossier.render(b5);
  const first = dossier.reviewRoot;
  expect(ready).toHaveBeenCalledOnce();
  dossier.render({ ...b5, title: "Revised review fixture", sections: [b5.sections[0], b5.sections[2], b5.sections[1]] });
  const complete = { connected: true, current: true, descendants: ["inner text", "inner text", "Builds"] };
  expect(ready.mock.results.map((result) => result.value)).toEqual([
    { ...complete, title: b5.title, anchors: [b5.ref, "A", "B", "C"] },
    { ...complete, title: "Revised review fixture", anchors: [b5.ref, "A", "C", "B"] },
  ]);
  expect(roots[0]).toBe(first);
  expect(roots[1]).toBe(dossier.reviewRoot);
  expect(dossier.reviewRoot).not.toBe(first);
  expect(first?.isConnected).toBe(false);
  dossier.destroy();
  expect(dossier.reviewRoot).toBeNull();
});

it("marks the B5 header and section containers around h1, p, li and table", () => {
  const dossier = mount(host());
  dossier.render(b5);
  const root = dossier.reviewRoot;
  expect(Array.from(root?.querySelectorAll<HTMLElement>(":scope > [data-anchor-id]") ?? [], (node) => node.dataset.anchorId))
    .toEqual(["focus-test", "A", "B", "C"]);
  expect(root?.querySelector("h1")?.closest("[data-anchor-id][data-commentable]")?.getAttribute("data-anchor-id"))
    .toBe("focus-test");
  for (const selector of ["p strong", "li strong", "table td strong"]) {
    const child = root?.querySelector(`[data-anchor-id="B"] ${selector}`);
    expect(child?.closest("[data-anchor-id][data-commentable]")?.getAttribute("data-anchor-id")).toBe("B");
  }
});

it("retains the completed root when Focus rejects a replacement document", () => {
  const node = host();
  const dossier = mount(node);
  const ready = vi.fn();
  node.addEventListener("st-dossier-ready", ready);
  expect(() => dossier.render({})).toThrow();
  expect(dossier.reviewRoot).toBeNull();
  dossier.render(report);
  const current = dossier.reviewRoot;
  expect(() => dossier.render({ ...report, citations: [] })).toThrow();
  expect(dossier.reviewRoot).toBe(current);
  expect(current?.isConnected).toBe(true);
  expect(ready).toHaveBeenCalledOnce();
});

it.each([
  { family: "section", doc: { ...b5, sections: b5.sections.map((section) => section.id === "B" ? { ...section, id: b5.ref } : section) } },
  { family: "option", doc: { ...decisionV2, sections: decisionV2.sections.map((section) => section.kind === "optionSet"
    ? { ...section, options: section.options?.map((option) => option.id === "opt-b" ? { ...option, id: decisionV2.ref } : option) }
    : section) } },
  { family: "source", doc: { ...report, sources: [...report.sources, { ...report.sources[0], id: report.ref }] } },
  { family: "citation", doc: { ...report, citations: [...report.citations, { ...report.citations[0], id: report.ref }] } },
  { family: "evidence group", doc: { ...report, evidenceGroups: [...report.evidenceGroups, { ...report.evidenceGroups[0], id: report.ref }] } },
  { family: "annex", doc: { ...report, annexes: [...report.annexes, { ...report.annexes[0], id: report.ref }] } },
])("retains the previous root when a $family ID collides with the header anchor", ({ doc }) => {
  const node = host();
  const dossier = mount(node);
  const ready = vi.fn();
  node.addEventListener("st-dossier-ready", ready);
  dossier.render(report);
  const current = dossier.reviewRoot;
  expect(() => dossier.render(doc)).toThrow(/focus-anchor-equals-document-ref/);
  expect(dossier.reviewRoot).toBe(current);
  expect(current?.parentElement).toBe(node);
  expect(ready).toHaveBeenCalledOnce();
});

it("resolves a fragment set before an asynchronous render and handles subsequent hash changes", async () => {
  history.replaceState(null, "", "#annex%3Ameasurements");
  const node = host();
  const dossier = mount(node);
  expect(dossier.reviewRoot).toBeNull();
  const ready = vi.fn(() => {
    expect(node.querySelector<HTMLDetailsElement>('[data-anchor-id="annex:measurements"]')?.open).toBe(false);
  });
  node.addEventListener("st-dossier-ready", ready);
  await Promise.resolve().then(() => dossier.render(report));
  expect(ready).toHaveBeenCalledOnce();
  const annex = node.querySelector<HTMLDetailsElement>('[data-anchor-id="annex:measurements"]');
  expect(annex?.open).toBe(true);
  expect(document.activeElement).toBe(annex);
  history.replaceState(null, "", "#shared-input");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  const citation = node.querySelector('[data-anchor-id="shared-input"]');
  expect(document.activeElement).toBe(citation);
  for (const hash of ["#unknown", "#%broken"]) {
    history.replaceState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(document.activeElement).toBe(citation);
  }
});
