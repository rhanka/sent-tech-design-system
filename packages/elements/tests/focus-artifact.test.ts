// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
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
    ids: ["p1", "q1", "os1", "opt-a", "opt-b", "o1", "diagram-1", "build-log", "preview", "shared-input",
      "single-build", "preview-citation", "build-evidence", "annex:measurements"],
    calls: 8,
    actions: 2,
  },
  {
    doc: report,
    ids: ["p1", "build-log", "preview", "shared-input", "single-build", "preview-citation", "build-evidence",
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
  expect.soft(Array.from(node.querySelectorAll("[data-anchor-id]"), (element) => element.getAttribute("data-anchor-id")).sort())
    .toEqual([doc.ref, ...ids].sort());
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
    controls[0]?.click();
    expect(selected).toHaveBeenCalledOnce();
    expect(selected.mock.calls[0]?.[0].detail).toEqual({
      event: "intent", name: "choose-option", target: "opt-a", context: {},
    });
  }
});

it("announces one completed light DOM root per render", () => {
  const node = host();
  const dossier = mount(node);
  const events: DossierReadyDetail[] = [];
  node.addEventListener("st-dossier-ready", (event) => {
    events.push((event as CustomEvent<DossierReadyDetail>).detail);
  });
  expect(dossier.reviewRoot).toBeNull();
  dossier.render(b5);
  const first = dossier.reviewRoot;
  expect(events).toEqual([{ reviewRoot: first }]);
  expect(first?.getRootNode()).toBe(document);
  expect(first?.parentElement).toBe(node);
  dossier.render({ ...b5, title: "Revised review fixture", sections: [...b5.sections].reverse() });
  expect(events).toEqual([{ reviewRoot: first }, { reviewRoot: dossier.reviewRoot }]);
  expect(dossier.reviewRoot).not.toBe(first);
  expect(first?.isConnected).toBe(false);
  expect(events[1]?.reviewRoot.querySelector("h1")?.textContent).toBe("Revised review fixture");
  dossier.destroy();
  expect(dossier.reviewRoot).toBeNull();
});

it("marks the B5 header and section containers around h1, p, li and table", () => {
  const dossier = mount(host());
  dossier.render(b5);
  const root = dossier.reviewRoot;
  expect(root?.querySelector("h1")?.closest("[data-anchor-id][data-commentable]")?.getAttribute("data-anchor-id"))
    .toBe("focus-test");
  for (const selector of ["p strong", "li strong", "table td strong"]) {
    const child = root?.querySelector(`[data-anchor-id="B"] ${selector}`);
    expect(child?.closest("[data-anchor-id][data-commentable]")?.getAttribute("data-anchor-id")).toBe("B");
  }
});

it("resolves a fragment set before an asynchronous render and handles subsequent hash changes", async () => {
  history.replaceState(null, "", "#annex%3Ameasurements");
  const node = host();
  const dossier = mount(node);
  expect(dossier.reviewRoot).toBeNull();
  await Promise.resolve().then(() => dossier.render(report));
  const annex = node.querySelector<HTMLDetailsElement>('[data-anchor-id="annex:measurements"]');
  expect(annex?.open).toBe(true);
  expect(document.activeElement).toBe(annex);
  history.replaceState(null, "", "#shared-input");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  const citation = node.querySelector('[data-anchor-id="shared-input"]');
  expect(document.activeElement).toBe(citation);
  history.replaceState(null, "", "#unknown");
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  expect(document.activeElement).toBe(citation);
});
