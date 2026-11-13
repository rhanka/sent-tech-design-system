/** Declaration checks for the optional, serialisable chain DATA vocabulary. */
import { tryCanonicalise } from "./canonical.js";
import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { ChainConstraint, ChainPath, Profile } from "./profile.js";

export function validateChainPredicates(profile: Profile): readonly Diagnostic[] {
  if (profile.chainPredicates === undefined) return [];
  const root = `profiles.${profile.id}.chainPredicates`;
  const serialised = tryCanonicalise(profile.chainPredicates, root);
  if (!serialised.ok) return serialised.diagnostics;
  const diagnostics: Diagnostic[] = [];
  const entities = new Set(profile.entityTypes.map((type) => type.id));
  const relations = new Set(profile.relationTypes.map((type) => type.id));
  const attributes = new Set(profile.entityTypes.flatMap((type) => type.attributes.map((field) => field.name)));
  const seen = new Set<string>();
  for (const [index, predicate] of profile.chainPredicates.entries()) {
    const path = `${root}[${index}]`;
    const fail = (check: string, field: string): void => {
      diagnostics.push(diagnostic({
        code: "type-definition-conflict", path: `${path}${field}`,
        message: `chain predicate ${predicate.id} fails check ${check}`,
        details: { check },
      }));
    };
    const types = (values: readonly string[], known: ReadonlySet<string>, field: string): void => {
      if (values.length === 0 || values.some((value) => !known.has(value))) fail("chain-unknown-type", field);
    };
    const constraints = (values: readonly ChainConstraint[] | undefined, field: string): void => {
      for (const [i, constraint] of (values ?? []).entries()) {
        if (!attributes.has(constraint.attribute)) fail("chain-unknown-type", `${field}[${i}].attribute`);
      }
    };
    const walk = (value: ChainPath, field: string): void => {
      types(value.endTypes, entities, `${field}.endTypes`);
      constraints(value.endConstraints, `${field}.endConstraints`);
      if (value.steps.length === 0) fail("chain-unknown-type", `${field}.steps`);
      for (const [i, step] of value.steps.entries()) {
        types(step.relationTypes, relations, `${field}.steps[${i}].relationTypes`);
        if (step.direction !== "forward" && step.direction !== "inverse") {
          fail("chain-invalid-direction", `${field}.steps[${i}].direction`);
        }
        if (!["one", "zeroOrMore", "oneOrMore"].includes(step.repeat)) {
          fail("chain-invalid-repeat", `${field}.steps[${i}].repeat`);
        }
      }
    };
    if (predicate.id.length === 0 || seen.has(predicate.id)) fail("chain-duplicate-id", ".id");
    seen.add(predicate.id);
    types(predicate.appliesTo.relationTypes, relations, ".appliesTo.relationTypes");
    types(predicate.appliesTo.startTypes, entities, ".appliesTo.startTypes");
    const roles = new Set(profile.relationTypes
      .filter((type) => predicate.appliesTo.relationTypes.includes(type.id))
      .flatMap((type) => type.roles.map((role) => role.role)));
    types(predicate.appliesTo.roles, roles, ".appliesTo.roles");
    constraints(predicate.startConstraints, ".startConstraints");
    if (predicate.alternatives.length === 0) fail("chain-unknown-type", ".alternatives");
    predicate.alternatives.forEach((alternative, i) => walk(alternative, `.alternatives[${i}]`));
    const aggregation = predicate.aggregation;
    const raw = predicate as unknown as Record<string, unknown>;
    if (predicate.selection !== "aggregate") {
      if (aggregation !== undefined || raw["sort"] !== undefined || raw["members"] !== undefined) {
        fail("chain-members-not-aggregate", ".aggregation");
      }
    } else if (aggregation?.memberRelationTypes === undefined || aggregation.memberTargetChain === undefined ||
               aggregation.memberSourceChain === undefined) {
      fail("chain-members-not-aggregate", ".aggregation");
    } else {
      types(aggregation.memberRelationTypes, relations, ".aggregation.memberRelationTypes");
      walk(aggregation.memberTargetChain, ".aggregation.memberTargetChain");
      walk(aggregation.memberSourceChain, ".aggregation.memberSourceChain");
      if (aggregation.sort !== undefined && aggregation.sort !== "sourceId,targetId,relationId") {
        fail("chain-members-not-aggregate", ".aggregation.sort");
      }
    }
  }
  return diagnostics;
}
