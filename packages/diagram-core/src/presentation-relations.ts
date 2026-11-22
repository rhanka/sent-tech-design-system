/** Resolve document relation refinements, diagram-presentation@2 and DE-2 connector words at the boundary of the frozen presentation adapter. */
import { isArrowheadKind, isLinkEmphasis } from "./connector-registry.js";
import { diagnostic, type Diagnostic } from "./diagnostics.js";
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  isPresentationContractV2Pin,
  type PresentationPin,
} from "./presentation.js";
import { validateDiagramPresentation as validatePinnedPresentation } from "./presentation-validate.js";
import { relationBaseType } from "./relation-types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shapeInvalid(path: string): Diagnostic {
  return diagnostic({
    code: "occurrence-endpoint-mismatch",
    severity: "error",
    path,
    message: "diagram presentation fails check presentation-shape-invalid",
    refs: [],
    details: { check: "presentation-shape-invalid" },
  });
}

function normalizeViewForPinnedAdapter(
  view: Parameters<typeof validatePinnedPresentation>[1],
): { readonly view: Parameters<typeof validatePinnedPresentation>[1]; readonly connectorDiagnostics: readonly Diagnostic[] } {
  const diagram = view.presentation.diagram as unknown;
  const hasDiagram = isRecord(diagram);
  const isV2 =
    hasDiagram &&
    isRecord(diagram["contractPin"]) &&
    isPresentationContractV2Pin(diagram["contractPin"] as unknown as PresentationPin);
  const isFrozenV1 = hasDiagram && !isV2;

  const ALLOWED_RELATION_OCCURRENCE_KEYS = new Set([
    "id",
    "relation",
    "endpoints",
    "waypoints",
    "strokeStyle",
    "arrowhead",
    "emphasis",
  ]);
  const connectorDiagnostics: Diagnostic[] = [];
  let relationOccurrencesChanged = false;
  const normalizedRelations: Record<string, unknown> = {};
  for (const key of Object.keys(view.relationOccurrences).sort()) {
    const occurrence = view.relationOccurrences[key] as unknown as Record<string, unknown>;
    for (const field of Object.keys(occurrence).sort()) {
      if (!ALLOWED_RELATION_OCCURRENCE_KEYS.has(field)) {
        connectorDiagnostics.push(shapeInvalid(`relationOccurrences.${key}.${field}`));
      }
    }
    const arrowhead = occurrence["arrowhead"];
    if (arrowhead !== undefined && (isFrozenV1 || !isArrowheadKind(arrowhead))) {
      connectorDiagnostics.push(shapeInvalid(`relationOccurrences.${key}.arrowhead`));
    }
    const emphasis = occurrence["emphasis"];
    if (emphasis !== undefined && (isFrozenV1 || !isLinkEmphasis(emphasis))) {
      connectorDiagnostics.push(shapeInvalid(`relationOccurrences.${key}.emphasis`));
    }
    // Frozen diagram-presentation@1 keeps its exact @1 strokeStyle check
    // ("solid" | "dashed"); diagram-presentation@2 admits the DE-2 "dotted" word.
    if (isV2 && occurrence["strokeStyle"] === "dotted") {
      normalizedRelations[key] = { ...occurrence, strokeStyle: "dashed" };
      relationOccurrencesChanged = true;
    } else {
      normalizedRelations[key] = occurrence;
    }
  }
  if (isFrozenV1 && isRecord(view.summaryLabels)) {
    for (const id of Object.keys(view.summaryLabels).sort()) {
      const summary = (view.summaryLabels as Record<string, unknown>)[id];
      if (isRecord(summary) && summary["strokeStyle"] === "dotted") {
        connectorDiagnostics.push(shapeInvalid(`summaryLabels.${id}.strokeStyle`));
      }
    }
  }
  let nextView = relationOccurrencesChanged
    ? ({ ...view, relationOccurrences: normalizedRelations } as Parameters<typeof validatePinnedPresentation>[1])
    : view;

  if (!isV2 || !isRecord(diagram)) {
    return { view: nextView, connectorDiagnostics };
  }
  const rawEntities = diagram["entities"];
  if (!isRecord(rawEntities)) {
    nextView = {
      ...nextView,
      presentation: {
        ...nextView.presentation,
        diagram: { ...diagram, contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN } } as never,
      },
    };
    return { view: nextView, connectorDiagnostics };
  }
  const entities: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(rawEntities)) {
    if (isRecord(entry) && "align" in entry) {
      const align = entry["align"];
      if (align === undefined || align === "left" || align === "center") {
        const { align: _validAlign, ...rest } = entry;
        void _validAlign;
        entities[key] = rest;
        continue;
      }
    }
    entities[key] = entry;
  }
  nextView = {
    ...nextView,
    presentation: {
      ...nextView.presentation,
      diagram: {
        ...diagram,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities,
      } as never,
    },
  };
  return { view: nextView, connectorDiagnostics };
}

export function validateDiagramPresentation(...args: Parameters<typeof validatePinnedPresentation>): ReturnType<typeof validatePinnedPresentation> {
  const [document, view, options] = args;
  let changed = false;
  const relations = Object.fromEntries(Object.entries(document.relations).map(([id, relation]) => {
    const profile = options.registry.get(relation.profile);
    const type = profile === undefined ? relation.type : relationBaseType(document, profile, relation);
    if (type === relation.type) return [id, relation];
    changed = true;
    return [id, { ...relation, type }];
  }));
  const normalized = normalizeViewForPinnedAdapter(view);
  const pinned = validatePinnedPresentation(changed ? { ...document, relations } : document, normalized.view, options);
  return normalized.connectorDiagnostics.length === 0 ? pinned : [...normalized.connectorDiagnostics, ...pinned];
}
