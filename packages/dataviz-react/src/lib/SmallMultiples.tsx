import {
  Grid,
  BarChart,
  type BarChartDatum,
  type BarChartTone,
} from '@sentropic/design-system-react';
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
  className?: string;
};

const keyOf = (v: unknown) => (v == null ? 'null' : String(v));

/**
 * Faceting / trellis: one design-system `BarChart` per distinct `facetBy`
 * value, laid out in a `Grid`, all sharing a single value `domain` so the
 * facets are visually comparable.
 */
export function SmallMultiples({
  store,
  viewId,
  facetBy,
  dimension,
  measure,
  label,
  columns = 2,
  tone,
  className,
}: SmallMultiplesProps) {
  useDashboard(store);
  const fdim = findDimension(store.model, facetBy);
  const dim = findDimension(store.model, dimension);
  const m = findMeasure(store.model, measure);
  let panels: { key: string; data: BarChartDatum[] }[] = [];
  let domain: [number, number] | undefined;
  if (fdim && dim && m) {
    const rows = store.applyCrossfilter(viewId);
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const k = keyOf(row[facetBy]);
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
    let min = 0;
    let max = 0;
    panels = keys.map((k) => {
      const facetRows = rows.filter((row) => keyOf(row[facetBy]) === k);
      const data = groupAggregate(facetRows, dimension, m).map(({ key: barKey, value }) => {
        if (value < min) min = value;
        if (value > max) max = value;
        return tone ? { label: barKey, value, tone } : { label: barKey, value };
      });
      return { key: k, data };
    });
    // Shared domain anchored at 0 (keeps negatives in view for mixed facets).
    domain = panels.length ? [min, max] : undefined;
  }
  return (
    <Grid columns={columns} gap={4} className={className} role="group" aria-label={label}>
      {panels.map((panel) => (
        <BarChart key={panel.key} data={panel.data} label={`${label} — ${panel.key}`} domain={domain} />
      ))}
    </Grid>
  );
}
