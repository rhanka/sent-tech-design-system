import {
  isPresentationContractV2Pin,
  type DiagramPresentation,
  type RelationPresentation,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

export type R7PresentationLike = Pick<DiagramPresentation, "contractPin" | "entities"> & {
  readonly relations?: Readonly<Record<string, RelationPresentation>>;
};

export type R7DocumentLike = Pick<SemanticDocument, "profileRefs" | "relations">;

function isNumberedFlowOnlyDocument(document: R7DocumentLike | undefined): boolean {
  if (document == null || document.relations == null || typeof document.relations !== "object") {
    return false;
  }
  let hasFlowStep = false;
  let hasNonFlowLink = false;
  for (const relation of Object.values(document.relations)) {
    if (relation?.type === "flow-step") hasFlowStep = true;
    else if (relation?.type !== "contains") hasNonFlowLink = true;
  }
  return hasFlowStep && !hasNonFlowLink;
}

/**
 * True when a scene opts into the r7 connector and routing path (`REQ-R7-11..17`):
 * - not ERD (`erd@1`) and not a pure numbered-flow (`flow-step`) scene (`REQ-R7-28`), AND:
 * - compact `v2` anatomy (`view.presentation.anatomy === "v2"` or any entity
 *   `anatomy: "v2"`, `REQ-R7-05 / REQ-R7-11 / REQ-R7-13 / REQ-R7-14`), OR
 * - `presentation.contractPin` (or `view.presentation.diagram.contractPin`) is
 *   `diagram-presentation@2`, OR
 * - `presentation.relations` declares one or more relation styles, OR
 * - `view.relationOccurrences` carries any `@4`-exclusive connector attribute
 *   (`strokeStyle === "dotted"`, `arrowhead`, `emphasis`), OR `strokeStyle === "dashed"`
 *   when not pinned to frozen `diagram-presentation@1`.
 *
 * Existing `v1` (`diagram-presentation@1` without `anatomy: "v2"` or relation styles),
 * ERD (`erd@1`), and numbered-flow scenes (including under `diagram-presentation@2`)
 * return `false`, preserving `main` geometry, port capacity, clearances, `<polyline>`
 * DOM, and `1.5 px` strokes (`REQ-R7-28`).
 */
export function isR7ConnectorPresentation(
  presentation: R7PresentationLike | undefined,
  view?: ViewDocument,
  document?: R7DocumentLike,
): boolean {
  if (document != null) {
    if (Array.isArray(document.profileRefs) && document.profileRefs.length === 1 && document.profileRefs[0] === "erd@1") {
      return false;
    }
    if (isNumberedFlowOnlyDocument(document)) {
      return false;
    }
  }
  if ((view?.presentation as { readonly anatomy?: string } | undefined)?.anatomy === "v2") {
    return true;
  }
  const presV2Pin =
    presentation?.contractPin !== undefined &&
    isPresentationContractV2Pin(presentation.contractPin);
  const viewDiagramPin = view?.presentation?.diagram?.contractPin;
  const viewV2Pin =
    viewDiagramPin !== undefined && isPresentationContractV2Pin(viewDiagramPin);
  if (presV2Pin || viewV2Pin) {
    return true;
  }
  if (presentation != null) {
    if (
      presentation.relations != null &&
      typeof presentation.relations === "object" &&
      Object.keys(presentation.relations).length > 0
    ) {
      return true;
    }
    if (presentation.entities != null && typeof presentation.entities === "object") {
      for (const entry of Object.values(presentation.entities)) {
        if ((entry as { readonly anatomy?: string } | undefined)?.anatomy === "v2") {
          return true;
        }
      }
    }
  }
  const frozenV1Pin =
    (presentation?.contractPin !== undefined && !presV2Pin) ||
    (viewDiagramPin !== undefined && !viewV2Pin);
  if (view?.relationOccurrences != null && typeof view.relationOccurrences === "object") {
    for (const occ of Object.values(view.relationOccurrences)) {
      if (
        occ?.strokeStyle === "dotted" ||
        (occ?.strokeStyle === "dashed" && !frozenV1Pin) ||
        occ?.arrowhead !== undefined ||
        occ?.emphasis !== undefined
      ) {
        return true;
      }
    }
  }
  return false;
}
