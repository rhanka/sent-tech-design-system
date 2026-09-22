import { defineComponent, h, type PropType } from 'vue';
import {
  ScatterPlot as DsScatterPlot,
  type ScatterPlotDatum,
} from '@sentropic/design-system-vue';
import { buildScatterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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
  class?: string;
};

/**
 * Scatter-plot matrix (SPLOM): an N×N grid of design-system `ScatterPlot`
 * components, each cell (i, j) crossing measure[j] (x) against measure[i] (y).
 * Layout mirrors SmallMultiples — a plain CSS grid, no hand-rolled chart code.
 */
export const ScatterPlotMatrix = defineComponent({
  name: 'ScatterPlotMatrix',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    measures: { type: Array as PropType<string[]>, required: true },
    label: { type: String, required: true },
    cellSize: { type: Number, default: 160 },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const rows = props.store.applyCrossfilter(props.viewId);
      const cells: { row: number; col: number; data: ScatterPlotDatum[]; xLabel: string; yLabel: string }[] = [];
      for (let row = 0; row < props.measures.length; row++) {
        for (let col = 0; col < props.measures.length; col++) {
          const m = buildScatterModel(props.store.model, rows, {
            x: props.measures[col]!,
            y: props.measures[row]!,
          });
          cells.push({ row, col, data: m.data as ScatterPlotDatum[], xLabel: m.xLabel, yLabel: m.yLabel });
        }
      }
      return h(
        'div',
        {
          role: 'group',
          'aria-label': props.label,
          class: ['splom-grid', props.class].filter(Boolean).join(' ') || undefined,
          style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${props.measures.length}, ${props.cellSize}px)`,
            gap: 'var(--st-spacing-2, 8px)',
          },
        },
        cells.map((cell) =>
          h(DsScatterPlot, {
            key: `${cell.row}-${cell.col}`,
            data: cell.data,
            xLabel: cell.xLabel,
            yLabel: cell.yLabel,
            width: props.cellSize,
            height: props.cellSize,
            label: `${props.label} — ${cell.yLabel} × ${cell.xLabel}`,
          }),
        ),
      );
    };
  },
});
