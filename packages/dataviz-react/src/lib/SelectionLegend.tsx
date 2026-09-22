import { Inline, SelectionChip } from '@sentropic/design-system-react';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type SelectionLegendProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Map of viewId -> human label for the legend chips (falls back to the id). */
  labels?: Record<string, string>;
  /** Aria-label of the legend group. */
  label?: string;
  className?: string;
};

/**
 * Per-view selections rendered as design-system `SelectionChip`s. Renders
 * nothing while there is no active selection.
 */
export function SelectionLegend({
  store,
  labels = {},
  label = 'Sélections actives',
  className,
}: SelectionLegendProps) {
  const state = useDashboard(store);
  const entries = Object.entries(state.selections).filter(([, keys]) => keys.length > 0);
  if (entries.length === 0) return null;
  return (
    <Inline role="group" aria-label={label} gap={2} wrap className={className}>
      {entries.map(([viewId, keys]) => (
        <SelectionChip
          key={viewId}
          label={labels[viewId] ?? viewId}
          count={keys.length}
          onClear={() => store.clearSelection(viewId)}
        />
      ))}
    </Inline>
  );
}
