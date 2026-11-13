/** Numbered flows are authored relations, independent of any process notation. */
import { stableStringify } from "./bindings.js";
import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { SemanticDocument, TypeDefinition } from "./document.js";
import type { EntityRef, RelationRef } from "./refs.js";
export interface FlowStep {
  readonly relation: RelationRef;
  readonly scenario: string;
  readonly step: number;
  readonly branch?: string;
  readonly ordinal: number;
  readonly badge: string;
  readonly source: EntityRef;
  readonly target: EntityRef;
  readonly self: boolean;
  readonly label?: string;
  readonly kind?: "sync" | "async" | "reply";
  readonly realises?: string;
}
export interface FlowScenario {
  readonly id: string;
  readonly label: string;
  readonly order?: number;
  readonly steps: readonly FlowStep[];
}
export interface FlowIndex {
  readonly scenarios: readonly FlowScenario[];
  readonly byRelation: Readonly<Record<string, FlowStep>>;
  readonly byEntity: Readonly<Record<string, readonly RelationRef[]>>;
}
const cmp = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export function withFlowTypes(document: SemanticDocument): { document: SemanticDocument; diagnostics: readonly Diagnostic[] } {
  const profile = document.profileRefs.includes("generic@2") ? "generic@2" : "generic@1";
  const definitions: TypeDefinition[] = [
    { id: "flow-step", profile, baseType: "link", attributes: [
      { name: "step", kind: "quantity", units: ["unit"], integer: true, min: 1, max: 999 },
      { name: "branch", kind: "text", pattern: "^[a-z]$", patternName: "flow-branch" },
      { name: "scenario", kind: "reference", refKind: "entity", targetTypes: ["flow-scenario"] },
      { name: "kind", kind: "enum", values: ["sync", "async", "reply"] },
      { name: "realises", kind: "text", maxLength: 200, pattern: "^bpmn:[\\w.-]+#[\\w.-]+$", patternName: "bpmn-task" },
    ] },
    { id: "flow-scenario", profile, baseType: "node", attributes: [
      { name: "order", kind: "quantity", units: ["unit"], integer: true, min: 1 },
    ] },
  ];
  const diagnostics: Diagnostic[] = [];
  for (const definition of definitions) {
    const existing = document.typeDefinitions[definition.id];
    if (existing !== undefined && stableStringify(existing) !== stableStringify(definition)) {
      diagnostics.push(diagnostic({ code: "flow-types-conflict", path: "typeDefinitions." + definition.id, message: "a different flow definition already exists" }));
    }
  }
  if (diagnostics.length > 0) return { document, diagnostics };
  if (definitions.every((definition) => document.typeDefinitions[definition.id] !== undefined)) return { document, diagnostics };
  return { document: { ...document, typeDefinitions: { ...document.typeDefinitions, ...Object.fromEntries(definitions.map((d) => [d.id, d])) } }, diagnostics };
}
export function flowIndex(document: SemanticDocument): FlowIndex {
  const scenarios = new Map<string, { id: string; label: string; order?: number; steps: FlowStep[] }>();
  const scenarioEntities = Object.values(document.entities).filter((e) => e.type === "flow-scenario").sort((a,b) => cmp(a.id,b.id));
  for (const entity of scenarioEntities) {
    const name = entity.attributes["name"];
    const order = entity.attributes["order"];
    scenarios.set(entity.id, { id: entity.id, label: name?.kind === "text" ? name.value : entity.id, ...(order?.kind === "quantity" ? { order: order.value } : {}), steps: [] });
  }
  const byRelation: Record<string, FlowStep> = {};
  const byEntity: Record<string, RelationRef[]> = {};
  for (const relation of Object.values(document.relations).filter((r) => r.type === "flow-step").sort((a,b) => cmp(a.id,b.id))) {
    const attrs = relation.attributes;
    const step = attrs["step"];
    if (step?.kind !== "quantity" || !Number.isInteger(step.value) || step.value < 1 || step.value > 999) continue;
    const owner = (role: string): EntityRef | undefined => {
      const end = relation.endpoints.find((e) => e.role === role)?.target;
      return end?.startsWith("port:") ? document.ports[end]?.owner : end?.startsWith("entity:") ? end as EntityRef : undefined;
    };
    const source = owner("source"), target = owner("target");
    if (source === undefined || target === undefined) continue;
    const scenario = attrs["scenario"]?.kind === "reference" ? attrs["scenario"].value : "";
    if (scenario === "" && !scenarios.has("")) scenarios.set("", { id: "", label: "", steps: [] });
    const group = scenarios.get(scenario);
    if (group === undefined) continue;
    const branch = attrs["branch"]?.kind === "text" ? attrs["branch"].value : undefined;
    const label = attrs["label"]?.kind === "text" ? attrs["label"].value : undefined;
    const kind = attrs["kind"]?.kind === "enum" ? attrs["kind"].value as FlowStep["kind"] : undefined;
    const realises = attrs["realises"]?.kind === "text" ? attrs["realises"].value : undefined;
    group.steps.push({ relation: relation.id, scenario, step: step.value, ...(branch === undefined ? {} : { branch }), ordinal: 0,
      badge: String(step.value) + (branch ?? ""), source, target, self: source === target,
      ...(label === undefined ? {} : { label }), ...(kind === undefined ? {} : { kind }), ...(realises === undefined ? {} : { realises }) });
  }
  const ordered = [...scenarios.values()].sort((a,b) => a.id === "" ? -1 : b.id === "" ? 1 : (a.order ?? Infinity) - (b.order ?? Infinity) || cmp(a.id,b.id));
  for (const scenario of ordered) {
    scenario.steps.sort((a,b) => a.step - b.step || cmp(a.branch ?? "", b.branch ?? "") || cmp(a.relation,b.relation));
    scenario.steps = scenario.steps.map((step, ordinal) => ({ ...step, ordinal }));
    for (const step of scenario.steps) {
      byRelation[step.relation] = step;
      for (const entity of new Set([step.source, step.target])) (byEntity[entity] ??= []).push(step.relation);
    }
  }
  return { scenarios: ordered, byRelation, byEntity };
}
/** Run after document validation; this pass only owns the flow semantics. */
export function validateFlows(document: SemanticDocument): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const groups = new Map<string, typeof document.relations[string][]>();
  const seen = new Set<string>();
  const scenarios = new Set(Object.values(document.entities).filter((e) => e.type === "flow-scenario").map((e) => e.id));
  const add = (code: Diagnostic["code"], relation: string, severity: "error" | "warning" = "error"): void => {
    diagnostics.push(diagnostic({ code, path: "relations." + relation, refs: [relation], severity, message: code }));
  };
  for (const relation of Object.values(document.relations).sort((a,b) => cmp(a.id,b.id))) {
    for (const end of relation.endpoints) {
      const owner = end.target.startsWith("port:") ? document.ports[end.target]?.owner : end.target;
      if (owner !== undefined && scenarios.has(owner as EntityRef)) {
        add("flow-scenario-misused", relation.id);
        if (relation.type === "flow-step") add("flow-step-end-invalid", relation.id);
      }
    }
    if (relation.type !== "flow-step") continue;
    const step = relation.attributes["step"];
    if (step === undefined) { add("flow-step-missing", relation.id); continue; }
    if (step.kind !== "quantity") continue;
    const scenarioAttr = relation.attributes["scenario"];
    const scenario = scenarioAttr?.kind === "reference" ? scenarioAttr.value : "";
    if (scenario !== "" && !scenarios.has(scenario as EntityRef)) add("flow-scenario-unknown", relation.id);
    const branch = relation.attributes["branch"];
    const key = JSON.stringify([scenario, step.value, branch?.kind === "text" ? branch.value : ""]);
    if (seen.has(key)) add("flow-step-duplicate", relation.id);
    seen.add(key);
    const groupKey = JSON.stringify([scenario, step.value]);
    const group = groups.get(groupKey) ?? [];
    group.push(relation); groups.set(groupKey, group);
  }
  for (const group of groups.values()) {
    if (group.length > 26) add("flow-branch-overflow", group[0]!.id);
    for (const relation of group) {
      if ((group.length === 1) === (relation.attributes["branch"] !== undefined)) add("flow-branch-without-sibling", relation.id, "warning");
    }
  }
  const numbers = new Map<string, Set<number>>();
  for (const group of groups.values()) {
    const first = group[0]!;
    const attr = first.attributes["scenario"];
    const scenario = attr?.kind === "reference" ? attr.value : "";
    const step = first.attributes["step"];
    if (step?.kind === "quantity") (numbers.get(scenario) ?? numbers.set(scenario, new Set()).get(scenario)!).add(step.value);
  }
  for (const [scenario, values] of numbers) {
    if ([...values].sort((a,b) => a-b).some((value,i) => value !== i+1)) diagnostics.push(diagnostic({ code: "flow-step-gap", severity: "warning", path: "flows." + scenario, message: "step numbers are not consecutive from 1" }));
  }
  return diagnostics;
}
