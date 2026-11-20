import { describe, expect, it } from "vitest";
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_CONTENT,
  DIAGRAM_PRESENTATION_V2_CONTRACT_DESCRIPTOR,
  DIAGRAM_PRESENTATION_V2_CONTRACT_ID,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_PROFILE_ID,
  DIAGRAM_PRESENTATION_V2_SCHEMA,
  DIAGRAM_PRESENTATION_V2_SCHEMA_DIGEST,
  DIAGRAM_PRESENTATION_V2_SCHEMA_PIN,
  canonicalBytes,
  createView,
  entityRef,
  generic2Profile,
  isPresentationContractPin,
  isPresentationContractProfileId,
  isPresentationContractV2Pin,
  isPresentationSchemaV2Pin,
  occurrenceRef,
  sha256Hex,
  text,
  validateDocument,
  validateView,
  viewRef,
  type SemanticDocument,
  type ViewDocument,
} from "../src/index.js";
import { baseDocument, ent, scopedOptions } from "./m3-helpers.js";

function docAndView(
  contractPin: typeof DIAGRAM_PRESENTATION_CONTRACT_PIN | typeof DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  entityExtra: Record<string, unknown>,
): { document: SemanticDocument; view: ViewDocument } {
  const document: SemanticDocument = {
    ...baseDocument(["generic@2"]),
    revision: 1,
    entities: {
      "entity:a": ent("a", "generic@2", "node", { name: text("Alpha") }),
    },
  };
  const view: ViewDocument = {
    ...createView({ viewId: viewRef("align"), semanticDocumentId: document.documentId, revision: 1 }),
    entityOccurrences: {
      "occurrence:a": {
        id: occurrenceRef("a"),
        entity: entityRef("a"),
        geometry: { x: 0, y: 0, width: 352, height: 154 },
      },
    },
    presentation: {
      camera: { x: 0, y: 0, zoom: 1 },
      anatomy: "v2",
      diagram: {
        contractPin: { ...contractPin },
        entities: {
          "occurrence:a": {
            form: "card",
            text: { title: "Alpha" },
            ...entityExtra,
          } as never,
        },
        legends: {},
        categoryTokens: [],
      },
    },
  };
  return { document, view };
}

describe("diagram-presentation@2 contract (DE-1)", () => {
  const options = scopedOptions([generic2Profile]);

  it("publishes frozen @2 schema and contract pins distinct from @1", () => {
    expect(DIAGRAM_PRESENTATION_V2_CONTRACT_ID).toBe("diagram-presentation@2");
    expect(DIAGRAM_PRESENTATION_V2_PROFILE_ID).toBe("diagram-presentation@2");
    expect(sha256Hex(canonicalBytes(DIAGRAM_PRESENTATION_V2_SCHEMA))).toBe(DIAGRAM_PRESENTATION_V2_SCHEMA_DIGEST);
    expect(sha256Hex(canonicalBytes(DIAGRAM_PRESENTATION_V2_CONTRACT_DESCRIPTOR))).toBe(
      DIAGRAM_PRESENTATION_V2_CONTRACT_CONTENT,
    );
    expect(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN).toEqual({
      id: "diagram-presentation",
      version: "2",
      contentDigest: DIAGRAM_PRESENTATION_V2_CONTRACT_CONTENT,
    });
    expect(isPresentationContractV2Pin(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN)).toBe(true);
    expect(isPresentationContractPin(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN)).toBe(false);
    expect(isPresentationContractV2Pin(DIAGRAM_PRESENTATION_CONTRACT_PIN)).toBe(false);
    expect(isPresentationSchemaV2Pin(DIAGRAM_PRESENTATION_V2_SCHEMA_PIN)).toBe(true);
    expect(isPresentationContractProfileId("diagram-presentation@2")).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_V2_SCHEMA)).toBe(true);
    expect(Object.isFrozen(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN)).toBe(true);
  });

  it("accepts align left/center under diagram-presentation@2 and refuses invalid values", () => {
    for (const align of ["left", "center"] as const) {
      const { document, view } = docAndView(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, { align });
      expect(validateView(view, document, options)).toEqual([]);
    }
    const absent = docAndView(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, {});
    expect(validateView(absent.view, absent.document, options)).toEqual([]);

    const bad = docAndView(DIAGRAM_PRESENTATION_V2_CONTRACT_PIN, { align: "right" });
    const diagnostics = validateView(bad.view, bad.document, options);
    expect(diagnostics.some((d) => d.path === "presentation.diagram.entities.occurrence:a.align")).toBe(true);
  });

  it("keeps diagram-presentation@1 strict by refusing align under @1 pin", () => {
    const { document, view } = docAndView(DIAGRAM_PRESENTATION_CONTRACT_PIN, { align: "center" });
    const diagnostics = validateView(view, document, options);
    expect(diagnostics.some((d) => d.path === "presentation.diagram.entities.occurrence:a.align")).toBe(true);
  });

  it("never accepts diagram-presentation@2 in SemanticDocument.profileRefs", () => {
    const doc: SemanticDocument = {
      ...baseDocument(["generic@2", "diagram-presentation@2" as never]),
    };
    expect(validateDocument(doc, options).length).toBeGreaterThan(0);
  });
});
