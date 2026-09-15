/**
 * Venn diagram data builder.
 *
 * Venn diagram data has a set-membership structure that is best expressed
 * explicitly rather than derived from a tabular row-per-observation model.
 * This builder is a typed passthrough: callers supply pre-built VennArea
 * objects (typically from a static demo or a curated configuration) and the
 * builder returns them unchanged.
 *
 * This mirrors the pattern used for other charts whose data shape cannot be
 * meaningfully derived by a generic field-mapping heuristic.
 */

import { type DataModel, type Row } from './model.js';

export interface VennArea {
  /** The set or intersection this area represents (e.g. ['A'], ['A','B']). */
  sets: string[];
  /** Numeric size/value of this area or intersection. */
  value: number;
}

export interface VennConfig {
  /** Pre-built areas (Venn data is best defined explicitly given its set-membership structure). */
  areas: VennArea[];
}

/**
 * Return the pre-built Venn areas from config unchanged.
 *
 * @param _model  DataModel — unused; present for API consistency
 * @param _rows   Row array — unused; present for API consistency
 * @param config  { areas } — the pre-built VennArea array
 */
export function buildVennData(
  _model: DataModel,
  _rows: readonly Row[],
  config: VennConfig,
): VennArea[] {
  return config.areas;
}
