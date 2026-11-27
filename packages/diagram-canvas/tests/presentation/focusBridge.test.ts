import { describe, expect, it } from "vitest";
import {
  createDocument,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  documentRef,
  entityRef,
  enumeration,
  GENERIC_PROFILE_ID,
  m3ProfileRegistry,
  occurrenceRef,
  PROCESS_PROFILE_ID,
  relationRef,
  shippedExecutorBindings,
  text,
} from "@sentropic/diagram-core";
import {
  layoutScene,
  renderProcessTable,
  shippedSceneBindings,
  shippedSceneRegistry,
  validateSceneDocument,
  type SceneDocument,
  type SceneLayoutInput,
  type ScenePresentation,
} from "../../src/focus-bridge.js";
import {
  layoutScene as directLayoutScene,
  shippedSceneBindings as directShippedSceneBindings,
  shippedSceneRegistry as directShippedSceneRegistry,
  validateSceneDocument as directValidateSceneDocument,
} from "../../src/presentation/diagramSceneModel.js";
import { renderProcessTable as directRenderProcessTable } from "../../src/presentation/process.js";
import { cardLineMeasurer } from "../../src/presentation/diagramCardModel.js";

function processFixture(): SceneDocument {
  const base = createDocument({
    documentId: documentRef("focus-bridge-process"),
    profileRefs: [PROCESS_PROFILE_ID],
  });
  return {
    ...base,
    entities: {
      "entity:intake": {
        id: entityRef("intake"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Intake"), kind: enumeration("start") },
      },
      "entity:review": {
        id: entityRef("review"),
        profile: PROCESS_PROFILE_ID,
        type: "step",
        attributes: { name: text("Review"), kind: enumeration("end") },
      },
    },
    relations: {
      "relation:intake.review": {
        id: relationRef("intake.review"),
        profile: PROCESS_PROFILE_ID,
        type: "transition",
        endpoints: [
          { role: "source", target: entityRef("intake") },
          { role: "target", target: entityRef("review") },
        ],
        attributes: { label: text("Submit") },
      },
    },
  };
}

function genericFixture(): { document: SceneDocument; presentation: ScenePresentation } {
  const base = createDocument({
    documentId: documentRef("focus-bridge-generic"),
    profileRefs: [GENERIC_PROFILE_ID],
  });
  return {
    document: {
      ...base,
      entities: {
        "entity:a": {
          id: entityRef("a"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: text("Node A") },
        },
        "entity:b": {
          id: entityRef("b"),
          profile: GENERIC_PROFILE_ID,
          type: "node",
          attributes: { name: text("Node B") },
        },
      },
      relations: {
        "relation:a.b": {
          id: relationRef("a.b"),
          profile: GENERIC_PROFILE_ID,
          type: "link",
          endpoints: [
            { role: "source", target: entityRef("a") },
            { role: "target", target: entityRef("b") },
          ],
          attributes: { label: text("Calls") },
        },
      },
    },
    presentation: {
      contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
      entities: {
        [occurrenceRef("e.a")]: { form: "card", text: { title: "Node A" } },
        [occurrenceRef("e.b")]: { form: "card", text: { title: "Node B" } },
      },
      legends: {},
      categoryTokens: [],
    },
  };
}

const emptyPresentation: ScenePresentation = {
  contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entities: {},
  legends: {},
  categoryTokens: [],
};

describe("@sentropic/diagram-canvas/focus-bridge", () => {
  it("re-exports the exact existing in-package functions and registry/bindings without DOM", () => {
    expect(typeof (globalThis as { document?: unknown }).document).toBe("undefined");
    expect(typeof (globalThis as { window?: unknown }).window).toBe("undefined");
    expect(validateSceneDocument).toBe(directValidateSceneDocument);
    expect(layoutScene).toBe(directLayoutScene);
    expect(renderProcessTable).toBe(directRenderProcessTable);
    expect(shippedSceneRegistry).toBe(directShippedSceneRegistry);
    expect(shippedSceneBindings).toBe(directShippedSceneBindings);
  });

  it("matches in-package outputs byte for byte on a process@1 fixture with no DOM access", () => {
    const doc = processFixture();
    const invalidDoc: SceneDocument = {
      ...doc,
      relations: {
        ...doc.relations,
        "relation:intake.missing": {
          id: relationRef("intake.missing"),
          profile: PROCESS_PROFILE_ID,
          type: "transition",
          endpoints: [
            { role: "source", target: entityRef("intake") },
            { role: "target", target: entityRef("missing") },
          ],
          attributes: {},
        },
      },
    };
    const input: SceneLayoutInput = {
      document: doc,
      registry: shippedSceneRegistry,
      bindings: shippedSceneBindings,
      presentation: emptyPresentation,
      measureLines: cardLineMeasurer(),
      collapsed: [],
      targetWidth: 640,
    };

    const trap = new Proxy(
      {},
      {
        get: () => {
          throw new Error("DOM global accessed by focus-bridge");
        },
      },
    );
    const globals = globalThis as unknown as Record<string, unknown>;
    globals["document"] = trap;
    globals["window"] = trap;
    try {
      expect(JSON.stringify(validateSceneDocument(doc))).toBe(
        JSON.stringify(directValidateSceneDocument(doc)),
      );
      expect(validateSceneDocument(doc)).toEqual([]);
      expect(
        JSON.stringify(
          validateSceneDocument(invalidDoc, {
            registry: shippedSceneRegistry,
            bindings: shippedSceneBindings,
          }),
        ),
      ).toBe(
        JSON.stringify(
          directValidateSceneDocument(invalidDoc, {
            registry: directShippedSceneRegistry,
            bindings: directShippedSceneBindings,
          }),
        ),
      );

      const bridgeLayout = layoutScene(input);
      const directLayout = directLayoutScene(input);
      expect(bridgeLayout.status).toBe("laid-out");
      expect(JSON.stringify(bridgeLayout)).toBe(JSON.stringify(directLayout));

      const bridgeTable = renderProcessTable(doc);
      const directTable = directRenderProcessTable(doc);
      expect(bridgeTable).toBe(directTable);
      expect(bridgeTable).toContain("Intake");
      expect(bridgeTable).toContain("Review");
      expect(bridgeTable).toContain("Submit");
    } finally {
      delete globals["document"];
      delete globals["window"];
    }
  });

  it("matches in-package outputs byte for byte on a generic@1 fixture", () => {
    const { document: doc, presentation } = genericFixture();
    const invalidDoc: SceneDocument = {
      ...doc,
      relations: {
        ...doc.relations,
        "relation:a.missing": {
          id: relationRef("a.missing"),
          profile: GENERIC_PROFILE_ID,
          type: "link",
          endpoints: [
            { role: "source", target: entityRef("a") },
            { role: "target", target: entityRef("missing") },
          ],
          attributes: {},
        },
      },
    };
    const input: SceneLayoutInput = {
      document: doc,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: cardLineMeasurer(),
      collapsed: [],
    };

    expect(
      JSON.stringify(
        validateSceneDocument(doc, {
          registry: m3ProfileRegistry,
          bindings: shippedExecutorBindings,
        }),
      ),
    ).toBe(
      JSON.stringify(
        directValidateSceneDocument(doc, {
          registry: m3ProfileRegistry,
          bindings: shippedExecutorBindings,
        }),
      ),
    );
    expect(
      validateSceneDocument(doc, {
        registry: m3ProfileRegistry,
        bindings: shippedExecutorBindings,
      }),
    ).toEqual([]);

    expect(
      JSON.stringify(
        validateSceneDocument(invalidDoc, {
          registry: m3ProfileRegistry,
          bindings: shippedExecutorBindings,
        }),
      ),
    ).toBe(
      JSON.stringify(
        directValidateSceneDocument(invalidDoc, {
          registry: m3ProfileRegistry,
          bindings: shippedExecutorBindings,
        }),
      ),
    );

    const bridgeLayout = layoutScene(input);
    const directLayout = directLayoutScene(input);
    expect(bridgeLayout.status).toBe("laid-out");
    expect(JSON.stringify(bridgeLayout)).toBe(JSON.stringify(directLayout));

    const bridgeTable = renderProcessTable(doc);
    const directTable = directRenderProcessTable(doc);
    expect(bridgeTable).toBe(directTable);
    expect(bridgeTable).toContain('<details class="st-diagramProcessTable">');
  });
});
