import {
  isPresentationContractV2Pin,
  type DiagramAnatomyVersion,
  type DiagramPresentation,
  type RelationPresentation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";
import { entityVerdict, relationVerdict } from "./visibility.js";

export type R7PresentationLike = Pick<DiagramPresentation, "contractPin" | "entities"> & {
  readonly relations?: Readonly<Record<string, RelationPresentation>>;
};

export type R7DocumentLike = Pick<SemanticDocument, "profileRefs" | "relations">
  & Partial<Pick<SemanticDocument, "typeDefinitions" | "entities">>;

export function diagramAnatomyOf(
  presentation: R7PresentationLike,
  view: ViewDocument | undefined,
  occurrence: string,
): DiagramAnatomyVersion {
  const entry = presentation.entities?.[occurrence] as { readonly anatomy?: DiagramAnatomyVersion } | undefined;
  return entry?.anatomy
    ?? view?.presentation?.entityAnatomy?.[occurrence]
    ?? view?.presentation?.anatomy
    ?? "v1";
}

/**
 * Compact anatomy or an authored connector style opts into DE-2. The
 * presentation pin alone leaves full-size scenes unchanged (REQ-R7-28).
 * ERD and views containing only numbered flows keep their own routing.
 */
export function isR7ConnectorPresentation(
  presentation: R7PresentationLike | undefined,
  view?: ViewDocument,
  document?: R7DocumentLike,
): boolean {
  if (document?.profileRefs?.length === 1 && document.profileRefs[0] === "erd@1") return false;
  const hasFilters = (view?.filters?.length ?? 0) > 0;
  const occurrences = view == null ? [] : Object.values(view.relationOccurrences ?? {}).filter((occ) => {
    if (occ == null) return false;
    if (!hasFilters) return true;
    const relation = document?.relations?.[occ.relation];
    if (relation !== undefined && !relationVerdict(view, relation, document).visible) return false;
    if (document?.entities != null && view.entityOccurrences != null) {
      for (const endpoint of occ.endpoints ?? []) {
        const ownerOccId = view.portOccurrences?.[endpoint.occurrence]?.ownerOccurrence ?? endpoint.occurrence;
        const entityId = view.entityOccurrences[ownerOccId]?.entity;
        const entity = entityId === undefined ? undefined : document.entities[entityId];
        if (entity !== undefined && !entityVerdict(view, entity).visible) return false;
      }
    }
    return true;
  });
  if (document != null) {
    const relations = view == null
      ? Object.values(document.relations ?? {})
      : occurrences.map((occ) => document.relations?.[occ.relation]);
    const types = relations.flatMap((relation) => relation == null ? [] : [relation.type]);
    if (types.includes("flow-step") && types.every((type) => type === "flow-step" || type === "contains")) return false;
  }

  const effectivePresentation = presentation ?? view?.presentation?.diagram;
  if (effectivePresentation != null) {
    const entities = view?.entityOccurrences ?? effectivePresentation.entities;
    if (Object.keys(entities ?? {}).some((id) => diagramAnatomyOf(effectivePresentation, view, id) === "v2")) return true;
  }
  if (view?.presentation?.anatomy === "v2" && effectivePresentation == null) return true;

  const styles = presentation?.relations;
  if (view == null && Object.keys(styles ?? {}).length > 0) return true;
  const authoredPin = view?.presentation?.diagram?.contractPin;
  const suppliedPin = presentation?.contractPin;
  const unpinnedDashes = authoredPin === undefined && (suppliedPin === undefined || isPresentationContractV2Pin(suppliedPin));
  return occurrences.some((occ) =>
    styles?.[occ.id] != null ||
    styles?.[occ.relation] != null ||
    occ.strokeStyle === "dotted" ||
    (occ.strokeStyle === "dashed" && unpinnedDashes) ||
    occ.arrowhead !== undefined ||
    occ.emphasis !== undefined
  );
}
