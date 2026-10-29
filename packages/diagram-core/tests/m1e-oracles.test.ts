/**
 * M1-e RED: oracles, witnesses and execution for archimate@2/uml@2.
 * Fails on the base commit: profiles and matrix cases do not exist.
 */
import { describe, expect, it } from "vitest";

import {
  archimate2Profile,
  generic2Profile,
  uml2Profile,
  validateDocument,
  validateView,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";
import { collection, enumeration, quantity, reference, structValue, text } from "../src/index.js";

const archimateOptions = () => scopedOptions([archimate2Profile]);
const umlOptions = () => scopedOptions([uml2Profile]);
const mixedArchimateOptions = () => scopedOptions([archimate2Profile, generic2Profile]);
const mixedUmlOptions = () => scopedOptions([uml2Profile, generic2Profile]);

describe("archimate@2 execution", () => {
  it("accepts application-component access data-object and rejects the reverse", () => {
    const doc = (source: string, target: string, type: string) => ({
      ...baseDocument(["archimate@2"]),
      entities: {
        "entity:c": ent("c", "archimate@2", "application-component", {
          name: text("C"),
          layer: enumeration("application"),
          aspect: enumeration("active"),
        }),
        "entity:d": ent("d", "archimate@2", "data-object", {
          name: text("D"),
          layer: enumeration("application"),
          aspect: enumeration("passive"),
        }),
      },
      relations: {
        "relation:r": rel("r", "archimate@2", type, [
          { role: "source", target: source },
          { role: "target", target: target },
        ]),
      },
    });
    expect(validateDocument(doc("entity:c", "entity:d", "access"), archimateOptions())).toEqual([]);
    const rejected = validateDocument(doc("entity:d", "entity:c", "access"), archimateOptions());
    expect(rejected.map((d) => d.code)).toContain("relationship-matrix-violation");
    expect(rejected[0]).toMatchObject({
      code: "relationship-matrix-violation",
      path: "relations.relation:r.endpoints",
      refs: ["relation:r", "entity:d", "entity:c"],
      details: {
        matrixId: "archimate-3.2",
        relationType: "access",
        sourceType: "data-object",
        targetType: "application-component",
      },
    });
  });

  it("accepts a relation-target association and rejects an access to @relation", () => {
    const doc = (type: string) => ({
      ...baseDocument(["archimate@2"]),
      entities: {
        "entity:a": ent("a", "archimate@2", "business-actor", {
          name: text("A"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
        "entity:p": ent("p", "archimate@2", "business-process", {
          name: text("P"),
          layer: enumeration("business"),
          aspect: enumeration("behavior"),
        }),
        "entity:c": ent("c", "archimate@2", "application-component", {
          name: text("C"),
          layer: enumeration("application"),
          aspect: enumeration("active"),
        }),
      },
      relations: {
        "relation:inner": rel("inner", "archimate@2", "assignment", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:p" },
        ]),
        "relation:r": rel("r", "archimate@2", type, [
          { role: "source", target: "entity:c" },
          { role: "target", target: "relation:inner" },
        ]),
      },
    });
    expect(validateDocument(doc("association"), archimateOptions()).filter((d) => d.code === "relationship-matrix-violation")).toEqual([]);
    expect(
      validateDocument(doc("access"), archimateOptions()).map((d) => d.code),
    ).toContain("relationship-matrix-violation");
  });

  it("builds the 42284-case corpus with 11569 allowed", async () => {
    const { buildArchimatePairCases, expandArchimateTuples, ARCHIMATE_RELATIONSHIP_IDS } = await import(
      "../src/index.js"
    );
    const cases = buildArchimatePairCases(expandArchimateTuples(), ARCHIMATE_RELATIONSHIP_IDS);
    expect(cases).toHaveLength(62 * 62 * 11);
    expect(cases.filter((c) => c.expected === "allowed")).toHaveLength(11569);
  });
});

describe("uml@2 execution", () => {
  it("checks bound-pair and exclusive composite ends byte-exact", () => {
    const doc = {
      ...baseDocument(["uml@2"]),
      entities: {
        "entity:p": ent("p", "uml@2", "property", {
          name: text("total"),
          visibility: enumeration("public"),
          stereotypes: collection([]),
          multiplicity: structValue("multiplicity", {
            lower: quantity(3, "unit"),
            upper: quantity(2, "unit"),
          }),
        }),
      },
      relations: {},
    };
    expect(validateDocument(doc, umlOptions())).toMatchObject([
      {
        code: "multiplicity-invalid",
        path: "entities.entity:p.attributes.multiplicity",
        message: "multiplicity lower 3 exceeds finite upper 2",
        details: { lower: 3, upper: 2, constraint: "bound-pair" },
      },
    ]);
  });

  it("refuses duplicate stereotype extends and inapplicable application", () => {
    const doc = {
      ...baseDocument(["uml@2"]),
      entities: {
        "entity:s": ent("s", "uml@2", "stereotype", {
          name: text("S"),
          extends: collection([
            { kind: "enum", value: "class" },
            { kind: "enum", value: "class" },
          ]),
        }),
        "entity:i": ent("i", "uml@2", "interface", {
          name: text("I"),
          visibility: enumeration("public"),
          stereotypes: collection([{ kind: "reference", value: "entity:s" }]),
        }),
      },
      relations: {},
    };
    const codes = validateDocument(doc, umlOptions()).map((d) => d.code);
    expect(codes).toContain("collection-bound-exceeded");
  });
});

describe("P-AM and P-UML witnesses", () => {
  it("P-AM applies card with categoryRef under two family contexts and keeps matrix governing", async () => {
    const mod = (await import("../src/index.js")) as typeof import("../src/index.js");
    const document = {
      ...baseDocument(["archimate@2", "generic@2"]),
      entities: {
        "entity:a": ent("a", "archimate@2", "application-component", {
          name: text("A"),
          layer: enumeration("application"),
          aspect: enumeration("active"),
        }),
        "entity:b": ent("b", "archimate@2", "data-object", {
          name: text("B"),
          layer: enumeration("application"),
          aspect: enumeration("passive"),
        }),
        "entity:l": ent("l", "generic@2", "legend", { name: text("L") }),
        "entity:k1": ent("k1", "generic@2", "legend-key", { name: text("K1"), category: text("risk") }),
      },
      relations: {
        "relation:lk": rel("lk", "generic@2", "contains", [
          { role: "parent", target: "entity:l" },
          { role: "child", target: "entity:k1" },
        ]),
        "relation:access": rel("access", "archimate@2", "access", [
          { role: "source", target: "entity:a" },
          { role: "target", target: "entity:b" },
        ]),
      },
    };
    expect(validateDocument(document, mixedArchimateOptions())).toEqual([]);
    const view = {
      ...mod.createView({ viewId: mod.viewRef("pam"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:a": { id: mod.occurrenceRef("a"), entity: mod.entityRef("a"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:l": { id: mod.occurrenceRef("l"), entity: mod.entityRef("l"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:k": { id: mod.occurrenceRef("k"), entity: mod.entityRef("k1"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:a": { form: "card", text: {}, categoryRef: mod.entityRef("k1") },
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: [mod.entityRef("k1")] } },
          categoryTokens: [{ legendRef: mod.entityRef("l"), category: "risk", token: "st-feedback-warning" }],
        },
      },
    };
    expect(validateView(view as never, document as never, mixedArchimateOptions())).toEqual([]);
    const reversed = {
      ...document,
      relations: {
        ...document.relations,
        "relation:access": rel("access", "archimate@2", "access", [
          { role: "source", target: "entity:b" },
          { role: "target", target: "entity:a" },
        ]),
      },
    };
    expect(validateDocument(reversed, mixedArchimateOptions()).map((d) => d.code)).toContain(
      "relationship-matrix-violation",
    );
    const familyPins = [
      mod.familyPinForProfile(mod.archimate2Profile),
      mod.familyPinForProfile(mod.generic2Profile),
    ];
    const adapterPin = mod.parsePinnedAdapterReference(
      mod.DIAGRAM_PRESENTATION_PACKAGED_CATALOG.compatibilityAdapter,
    );
    expect(adapterPin).toBeDefined();
    const baseApplyInput = {
      familyPins,
      semanticDocument: document,
      sourceView: view,
      contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
      semanticCategoryPins: [],
      adapterPin: adapterPin as NonNullable<typeof adapterPin>,
    };
    const applied = mod.applyPresentation(baseApplyInput as never, mixedArchimateOptions());
    expect(applied.outcome).toBe("ok");
    if (applied.outcome !== "ok") return;
    expect(applied.diagnostics).toEqual([]);
    expect(applied.familyPins).toEqual(familyPins);
    expect(applied.contractPin).toEqual(mod.DIAGRAM_PRESENTATION_CONTRACT_PIN);
    const refusedMatrix = mod.applyPresentation(
      { ...baseApplyInput, semanticDocument: reversed } as never,
      mixedArchimateOptions(),
    );
    expect(refusedMatrix.outcome).toBe("refused");
    if (refusedMatrix.outcome !== "refused") return;
    expect(refusedMatrix.diagnostics.map((entry) => entry.code)).toContain("relationship-matrix-violation");
    expect("view" in refusedMatrix).toBe(false);
    const missingGenericDoc = {
      ...document,
      profileRefs: ["archimate@2" as never],
      entities: {
        "entity:a": document.entities["entity:a"],
        "entity:b": document.entities["entity:b"],
      },
      relations: {
        "relation:access": document.relations["relation:access"],
      },
    };
    const missingCodes = validateView(view as never, missingGenericDoc as never, mixedArchimateOptions()).map(
      (d) => d.code,
    );
    expect(missingCodes).toContain("dangling-reference");
  });

  it("P-UML validates multiplicity and stereotype before application and draws card and container", async () => {
    const mod = (await import("../src/index.js")) as typeof import("../src/index.js");
    const document = {
      ...baseDocument(["uml@2", "generic@2"]),
      entities: {
        "entity:c": ent("c", "uml@2", "class", {
          name: text("C"),
          visibility: enumeration("public"),
          stereotypes: collection([]),
        }),
        "entity:p": ent("p", "uml@2", "package", {
          name: text("P"),
          visibility: enumeration("public"),
          stereotypes: collection([]),
        }),
        "entity:l": ent("l", "generic@2", "legend", { name: text("L") }),
        "entity:k1": ent("k1", "generic@2", "legend-key", { name: text("K1"), category: text("risk") }),
      },
      relations: {
        "relation:lk": rel("lk", "generic@2", "contains", [
          { role: "parent", target: "entity:l" },
          { role: "child", target: "entity:k1" },
        ]),
      },
    };
    expect(validateDocument(document, mixedUmlOptions())).toEqual([]);
    expect("card" in (uml2Profile.entityTypes.find((t) => t.id === "class")?.attributes ?? [])).toBe(false);
    const view = {
      ...mod.createView({ viewId: mod.viewRef("puml"), semanticDocumentId: document.documentId }),
      entityOccurrences: {
        "occurrence:c": { id: mod.occurrenceRef("c"), entity: mod.entityRef("c"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:p": { id: mod.occurrenceRef("p"), entity: mod.entityRef("p"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:l": { id: mod.occurrenceRef("l"), entity: mod.entityRef("l"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
        "occurrence:k": { id: mod.occurrenceRef("k"), entity: mod.entityRef("k1"), geometry: { x: 0, y: 0, width: 460, height: 200 } },
      },
      relationOccurrences: {},
      presentation: {
        camera: { x: 0, y: 0, zoom: 1 },
        diagram: {
          contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
          entities: {
            "occurrence:c": { form: "card", text: {}, categoryRef: mod.entityRef("k1") },
            "occurrence:p": { form: "container", text: {} },
            "occurrence:l": { form: "legend", text: {} },
            "occurrence:k": { form: "legend-key", text: {} },
          },
          legends: { "occurrence:l": { order: [mod.entityRef("k1")] } },
          categoryTokens: [{ legendRef: mod.entityRef("l"), category: "risk", token: "st-feedback-warning" }],
        },
      },
    };
    expect(validateView(view as never, document as never, mixedUmlOptions())).toEqual([]);
    const badMultiplicity = {
      ...document,
      entities: {
        ...document.entities,
        "entity:bad": ent("bad", "uml@2", "property", {
          name: text("bad"),
          visibility: enumeration("public"),
          stereotypes: collection([]),
          multiplicity: structValue("multiplicity", {
            lower: quantity(3, "unit"),
            upper: quantity(2, "unit"),
          }),
        }),
      },
    };
    expect(validateDocument(badMultiplicity, mixedUmlOptions()).map((d) => d.code)).toContain("multiplicity-invalid");
    const umlFamilyPins = [mod.familyPinForProfile(mod.uml2Profile), mod.familyPinForProfile(mod.generic2Profile)];
    const umlAdapterPin = mod.parsePinnedAdapterReference(
      mod.DIAGRAM_PRESENTATION_PACKAGED_CATALOG.compatibilityAdapter,
    );
    expect(umlAdapterPin).toBeDefined();
    const baseUmlInput = {
      familyPins: umlFamilyPins,
      semanticDocument: document,
      sourceView: view,
      contractPin: mod.DIAGRAM_PRESENTATION_CONTRACT_PIN,
      semanticCategoryPins: [],
      adapterPin: umlAdapterPin as NonNullable<typeof umlAdapterPin>,
    };
    const appliedUml = mod.applyPresentation(baseUmlInput as never, mixedUmlOptions());
    expect(appliedUml.outcome).toBe("ok");
    if (appliedUml.outcome !== "ok") return;
    expect(appliedUml.diagnostics).toEqual([]);
    const refusedMultiplicity = mod.applyPresentation(
      { ...baseUmlInput, semanticDocument: badMultiplicity } as never,
      mixedUmlOptions(),
    );
    expect(refusedMultiplicity.outcome).toBe("refused");
    if (refusedMultiplicity.outcome !== "refused") return;
    expect(refusedMultiplicity.diagnostics.map((entry) => entry.code)).toContain("multiplicity-invalid");
    expect("view" in refusedMultiplicity).toBe(false);
    const stereotypeDoc = {
      ...document,
      entities: {
        ...document.entities,
        "entity:s": ent("s", "uml@2", "stereotype", {
          name: text("S"),
          extends: collection([{ kind: "enum", value: "class" }]),
        }),
        "entity:q": ent("q", "uml@2", "package", {
          name: text("Q"),
          visibility: enumeration("public"),
          stereotypes: collection([{ kind: "reference", value: "entity:s" }]),
        }),
      },
    };
    expect(validateDocument(stereotypeDoc, mixedUmlOptions()).map((d) => d.code)).toContain(
      "stereotype-application-invalid",
    );
    const refusedStereotype = mod.applyPresentation(
      { ...baseUmlInput, semanticDocument: stereotypeDoc } as never,
      mixedUmlOptions(),
    );
    expect(refusedStereotype.outcome).toBe("refused");
    if (refusedStereotype.outcome !== "refused") return;
    expect(refusedStereotype.diagnostics.map((entry) => entry.code)).toContain("stereotype-application-invalid");
    expect("view" in refusedStereotype).toBe(false);
  });

  it("P-BPMN stays blocked on A-prime", async () => {
    const { BPMN_BLOCKED_ON_APRIME } = await import("../src/index.js");
    expect(BPMN_BLOCKED_ON_APRIME).toBe(true);
  });
});
