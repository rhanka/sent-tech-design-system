import { defineComponent, h, type PropType } from 'vue';
import { Button, Inline, type BarChartTone } from '@sentropic/design-system-vue';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
import { drillLevel, onDrillSelect } from './drill.js';
import { DrillBarChart } from './DrillBarChart.js';
import { DonutChart } from './DonutChart.js';
import { TreemapChart } from './TreemapChart.js';

/** Which design-system chart renders the current drill level. */
export type DrillChartKind = 'bar' | 'donut' | 'treemap';

export type DrillChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; the chart groups by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each datum's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Design-system chart to render for the current level. Defaults to `'bar'`. */
  kind?: DrillChartKind;
  /** Bar tone (only used by `kind="bar"`). */
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  /** Donut diameter (only used by `kind="donut"`). */
  size?: number;
  /** Donut ring thickness (only used by `kind="donut"`). */
  thickness?: number;
  class?: string;
};

/**
 * A categorical chart that drills through a dimension hierarchy, generalised
 * over the design-system chart kind. The drill state + level maths + the
 * drill-vs-select decision come from the shared engine in `./drill`; the visual
 * comes entirely from the existing DS chart wrappers.
 *
 * `kind="bar"` delegates to {@link DrillBarChart}, whose BarChart already owns
 * the click surface. `kind="donut" | "treemap"` render the matching wrapper for
 * the visual (DS donut/treemap are presentational) plus an accessible row of DS
 * Buttons that performs the drill — composition, no new visuals.
 */
export const DrillChart = defineComponent({
  name: 'DrillChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    hierarchy: { type: Array as PropType<string[]>, required: true },
    measure: { type: String, required: true },
    label: { type: String, required: true },
    kind: { type: String as PropType<DrillChartKind>, default: 'bar' },
    tone: { type: String as PropType<BarChartTone>, default: undefined },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    size: { type: Number, default: undefined },
    thickness: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      // `state.value` establishes the reactive dependency so the level
      // re-resolves on every store mutation (drill / filter / select).
      void state.value;

      if (props.kind === 'bar') {
        // The bar wrapper already owns the full drill+select click surface.
        return h(DrillBarChart, {
          store: props.store,
          viewId: props.viewId,
          hierarchy: props.hierarchy,
          measure: props.measure,
          label: props.label,
          tone: props.tone,
          orientation: props.orientation,
          width: props.width,
          height: props.height,
          class: props.class,
        });
      }

      const level = drillLevel(props.store, props.viewId, props.hierarchy, props.measure);
      const selectedKeys = state.value.selections[props.viewId] ?? [];
      const select = (key: string) => onDrillSelect(props.store, props.viewId, props.hierarchy, key);

      // Donut / treemap DS charts are purely presentational (no click surface),
      // so the visual comes from the existing wrapper and the drill interaction
      // is an accessible row of DS Buttons driven by the shared engine.
      const visual =
        props.kind === 'donut'
          ? h(DonutChart, {
              store: props.store,
              viewId: props.viewId,
              category: level.dimension ?? props.hierarchy[0],
              measure: props.measure,
              label: props.label,
              size: props.size,
              thickness: props.thickness,
            })
          : h(TreemapChart, {
              store: props.store,
              viewId: props.viewId,
              hierarchy: level.dimension ? [level.dimension] : props.hierarchy,
              measure: props.measure,
              label: props.label,
              width: props.width,
              height: props.height,
            });

      const controls = h(
        Inline,
        {
          gap: 1,
          role: 'group',
          'aria-label': `${props.label} — ${level.canDrill ? 'drill' : 'select'}`,
        },
        () =>
          level.data.map((datum) =>
            h(
              Button,
              {
                key: datum.key,
                variant:
                  !level.canDrill && selectedKeys.includes(datum.key) ? 'primary' : 'ghost',
                onClick: () => select(datum.key),
              },
              () => `${datum.key}: ${datum.value}`,
            ),
          ),
      );

      return h(Inline, { gap: 2, class: props.class }, () => [visual, controls]);
    };
  },
});
