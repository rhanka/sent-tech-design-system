/**
 * The catalogue registry (§5.1): every contract module, in catalogue order.
 * Adding a component is a lot item with its own parity check (§5.4); this
 * array is the single place a new contract module registers.
 */

import type { ContractModule } from "./types.js";

import { barChartContract } from "./bar-chart.js";
import { bpmnCanvasContract } from "./bpmn-canvas.js";
import { decisionDossierContract } from "./decision-dossier.js";

export type { ContractModule } from "./types.js";
export {
  type BarChartProps,
  type BarChartDatum,
  type BarChartTone,
  type ChartAnnotation,
  type ChartAnnotationMarker,
  type ChartBand,
  type ChartGoalLine,
  type ChartOverlayTone,
  type ChartReferenceLine,
  type ChartScale,
  type DataLabelsJson,
} from "./bar-chart.js";
export { type BpmnCanvasDocument, type BpmnCanvasProps } from "./bpmn-canvas.js";
export { type DecisionDossierDocumentRef, type DecisionDossierProps } from "./decision-dossier.js";

/** The catalogue identity (§5.2): `$id` = `catalogId`. */
export const CATALOG_ID = "https://design-system.sent-tech.ca/catalogs/elements/v1/catalog.json";

/** The envelope schema's `$id` (the standalone schemas live next to it, §5.2). */
export const ENVELOPE_ID = "https://design-system.sent-tech.ca/catalogs/elements/v1/envelope.json";

/** Standalone schema `$id` for one component (§5.2). */
export function standaloneId(component: string): string {
  return `https://design-system.sent-tech.ca/catalogs/elements/v1/components/${component}.json`;
}

/**
 * The A2UI v0.9.1 common-types URI the catalogue's entries reference
 * (`ComponentCommon`). The installed SDK (0.14.0) ships no v0_9_1 schema set
 * (only v0_8, v0_9 and v1_0), so the vendored copy is generated from the
 * SDK's v0_9 common_types.json with this `$id` (see src/generated).
 */
export const A2UI_COMMON_TYPES_ID = "https://a2ui.org/specification/v0_9_1/common_types.json";

/** The A2UI protocol version this catalogue targets (§5.2). */
export const A2UI_PROTOCOL_VERSION = "0.9.1";

/** Every contract module, in catalogue order (§5.4). */
export const contracts: readonly ContractModule[] = [
  barChartContract,
  bpmnCanvasContract,
  decisionDossierContract,
];
