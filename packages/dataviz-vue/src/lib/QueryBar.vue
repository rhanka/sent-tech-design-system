<script setup lang="ts">
import { ref } from 'vue';
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

defineOptions({ name: 'QueryBar' });
const props = withDefaults(defineProps<QueryBarProps>(), {
  fields: undefined, label: 'Search', placeholder: 'Search', clearLabel: undefined, size: undefined, minLength: undefined, caseSensitive: undefined, class: undefined,
});
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

function onClear() {
  applyQuery('');
}
</script>

<template>
  <Search :label="props.label" :model-value="query" :placeholder="props.placeholder"
    :clear-label="props.clearLabel" :size="props.size"
    :class="['st-queryBar', props.class].filter(Boolean).join(' ')"
    @update:model-value="applyQuery" @clear="onClear" />
</template>
