/**
 * Scatter-plot matrix (SPLOM) builder.
 *
 * Produces the N×N cells needed by the ScatterPlotMatrix component by calling
 * `buildScatterModel` once per (row-measure, col-measure) pair.  The diagonal
 * (i === j) is included — consumers may hide it if needed but the builder
 * never drops it so the grid stays perfectly square.
 */

import { type DataModel, type Row } from './model.js';
import { buildScatterModel, type ScatterModel } from './scatter.js';

export interface ScatterMatrixConfig {
  /** Ordered list of measure (or numeric dimension) field ids to cross. */
  measures: string[];
}

export interface ScatterMatrixCell extends ScatterModel {
  /** 0-based row index (drives the y axis). */
  row: number;
  /** 0-based column index (drives the x axis). */
  col: number;
}

export interface ScatterMatrixModel {
  /** Flat array of N×N cells in row-major order. */
  cells: ScatterMatrixCell[];
  /** Ordered measure ids (same as `config.measures`). */
  measures: string[];
}

/**
 * Build a scatter-plot matrix model from raw rows.
 *
 * @param model   DataModel — passed through to `buildScatterModel` for label lookup.
 * @param rows    Filtered rows from `store.applyCrossfilter(viewId)`.
 * @param config  `{ measures }` — list of field ids to cross.
 */
export function buildScatterMatrix(
  model: DataModel,
  rows: readonly Row[],
  config: ScatterMatrixConfig,
): ScatterMatrixModel {
  const { measures } = config;
  const cells: ScatterMatrixCell[] = [];
  for (let row = 0; row < measures.length; row++) {
    for (let col = 0; col < measures.length; col++) {
      const scatter = buildScatterModel(model, rows, {
        x: measures[col]!,
        y: measures[row]!,
      });
      cells.push({ row, col, ...scatter });
    }
  }
  return { cells, measures };
}
