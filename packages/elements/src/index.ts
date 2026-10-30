/**
 * The package root: the catalogue registry and the envelope validator.
 * Everything a renderer imports at runtime is here; the Node-side
 * generator (src/generator) and the structure bridge it defaults to
 * (src/structure) are reachable through the validate barrel and never
 * re-exported separately.
 */

export {
  contracts,
  CATALOG_ID,
  ENVELOPE_ID,
  standaloneId,
  A2UI_COMMON_TYPES_ID,
  A2UI_PROTOCOL_VERSION,
} from "./contracts/index.js";
export type { ContractModule } from "./contracts/index.js";
export * from "./validate/index.js";
