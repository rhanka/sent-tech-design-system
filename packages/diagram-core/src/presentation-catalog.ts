/**
 * Governed presentation catalog resolution (internal, not exported).
 *
 * The application join resolves only the packaged governed entry. Positive
 * witnesses inject a test entry by mocking this module in tests; production
 * has no override path. The packaged data lives in a module-private binding
 * that no consumer can reach; the public catalog snapshot in presentation.js
 * is a detached frozen copy the resolver never reads.
 */

import {
  DIAGRAM_PRESENTATION_SCHEMA_DIGEST,
  type PresentationContractCatalog,
} from "./presentation.js";

function deepFreezeValue<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Object.isFrozen(value)) return value;
  const target = value as Record<string, unknown>;
  for (const key of Object.keys(target)) {
    const child = target[key];
    if (child !== null && typeof child === "object") {
      deepFreezeValue(child);
    }
  }
  return Object.freeze(value);
}

const PRIVATE_SCHEMA_PIN = {
  id: "diagram-presentation-schema",
  version: "1",
  contentDigest: DIAGRAM_PRESENTATION_SCHEMA_DIGEST,
};
deepFreezeValue(PRIVATE_SCHEMA_PIN);

const PRIVATE_PACKAGED_CATALOG: PresentationContractCatalog = {
  compatibilityAdapter: "transitional:ds-schema-adapter-unqualified",
  adapterBytes: undefined,
  schemaPin: PRIVATE_SCHEMA_PIN as PresentationContractCatalog["schemaPin"],
};
deepFreezeValue(PRIVATE_PACKAGED_CATALOG);

export function resolveGovernedCatalog(): PresentationContractCatalog {
  return PRIVATE_PACKAGED_CATALOG;
}
