import { Breadcrumb, Button, Inline } from '@sentropic/design-system-react';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type DrillBreadcrumbProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (must match the DrillBarChart it accompanies). */
  viewId: string;
  /** The same ordered dimension hierarchy used by the DrillBarChart. */
  hierarchy: string[];
  /** Aria-label of the breadcrumb trail. */
  label?: string;
  /** Label of the "go up one level" button. */
  backLabel?: string;
  className?: string;
};

/**
 * Drill trail (design-system Breadcrumb) plus a "go up one level" button that
 * pops the drill path and clears the value-filter applied at that level.
 */
export function DrillBreadcrumb({
  store,
  viewId,
  hierarchy,
  label = 'Chemin de drill',
  backLabel = 'Remonter',
  className,
}: DrillBreadcrumbProps) {
  const state = useDashboard(store);
  const path = state.drill[viewId] ?? [];
  const dimLabel = (id: string) => findDimension(store.model, id)?.label ?? id;
  const items = hierarchy
    .slice(0, path.length + 1)
    .map((dim, i) => ({ label: dimLabel(dim), current: i === path.length }));
  const back = () => {
    const p = store.getState().drill[viewId] ?? [];
    if (p.length === 0) return;
    store.drillUp(viewId);
    store.clearFilter(hierarchy[p.length - 1]);
  };
  return (
    <Inline gap={2} className={className}>
      <Breadcrumb items={items} label={label} />
      {path.length > 0 && (
        <Button variant="ghost" onClick={back}>
          {backLabel}
        </Button>
      )}
    </Inline>
  );
}
