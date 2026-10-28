/**
 * Governed presentation catalog resolution (internal, not exported).
 *
 * The application join resolves only the packaged governed entry. Positive
 * witnesses inject a test entry by mocking this module in tests; production
 * has no override path.
 */

import {
  DIAGRAM_PRESENTATION_PACKAGED_CATALOG,
  type PresentationContractCatalog,
} from "./presentation.js";

export function resolveGovernedCatalog(): PresentationContractCatalog {
  return DIAGRAM_PRESENTATION_PACKAGED_CATALOG;
}
