import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-preact';
import { buildScatterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { classNames } from '../classNames.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type ScatterPlotMatrixProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph. */
  viewId: string;
  /** Ordered list of measure field ids to cross (N×N grid). */
  measures: string[];
  /** Accessible label for the matrix group. */
  label: string;
  /** Size in px of each individual cell. Defaults to 160. */
  cellSize?: number;
  className?: MaybeSignal<string>;
};

/**
 * Scatter-plot matrix (SPLOM): an N×N grid of design-system `ScatterPlot`
 * components, each cell (i, j) crossing measure[j] (x) against measure[i] (y).
 * Layout mirrors SmallMultiples — a plain CSS grid, no hand-rolled chart code.
 */
export function ScatterPlotMatrix({
  store,
  viewId,
  measures,
  label,
  cellSize = 160,
  className,
}: ScatterPlotMatrixProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const rows = store.applyCrossfilter(viewId);
  const cells: { row: number; col: number; data: ScatterPlotDatum[]; xLabel: string; yLabel: string }[] = [];
  for (let row = 0; row < measures.length; row++) {
    for (let col = 0; col < measures.length; col++) {
      const m = buildScatterModel(store.model, rows, {
        x: measures[col]!,
        y: measures[row]!,
      });
      cells.push({ row, col, data: m.data as ScatterPlotDatum[], xLabel: m.xLabel, yLabel: m.yLabel });
    }
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={classNames('splom-grid', resolvedClassName)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${measures.length}, ${cellSize}px)`,
        gap: 'var(--st-spacing-2, 8px)',
      }}
    >
      {cells.map((cell) => (
        <DsScatterPlot
          key={`${cell.row}-${cell.col}`}
          data={cell.data}
          xLabel={cell.xLabel}
          yLabel={cell.yLabel}
          width={cellSize}
          height={cellSize}
          label={`${label} — ${cell.yLabel} × ${cell.xLabel}`}
        />
      ))}
    </div>
  );
}
