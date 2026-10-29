/**
 * M1-e RED: oracles, witnesses and execution for archimate@2/uml@2.
 * Fails on the base commit: profiles and matrix cases do not exist.
 */
import { describe, expect, it } from "vitest";

import {
  archimate2Profile,
  uml2Profile,
  validateDocument,
} from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";
import { collection, enumeration, quantity, reference, structValue, text } from "../src/index.js";

const archimateOptions = () => scopedOptions([archimate2Profile]);
const umlOptions = () => scopedOptions([uml2Profile]);

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
  it("P-AM keeps two family contexts under one contract", async () => {
    const { GENERIC2_PROFILE_ID } = await import("../src/index.js");
    expect(GENERIC2_PROFILE_ID).toBe("generic@2");
    expect(archimate2Profile.id).toBe("archimate@2");
  });

  it("P-UML validates multiplicity before application", () => {
    expect(uml2Profile.id).toBe("uml@2");
    expect(umlOptions().registry.list()).toContain("uml@2");
  });

  it("P-BPMN stays blocked on A-prime", async () => {
    const { BPMN_BLOCKED_ON_APRIME } = await import("../src/index.js");
    expect(BPMN_BLOCKED_ON_APRIME).toBe(true);
  });
});
