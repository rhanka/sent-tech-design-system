/**
 * The transactional unit: one document and the views over it.
 *
 * SPEC 3.5 says a validated command transforms `(document, vues, revision)`.
 * That tuple is this type. A command never touches a document without its
 * views, because the policies that make a delete legal (what happens to the
 * occurrences) are only decidable with the views in hand.
 */

import type { SemanticDocument } from "./document.js";
import type { ViewRef } from "./refs.js";
import type { ViewDocument } from "./view.js";

export interface DiagramState {
  readonly document: SemanticDocument;
  /** Keyed by the view's own reference, so view order is never content. */
  readonly views: Readonly<Record<string, ViewDocument>>;
}

export function createState(document: SemanticDocument, views: readonly ViewDocument[] = []): DiagramState {
  const keyed: Record<string, ViewDocument> = {};
  for (const view of views) {
    if (keyed[view.viewId] !== undefined) {
      throw new Error(`view ${view.viewId} given twice; a view id is unique in a state`);
    }
    keyed[view.viewId] = view;
  }
  return { document, views: keyed };
}

export const viewOf = (state: DiagramState, ref: ViewRef): ViewDocument | undefined => state.views[ref];

export const viewRefsOf = (state: DiagramState): readonly ViewRef[] =>
  Object.keys(state.views)
    .sort()
    .map((key) => key as ViewRef);
