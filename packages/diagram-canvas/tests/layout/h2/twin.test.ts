import { createHash } from "node:crypto";
import {
  canonicalise,
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  DS_LAYOUT_V2_VOCABULARY,
  DS_LAYOUT_VOCABULARY,
  entityRef,
  lowerLayoutHints,
  lowerLayoutHintsV2,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  type DsLayoutHints,
  type DsLayoutHintsV2,
  type Entity,
  type PresentationText,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { createLayoutCache, layoutFingerprint, layoutMeasured } from "../../../src/index.js";
import { layoutScene } from "../../../src/presentation/diagramSceneModel.js";
import { measure } from "../fixtures.js";
import { hCondInput } from "../dc2a/h-cond.js";
import { pinnedMeasurer } from "../dc2a/scenes.js";
import { buildAppctxArchitecture16x9, enumerateVisibleFoldStates } from "./fixtures/referenceSet.js";

function buildGroupedDoc(): {
  document: SemanticDocument;
  presentation: {
    contractPin: typeof DIAGRAM_PRESENTATION_CONTRACT_PIN;
    entities: Record<string, { form: "card" | "container"; text: PresentationText }>;
    legends: Record<string, never>;
    categoryTokens: [];
  };
} {
  const entities: Record<string, Entity> = {};
  const relations: Record<string, Relation> = {};
  const forms: Record<string, { form: "card" | "container"; text: PresentationText }> = {};
  const add = (local: string, container: boolean, parent?: string) => {
    const ref = entityRef(local);
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type: container ? "container" : "node",
      attributes: { name: { kind: "text", value: local } },
    };
    forms[occurrenceRef(`e.${local}`)] = { form: container ? "container" : "card", text: { title: local } };
    if (parent !== undefined) {
      const rel = relationRef(`contains.${local}`);
      relations[rel] = {
        id: rel,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(parent) },
          { role: "child", target: ref },
        ],
        attributes: {},
      };
    }
  };
  add("Z", true);
  for (const name of ["c0", "c1", "c2", "c3"]) add(name, false, "Z");
  for (const name of ["r0", "r1"]) add(name, false);
  return {
    document: {
      documentId: documentRef("h2-twin-doc"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    },
    presentation: {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: forms,
      legends: {},
      categoryTokens: [],
    },
  };
}

describe("H2.2 @2 auto-pack twin byte-identity (REQ-R7-28)", () => {
  const roots = [entityRef("Z"), entityRef("r0"), entityRef("r1")] as const;
  const payloads: readonly { readonly name: string; readonly shared: Omit<DsLayoutHints, "vocabulary"> }[] = [
    { name: "bare auto-pack", shared: { mode: "auto-pack" } },
    { name: "rootOrder + ordering", shared: { mode: "auto-pack", rootOrder: [entityRef("r1"), entityRef("Z")], ordering: { [entityRef("Z")]: [entityRef("c3"), entityRef("c1")] } } },
    { name: "grouping_axis rows", shared: { mode: "auto-pack", grouping_axis: "rows", rootOrder: [entityRef("r0")] } },
    { name: "grouping_axis columns", shared: { mode: "auto-pack", grouping_axis: "columns" } },
    {
      name: "recursive grouping + stretch",
      shared: {
        mode: "auto-pack",
        stretch: true,
        grouping: [
          {
            id: "g1",
            direction: "rows",
            items: [entityRef("c0"), { id: "g2", direction: "columns", items: [entityRef("c1"), entityRef("c2")] }],
          },
        ],
      },
    },
  ];

  it.each(payloads)("renders byte-identical view and shares exact cache key for $name", ({ shared }) => {
    const { document, presentation } = buildGroupedDoc();
    const v1Hints = lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, ...shared } as DsLayoutHints, roots);
    const v2Hints = lowerLayoutHintsV2({ vocabulary: DS_LAYOUT_V2_VOCABULARY, ...shared } as DsLayoutHintsV2, roots);

    const baseOpts = {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: pinnedMeasurer,
      measureText: measure,
      targetWidth: 1440,
    };

    const r1 = layoutMeasured(document, { ...baseOpts, hints: v1Hints });
    const r2 = layoutMeasured(document, { ...baseOpts, hints: v2Hints });
    expect(r1.status).toBe("laid-out");
    expect(r2.status).toBe("laid-out");
    if (r1.status !== "laid-out" || r2.status !== "laid-out") return;

    expect(canonicalise(r2.view, "view")).toBe(canonicalise(r1.view, "view"));
    expect(r2.linkLegend).toBeUndefined();
    expect(r2.legendResolved).toBeUndefined();
    expect(layoutFingerprint({ options: { ...baseOpts, hints: v2Hints } })).toBe(
      layoutFingerprint({ options: { ...baseOpts, hints: v1Hints } }),
    );

    const cache = createLayoutCache();
    cache.layout(document, { ...baseOpts, hints: v1Hints });
    expect(cache.has(document, { ...baseOpts, hints: v2Hints })).toBe(true);
  });

  for (const name of ["architecture", "ontology"] as const) {
    for (const folded of [false, true]) {
      it(`keeps h-cond ${name}/${folded ? "folded" : "unfolded"} byte-identical under @2 auto-pack`, () => {
        const input = hCondInput(name, folded);
        const v1Hints = lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, mode: "auto-pack" });
        const v2Hints = lowerLayoutHintsV2({ vocabulary: DS_LAYOUT_V2_VOCABULARY, mode: "auto-pack" });
        const cache = createLayoutCache();

        const r1 = layoutScene({ ...input, cache, hints: v1Hints });
        expect(r1.status).toBe("laid-out");
        const beforeHits = cache.stats().hits;
        const r2 = layoutScene({ ...input, cache, hints: v2Hints });
        expect(r2.status).toBe("laid-out");
        expect(cache.stats().hits).toBe(beforeHits + 1);
        if (r1.status === "laid-out" && r2.status === "laid-out") {
          expect(canonicalise(r2.view, "view")).toBe(canonicalise(r1.view, "view"));
        }
      });
    }
  }

  it("preserves DE-2 byte-identity on all 52 hints-free and @1/@2 auto-pack r7 fold states of appctx-architecture (REQ-R7-28)", () => {
    const scene = buildAppctxArchitecture16x9();
    const states = enumerateVisibleFoldStates(scene.document, scene.containers, scene.sourceView);
    expect(states).toHaveLength(52);
    const v1AutoPack = lowerLayoutHints({ vocabulary: DS_LAYOUT_VOCABULARY, mode: "auto-pack" });
    const v2AutoPack = lowerLayoutHintsV2({ vocabulary: DS_LAYOUT_V2_VOCABULARY, mode: "auto-pack" });
    const cache = createLayoutCache({ maxEntries: 128 });
    const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");
    const chunks: string[] = [];

    for (const collapsed of states) {
      const key = collapsed.join(",");
      const baseOpts = {
        registry: scene.registry,
        bindings: scene.bindings,
        presentation: scene.presentation,
        measureLines: scene.measureLines,
        measureText: () => ({ width: 80, height: 20 }),
        targetWidth: 1440,
        collapsed,
      };
      const hintsFree = cache.layout(scene.document, baseOpts, scene.sourceView);
      expect(hintsFree.status, `hints-free[${key}]`).toBe("laid-out");
      if (hintsFree.status !== "laid-out") continue;
      expect(hintsFree.composition, `hints-free[${key}]`).toBeUndefined();
      expect(hintsFree.routeSpacing, `hints-free[${key}]`).toBeDefined();

      // @1 auto-pack and @2 auto-pack share the exact cache key with hints-free on the r7 path.
      const hitsBefore = cache.stats().hits;
      const r1 = cache.layout(scene.document, { ...baseOpts, hints: v1AutoPack }, scene.sourceView);
      const r2 = cache.layout(scene.document, { ...baseOpts, hints: v2AutoPack }, scene.sourceView);
      expect(r1.status).toBe("laid-out");
      expect(r2.status).toBe("laid-out");
      expect(cache.stats().hits).toBe(hitsBefore + 2);
      if (r1.status === "laid-out" && r2.status === "laid-out") {
        const canonical = canonicalise(hintsFree.view, "view");
        expect(canonicalise(r1.view, "view")).toBe(canonical);
        expect(canonicalise(r2.view, "view")).toBe(canonical);
        chunks.push(`${key}:${sha256(canonical)}`);
      }
    }

    // Pinned against shipped origin/main DE-2 (bdbddd859) across all 52 r7 fold states.
    expect(sha256(chunks.join("\n"))).toBe("1e60c2ba4b00106f550139303d8606cba403b1547be988fd91d89e8a0c7c330c");
  }, 60_000);
});
