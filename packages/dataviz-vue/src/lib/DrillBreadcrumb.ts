import { defineComponent, h, type PropType } from 'vue';
import { Breadcrumb, Button, Inline } from '@sentropic/design-system-vue';
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
  class?: string;
};

/**
 * Drill trail (design-system Breadcrumb) plus a "go up one level" button that
 * pops the drill path and clears the value-filter applied at that level.
 */
export const DrillBreadcrumb = defineComponent({
  name: 'DrillBreadcrumb',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, required: true },
    hierarchy: { type: Array as PropType<string[]>, required: true },
    label: { type: String, default: 'Chemin de drill' },
    backLabel: { type: String, default: 'Remonter' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    const dimLabel = (id: string) => findDimension(props.store.model, id)?.label ?? id;
    const back = () => {
      const p = props.store.getState().drill[props.viewId] ?? [];
      if (p.length === 0) return;
      props.store.drillUp(props.viewId);
      props.store.clearFilter(props.hierarchy[p.length - 1]);
    };
    return () => {
      const path = state.value.drill[props.viewId] ?? [];
      const items = props.hierarchy
        .slice(0, path.length + 1)
        .map((dim, i) => ({ label: dimLabel(dim), current: i === path.length }));
      const children = [h(Breadcrumb, { items, label: props.label })];
      if (path.length > 0) {
        children.push(h(Button, { variant: 'ghost', onClick: back }, { default: () => props.backLabel }));
      }
      return h(Inline, { gap: 2, class: props.class }, { default: () => children });
    };
  },
});
