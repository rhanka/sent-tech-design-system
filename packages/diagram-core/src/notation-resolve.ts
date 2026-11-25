import type { AttributeValue } from "./attributes.js";
import { type Diagnostic, diagnostic } from "./diagnostics.js";
import type { Entity, Relation, SemanticDocument } from "./document.js";
import {
  DIAGRAM_NOTATION_ENCODINGS,
  DIAGRAM_NOTATION_MODES,
  DIAGRAM_NOTATION_NATURES,
  DIAGRAM_NOTATION_ROLES,
  DIAGRAM_NOTATION_RULES,
  DIAGRAM_NOTATION_VOCABULARY,
  type NotationBlock,
  type NotationEncoding,
  type NotationEnds,
  type NotationNature,
  type NotationNode,
  type NotationRelation,
  type NotationRole,
  type NotationSlot,
  type NotationVariant,
} from "./notation.js";
import { entityTypeOf, relationTypeOf, type Profile, type ProfileId } from "./profile.js";
import { PROCESS_PROFILE_ID, processNotation } from "./profiles/process.js";

export interface ResolvedNotationEntity {
  readonly role: NotationRole;
  readonly nature: NotationNature;
  readonly variant?: NotationVariant;
  readonly icon?: string;
  readonly kicker?: string;
}

export interface ResolvedNotationRelation {
  readonly encoding: NotationEncoding;
  readonly ends?: NotationEnds;
  readonly provisional: boolean;
  readonly on?: string;
  readonly label?: string;
}

export interface ResolvedNotation {
  readonly entities: Readonly<Record<string, ResolvedNotationEntity>>;
  readonly relations: Readonly<Record<string, ResolvedNotationRelation>>;
}

function slotValues(slot: NotationSlot): readonly string[] {
  return typeof slot === "string" ? [slot] : [...Object.values(slot.values), slot.default];
}

function evaluateSlot(
  slot: NotationSlot | undefined,
  attributes: Readonly<Record<string, AttributeValue>>,
): string | undefined {
  if (slot === undefined) return undefined;
  if (typeof slot === "string") return slot;
  const raw = attributes[slot.attribute];
  if (raw !== undefined && "value" in raw) {
    const key = String(raw.value);
    if (Object.prototype.hasOwnProperty.call(slot.values, key)) return slot.values[key];
  }
  return slot.default;
}

/** Validate a `diagram-notation@1` block against its profile and frozen vocabulary rules. */
export function validateNotation(block: NotationBlock, profile: Profile): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const basePath = `notation.${profile.id}`;
  const pushError = (path: string, message: string) =>
    diagnostics.push(diagnostic({ code: "type-definition-conflict", path, message }));

  if (block.vocabulary !== DIAGRAM_NOTATION_VOCABULARY) {
    pushError(`${basePath}.vocabulary`, `expected ${DIAGRAM_NOTATION_VOCABULARY}, got ${String(block.vocabulary)}`);
  }
  const mode = block.mode ?? DIAGRAM_NOTATION_RULES.defaultMode;
  if (!(DIAGRAM_NOTATION_MODES as readonly string[]).includes(mode)) {
    pushError(`${basePath}.mode`, `unknown notation mode ${String(mode)}`);
  }

  const iconRegex = new RegExp(DIAGRAM_NOTATION_RULES.iconPattern);

  for (const [typeId, node] of Object.entries(block.entityTypes)) {
    const entityPath = `${basePath}.entityTypes.${typeId}`;
    const declared = entityTypeOf(profile, typeId);
    if (declared === undefined) {
      pushError(entityPath, `entity type ${typeId} is not declared by profile ${profile.id}`);
      continue;
    }
    if (!(DIAGRAM_NOTATION_ROLES as readonly string[]).includes(node.role)) {
      pushError(`${entityPath}.role`, `unknown notation role ${String(node.role)}`);
      continue;
    }
    const roleRule = DIAGRAM_NOTATION_RULES.roles[node.role];
    if (!(roleRule.natures as readonly string[]).includes(node.nature)) {
      pushError(`${entityPath}.nature`, `role ${node.role} does not admit nature ${String(node.nature)}`);
    }
    if (roleRule.variant === "refused") {
      if (node.variant !== undefined) {
        pushError(`${entityPath}.variant`, `role ${node.role} refuses variant`);
      }
    } else if (node.variant !== undefined) {
      const allowedVariants = DIAGRAM_NOTATION_RULES.variants[node.nature] ?? [];
      for (const candidate of slotValues(node.variant)) {
        if (!(allowedVariants as readonly string[]).includes(candidate)) {
          pushError(
            `${entityPath}.variant`,
            `variant ${candidate} is not allowed for nature ${node.nature}`,
          );
        }
      }
    }

    const effectiveVariants =
      node.variant !== undefined
        ? slotValues(node.variant)
        : (DIAGRAM_NOTATION_RULES.variants[node.nature] ?? []).slice(0, 1);

    if (roleRule.icon === "refused" && node.icon !== undefined) {
      pushError(`${entityPath}.icon`, `role ${node.role} refuses icon`);
    } else if (roleRule.icon === "required" && node.icon === undefined) {
      pushError(`${entityPath}.icon`, `role ${node.role} requires icon`);
    } else if (
      roleRule.icon === "participant-only" &&
      node.icon !== undefined &&
      !effectiveVariants.every((variant) => variant === "participant")
    ) {
      pushError(`${entityPath}.icon`, `role ${node.role} admits icon only for variant participant`);
    }
    if (node.icon !== undefined) {
      for (const glyph of slotValues(node.icon)) {
        if (!iconRegex.test(glyph)) {
          pushError(`${entityPath}.icon`, `icon ${glyph} fails pattern ${DIAGRAM_NOTATION_RULES.iconPattern}`);
        }
      }
    }

    if (roleRule.kicker === "refused" && node.kicker !== undefined) {
      pushError(`${entityPath}.kicker`, `role ${node.role} refuses kicker`);
    }

    for (const held of node.holds ?? []) {
      if (!(roleRule.holds as readonly string[]).includes(held)) {
        pushError(`${entityPath}.holds`, `role ${node.role} cannot hold ${held}`);
      }
    }
  }

  if (mode === "strict") {
    for (const declared of profile.entityTypes) {
      if (declared.abstract === true) continue;
      if (!Object.prototype.hasOwnProperty.call(block.entityTypes, declared.id)) {
        pushError(`${basePath}.entityTypes.${declared.id}`, `strict notation requires entity type ${declared.id}`);
      }
    }
  }

  for (const [relId, relNode] of Object.entries(block.relationTypes)) {
    const relPath = `${basePath}.relationTypes.${relId}`;
    const declared = relationTypeOf(profile, relId);
    if (declared === undefined) {
      pushError(relPath, `relation type ${relId} is not declared by profile ${profile.id}`);
      continue;
    }
    if (!(DIAGRAM_NOTATION_ENCODINGS as readonly string[]).includes(relNode.encoding)) {
      pushError(`${relPath}.encoding`, `unknown encoding ${String(relNode.encoding)}`);
      continue;
    }
    const encodingRule = DIAGRAM_NOTATION_RULES.encodings[relNode.encoding];
    for (const key of Object.keys(relNode)) {
      if ((relNode as unknown as Record<string, unknown>)[key] !== undefined && !(encodingRule.properties as readonly string[]).includes(key)) {
        pushError(`${relPath}.${key}`, `encoding ${relNode.encoding} refuses property ${key}`);
      }
    }
    for (const req of encodingRule.required) {
      if ((relNode as unknown as Record<string, unknown>)[req] === undefined) {
        pushError(`${relPath}.${req}`, `encoding ${relNode.encoding} requires property ${req}`);
      }
    }
    if (relNode.encoding === "containment") {
      if (declared.hierarchy?.shape !== DIAGRAM_NOTATION_RULES.containmentHierarchyShape) {
        pushError(
          relPath,
          `containment encoding requires relation type ${relId} to declare a ${DIAGRAM_NOTATION_RULES.containmentHierarchyShape} hierarchy`,
        );
      }
    }
    if (relNode.encoding === "detail" || relNode.encoding === "footer") {
      const targetRole = declared.roles.find((role) => role.role === relNode.on);
      if (targetRole === undefined) {
        pushError(`${relPath}.on`, `relation type ${relId} has no role ${String(relNode.on)}`);
      } else {
        const owners = DIAGRAM_NOTATION_RULES.slotOwners[relNode.encoding];
        const allowedTypes = targetRole.entityTypes ?? profile.entityTypes.map((t) => t.id);
        for (const entityType of allowedTypes) {
          const mapped = block.entityTypes[entityType];
          if (mapped !== undefined && !(owners as readonly string[]).includes(mapped.role)) {
            pushError(`${relPath}.on`, `encoding ${relNode.encoding} cannot attach to role ${mapped.role}`);
          }
        }
      }
    }
  }

  if (mode === "strict") {
    for (const declared of profile.relationTypes) {
      if (!Object.prototype.hasOwnProperty.call(block.relationTypes, declared.id)) {
        pushError(`${basePath}.relationTypes.${declared.id}`, `strict notation requires relation type ${declared.id}`);
      }
    }
  }

  return diagnostics;
}

/** Resolve one semantic entity against a notation block. */
export function resolveNotationEntity(
  block: NotationBlock,
  entity: Entity,
): ResolvedNotationEntity | undefined {
  const node: NotationNode | undefined = block.entityTypes[entity.type];
  if (node === undefined) return undefined;
  const variant = evaluateSlot(node.variant, entity.attributes) as NotationVariant | undefined;
  const defaultVariant =
    variant ?? (DIAGRAM_NOTATION_RULES.variants[node.nature] as readonly NotationVariant[])[0];
  const icon = evaluateSlot(node.icon, entity.attributes);
  const kicker = evaluateSlot(node.kicker, entity.attributes);
  return {
    role: node.role,
    nature: node.nature,
    ...(defaultVariant === undefined ? {} : { variant: defaultVariant }),
    ...(icon === undefined ? {} : { icon }),
    ...(kicker === undefined ? {} : { kicker }),
  };
}

/** Resolve one semantic relation against a notation block and its profile. */
export function resolveNotationRelation(
  block: NotationBlock,
  profile: Profile,
  relation: Relation,
): ResolvedNotationRelation | undefined {
  const relNode: NotationRelation | undefined = block.relationTypes[relation.type];
  if (relNode === undefined) return undefined;
  const declared = relationTypeOf(profile, relation.type);
  const ends: NotationEnds | undefined =
    relNode.encoding === "arrow"
      ? relNode.ends ?? DIAGRAM_NOTATION_RULES.endsDefault[declared?.direction ?? "directed"]
      : relNode.ends;
  let provisional = false;
  if (relNode.provisional !== undefined) {
    const attr = relation.attributes[relNode.provisional.attribute];
    if (attr !== undefined && "value" in attr && String(attr.value) === relNode.provisional.equals) {
      provisional = true;
    }
  }
  return {
    encoding: relNode.encoding,
    ...(ends === undefined ? {} : { ends }),
    provisional,
    ...(relNode.on === undefined ? {} : { on: relNode.on }),
    ...(relNode.label === undefined ? {} : { label: relNode.label }),
  };
}

/** Resolve all entities and relations in a document for the given profile & notation block. */
export function resolveNotation(
  block: NotationBlock,
  profile: Profile,
  document: SemanticDocument,
): ResolvedNotation {
  const entities: Record<string, ResolvedNotationEntity> = {};
  for (const [id, entity] of Object.entries(document.entities)) {
    if (entity.profile !== profile.id) continue;
    const resolved = resolveNotationEntity(block, entity);
    if (resolved !== undefined) entities[id] = resolved;
  }
  const relations: Record<string, ResolvedNotationRelation> = {};
  for (const [id, relation] of Object.entries(document.relations)) {
    if (relation.profile !== profile.id) continue;
    const resolved = resolveNotationRelation(block, profile, relation);
    if (resolved !== undefined) relations[id] = resolved;
  }
  return { entities, relations };
}

/** Return the embedded `diagram-notation@1` block for a shipped profile, if any. */
export function notationForProfile(profileId: ProfileId): NotationBlock | undefined {
  return profileId === PROCESS_PROFILE_ID ? processNotation : undefined;
}
