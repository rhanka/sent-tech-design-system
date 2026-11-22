// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { tick } from "svelte";
import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { createFixtureCommentsAdapter } from "@sentropic/design-system-review-core";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import { buildDossierViews } from "../src/ports/dossier-views.js";
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

function companionManifest(doc: unknown, views: unknown) {
  return {
    contract: "focus-dossier/1",
    document: { digest: baseDigest(doc) },
    renderer: { digest: baseDigest(kit) },
    derived: [{
      path: "views.json", mimeType: "application/json", digest: baseDigest(views),
      bytes: new TextEncoder().encode(canonicalJson(views)).length,
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
  (source, label) => {
    const doc = dossier(source);
    const original = JSON.stringify(doc);
    const views = buildDossierViews(doc, kit)!;
    expect(views).toMatchObject({
      contract: "focus-views/1", documentDigest: baseDigest(doc), rendererDigest: baseDigest(kit),
      diagrams: { "diagram-1": { scene: { profileRefs: ["generic@1"] }, views: { expanded: expect.any(Object), folded: expect.any(Object) } } },
    });
    expect(canonicalJson(buildDossierViews(JSON.parse(original), kit))).toBe(canonicalJson(views));
    const { host, rendered } = mount();
    rendered.render(doc, { views, manifest: companionManifest(doc, views) });
    expect(host.querySelector('[data-anchor-id="diagram-1"] svg')?.textContent).toContain(label);
    expect(host.textContent).not.toContain(source);
    expect(JSON.stringify(doc)).toBe(original);
  },
);

it("refuses missing scenes and mismatched companions before announcing a root", () => {
  const { host, rendered } = mount();
  const ready = vi.fn();
  host.addEventListener("st-dossier-ready", ready);
  const doc = dossier(flowchart);
  expect(() => rendered.render(doc)).toThrow(/diagram-1/);
  const views = buildDossierViews(doc, kit)!;
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
  (source) => {
    expect(() => buildDossierViews(dossier(source), kit)).toThrow(expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }));
  },
);

it("reports all text overflow diagnostics before returning a companion or mounting", () => {
  const longTitle = "W".repeat(180);
  const overflow = structuredClone(scene);
  overflow.entities["entity:child"].attributes.name.value = longTitle;
  const doc = dossier(flowchart, { scene: overflow });
  const { rendered } = mount();
  const refused = expect.objectContaining({
    code: "diagram-layout-refused", sectionId: "diagram-1",
    diagnostics: expect.arrayContaining([expect.objectContaining({ code: "card-overflow", slot: "title", text: longTitle })]),
  });
  expect(() => rendered.render(doc)).toThrow(refused);
  expect(() => buildDossierViews(doc, kit)).toThrow(refused);
  expect(rendered.reviewRoot).toBeNull();
});

it("preserves all overflow diagnostics across container and child nodes", () => {
  const longGroup = "G".repeat(180);
  const longChild = "C".repeat(180);
  const overflow = structuredClone(scene);
  overflow.entities["entity:group"].attributes.name.value = longGroup;
  overflow.entities["entity:child"].attributes.name.value = longChild;
  const doc = dossier(flowchart, { scene: overflow });
  const refused = expect.objectContaining({
    code: "diagram-layout-refused",
    sectionId: "diagram-1",
    diagnostics: expect.arrayContaining([
      expect.objectContaining({ code: "zone-overflow", slot: "title", text: longGroup }),
      expect.objectContaining({ code: "card-overflow", slot: "title", text: longChild }),
    ]),
  });
  expect(() => buildDossierViews(doc, kit)).toThrow(refused);
  const { rendered } = mount();
  expect(() => rendered.render(doc)).toThrow(refused);
  expect(rendered.reviewRoot).toBeNull();
});

it.each(["ecosystem:overview", "ecosystem:models", "ecosystem:knowledge", "ecosystem:interfaces"])(
  "resolves every pinned ecosystem scene %s deterministically without mutating the source",
  (source) => {
    const doc = dossier(source);
    const original = JSON.stringify(doc);
    const first = buildDossierViews(doc, kit)!;
    const second = buildDossierViews(JSON.parse(original), kit)!;
    expect(canonicalJson(second)).toBe(canonicalJson(first));
    expect(JSON.stringify(doc)).toBe(original);
    const { host, rendered } = mount();
    rendered.render(doc, { views: first, manifest: companionManifest(doc, first) });
    expect(host.querySelector('[data-anchor-id="diagram-1"] svg')).not.toBeNull();
    expect(host.querySelector('[data-anchor-id="diagram-1"] pre')).toBeNull();
  },
);

it("refuses host-reference diagrams, unsupported syntax, duplicate nodes and cyclic scenes", () => {
  const refDoc = {
    ...decision,
    sections: decision.sections.map((section) => section.kind === "diagram" ? {
      kind: "diagram", id: section.id, targetRef: section.targetRef, alt: section.alt,
      renderComponent: "DiagramSceneFigure", sourceRef: "ecosystem:overview",
    } : section),
  };
  expect(() => buildDossierViews(refDoc, kit)).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }),
  );
  const plantumlDoc = {
    ...decision,
    sections: decision.sections.map((section) => section.kind === "diagram" ? {
      kind: "diagram", id: section.id, targetRef: section.targetRef, alt: section.alt,
      syntax: "plantuml", source: "@startuml\na -> b\n@enduml",
    } : section),
  };
  expect(() => buildDossierViews(plantumlDoc, kit)).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }),
  );
  expect(() => buildDossierViews(dossier('flowchart LR\na["One"]\na["Two"]'), kit)).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }),
  );
  const baseCyclic = structuredClone(scene);
  baseCyclic.entities["entity:child"].type = "container";
  const cyclic = {
    ...baseCyclic,
    relations: {
      ...baseCyclic.relations,
      "relation:cycle": {
        id: "relation:cycle", profile: "generic@1", type: "contains", attributes: {},
        endpoints: [{ role: "parent", target: "entity:child" }, { role: "child", target: "entity:group" }],
      },
    },
  };
  expect(() => buildDossierViews(dossier(flowchart, { scene: cyclic }), kit)).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }),
  );
  const withExtra = { ...structuredClone(scene), layoutHints: { rankdir: "LR" } };
  expect(() => buildDossierViews(dossier(flowchart, { scene: withExtra }), kit)).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-source-unsupported" }),
  );
});

it("refuses stale view geometry and missing diagram entries without replacing the live root", () => {
  const doc = dossier(flowchart);
  const views = buildDossierViews(doc, kit)!;
  const { host, rendered } = mount();
  const ready = vi.fn();
  host.addEventListener("st-dossier-ready", ready);
  rendered.render(doc, { views, manifest: companionManifest(doc, views) });
  const liveRoot = rendered.reviewRoot;
  expect(ready).toHaveBeenCalledOnce();

  // Even if manifest hashes are recomputed over a stale views.json, the kit
  // refuses derived views that disagree with the engine output.
  const stale = structuredClone(views);
  const camera = stale.diagrams["diagram-1"]!.views.expanded.presentation.camera!;
  (camera as { x: number }).x += 42;
  expect(() => rendered.render(doc, { views: stale, manifest: companionManifest(doc, stale) })).toThrow(
    expect.objectContaining({ sectionId: "diagram-1", code: "diagram-views-invalid" }),
  );

  // Authoritative scene contradicting the companion scene is refused too.
  const docWithScene = dossier(flowchart, { scene });
  const sceneViews = buildDossierViews(docWithScene, kit)!;
  const tamperedSceneViews = { ...sceneViews, diagrams: { "diagram-1": views.diagrams["diagram-1"]! } };
  expect(() => rendered.render(docWithScene, {
    views: tamperedSceneViews,
    manifest: companionManifest(docWithScene, tamperedSceneViews),
  })).toThrow(expect.objectContaining({ sectionId: "diagram-1", code: "diagram-views-invalid" }));

  // Missing entry for a second source-only diagram is refused.
  const twoDiagrams = {
    ...doc,
    sections: [...doc.sections, {
      kind: "diagram", id: "diagram-2", targetRef: "decision-short2", alt: "Second diagram",
      syntax: "mermaid", source: "ecosystem:knowledge",
    }],
  };
  const partialViews = { ...views, documentDigest: baseDigest(twoDiagrams) };
  expect(() => rendered.render(twoDiagrams, {
    views: partialViews,
    manifest: companionManifest(twoDiagrams, partialViews),
  })).toThrow(expect.objectContaining({ sectionId: "diagram-2", code: "diagram-views-invalid" }));

  expect(ready).toHaveBeenCalledOnce();
  expect(rendered.reviewRoot).toBe(liveRoot);
});

it("keeps container fold/expand interactive in review mode without opening a comment composer", async () => {
  const host = document.body.appendChild(document.createElement("main"));
  const handle = createFixtureCommentsAdapter({ caller: { userId: "user-alice" } });
  const rendered = mountDossier(host, {
    review: {
      adapter: handle.adapter,
      tenant: "workspace-fixture",
      target: { kind: "artifact", id: "art-diagram-review" },
      currentUser: { actorId: "user-alice", kind: "human", displayLabel: "Alice", color: "#2563eb" },
      mode: "review",
    },
  });
  cleanups.push(rendered.destroy);
  rendered.render(dossier("ignored source", { scene }));
  await tick();
  const figure = host.querySelector('[data-anchor-id="diagram-1"]')!;
  const toggle = figure.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')!;
  expect(toggle.hasAttribute("data-review-passthrough")).toBe(true);
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(toggle.dispatchEvent(click)).toBe(true);
  expect(click.defaultPrevented).toBe(false);
  await tick();
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(figure.querySelector("svg")?.textContent).not.toContain("Child");
  expect(document.querySelector(".st-review-composer__textarea")).toBeNull();
  toggle.click();
  await tick();
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(figure.querySelector("svg")?.textContent).toContain("Child");
});
