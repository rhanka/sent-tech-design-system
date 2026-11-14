<script setup lang="ts">
import { computed } from 'vue';
import {
  Search,
  DatePicker,
  Select,
  MultiSelect,
  Button,
  FilterBar,
  FilterPill,
} from '@sentropic/design-system-vue';
import type { TimeRange } from '@sentropic/dataviz-core';

export type ActiveFilter = {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number;
  label?: string;
};

export type FilterControl =
  | { kind: 'query-search'; label: string; placeholder?: string; fields: string[] }
  | { kind: 'date-range'; label: string }
  | { kind: 'relative-date'; label: string; presets?: { label: string; from: string; to: string }[] }
  | { kind: 'variable'; label: string; dimension: string; multiSelect?: boolean };

export type ExportConfig = {
  label: string;
  fields: string[];
  filenameTemplate: string;
};

export type DashboardFilterBarProps = {
  controls: FilterControl[];
  export?: ExportConfig;
  chips?: boolean;
  activeFilters?: ActiveFilter[];
  timeRange?: TimeRange | null;
  onQueryChange?: (q: string) => void;
  onTimeRangeChange?: (range: TimeRange | null) => void;
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  onExport?: (config: ExportConfig) => void;
  class?: string;
};

defineOptions({ name: 'DashboardFilterBar' });
const props = withDefaults(defineProps<DashboardFilterBarProps>(), {
  export: undefined, chips: false, activeFilters: () => [], timeRange: undefined,
  onQueryChange: undefined, onTimeRangeChange: undefined, onFiltersChange: undefined,
  onExport: undefined, class: undefined,
});

const pickerValue = computed(() => props.timeRange
  ? { start: new Date(props.timeRange.from), end: new Date(props.timeRange.to) }
  : null);

function queryInput(e: Event) {
  props.onQueryChange?.((e.currentTarget as HTMLInputElement).value);
}

function dateRangeChange(value: unknown) {
  if (!value) { props.onTimeRangeChange?.(null); return; }
  const r = value as { start: Date | null; end: Date | null };
  if (r.start && r.end) {
    props.onTimeRangeChange?.({ from: r.start.toISOString(), to: r.end.toISOString() });
  }
}

function relativeOptions(control: FilterControl) {
  if (control.kind !== 'relative-date') return [{ value: '', label: '—' }];
  const presets = control.presets ?? [];
  return [
    { value: '', label: '—' },
    ...presets.map((p) => ({ value: `${p.from}|${p.to}|${p.label}`, label: p.label })),
  ];
}

function relativeChange(e: Event) {
  const val = (e.currentTarget as HTMLSelectElement).value;
  if (!val) { props.onTimeRangeChange?.(null); return; }
  const [from, to, relativeLabel] = val.split('|');
  if (from && to) {
    props.onTimeRangeChange?.({ from, to, relativeLabel });
  }
}

function multiChange(control: FilterControl, values: string[]) {
  if (control.kind !== 'variable') return;
  const filters = values.map((v) => ({
    field: control.dimension,
    operator: 'eq' as const,
    value: v,
  }));
  props.onFiltersChange?.(filters);
}

function singleChange(control: FilterControl, e: Event) {
  if (control.kind !== 'variable') return;
  const val = (e.currentTarget as HTMLSelectElement).value;
  const filters = val
    ? [{ field: control.dimension, operator: 'eq' as const, value: val }]
    : [];
  props.onFiltersChange?.(filters);
}

function exportClick() {
  if (props.export) props.onExport?.(props.export);
}

function removeFilter(i: number) {
  props.onFiltersChange?.(props.activeFilters.filter((_, j) => j !== i));
}
</script>

<template>
  <div :class="['st-dashboardFilterBar', props.class].filter(Boolean).join(' ') || undefined">
    <template v-for="(control, i) in props.controls" :key="i">
      <Search v-if="control.kind === 'query-search'" :key="'s-' + i" :label="control.label" :placeholder="control.placeholder"
        @input="queryInput" />
      <DatePicker v-else-if="control.kind === 'date-range'" :key="'d-' + i" mode="range" :label="control.label"
        :value="pickerValue" @change="dateRangeChange" />
      <Select v-else-if="control.kind === 'relative-date'" :key="'r-' + i" :label="control.label" :options="relativeOptions(control)"
        @change="relativeChange" />
      <MultiSelect v-else-if="control.kind === 'variable' && control.multiSelect" :key="'m-' + i" :label="control.label"
        :options="[]" @change="(values: string[]) => multiChange(control, values)" />
      <Select v-else-if="control.kind === 'variable'" :key="'v-' + i" :label="control.label" :options="[{ value: '', label: '—' }]"
        @change="(e: Event) => singleChange(control, e)" />
    </template>
    <Button v-if="props.export" variant="secondary" @click="exportClick">{{ props.export.label }}</Button>
    <FilterBar v-if="props.chips && props.activeFilters.length > 0" label="Filtres actifs">
      <FilterPill v-for="(f, i) in props.activeFilters" :key="i" :field="f.label ?? f.field" :value="String(f.value)"
        @remove="() => removeFilter(i)" />
    </FilterBar>
  </div>
</template>
