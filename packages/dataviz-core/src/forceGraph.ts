/**
 * Force-directed graph (NetworkGraph) data builder.
 *
 * Derives a set of distinct nodes from edge source/target fields and maps the
 * rows into ForceGraph-compatible node and edge structures, as expected by the
 * DS ForceGraph component.
 *
 * Nodes are deduced from the union of all source and target values encountered
 * in the rows. Each node receives a cycling categorical tone (category1..8)
 * assigned in first-seen order. Rows where either source or target is null /
 * empty are dropped silently. An optional weight field is mapped to the node's
 * weight (summed across all edges touching that node) when provided; otherwise
 * weight defaults to 1.
 *
 * No aggregation of edges: each valid row becomes one edge. Duplicate edges
 * (same source→target pair) are kept as-is to preserve multi-edges when the
 * data contains them.
 */

import { type DataModel, type Row } from './model.js';

const FORCE_GRAPH_TONES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
  'category7',
  'category8',
] as const;

export type ForceGraphToneCore = (typeof FORCE_GRAPH_TONES)[number];

/** Structural node type mirroring DS ForceGraphNode (no DS import). */
export interface ForceGraphNodeCore {
  /** Stable identifier; referenced by edges. */
  id: string;
  /** Visible label (same as id for deduced nodes). */
  label?: string;
  /** Cycling categorical tone assigned in first-seen order. */
  tone?: ForceGraphToneCore;
  /** Relative node radius weight (sum of incident edge weights). */
  weight?: number;
}

/** Structural edge type mirroring DS ForceGraphEdge (no DS import). */
export interface ForceGraphEdgeCore {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Optional edge weight (from the weight field when provided). */
  width?: number;
}

/** Result produced by {@link buildForceGraphData}. */
export interface ForceGraphDataResult {
  nodes: ForceGraphNodeCore[];
  edges: ForceGraphEdgeCore[];
}

/** Configuration for {@link buildForceGraphData}. */
export interface ForceGraphConfig {
  /** Field id whose value is the source node identifier. */
  source: string;
  /** Field id whose value is the target node identifier. */
  target: string;
  /**
   * Optional field id whose numeric value is used as the edge weight.
   * When provided, the value is forwarded as `width` on the edge and
   * accumulated as `weight` on each incident node.
   */
  weight?: string;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Build force-directed graph data from raw rows.
 *
 * Nodes are deduced from the union of all distinct source/target values.
 * Each node is assigned a cycling categorical tone in first-seen insertion
 * order. Rows where source or target resolves to an empty string are dropped.
 *
 * @param _model  DataModel — reserved for future label/format lookup
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`
 * @param config  { source, target, weight? } — field ids
 */
export function buildForceGraphData(
  _model: DataModel,
  rows: readonly Row[],
  config: ForceGraphConfig,
): ForceGraphDataResult {
  // Map from node id → insertion index (for tone cycling)
  const nodeIndex = new Map<string, number>();
  // Accumulated weight per node (sum of incident edge weights)
  const nodeWeightAcc = new Map<string, number>();

  const edges: ForceGraphEdgeCore[] = [];

  const ensureNode = (id: string): void => {
    if (!nodeIndex.has(id)) {
      nodeIndex.set(id, nodeIndex.size);
      nodeWeightAcc.set(id, 0);
    }
  };

  for (const row of rows) {
    const sourceRaw = row[config.source];
    const targetRaw = row[config.target];

    const source = sourceRaw == null ? '' : String(sourceRaw).trim();
    const target = targetRaw == null ? '' : String(targetRaw).trim();

    // Drop rows with missing node identifiers
    if (source === '' || target === '') {
      continue;
    }

    ensureNode(source);
    ensureNode(target);

    const edge: ForceGraphEdgeCore = { source, target };

    if (config.weight !== undefined) {
      const w = toFiniteNumber(row[config.weight]);
      if (w !== undefined) {
        edge.width = w;
        nodeWeightAcc.set(source, (nodeWeightAcc.get(source) ?? 0) + w);
        nodeWeightAcc.set(target, (nodeWeightAcc.get(target) ?? 0) + w);
      }
    }

    edges.push(edge);
  }

  const nodes: ForceGraphNodeCore[] = Array.from(nodeIndex.entries()).map(([id, idx]) => {
    const tone = FORCE_GRAPH_TONES[idx % FORCE_GRAPH_TONES.length];
    const accWeight = nodeWeightAcc.get(id) ?? 0;
    const node: ForceGraphNodeCore = { id, label: id, tone };
    if (config.weight !== undefined && accWeight > 0) {
      node.weight = accWeight;
    }
    return node;
  });

  return { nodes, edges };
}
