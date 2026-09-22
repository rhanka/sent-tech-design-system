import { defineComponent, h, ref, type PropType } from 'vue';
import { Search, type SearchSize } from '@sentropic/design-system-vue';
import { buildQueryFilterSpec, type DashboardStore } from '@sentropic/dataviz-core';

export type QueryBarProps = {
  store: DashboardStore;
  /** Dimension owned by this query bar. Matching rows include this dimension's values. */
  dimension: string;
  /** Fields searched for the query. Defaults to the owned dimension. */
  fields?: readonly string[];
  label?: string;
  placeholder?: string;
  clearLabel?: string;
  size?: SearchSize;
  minLength?: number;
  caseSensitive?: boolean;
  class?: string;
};

export const QueryBar = defineComponent({
  name: 'QueryBar',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    dimension: { type: String, required: true },
    fields: { type: Array as PropType<readonly string[]>, default: undefined },
    label: { type: String, default: 'Search' },
    placeholder: { type: String, default: 'Search' },
    clearLabel: { type: String, default: undefined },
    size: { type: String as PropType<SearchSize>, default: undefined },
    minLength: { type: Number, default: undefined },
    caseSensitive: { type: Boolean, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const query = ref('');

    function applyQuery(next: string) {
      query.value = next;
      const spec = buildQueryFilterSpec(props.store.model, props.store.data, {
        dimension: props.dimension,
        fields: props.fields,
        query: next,
        minLength: props.minLength,
        caseSensitive: props.caseSensitive,
      });
      if (spec) props.store.setFilter(props.dimension, spec);
      else props.store.clearFilter(props.dimension);
    }

    return () => {
      const searchProps: Record<string, unknown> = {
        label: props.label,
        modelValue: query.value,
        placeholder: props.placeholder,
        class: ['st-queryBar', props.class].filter(Boolean).join(' '),
        'onUpdate:modelValue': applyQuery,
        onClear: () => applyQuery(''),
      };
      if (props.clearLabel !== undefined) searchProps.clearLabel = props.clearLabel;
      if (props.size !== undefined) searchProps.size = props.size;
      return h(Search, searchProps);
    };
  },
});
