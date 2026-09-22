import { defineComponent, h, type PropType } from 'vue';
import {
  Grid,
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-vue';
import {
  findDimension,
  findMeasure,
  groupAggregate,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type SmallMultiplesProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph. */
  viewId: string;
  /** Dimension whose distinct values each produce one facet (panel). */
  facetBy: string;
  /** Dimension to group rows by inside each facet (bar categories). */
  dimension: string;
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label; each facet chart is "<label> — <facet key>". */
  label: string;
  /** Number of grid columns (design-system Grid). Defaults to 2. */
  columns?: number;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  class?: string;
};

const keyOf = (v: unknown) => (v == null ? 'null' : String(v));

/**
 * Faceting / trellis: one design-system `BarChart` per distinct `facetBy`
 * value, laid out in a `Grid`, all sharing a single value `domain` so the
 * facets are visually comparable.
 */
export const SmallMultiples = defineComponent({
  name: 'SmallMultiples',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    facetBy: { type: String, required: true },
    dimension: { type: String, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    columns: { type: Number, default: 2 },
    tone: { type: String as PropType<BarChartTone>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      const fdim = findDimension(props.store.model, props.facetBy);
      const dim = findDimension(props.store.model, props.dimension);
      const m = findMeasure(props.store.model, props.measure);
      let panels: { key: string; data: BarChartDatum[] }[] = [];
      let domain: [number, number] | undefined;
      if (fdim && dim && m) {
        const rows = props.store.applyCrossfilter(props.viewId);
        const keys: string[] = [];
        const seen = new Set<string>();
        for (const row of rows) {
          const k = keyOf(row[props.facetBy]);
          if (!seen.has(k)) {
            seen.add(k);
            keys.push(k);
          }
        }
        let min = 0;
        let max = 0;
        panels = keys.map((k) => {
          const facetRows = rows.filter((row) => keyOf(row[props.facetBy]) === k);
          const data = groupAggregate(facetRows, props.dimension, m).map(({ key: barKey, value }) => {
            if (value < min) min = value;
            if (value > max) max = value;
            return props.tone ? { label: barKey, value, tone: props.tone } : { label: barKey, value };
          });
          return { key: k, data };
        });
        // Shared domain anchored at 0 (keeps negatives in view for mixed facets).
        domain = panels.length ? [min, max] : undefined;
      }
      return h(
        Grid,
        { columns: props.columns, gap: 4, class: props.class, role: 'group', 'aria-label': props.label },
        {
          default: () =>
            panels.map((panel) =>
              h(BarChart, {
                key: panel.key,
                data: panel.data,
                label: `${props.label} — ${panel.key}`,
                domain,
              }),
            ),
        },
      );
    };
  },
});
