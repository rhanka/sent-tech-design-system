import { defineComponent, h, type PropType } from 'vue';
import { Inline, SelectionChip } from '@sentropic/design-system-vue';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type SelectionLegendProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Map of viewId -> human label for the legend chips (falls back to the id). */
  labels?: Record<string, string>;
  /** Aria-label of the legend group. */
  label?: string;
  class?: string;
};

/**
 * Per-view selections rendered as design-system `SelectionChip`s. Renders
 * nothing while there is no active selection.
 */
export const SelectionLegend = defineComponent({
  name: 'SelectionLegend',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    labels: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    label: { type: String, default: 'Sélections actives' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      const entries = Object.entries(state.value.selections).filter(([, keys]) => keys.length > 0);
      if (entries.length === 0) return null;
      return h(
        Inline,
        { role: 'group', 'aria-label': props.label, gap: 2, wrap: true, class: props.class },
        {
          default: () =>
            entries.map(([viewId, keys]) =>
              h(SelectionChip, {
                key: viewId,
                label: props.labels[viewId] ?? viewId,
                count: keys.length,
                onClear: () => props.store.clearSelection(viewId),
              }),
            ),
        },
      );
    };
  },
});
