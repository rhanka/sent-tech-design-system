import { Button, Inline, type BarChartTone } from '@sentropic/design-system-react';
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
  className?: string;
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
export function DrillChart({
  store,
  viewId,
  hierarchy,
  measure,
  label,
  kind = 'bar',
  tone,
  orientation = 'vertical',
  width,
  height,
  size,
  thickness,
  className,
}: DrillChartProps) {
  const state = useDashboard(store);
  const level = drillLevel(store, viewId, hierarchy, measure);
  const selectedKeys = state.selections[viewId] ?? [];
  const select = (key: string) => onDrillSelect(store, viewId, hierarchy, key);

  if (kind === 'bar') {
    // The bar wrapper already owns the full drill+select click surface.
    return (
      <DrillBarChart
        store={store}
        viewId={viewId}
        hierarchy={hierarchy}
        measure={measure}
        label={label}
        tone={tone}
        orientation={orientation}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  // Donut / treemap DS charts are purely presentational (no click surface), so
  // the visual comes from the existing wrapper and the drill interaction is an
  // accessible row of DS Buttons driven by the shared engine.
  return (
    <Inline gap={2} className={className}>
      {kind === 'donut' ? (
        <DonutChart
          store={store}
          viewId={viewId}
          category={level.dimension ?? hierarchy[0]}
          measure={measure}
          label={label}
          size={size}
          thickness={thickness}
        />
      ) : (
        <TreemapChart
          store={store}
          viewId={viewId}
          hierarchy={level.dimension ? [level.dimension] : hierarchy}
          measure={measure}
          label={label}
          width={width}
          height={height}
        />
      )}
      <Inline gap={1} role="group" aria-label={`${label} — ${level.canDrill ? 'drill' : 'select'}`}>
        {level.data.map((datum) => (
          <Button
            key={datum.key}
            variant={!level.canDrill && selectedKeys.includes(datum.key) ? 'primary' : 'ghost'}
            onClick={() => select(datum.key)}
          >
            {datum.key}: {datum.value}
          </Button>
        ))}
      </Inline>
    </Inline>
  );
}
