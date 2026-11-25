import { describe, expect, it } from "vitest";
import { baseDigest, canonicalJson } from "@sentropic/focus/editing";
import { shippedSceneBindings, shippedSceneRegistry, validateSceneDocument, type SceneDocument } from "@sentropic/diagram-canvas/diagramSceneModel";
import { FOCUS_PROCESS_TARGET_WIDTH, prepareDossierDiagram } from "../src/focus-diagrams/diagram-layout.js";
import { readDossierScene, resolveDossierScene } from "../src/focus-diagrams/diagram-source.js";
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

  it("keeps generic@1 bound locally to foldableGenericProfile and validates frozen focus-views/1 (flowchart + ecosystem:* + container)", () => {
    const doc = {
      ...decision,
      sections: [
        ...decision.sections.filter((s) => s.kind !== "diagram"),
        makeFlowchartSection("diagram-flowchart", 'flowchart LR\ns1["Step 1"]\ns2["Step 2"]\ns3["Step 3"]\ns4["Step 4"]\ns5["Step 5"]\ns1 -->|Next| s2\ns2 -->|Next| s3\ns3 -->|Next| s4\ns4 -->|Next| s5'),
        makeFlowchartSection("diagram-ecosystem", "ecosystem:overview"),
        makeFlowchartSection("diagram-container", "ignored", { scene: containerScene }),
      ],
    };
    const views = buildDossierViews(doc, kit)!;
    expect(views.diagrams["diagram-flowchart"]?.scene.profileRefs).toEqual(["process@1"]);
    expect(views.diagrams["diagram-ecosystem"]?.scene.profileRefs).toEqual(["generic@1"]);
    expect(views.diagrams["diagram-container"]?.scene.profileRefs).toEqual(["generic@1"]);
    const containerPrep = prepareDossierDiagram("diagram-container", "Container", containerScene as unknown as SceneDocument);
    expect(containerPrep.layout.containers).toEqual(["occurrence:e.group"]);
    expect(containerPrep.folded.svg).not.toContain("Child");
    expect(containerPrep.expanded.svg).toContain("Child");

    const manifest = {
      contract: "focus-dossier/1",
      document: { digest: baseDigest(doc) },
      renderer: { digest: baseDigest(kit) },
      derived: [{
        path: "views.json",
        mimeType: "application/json",
        digest: baseDigest(views),
        bytes: new TextEncoder().encode(canonicalJson(views)).length,
      }],
    };
    const validated = validateDossierViews(doc, manifest, views, new Set(["diagram-flowchart", "diagram-ecosystem", "diagram-container"]));
    expect(validated.size).toBe(3);
  });
});
