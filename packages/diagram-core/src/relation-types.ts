/** Document-local relation refinements inherit the complete relation declaration. */
import type { Relation, SemanticDocument } from "./document.js";
import { relationTypeOf, type Profile, type RelationTypeDeclaration } from "./profile.js";

export function relationBaseType(document: SemanticDocument, profile: Profile, relation: Relation): string {
  if (relationTypeOf(profile, relation.type) !== undefined) return relation.type;
  const definition = document.typeDefinitions[relation.type];
  return definition?.profile === profile.id ? definition.baseType : relation.type;
}

export function relationSchema(document: SemanticDocument, profile: Profile, relation: Relation): RelationTypeDeclaration | undefined {
  const base = relationTypeOf(profile, relationBaseType(document, profile, relation));
  if (base === undefined) return undefined;
  const definition = document.typeDefinitions[relation.type];
  return relation.type === base.id || definition?.profile !== profile.id
    ? base : { ...base, attributes: [...(base.attributes ?? []), ...definition.attributes] };
}
