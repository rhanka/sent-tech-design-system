/**
 * The shared type resolver (M3 §5.1).
 *
 * One resolver accepts (document, owning profile context, type id). It
 * resolves profile types or additive document refinements, follows the full
 * base chain with a visited set, and returns the effective schema, the nearest
 * declared family type, the inherited container capability and the ordered
 * ancestry — or a structured refusal (unknown base, cross-owner base without
 * an admitted join, cycle, inherited attribute redeclaration) that the caller
 * reports with the pinned literal for its stage.
 *
 * A concrete document refinement of an abstract profile base remains
 * instantiable; the abstract flag prohibits instantiating the base itself and
 * is not inherited as a blanket prohibition.
 *
 * Cached results are scoped to the document revision and the exact profile
 * context; a cache never crosses pins.
 */

import type { AttributeSchema } from "./attributes.js";
import { digestProfile } from "./bindings.js";
import type { SemanticDocument, TypeDefinition } from "./document.js";
import { type Diagnostic, diagnostic } from "./diagnostics.js";
import { entityTypeOf, type Profile, type ProfileId } from "./profile.js";

export interface ResolvedType {
  readonly profileId: ProfileId;
  readonly typeId: string;
  /** Self-first chain: the queried id, then each base up to the root. */
  readonly ancestry: readonly string[];
  /** Nearest chain member declared by the profile (the family root for roles). */
  readonly familyType: string;
  readonly schemas: readonly AttributeSchema[];
  /** Inherited container capability; never acquired by geometry. */
  readonly container: boolean;
  /** Whether the queried id itself is an abstract profile type. */
  readonly abstract: boolean;
}

export type TypeResolution =
  | { readonly ok: true; readonly resolved: ResolvedType }
  | { readonly ok: false; readonly diagnostic: Diagnostic; readonly failedType: string };

export interface TypeResolver {
  resolve(profile: Profile, typeId: string): TypeResolution;
  /** The document revision the cache is currently scoped to. */
  readonly revision: number;
}

type ChainNode =
  | { readonly kind: "profile"; readonly id: string }
  | { readonly kind: "definition"; readonly definition: TypeDefinition };

class CycleThrown {
  constructor(readonly cycle: readonly string[]) {}
}

class UnknownBaseThrown {
  constructor(
    readonly fromId: string,
    readonly baseId: string,
  ) {}
}

class RedeclarationThrown {
  constructor(
    readonly definitionId: string,
    readonly attribute: string,
    readonly baseType: string,
  ) {}
}

export function createTypeResolver(document: SemanticDocument): TypeResolver {
  let revision = document.revision;
  let cache = new Map<string, TypeResolution>();

  const nodeOf = (profile: Profile, id: string): ChainNode | undefined => {
    if (entityTypeOf(profile, id) !== undefined) return { kind: "profile", id };
    const definition = document.typeDefinitions[id];
    // A refinement belongs to exactly one owning context: a definition filed
    // under another profile is not resolvable here. There is no admitted join
    // in this lot, so a cross-owner base refuses at the use site.
    if (definition !== undefined && definition.profile === profile.id) return { kind: "definition", definition };
    return undefined;
  };

  const resolveInto = (profile: Profile, typeId: string): TypeResolution => {
    if (nodeOf(profile, typeId) === undefined) {
      return {
        ok: false,
        diagnostic: diagnostic({
          code: "unknown-entity-type",
          path: `profiles.${profile.id}.entityTypes.${typeId}`,
          message: `neither profile ${profile.id} nor the document declares entity type ${typeId}`,
          details: { type: typeId, profile: profile.id },
        }),
        failedType: typeId,
      };
    }

    // Depth-first walk, base-first: every base resolves before the node that
    // refines it, so a redeclaration sees the full inherited schema set.
    const ancestryBaseFirst: string[] = [];
    const merged: AttributeSchema[] = [];
    const seen = new Set<string>();
    const stack: string[] = [];
    let container = false;

    const visit = (id: string): void => {
      if (seen.has(id)) return;
      if (stack.includes(id)) {
        throw new CycleThrown([...stack.slice(stack.indexOf(id)), id]);
      }
      const node = nodeOf(profile, id);
      if (node === undefined) {
        throw new UnknownBaseThrown(stack[stack.length - 1] as string, id);
      }
      stack.push(id);
      try {
        const bases: readonly string[] =
          node.kind === "definition"
            ? [node.definition.baseType]
            : ((entityTypeOf(profile, node.id)?.supertypes ?? []) as readonly string[]);
        for (const base of bases) visit(base);
        const inheritedNames = new Set(merged.map((schema) => schema.name));
        const ownAttributes = node.kind === "definition" ? node.definition.attributes : [];
        for (const schema of ownAttributes) {
          if (inheritedNames.has(schema.name)) {
            const immediate = node.kind === "definition" ? node.definition.baseType : id;
            throw new RedeclarationThrown(
              node.kind === "definition" ? node.definition.id : id,
              schema.name,
              immediate,
            );
          }
        }
        if (node.kind === "profile" && entityTypeOf(profile, node.id)?.container === true) {
          container = true;
        }
        const declaredAttributes =
          node.kind === "profile" ? (entityTypeOf(profile, node.id)?.attributes ?? []) : ownAttributes;
        for (const schema of declaredAttributes) {
          if (!inheritedNames.has(schema.name)) {
            merged.push(schema);
            inheritedNames.add(schema.name);
          }
        }
        seen.add(id);
        ancestryBaseFirst.push(id);
      } finally {
        stack.pop();
      }
    };

    try {
      visit(typeId);
    } catch (thrown) {
      if (thrown instanceof CycleThrown) {
        const cycle = thrown.cycle.join(">");
        return {
          ok: false,
          diagnostic: diagnostic({
            code: "type-definition-conflict",
            path: `typeDefinitions.${typeId}.baseType`,
            message: `type definition ${typeId} closes base cycle ${cycle}`,
            refs: [],
            details: { check: "resolution-cycle", cycle },
          }),
          failedType: typeId,
        };
      }
      if (thrown instanceof UnknownBaseThrown) {
        return {
          ok: false,
          diagnostic: diagnostic({
            code: "unknown-entity-type",
            path: `typeDefinitions.${thrown.fromId}.baseType`,
            message: `profile ${profile.id} does not declare base type ${thrown.baseId}`,
          }),
          failedType: typeId,
        };
      }
      if (thrown instanceof RedeclarationThrown) {
        return {
          ok: false,
          diagnostic: diagnostic({
            code: "type-definition-conflict",
            path: `typeDefinitions.${thrown.definitionId}.attributes.${thrown.attribute}`,
            message:
              `type definition ${thrown.definitionId} redeclares ${thrown.attribute}, ` +
              `which base type ${thrown.baseType} already declares; refinements are additive only`,
            details: { attribute: thrown.attribute, baseType: thrown.baseType },
          }),
          failedType: typeId,
        };
      }
      throw thrown;
    }

    const ancestry = [...ancestryBaseFirst].reverse();
    const familyType = ancestry.find((id) => entityTypeOf(profile, id) !== undefined) ?? typeId;
    const startDeclared = entityTypeOf(profile, typeId);
    return {
      ok: true,
      resolved: {
        profileId: profile.id,
        typeId,
        ancestry,
        familyType,
        schemas: merged,
        container,
        abstract: startDeclared?.abstract === true,
      },
    };
  };

  return {
    get revision() {
      return revision;
    },
    resolve: (profile: Profile, typeId: string): TypeResolution => {
      if (document.revision !== revision) {
        revision = document.revision;
        cache = new Map<string, TypeResolution>();
      }
      // The entry is keyed by the immutable profile identity (id, version and
      // declaration bytes), never by the id alone: two same-id profiles with
      // different contents resolve from their own entries. Revision scoping
      // below is retained unchanged.
      const key = `${profile.id}::${digestProfile(profile)}::${typeId}`;
      const cached = cache.get(key);
      if (cached !== undefined) return cached;
      const resolution = resolveInto(profile, typeId);
      cache.set(key, resolution);
      return resolution;
    },
  };
}
