import {
  isPresentationContractV2Pin,
  type DiagramPresentation,
  type RelationPresentation,
  type ViewDocument,
} from "@sentropic/diagram-core";

export type R7PresentationLike = Pick<DiagramPresentation, "contractPin" | "entities"> & {
  readonly relations?: Readonly<Record<string, RelationPresentation>>;
};

/**
 * True when a scene opts into the r7 connector and routing path (`REQ-R7-11..17`):
 * - `presentation.contractPin` is `diagram-presentation@2`, OR
 * - `presentation.relations` declares one or more relation styles, OR
 * - `view.relationOccurrences` carries any `@4` connector attribute
 *   (`strokeStyle`, `arrowhead`, `emphasis`).
 *
 * Existing `v1` (`diagram-presentation@1` without relation styles), ERD (`erd@1`),
 * and numbered-flow scenes return `false`, preserving `main` geometry, port
 * capacity, clearances, `<polyline>` DOM, and `1.5 px` strokes (`REQ-R7-28`).
 */
export function isR7ConnectorPresentation(
  presentation: R7PresentationLike | undefined,
  view?: ViewDocument,
): boolean {
  if (presentation !== undefined) {
    if (
      presentation.contractPin !== undefined &&
      isPresentationContractV2Pin(presentation.contractPin)
    ) {
      return true;
    }
    if (
      presentation.relations !== undefined &&
      Object.keys(presentation.relations).length > 0
    ) {
      return true;
    }
  }
  if (view !== undefined) {
    for (const occ of Object.values(view.relationOccurrences)) {
      if (
        occ.strokeStyle === "dotted" ||
        occ.arrowhead !== undefined ||
        occ.emphasis !== undefined
      ) {
        return true;
      }
    }
  }
  return false;
}
