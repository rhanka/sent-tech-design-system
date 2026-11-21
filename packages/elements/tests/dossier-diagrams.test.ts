// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import decision from "./fixtures/focus-artifact/decision-v1.json";

const kit = { name: "test-kit", files: [{ path: "index.html", size: 10 }] };
const scene = {
  documentId: "document:diagram-1", schemaVersion: { major: 1, minor: 1 }, revision: 0,
  profileRefs: ["generic@1"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
  entities: {
    "entity:group": { id: "entity:group", profile: "generic@1", type: "container", attributes: { name: { kind: "text", value: "Group" } } },
    "entity:child": { id: "entity:child", profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: "Child" } } },
  },
  relations: {
    "relation:group": { id: "relation:group", profile: "generic@1", type: "contains", attributes: {},
      endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:child" }] },
  },
};
const flowchart = 'flowchart LR\nreader["Reader"]\nkit["Kit"]\nreader -->|opens| kit';

function dossier(source: string, extra = {}) {
  return {
    ...decision,
    sections: decision.sections.map((section) => section.kind === "diagram" ? {
      kind: "diagram", id: section.id, targetRef: section.targetRef, alt: section.alt, syntax: "mermaid", source, ...extra,
    } : section),
  };
}

function mount() {
  const host = document.body.appendChild(document.createElement("main"));
  const rendered = mountDossier(host);
  cleanups.push(rendered.destroy);
  return { host, rendered };
}

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  document.body.replaceChildren();
});

// This public port is introduced by FA-D2.
async function producer() {
  const path = "../src/ports/dossier-views.ts";
  return (await import(path)).buildDossierViews;
}

function companionManifest(doc: unknown, views: unknown) {
  return {
    contract: "focus-dossier/1",
    document: { digest: baseDigest(doc) },
    renderer: { digest: baseDigest(kit) },
    derived: [{
      path: "views.json", mimeType: "application/json", sha256: baseDigest(views),
      size: new TextEncoder().encode(canonicalJson(views)).length,
    }],
  };
}

it("renders the authoritative scene and replots it when a container folds or expands", () => {
  const { host, rendered } = mount();
  rendered.render(dossier("unsupported source", { scene }));
  const figure = host.querySelector('[data-anchor-id="diagram-1"]')!;
  const drawing = () => figure.querySelector("svg")!;
  expect(drawing().textContent).toContain("Child");
  expect(figure.textContent).not.toContain("unsupported source");
  const expanded = drawing();
  const toggle = figure.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')!;
  toggle.click();
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(drawing()).not.toBe(expanded);
  expect(drawing().textContent).not.toContain("Child");
  toggle.click();
  expect(drawing().textContent).toContain("Child");
});

it.each([["ecosystem:overview", "h2a"], [flowchart, "opens"]])(
  "builds the same companion bytes and renders a source-only diagram %s",
  async (source, label) => {
    const doc = dossier(source);
    const original = JSON.stringify(doc);
    const build = await producer();
    const views = build(doc, kit);
    expect(views).toMatchObject({
      contract: "focus-views/1", documentDigest: baseDigest(doc), rendererDigest: baseDigest(kit),
      diagrams: { "diagram-1": { scene: { profileRefs: ["generic@1"] }, views: { expanded: expect.any(Object), folded: expect.any(Object) } } },
    });
    expect(canonicalJson(build(JSON.parse(original), kit))).toBe(canonicalJson(views));
    const { host, rendered } = mount();
    rendered.render(doc, { views, manifest: companionManifest(doc, views) });
    expect(host.querySelector('[data-anchor-id="diagram-1"] svg')?.textContent).toContain(label);
    expect(host.textContent).not.toContain(source);
    expect(JSON.stringify(doc)).toBe(original);
  },
);

it("refuses missing scenes and mismatched companions before announcing a root", async () => {
  const { host, rendered } = mount();
  const ready = vi.fn();
  host.addEventListener("st-dossier-ready", ready);
  const doc = dossier(flowchart);
  expect(() => rendered.render(doc)).toThrow(/diagram-1/);
  const build = await producer();
  const views = build(doc, kit);
  const manifest = companionManifest(doc, views);
  expect(() => rendered.render({ ...doc, title: "Other document" }, { views, manifest })).toThrow(/document.*digest/i);
  const otherKit = { ...manifest, renderer: { digest: baseDigest("other kit") } };
  expect(() => rendered.render(doc, { views, manifest: otherKit })).toThrow(/renderer.*digest/i);
  expect(() => rendered.render(doc, { views: { ...views, diagrams: {} }, manifest })).toThrow(/views.*digest/i);
  expect(ready).not.toHaveBeenCalled();
  expect(rendered.reviewRoot).toBeNull();
});

it.each(["ecosystem:missing", 'flowchart LR\na["A"]\na --> b', 'flowchart LR\na["A"]\na -->|opens| absent'])(
  "refuses unsupported source %s at build time",
  async (source) => {
    const build = await producer();
    expect(() => build(dossier(source), kit)).toThrow(expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }));
  },
);

it("reports all text overflow diagnostics before returning a companion or mounting", async () => {
  const longTitle = "W".repeat(1600);
  const overflow = structuredClone(scene);
  overflow.entities["entity:child"].attributes.name.value = longTitle;
  const doc = dossier(flowchart, { scene: overflow });
  const { rendered } = mount();
  const refused = expect.objectContaining({
    code: "diagram-layout-refused", sectionId: "diagram-1",
    diagnostics: expect.arrayContaining([expect.objectContaining({ code: "card-overflow", slot: "title", text: longTitle })]),
  });
  expect(() => rendered.render(doc)).toThrow(refused);
  const build = await producer();
  expect(() => build(doc, kit)).toThrow(refused);
  expect(rendered.reviewRoot).toBeNull();
});
