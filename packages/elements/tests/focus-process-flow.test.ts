// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { shippedSceneBindings, shippedSceneRegistry, validateSceneDocument, type SceneDocument } from "@sentropic/diagram-canvas/focus-bridge";
import { mountDossier } from "../src/element/dom/dossier-mount.js";
import { FOCUS_PROCESS_TARGET_WIDTH, prepareDossierDiagram } from "../src/focus-diagrams/diagram-layout.js";
import { DossierDiagramError, readDossierScene, resolveDossierScene } from "../src/focus-diagrams/diagram-source.js";
import { buildDossierViews, validateDossierViews } from "../src/focus-diagrams/dossier-views.js";
import decision from "./fixtures/focus-artifact/decision-v1.json";

const kit = { name: "test-kit", files: [{ path: "index.html", size: 10 }] };

const containerScene = {
  documentId: "document:container-1",
  schemaVersion: { major: 1, minor: 1 },
  revision: 0,
  profileRefs: ["generic@1"],
  typeDefinitions: {},
  ports: {},
  resources: {},
  extensions: [],
  entities: {
    "entity:group": { id: "entity:group", profile: "generic@1", type: "container", attributes: { name: { kind: "text", value: "Group" } } },
    "entity:child": { id: "entity:child", profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: "Child" } } },
  },
  relations: {
    "relation:group": {
      id: "relation:group",
      profile: "generic@1",
      type: "contains",
      attributes: {},
      endpoints: [{ role: "parent", target: "entity:group" }, { role: "child", target: "entity:child" }],
    },
  },
};

function makeFlowchartSection(id: string, source: string, extra: Record<string, unknown> = {}) {
  return {
    kind: "diagram" as const,
    id,
    targetRef: "decision-short2",
    alt: `Diagram ${id}`,
    syntax: "mermaid" as const,
    source,
    ...extra,
  };
}

describe("Focus process@1 lowering and validation bridge (L1d)", () => {
  it("pins FOCUS_PROCESS_TARGET_WIDTH to 640", () => {
    expect(FOCUS_PROCESS_TARGET_WIDTH).toBe(640);
  });

  it("lowers Mermaid flowchart LR with parallel edges to process@1 using relation:<from>.<to> (.2/.3) ids", () => {
    const source = [
      "flowchart LR",
      'intake["Intake"]',
      'triage["Triage"]',
      'review["Review"]',
      "intake -->|Submit| triage",
      "intake -->|Expedite| triage",
      "intake -->|Escalate| triage",
      "triage -->|Approve| review",
    ].join("\n");
    const lowered = resolveDossierScene(makeFlowchartSection("flow-1", source) as never) as unknown as SceneDocument;
    expect(lowered.profileRefs).toEqual(["process@1"]);
    expect(Object.keys(lowered.relations).sort()).toEqual([
      "relation:intake.triage",
      "relation:intake.triage.2",
      "relation:intake.triage.3",
      "relation:triage.review",
    ]);
    expect(validateSceneDocument(lowered, { registry: shippedSceneRegistry, bindings: shippedSceneBindings })).toEqual([]);
  });

  it("lowers Mermaid flowchart TB and TD with a validated sentropic:process-flow direction extension", () => {
    for (const dir of ["TB", "TD"]) {
      const source = `flowchart ${dir}\na["One"]\nb["Two"]\na -->|Next| b`;
      const lowered = resolveDossierScene(makeFlowchartSection(`flow-${dir}`, source) as never) as unknown as SceneDocument;
      expect(lowered.profileRefs).toEqual(["process@1"]);
      expect(lowered.extensions).toHaveLength(1);
      expect(lowered.extensions[0]?.namespace).toBe("sentropic:process-flow");
      expect(lowered.extensions[0]?.validation).toBe("validated");
      expect(JSON.parse(lowered.extensions[0]?.source ?? "{}")).toEqual({ direction: "TB" });
      expect(validateSceneDocument(lowered, { registry: shippedSceneRegistry, bindings: shippedSceneBindings })).toEqual([]);
      const reread = readDossierScene(`flow-${dir}`, lowered);
      expect(reread).toEqual(lowered);
    }
  });

  it("accepts process@1 with validated sentropic:process-flow extension and rejects invalid extensions", () => {
    const base = resolveDossierScene(makeFlowchartSection("flow-tb", 'flowchart TB\na["A"]\nb["B"]\na -->|Go| b') as never) as unknown as SceneDocument;
    expect(readDossierScene("flow-tb", base)).toEqual(base);

    const tamperedHash = structuredClone(base) as unknown as { extensions: { contentHash: string }[] };
    tamperedHash.extensions[0]!.contentHash = "fnv1a64:0000000000000000";
    expect(() => resolveDossierScene(makeFlowchartSection("bad-hash", "ignored", { scene: tamperedHash }) as never)).toThrow(
      expect.objectContaining({ sectionId: "bad-hash", code: "diagram-source-unsupported" }),
    );
    expect(() => readDossierScene("bad-hash", tamperedHash)).toThrow(
      expect.objectContaining({ sectionId: "bad-hash", code: "diagram-source-unsupported" }),
    );

    const wrongNamespace = structuredClone(base) as unknown as { extensions: { namespace: string }[] };
    wrongNamespace.extensions[0]!.namespace = "other:extension";
    expect(() => resolveDossierScene(makeFlowchartSection("bad-ns", "ignored", { scene: wrongNamespace }) as never)).toThrow(
      expect.objectContaining({ sectionId: "bad-ns", code: "diagram-source-unsupported" }),
    );
    expect(() => readDossierScene("bad-ns", wrongNamespace)).toThrow(
      expect.objectContaining({ sectionId: "bad-ns", code: "diagram-source-unsupported" }),
    );
  });

  it("refuses malformed nested objects and undeclared extra keys with DossierDiagramError instead of TypeError or passthrough", () => {
    const validProcess = resolveDossierScene(makeFlowchartSection("valid", 'flowchart LR\na["A"]\nb["B"]\na -->|Go| b') as never);
    const cases: Record<string, unknown>[] = [
      { ...structuredClone(validProcess), entities: { "entity:a": null } },
      { ...structuredClone(validProcess), entities: { "entity:a": { id: "entity:a", profile: "process@1", type: "step" } } },
      { ...structuredClone(validProcess), entities: { "entity:a": { id: "entity:a", profile: "process@1", type: "step", attributes: { name: null } } } },
      { ...structuredClone(validProcess), relations: { "relation:a.b": { id: "relation:a.b", profile: "process@1", type: "transition", attributes: {} } } },
      { ...structuredClone(validProcess), relations: { "relation:a.b": { id: "relation:a.b", profile: "process@1", type: "transition", endpoints: [null], attributes: {} } } },
      { ...structuredClone(validProcess), extensions: [{ namespace: "sentropic:process-flow" }] },
      { ...structuredClone(validProcess), entities: { ...(validProcess.entities as Record<string, unknown>), "entity:a": { ...(validProcess.entities as Record<string, Record<string, unknown>>)["entity:a"], geometry: { x: 10, y: 20 } } } },
      { ...structuredClone(validProcess), relations: { "relation:a.b": { ...(validProcess.relations as Record<string, Record<string, unknown>>)["relation:a.b"], layoutHints: { rankdir: "LR" } } } },
      { ...structuredClone(validProcess), relations: { "relation:a.b": { ...(validProcess.relations as Record<string, Record<string, unknown>>)["relation:a.b"], endpoints: [{ role: "source", target: "entity:a", geometry: {} }, { role: "target", target: "entity:b" }] } } },
      { ...structuredClone(validProcess), extensions: [{ namespace: "sentropic:process-flow", schemaVersion: "1", scope: { kind: "document", extra: true }, validation: "validated", contentHash: "fnv1a64:0000000000000000", source: "{}" }] },
      { ...structuredClone(validProcess), extensions: [{ namespace: "sentropic:process-flow", schemaVersion: "1", scope: { kind: "document" }, validation: "validated", contentHash: "fnv1a64:0000000000000000", source: "{}", geometry: {} }] },
    ];
    for (const [index, badScene] of cases.entries()) {
      expect(() => readDossierScene(`bad-${index}`, badScene), `read case ${index}`).toThrowError(DossierDiagramError);
      expect(() => readDossierScene(`bad-${index}`, badScene), `read code ${index}`).toThrow(
        expect.objectContaining({ sectionId: `bad-${index}`, code: "diagram-source-unsupported" }),
      );
      expect(() => resolveDossierScene(makeFlowchartSection(`bad-${index}`, "ignored", { scene: badScene }) as never), `resolve case ${index}`).toThrowError(DossierDiagramError);
      expect(() => resolveDossierScene(makeFlowchartSection(`bad-${index}`, "ignored", { scene: badScene }) as never), `resolve code ${index}`).toThrow(
        expect.objectContaining({ sectionId: `bad-${index}`, code: "diagram-source-unsupported" }),
      );
    }
  });

  it("keeps generic@1 bound locally to foldableGenericProfile and replays frozen kit 0.5.0 generic@1 relation:0 views via mountDossier", () => {
    const legacyFlow = 'flowchart LR\ns1["Step 1"]\ns2["Step 2"]\ns1 -->|Next| s2';
    const doc = {
      ...decision,
      sections: [
        ...decision.sections.filter((s) => s.kind !== "diagram"),
        makeFlowchartSection("diagram-flowchart", legacyFlow),
        makeFlowchartSection("diagram-ecosystem", "ecosystem:overview"),
        makeFlowchartSection("diagram-container", "ignored", { scene: containerScene }),
      ],
    };
    const liveViews = buildDossierViews(doc, kit)!;
    expect(liveViews.diagrams["diagram-flowchart"]?.scene.profileRefs).toEqual(["process@1"]);
    const frozenGenericView = {
      viewId: "view:layout", semanticDocumentId: "document:diagram-flowchart", revision: 0,
      entityOccurrences: { "occurrence:e.s1": { id: "occurrence:e.s1", entity: "entity:s1", geometry: { x: 0, y: 0, width: 460, height: 200 }, z: 0 }, "occurrence:e.s2": { id: "occurrence:e.s2", entity: "entity:s2", geometry: { x: 568, y: 0, width: 460, height: 200 }, z: 0 } },
      relationOccurrences: { "occurrence:r.0": { id: "occurrence:r.0", relation: "relation:0", endpoints: [{ role: "source", occurrence: "occurrence:e.s1" }, { role: "target", occurrence: "occurrence:e.s2" }], waypoints: [{ x: 460, y: 100 }, { x: 568, y: 100 }] } },
      portOccurrences: {}, groups: {}, filters: [],
      presentation: { camera: { x: 0, y: 0, zoom: 1 }, diagram: { contractPin: { id: "diagram-presentation", version: "1", contentDigest: "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae" }, entities: { "occurrence:e.s1": { form: "card", text: { title: "Step 1" }, icon: "base" }, "occurrence:e.s2": { form: "card", text: { title: "Step 2" }, icon: "base" } }, legends: {}, categoryTokens: [] } },
    };
    const frozenViews = {
      ...liveViews,
      diagrams: {
        ...liveViews.diagrams,
        "diagram-flowchart": {
          scene: {
            documentId: "document:diagram-flowchart", schemaVersion: { major: 1, minor: 1 }, revision: 0, profileRefs: ["generic@1"], typeDefinitions: {}, ports: {}, resources: {}, extensions: [],
            entities: { "entity:s1": { id: "entity:s1", profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: "Step 1" } } }, "entity:s2": { id: "entity:s2", profile: "generic@1", type: "node", attributes: { name: { kind: "text", value: "Step 2" } } } },
            relations: { "relation:0": { id: "relation:0", profile: "generic@1", type: "link", endpoints: [{ role: "source", target: "entity:s1" }, { role: "target", target: "entity:s2" }], attributes: { label: { kind: "text", value: "Next" } } } },
          },
          views: { expanded: frozenGenericView, folded: frozenGenericView },
        },
      },
    };
    const containerPrep = prepareDossierDiagram("diagram-container", "Container", containerScene as unknown as SceneDocument);
    expect(containerPrep.layout.containers).toEqual(["occurrence:e.group"]);
    expect(containerPrep.folded.svg).not.toContain("Child");
    expect(containerPrep.expanded.svg).toContain("Child");

    const manifest = {
      contract: "focus-dossier/1",
      document: { digest: baseDigest(doc) },
      renderer: { digest: baseDigest(kit) },
      derived: [{ path: "views.json", mimeType: "application/json", digest: baseDigest(frozenViews), bytes: new TextEncoder().encode(canonicalJson(frozenViews)).length }],
    };
    expect(validateDossierViews(doc, manifest, frozenViews, new Set(["diagram-flowchart", "diagram-ecosystem", "diagram-container"])).size).toBe(3);
    const host = document.body.appendChild(document.createElement("main"));
    const mounted = mountDossier(host);
    try {
      mounted.render(doc, { views: frozenViews, manifest });
      expect(host.querySelector('[data-anchor-id="diagram-flowchart"] svg')?.textContent).toContain("Next");
      expect(host.querySelector('[data-anchor-id="diagram-container"] svg')?.textContent).toContain("Child");
    } finally {
      mounted.destroy();
      host.remove();
    }
  });
});
