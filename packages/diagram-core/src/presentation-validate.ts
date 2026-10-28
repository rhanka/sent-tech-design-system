/**
 * Presentation view validation (M3 §3.2–§3.6, C.3/C.6).
 *
 * Views without `presentation.diagram` validate exactly as on main; views
 * carrying it execute the closed presentation checks. No folds, no
 * measurement, no archimate@2/uml@2, no migrations.
 */

import { diagnostic, type Diagnostic } from "./diagnostics.js";
import type { SemanticDocument } from "./document.js";
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  type DiagramPresentation,
} from "./presentation.js";
import { createTypeResolver } from "./resolver.js";
import { refKindOf } from "./refs.js";
import type { ProfileRegistry } from "./profile.js";
import type { ValidationOptions } from "./validate.js";
import type { ViewDocument } from "./view.js";

const KEY_PATTERN = /^[a-z][a-z0-9-]*$/;
const TOKEN_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

function shapeMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check presentation-shape-invalid",
    refs: [],
    details: { check: "presentation-shape-invalid" },
  });
}

function pinMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check presentation-pin-mismatch",
    refs: [],
    details: { check: "presentation-pin-mismatch" },
  });
}

function formMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check form-selector-mismatch",
    refs: [],
    details: { check: "form-selector-mismatch" },
  });
}

function orderMismatch(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check legend-order-invalid",
    refs: [],
    details: { check: "legend-order-invalid" },
  });
}

function tokenConflict(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check token-binding-conflict",
    refs: [],
    details: { check: "token-binding-conflict" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textTooLong(path: string, length: number, maxLength: number): Diagnostic {
  return diagnostic({
    code: "text-too-long",
    severity: "error",
    path,
    message: `text is ${length} characters, the schema allows ${maxLength}`,
    details: { length, maxLength },
  });
}

function patternMismatch(
  path: string,
  patternName: string,
  length: number,
  maxLength?: number,
): Diagnostic {
  return diagnostic({
    code: "text-pattern-mismatch",
    severity: "error",
    path,
    message: `value does not match the ${patternName} grammar`,
    refs: [],
    details:
      maxLength === undefined
        ? { pattern: patternName, length }
        : { pattern: patternName, length, maxLength },
  });
}

function minLengthMismatch(path: string, attribute: string, length: number, minLength: number): Diagnostic {
  return diagnostic({
    code: "text-pattern-mismatch",
    severity: "error",
    path,
    message: `value is shorter than the minimum length for ${attribute}`,
    refs: [],
    details: { pattern: "min-length", length, minLength },
  });
}

function danglingPresentation(path: string, targetId: string): Diagnostic {
  return diagnostic({
    code: "dangling-reference",
    severity: "error",
    path,
    message: `presentation reference ${targetId} does not resolve`,
    refs: [targetId],
    details: {},
  });
}

function wrongNamespacePresentation(path: string, targetId: string, expectedKind: string): Diagnostic {
  return diagnostic({
    code: "reference-type-mismatch",
    severity: "error",
    path,
    message: `presentation reference ${targetId} must be a ${expectedKind}`,
    refs: [targetId],
    details: { expectedKind },
  });
}

const GENERIC2_PROFILE_ID = "generic@2" as const;

interface FamilySets {
  readonly legendHierarchyIds: ReadonlySet<string>;
}

function collectFamilySets(registry: ProfileRegistry, profileIds: readonly string[]): FamilySets {
  const legendHierarchyIds = new Set<string>();
  for (const id of profileIds) {
    if (id !== GENERIC2_PROFILE_ID) continue;
    const profile = registry.get(id as never);
    if (profile === undefined) continue;
    for (const constraint of profile.constraints) {
      if (constraint.kind === "children-restricted" || constraint.kind === "required-parent") {
        const typed = constraint as {
          readonly hierarchyId: string;
        };
        legendHierarchyIds.add(typed.hierarchyId);
      }
    }
  }
  return { legendHierarchyIds };
}

function isGeneric2Legend(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: ReturnType<typeof createTypeResolver>,
  entityId: string,
): boolean {
  const entity = document.entities[entityId];
  if (entity === undefined) return false;
  if (entity.profile !== GENERIC2_PROFILE_ID) return false;
  const owner = registry.get(entity.profile as never);
  if (owner === undefined) return false;
  const resolution = resolver.resolve(owner, entity.type);
  if (!resolution.ok) return false;
  return resolution.resolved.ancestry.includes("legend");
}

function isGeneric2Key(
  document: SemanticDocument,
  registry: ProfileRegistry,
  resolver: ReturnType<typeof createTypeResolver>,
  entityId: string,
): boolean {
  const entity = document.entities[entityId];
  if (entity === undefined) return false;
  if (entity.profile !== GENERIC2_PROFILE_ID) return false;
  const owner = registry.get(entity.profile as never);
  if (owner === undefined) return false;
  const resolution = resolver.resolve(owner, entity.type);
  if (!resolution.ok) return false;
  return resolution.resolved.ancestry.includes("legend-key");
}

function satisfiesExplicitForm(
  form: string,
  ownerId: string,
  ancestry: readonly string[],
  container: boolean,
): boolean {
  if (form === "card") return container === false;
  if (form === "container") return container === true;
  if (form === "legend") return ownerId === GENERIC2_PROFILE_ID && ancestry.includes("legend");
  if (form === "legend-key") return ownerId === GENERIC2_PROFILE_ID && ancestry.includes("legend-key");
  return false;
}

function hierarchyChildren(
  document: SemanticDocument,
  registry: ProfileRegistry,
  hierarchyIds: ReadonlySet<string>,
): Map<string, string[]> {
  const childToParents = new Map<string, string[]>();
  void registry;
  void hierarchyIds;
  void childToParents;
  return new Map();
}

export function validateDiagramPresentation(
  document: SemanticDocument,
  view: ViewDocument,
  options: ValidationOptions,
): readonly Diagnostic[] {
  const diagram = view.presentation.diagram as DiagramPresentation | undefined;
  if (diagram === undefined) return [];
  const diagnostics: Diagnostic[] = [];
  const registry = options.registry;
  const resolver = createTypeResolver(document);
  const familySets = collectFamilySets(
    registry,
    document.profileRefs as readonly string[],
  );
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as unknown as Record<string, unknown>;
    const style = occurrence["strokeStyle"];
    if (style !== undefined && style !== "solid" && style !== "dashed") {
      diagnostics.push(shapeMismatch(`relationOccurrences.${key}.strokeStyle`));
    }
  }

  const shapeFailed = new Set<string>();

  if (!isRecord(diagram)) {
    diagnostics.push(shapeMismatch("presentation.diagram"));
    return diagnostics;
  }
  const allowedDiagramKeys = new Set(["contractPin", "entities", "legends", "categoryTokens"]);
  for (const key of Object.keys(diagram as unknown as Record<string, unknown>)) {
    if (!allowedDiagramKeys.has(key)) {
      diagnostics.push(shapeMismatch(`presentation.diagram.${key}`));
      shapeFailed.add(`presentation.diagram.${key}`);
    }
  }
  for (const required of ["contractPin", "entities", "legends", "categoryTokens"]) {
    if ((diagram as unknown as Record<string, unknown>)[required] === undefined) {
      diagnostics.push(shapeMismatch(`presentation.diagram.${required}`));
      shapeFailed.add(`presentation.diagram.${required}`);
    }
  }
  if (shapeFailed.size > 0) {
    return diagnostics;
  }

  const contractPin = diagram.contractPin as unknown;
  if (!isRecord(contractPin)) {
    diagnostics.push(shapeMismatch("presentation.diagram.contractPin"));
    return diagnostics;
  }
  const allowedPinKeys = new Set(["id", "version", "contentDigest"]);
  for (const key of Object.keys(contractPin)) {
    if (!allowedPinKeys.has(key)) {
      diagnostics.push(shapeMismatch(`presentation.diagram.contractPin.${key}`));
    }
  }
  for (const required of ["id", "version", "contentDigest"]) {
    if (contractPin[required] === undefined) {
      diagnostics.push(shapeMismatch(`presentation.diagram.contractPin.${required}`));
    }
  }
  if (
    typeof contractPin["id"] !== "string" ||
    typeof contractPin["version"] !== "string" ||
    typeof contractPin["contentDigest"] !== "string"
  ) {
    diagnostics.push(shapeMismatch("presentation.diagram.contractPin"));
    return diagnostics;
  }
  if (
    contractPin["id"] !== DIAGRAM_PRESENTATION_CONTRACT_PIN.id ||
    contractPin["version"] !== DIAGRAM_PRESENTATION_CONTRACT_PIN.version ||
    contractPin["contentDigest"] !== DIAGRAM_PRESENTATION_CONTRACT_PIN.contentDigest ||
    !DIGEST_PATTERN.test(contractPin["contentDigest"] as string)
  ) {
    diagnostics.push(pinMismatch("presentation.diagram.contractPin"));
    return diagnostics;
  }

  if (!isRecord(diagram.entities as unknown)) {
    diagnostics.push(shapeMismatch("presentation.diagram.entities"));
    return diagnostics;
  }
  if (!isRecord(diagram.legends as unknown)) {
    diagnostics.push(shapeMismatch("presentation.diagram.legends"));
    return diagnostics;
  }
  if (!Array.isArray(diagram.categoryTokens as unknown)) {
    diagnostics.push(shapeMismatch("presentation.diagram.categoryTokens"));
    return diagnostics;
  }

  const entities = diagram.entities as unknown as Record<string, unknown>;
  const legends = diagram.legends as unknown as Record<string, unknown>;
  const categoryTokens = diagram.categoryTokens as unknown as readonly unknown[];

  const validEntityOccurrences = new Set<string>();
  for (const key of Object.keys(entities).sort()) {
    const entryPath = `presentation.diagram.entities.${key}`;
    if (refKindOf(key) !== "occurrence") {
      diagnostics.push(wrongNamespacePresentation(entryPath, key, "occurrence"));
      shapeFailed.add(entryPath);
      continue;
    }
    if (view.entityOccurrences[key] === undefined) {
      diagnostics.push(danglingPresentation(entryPath, key));
      shapeFailed.add(entryPath);
      continue;
    }
    validEntityOccurrences.add(key);
    const entry = entities[key] as unknown;
    if (!isRecord(entry)) {
      diagnostics.push(shapeMismatch(entryPath));
      shapeFailed.add(entryPath);
      continue;
    }
    const allowed = new Set(["form", "text", "icon", "categoryRef"]);
    for (const field of Object.keys(entry)) {
      if (!allowed.has(field)) {
        diagnostics.push(shapeMismatch(`${entryPath}.${field}`));
        shapeFailed.add(`${entryPath}.${field}`);
      }
    }
    if (entry["form"] === undefined || entry["text"] === undefined) {
      if (entry["form"] === undefined) {
        diagnostics.push(shapeMismatch(`${entryPath}.form`));
        shapeFailed.add(`${entryPath}.form`);
      }
      if (entry["text"] === undefined) {
        diagnostics.push(shapeMismatch(`${entryPath}.text`));
        shapeFailed.add(`${entryPath}.text`);
      }
      continue;
    }
    if (
      entry["form"] !== "card" &&
      entry["form"] !== "container" &&
      entry["form"] !== "legend" &&
      entry["form"] !== "legend-key"
    ) {
      diagnostics.push(shapeMismatch(`${entryPath}.form`));
      shapeFailed.add(`${entryPath}.form`);
      continue;
    }
    const textValue = entry["text"] as unknown;
    if (!isRecord(textValue)) {
      diagnostics.push(shapeMismatch(`${entryPath}.text`));
      shapeFailed.add(`${entryPath}.text`);
      continue;
    }
    const allowedText = new Set(["title", "kicker", "body", "detail", "subtitle", "footer"]);
    for (const slot of Object.keys(textValue)) {
      if (!allowedText.has(slot)) {
        diagnostics.push(shapeMismatch(`${entryPath}.text.${slot}`));
        shapeFailed.add(`${entryPath}.text.${slot}`);
      } else if (typeof textValue[slot] !== "string") {
        diagnostics.push(shapeMismatch(`${entryPath}.text.${slot}`));
        shapeFailed.add(`${entryPath}.text.${slot}`);
      }
    }
    if (entry["icon"] !== undefined && typeof entry["icon"] !== "string") {
      diagnostics.push(shapeMismatch(`${entryPath}.icon`));
      shapeFailed.add(`${entryPath}.icon`);
    }
    if (entry["categoryRef"] !== undefined && typeof entry["categoryRef"] !== "string") {
      diagnostics.push(shapeMismatch(`${entryPath}.categoryRef`));
      shapeFailed.add(`${entryPath}.categoryRef`);
    }
  }

  for (const key of Object.keys(legends).sort()) {
    const entryPath = `presentation.diagram.legends.${key}`;
    if (refKindOf(key) !== "occurrence") {
      diagnostics.push(wrongNamespacePresentation(entryPath, key, "occurrence"));
      shapeFailed.add(entryPath);
      continue;
    }
    if (view.entityOccurrences[key] === undefined) {
      diagnostics.push(danglingPresentation(entryPath, key));
      shapeFailed.add(entryPath);
      continue;
    }
    const entry = legends[key] as unknown;
    if (!isRecord(entry)) {
      diagnostics.push(shapeMismatch(entryPath));
      shapeFailed.add(entryPath);
      continue;
    }
    for (const field of Object.keys(entry)) {
      if (field !== "order") {
        diagnostics.push(shapeMismatch(`${entryPath}.${field}`));
        shapeFailed.add(`${entryPath}.${field}`);
      }
    }
    if (entry["order"] === undefined) {
      diagnostics.push(shapeMismatch(`${entryPath}.order`));
      shapeFailed.add(`${entryPath}.order`);
      continue;
    }
    if (!Array.isArray(entry["order"])) {
      diagnostics.push(shapeMismatch(`${entryPath}.order`));
      shapeFailed.add(`${entryPath}.order`);
      continue;
    }
    const order = entry["order"] as readonly unknown[];
    let orderShapeBad = false;
    order.forEach((item, index) => {
      if (typeof item !== "string") {
        diagnostics.push(shapeMismatch(`${entryPath}.order[${index}]`));
        shapeFailed.add(`${entryPath}.order`);
        orderShapeBad = true;
      }
    });
    if (orderShapeBad) continue;
  }

  categoryTokens.forEach((item, index) => {
    const itemPath = `presentation.diagram.categoryTokens[${index}]`;
    if (!isRecord(item)) {
      diagnostics.push(shapeMismatch(itemPath));
      shapeFailed.add(itemPath);
      return;
    }
    const allowed = new Set(["legendRef", "category", "token"]);
    for (const field of Object.keys(item)) {
      if (!allowed.has(field)) {
        diagnostics.push(shapeMismatch(`${itemPath}.${field}`));
        shapeFailed.add(`${itemPath}.${field}`);
      }
    }
    for (const required of ["legendRef", "category", "token"]) {
      if (item[required] === undefined) {
        diagnostics.push(shapeMismatch(`${itemPath}.${required}`));
        shapeFailed.add(`${itemPath}.${required}`);
      } else if (typeof item[required] !== "string") {
        diagnostics.push(shapeMismatch(`${itemPath}.${required}`));
        shapeFailed.add(`${itemPath}.${required}`);
      }
    }
  });

  if (diagnostics.some((entry) => entry.details !== undefined && (entry.details as Record<string, unknown>)["check"] === "presentation-shape-invalid")) {
    const onlyShape = diagnostics.filter(
      (entry) => (entry.details as Record<string, unknown> | undefined)?.["check"] === "presentation-shape-invalid",
    );
    if (diagnostics.length > 0 && onlyShape.length > 0 && shapeFailed.size > 0) {
      return onlyShape;
    }
  }

  for (const key of Object.keys(entities).sort()) {
    if (shapeFailed.has(`presentation.diagram.entities.${key}`)) continue;
    if (!validEntityOccurrences.has(key)) continue;
    const entry = entities[key] as { form: string; text: Record<string, string>; icon?: string };
    const entryPath = `presentation.diagram.entities.${key}`;
    const occurrence = view.entityOccurrences[key];
    if (occurrence === undefined) continue;
    const semantic = document.entities[occurrence.entity];
    if (semantic === undefined) continue;
    const owner = registry.get(semantic.profile as never);
    if (owner === undefined) continue;
    const resolution = resolver.resolve(owner, semantic.type);
    if (!resolution.ok) continue;
    const ancestry = resolution.resolved.ancestry;
    const container = resolution.resolved.container;
    if (!satisfiesExplicitForm(entry.form, owner.id, ancestry, container)) {
      diagnostics.push(formMismatch(`${entryPath}.form`));
      continue;
    }
    const textValue = entry.text as Record<string, string>;
    const maxFor = (slot: string): number => {
      if (slot === "title") return entry.form === "legend-key" ? 120 : 200;
      if (slot === "kicker") return 80;
      if (slot === "body" || slot === "detail") return 400;
      if (slot === "subtitle") return 600;
      return 120;
    };
    for (const slot of Object.keys(textValue).sort()) {
      const value = textValue[slot] as string;
      if (typeof value !== "string") continue;
      if ((entry.form === "card" || entry.form === "legend-key") && slot === "subtitle") {
        diagnostics.push(shapeMismatch(`${entryPath}.text.${slot}`));
        continue;
      }
      const max = maxFor(slot);
      if ([...value].length > max) {
        diagnostics.push(textTooLong(`${entryPath}.text.${slot}`, [...value].length, max));
      }
    }
    if (typeof entry.icon === "string") {
      const length = [...entry.icon].length;
      if (length > 40) {
        diagnostics.push(textTooLong(`${entryPath}.icon`, length, 40));
      } else if (length < 1) {
        diagnostics.push(minLengthMismatch(`${entryPath}.icon`, "icon", length, 1));
      } else if (!KEY_PATTERN.test(entry.icon)) {
        diagnostics.push(patternMismatch(`${entryPath}.icon`, "key", length, 40));
      }
    }
  }

  categoryTokens.forEach((item, index) => {
    const itemPath = `presentation.diagram.categoryTokens[${index}]`;
    if (shapeFailed.has(itemPath)) return;
    const typed = item as { legendRef: string; category: string; token: string };
    if (typeof typed.legendRef !== "string" || typeof typed.category !== "string" || typeof typed.token !== "string") {
      return;
    }
    if (refKindOf(typed.legendRef) !== "entity") {
      diagnostics.push(wrongNamespacePresentation(`${itemPath}.legendRef`, typed.legendRef, "entity"));
      return;
    }
    const target = document.entities[typed.legendRef];
    if (target === undefined) {
      diagnostics.push(danglingPresentation(`${itemPath}.legendRef`, typed.legendRef));
      return;
    }
    if (!isGeneric2Legend(document, registry, resolver, typed.legendRef)) {
      diagnostics.push({
        code: "tone-category-unknown",
        severity: "error",
        path: `${itemPath}.legendRef`,
        message: `legendRef names ${typed.legendRef}, which is not a legend`,
        refs: [typed.legendRef],
        details: {
          value: typed.category,
          legendBinding: "bound-target-not-legend",
          categoryType: "legend-key",
        },
      });
      return;
    }
    const categoryLength = [...typed.category].length;
    if (typed.category.length === 0 || categoryLength > 40 || !KEY_PATTERN.test(typed.category)) {
      if (categoryLength > 40) {
        diagnostics.push(textTooLong(`${itemPath}.category`, categoryLength, 40));
      } else if (categoryLength < 1) {
        diagnostics.push(minLengthMismatch(`${itemPath}.category`, "category", categoryLength, 1));
      } else {
        diagnostics.push(patternMismatch(`${itemPath}.category`, "key", categoryLength, 40));
      }
      return;
    }
    const tokenLength = [...typed.token].length;
    if (tokenLength > 80) {
      diagnostics.push(textTooLong(`${itemPath}.token`, tokenLength, 80));
    } else if (tokenLength < 1) {
      diagnostics.push(minLengthMismatch(`${itemPath}.token`, "token", tokenLength, 1));
    } else if (!TOKEN_PATTERN.test(typed.token)) {
      diagnostics.push(patternMismatch(`${itemPath}.token`, "token-name", tokenLength, 80));
    }
  });

  const seenBindings = new Map<string, number>();
  categoryTokens.forEach((item, index) => {
    const typed = item as { legendRef?: unknown; category?: unknown };
    if (typeof typed.legendRef !== "string" || typeof typed.category !== "string") return;
    const key = `${typed.legendRef}\n${typed.category}`;
    if (seenBindings.has(key)) {
      diagnostics.push(tokenConflict(`presentation.diagram.categoryTokens[${index}]`));
    } else {
      seenBindings.set(key, index);
    }
  });

  for (const key of Object.keys(entities).sort()) {
    if (shapeFailed.has(`presentation.diagram.entities.${key}`)) continue;
    if (!validEntityOccurrences.has(key)) continue;
    const entry = entities[key] as { categoryRef?: unknown };
    const entryPath = `presentation.diagram.entities.${key}.categoryRef`;
    if (entry.categoryRef === undefined) continue;
    if (typeof entry.categoryRef !== "string") continue;
    const targetId = entry.categoryRef as string;
    if (refKindOf(targetId) !== "entity") {
      diagnostics.push(wrongNamespacePresentation(entryPath, targetId, "entity"));
      continue;
    }
    if (document.entities[targetId] === undefined) {
      diagnostics.push(danglingPresentation(entryPath, targetId));
      continue;
    }
    if (!isGeneric2Key(document, registry, resolver, targetId)) {
      diagnostics.push(wrongNamespacePresentation(entryPath, targetId, "legend-key"));
    }
  }

  void hierarchyChildren;

  const legendChildren = new Map<string, string[]>();
  const buildLegendChildren = (): void => {
    if (legendChildren.size > 0) return;
    const hierarchyIds = familySets.legendHierarchyIds;
    if (hierarchyIds.size === 0) return;
    for (const profileId of document.profileRefs) {
      if (profileId !== GENERIC2_PROFILE_ID) continue;
      const profile = registry.get(profileId as never);
      if (profile === undefined) continue;
      const declarations = profile.relationTypes.filter((declaration) =>
        declaration.hierarchy !== undefined && hierarchyIds.has(declaration.hierarchy.id),
      );
      for (const declaration of declarations) {
        const hierarchy = declaration.hierarchy as { parentRole: string; childRole: string };
        for (const relation of Object.values(document.relations)) {
          if (relation.profile !== profile.id || relation.type !== declaration.id) continue;
          const parents = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.parentRole);
          const kids = relation.endpoints.filter((endpoint) => endpoint.role === hierarchy.childRole);
          for (const parent of parents) {
            if (refKindOf(parent.target) !== "entity") continue;
            for (const kid of kids) {
              if (refKindOf(kid.target) !== "entity") continue;
              legendChildren.set(parent.target, [...(legendChildren.get(parent.target) ?? []), kid.target]);
            }
          }
        }
      }
    }
    for (const kids of legendChildren.values()) kids.sort();
  };
  buildLegendChildren();

  const directKeysOf = (legendEntityId: string): string[] => {
    if (!isGeneric2Legend(document, registry, resolver, legendEntityId)) return [];
    const kids = legendChildren.get(legendEntityId) ?? [];
    return kids.filter((kid) => isGeneric2Key(document, registry, resolver, kid));
  };

  const isLegendEntity = (entityId: string): boolean =>
    isGeneric2Legend(document, registry, resolver, entityId);

  categoryTokens.forEach((item, index) => {
    const itemPath = `presentation.diagram.categoryTokens[${index}]`;
    if (shapeFailed.has(itemPath)) return;
    const typed = item as { legendRef?: unknown; category?: unknown; token?: unknown };
    if (typeof typed.legendRef !== "string" || typeof typed.category !== "string" || typeof typed.token !== "string") {
      return;
    }
    if (refKindOf(typed.legendRef) !== "entity") return;
    if (document.entities[typed.legendRef] === undefined) return;
    if (!isGeneric2Legend(document, registry, resolver, typed.legendRef)) return;
    const categoryLength = [...typed.category].length;
    if (typed.category.length === 0 || categoryLength > 40 || !KEY_PATTERN.test(typed.category)) return;
    const tokenValue = typed.token;
    if (typeof tokenValue !== "string") return;
    const tokenLength = [...tokenValue].length;
    if (tokenLength < 1 || tokenLength > 80 || !TOKEN_PATTERN.test(tokenValue)) return;
    const direct = directKeysOf(typed.legendRef);
    const categories = new Set<string>();
    for (const kid of direct) {
      const keyEntity = document.entities[kid];
      if (keyEntity === undefined) continue;
      const keyValue = keyEntity.attributes["category"];
      if (keyValue !== undefined && keyValue.kind === "text") {
        const value = (keyValue as { value: string }).value;
        if (typeof value === "string") categories.add(value);
      }
    }
    if (!categories.has(typed.category)) {
      diagnostics.push({
        code: "tone-category-unknown",
        severity: "error",
        path: `${itemPath}.category`,
        message: `category ${typed.category} is not a direct key category of legend ${typed.legendRef}`,
        refs: [typed.legendRef],
        details: { value: typed.category, legendBinding: "undeclared", categoryType: "legend-key" },
      });
    }
  });

  for (const key of Object.keys(entities).sort()) {
    if (shapeFailed.has(`presentation.diagram.entities.${key}`)) continue;
    if (!validEntityOccurrences.has(key)) continue;
    const entry = entities[key] as { categoryRef?: string };
    if (entry.categoryRef !== undefined) continue;
    const occurrence = view.entityOccurrences[key];
    if (occurrence === undefined) continue;
    const semantic = document.entities[occurrence.entity];
    if (semantic === undefined) continue;
    const owner = registry.get(semantic.profile as never);
    if (owner === undefined) continue;
    const resolution = resolver.resolve(owner, semantic.type);
    if (!resolution.ok) continue;
    const ancestry = resolution.resolved.ancestry;
    const isKeyType = owner.id === GENERIC2_PROFILE_ID && ancestry.includes("legend-key");
    const isLegendType = owner.id === GENERIC2_PROFILE_ID && ancestry.includes("legend");
    if (isKeyType || isLegendType) continue;
    const schemas = resolution.resolved.schemas;
    const categorySchema = schemas.find((schema) => schema.name === "category");
    if (categorySchema === undefined || categorySchema.kind !== "text") continue;
    const value = semantic.attributes["category"];
    if (value === undefined || value.kind !== "text") continue;
    const category = (value as { value: string }).value;
    if (typeof category !== "string" || category.length === 0) continue;
    const matchingLegends: string[] = [];
    for (const entityId of Object.keys(document.entities).sort()) {
      if (!isLegendEntity(entityId)) continue;
      const keys = directKeysOf(entityId);
      for (const kid of keys) {
        const keyEntity = document.entities[kid];
        if (keyEntity === undefined) continue;
        const keyValue = keyEntity.attributes["category"];
        if (keyValue !== undefined && keyValue.kind === "text" && (keyValue as { value: string }).value === category) {
          matchingLegends.push(entityId);
          break;
        }
      }
    }
    if (matchingLegends.length === 0) {
      diagnostics.push({
        code: "tone-category-unknown",
        severity: "error",
        path: `presentation.diagram.entities.${key}.categoryRef`,
        message: `category ${category} on occurrence ${key} is not declared by any legend in this document`,
        refs: [key],
        details: { value: category, legendBinding: "undeclared", categoryType: "legend-key" },
      });
      continue;
    }
    const tokens = new Set<string>();
    for (const legendId of matchingLegends) {
      for (const [index, item] of (categoryTokens as readonly unknown[]).entries()) {
        void index;
        const typed = item as { legendRef: string; category: string; token: string };
        if (typed.legendRef === legendId && typed.category === category && typeof typed.token === "string") {
          tokens.add(typed.token);
        }
      }
    }
    if (tokens.size === 0) {
      diagnostics.push({
        code: "tone-category-unknown",
        severity: "error",
        path: `presentation.diagram.entities.${key}.categoryRef`,
        message: `category ${category} on occurrence ${key} is not declared by any legend in this document`,
        refs: [key],
        details: { value: category, legendBinding: "undeclared", categoryType: "legend-key" },
      });
      continue;
    }
    if (tokens.size > 1) {
      diagnostics.push({
        code: "tone-category-unknown",
        severity: "error",
        path: `presentation.diagram.entities.${key}.categoryRef`,
        message: `category ${category} on occurrence ${key} resolves ambiguously across legends; set categoryRef to bind it`,
        refs: [key],
        details: { value: category, legendBinding: "ambiguous", categoryType: "legend-key" },
      });
    }
  }

  for (const key of Object.keys(legends).sort()) {
    const entryPath = `presentation.diagram.legends.${key}.order`;
    const entryKeyPath = `presentation.diagram.legends.${key}`;
    if (shapeFailed.has(entryPath) || shapeFailed.has(entryKeyPath)) continue;
    const occurrence = view.entityOccurrences[key];
    if (occurrence === undefined) continue;
    const semantic = document.entities[occurrence.entity];
    if (semantic === undefined) continue;
    if (!isGeneric2Legend(document, registry, resolver, semantic.id)) {
      diagnostics.push(formMismatch(entryKeyPath));
      continue;
    }
    const entry = legends[key] as { order: readonly unknown[] };
    const actual = (entry.order ?? []) as readonly unknown[];
    let referencesOk = true;
    actual.forEach((item, index) => {
      if (typeof item !== "string") return;
      const itemPath = `${entryPath}[${index}]`;
      if (refKindOf(item) !== "entity") {
        diagnostics.push(wrongNamespacePresentation(itemPath, item, "entity"));
        referencesOk = false;
        return;
      }
      if (document.entities[item] === undefined) {
        diagnostics.push(danglingPresentation(itemPath, item));
        referencesOk = false;
      }
    });
    if (!referencesOk) continue;
    const expected = directKeysOf(semantic.id).slice().sort();
    const actualStrings = actual.filter((item): item is string => typeof item === "string");
    const actualSorted = [...actualStrings].sort();
    const uniqueActual = new Set(actualStrings);
    if (
      uniqueActual.size !== actualStrings.length ||
      actualSorted.length !== expected.length ||
      actualSorted.some((value, index) => value !== expected[index])
    ) {
      diagnostics.push(orderMismatch(entryPath));
    }
  }

  return diagnostics;
}
