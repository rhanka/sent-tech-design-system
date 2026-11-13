export { default as GraphLegend } from './GraphLegend.vue';
export type { ForceGraphLegendEntry, ForceGraphNodeShape, ForceGraphTone, ForceGraphEdgeDash } from '@sentropic/graph/presentation';
import type { ForceGraphLegendEntry } from '@sentropic/graph/presentation';
export type GraphLegendProps = { entries: ForceGraphLegendEntry[]; title?: string; class?: string };
