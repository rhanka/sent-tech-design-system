import { describe, expect, it } from "vitest";
import { defaultProfileRegistry, flowIndex, genericProfile, quantity, reference, relationSchema, text, validateDocument, validateFlows, withFlowTypes, type SemanticDocument } from "../src/index.js";
import { baseDocument, ent, rel, scopedOptions } from "./m3-helpers.js";

function doc(steps = 4): SemanticDocument {
  return withFlowTypes({ ...baseDocument(["generic@1"]), entities: { "entity:a": ent("a", "generic@1", "node", { name: text("A") }), "entity:b": ent("b", "generic@1", "node", { name: text("B") }) },
    relations: Object.fromEntries(Array.from({ length: steps }, (_,i) => {
      const r = rel(String(steps-i), "generic@1", "flow-step", [{ role: "source", target: i === 3 ? "entity:b" : "entity:a" }, { role: "target", target: i === 3 ? "entity:a" : "entity:b" }], { step: quantity(i+1, "unit") }); return [r.id,r];
    })) }).document;
}
const codes = (d: SemanticDocument) => validateDocument(d, { registry: defaultProfileRegistry }).map((x) => x.code);
const flowCodes = (d: SemanticDocument) => validateFlows(d).map((x) => x.code);
const change = (d: SemanticDocument, attributes: SemanticDocument["relations"][string]["attributes"]) => ({ ...d, relations: { ...d.relations, "relation:4": { ...d.relations["relation:4"]!, attributes } } });

describe("DC-2c A1–A3 core", () => {
  it("inherits roles, direction and attributes; accepts numbered steps and refuses plain-link flow attributes", () => {
    const d = doc(); expect(codes(d)).toEqual([]); expect(flowCodes(d)).toEqual([]);
    const schema = relationSchema(d, genericProfile, d.relations["relation:4"]!)!;
    expect(schema.roles).toEqual(genericProfile.relationTypes[0]!.roles);
    expect(schema.direction).toBe("directed"); expect(schema.attributes!.map((a) => a.name)).toContain("label");
    const plain = { ...d, relations: { "relation:4": { ...d.relations["relation:4"]!, type: "link" } } };
    expect(codes(plain)).toContain("attribute-not-in-schema");
  });
  it("refuses reserved ids, ambiguous bases, inherited redeclarations and required additions", () => {
    const d = doc(); const def = d.typeDefinitions["flow-step"]!;
    expect(codes({ ...d, typeDefinitions: { ...d.typeDefinitions, node: { ...def, id: "node" } } })).toContain("type-definition-reserved");
    expect(codes({ ...d, typeDefinitions: { ...d.typeDefinitions, "flow-step": { ...def, attributes: [{ name: "label", kind: "text" }] } } })).toContain("type-definition-conflict");
    expect(codes({ ...d, typeDefinitions: { ...d.typeDefinitions, "flow-step": { ...def, attributes: [{ name: "extra", kind: "text", required: true }] } } })).toContain("type-definition-conflict");
    const profile = { ...genericProfile, id: "test@2" as const, entityTypes: [...genericProfile.entityTypes, { id: "link", label: "Link", attributes: [] }] };
    const ambiguous = { ...baseDocument([profile.id]), typeDefinitions: { x: { id: "x", profile: profile.id, baseType: "link", attributes: [] } } };
    expect(validateDocument(ambiguous, scopedOptions([profile])).map((x) => x.code)).toContain("type-definition-ambiguous");
  });
  it("is idempotent and leaves a conflicting document unchanged", () => {
    const d = doc(); expect(withFlowTypes(d).document).toBe(d);
    const conflicting = { ...d, typeDefinitions: { ...d.typeDefinitions, "flow-step": { ...d.typeDefinitions["flow-step"]!, label: "different" } } };
    expect(withFlowTypes(conflicting)).toMatchObject({ document: conflicting, diagnostics: [{ code: "flow-types-conflict" }] });
    expect(withFlowTypes(conflicting).document).toBe(conflicting);
  });
  it("indexes 3 forward and 1 reverse steps in authored order, independently of twenty shuffles", () => {
    const d = doc(); const index = flowIndex(d);
    expect(index.scenarios[0]!.steps.map((s) => [s.ordinal,s.badge])).toEqual([[0,"1"],[1,"2"],[2,"3"],[3,"4"]]);
    expect(index.byEntity["entity:a"]).toEqual(["relation:4","relation:3","relation:2","relation:1"]);
    for (let seed=1;seed<=20;seed++) {
      const entries=Object.entries(d.relations); let value=seed;
      for(let i=entries.length-1;i>0;i--) { value=(value*1664525+1013904223)>>>0; const j=value%(i+1); [entries[i],entries[j]]=[entries[j]!,entries[i]!]; }
      expect(flowIndex({ ...d, relations: Object.fromEntries(entries) })).toEqual(index);
    }
  });
  it("raises each flow diagnostic on a minimal invalid fixture", () => {
    const d=doc();
    expect(flowCodes(change(d, {}))).toContain("flow-step-missing");
    expect(flowCodes(change(d, { step: quantity(2,"unit") }))).toContain("flow-step-duplicate");
    expect(flowCodes(change(d, { step: quantity(1,"unit"), branch: text("a") }))).toContain("flow-branch-without-sibling");
    expect(flowCodes(change(d, { step: quantity(9,"unit") }))).toContain("flow-step-gap");
    expect(flowCodes(change(d, { step: quantity(1,"unit"), scenario: reference("entity:missing") }))).toContain("flow-scenario-unknown");
    const scenario=ent("a","generic@1","flow-scenario",{ name:text("Scenario") });
    expect(flowCodes({ ...d, entities: { ...d.entities, [scenario.id]:scenario } })).toEqual(expect.arrayContaining(["flow-scenario-misused","flow-step-end-invalid"]));
    const overflow=doc(27); const relations=Object.fromEntries(Object.values(overflow.relations).map((r,i) => [r.id,{ ...r, attributes:{ step:quantity(1,"unit"), branch:text(String.fromCharCode(97+i)) } }]));
    expect(flowCodes({ ...overflow,relations })).toContain("flow-branch-overflow");
  });
});
