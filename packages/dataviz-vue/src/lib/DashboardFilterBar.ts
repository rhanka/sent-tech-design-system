import { defineComponent, h, type PropType, type Component } from 'vue';
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

export const DashboardFilterBar = defineComponent({
  name: 'DashboardFilterBar',
  props: {
    controls: { type: Array as PropType<FilterControl[]>, required: true },
    export: { type: Object as PropType<ExportConfig>, default: undefined },
    chips: { type: Boolean, default: false },
    activeFilters: { type: Array as PropType<ActiveFilter[]>, default: () => [] },
    timeRange: { type: Object as PropType<TimeRange | null>, default: undefined },
    onQueryChange: { type: Function as PropType<(q: string) => void>, default: undefined },
    onTimeRangeChange: { type: Function as PropType<(range: TimeRange | null) => void>, default: undefined },
    onFiltersChange: { type: Function as PropType<(filters: ActiveFilter[]) => void>, default: undefined },
    onExport: { type: Function as PropType<(config: ExportConfig) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const pickerValue = props.timeRange
        ? { start: new Date(props.timeRange.from), end: new Date(props.timeRange.to) }
        : null;

      const controlNodes = props.controls.map((control, i) => {
        if (control.kind === 'query-search') {
          return h(Search as Component, {
            key: i,
            label: control.label,
            placeholder: control.placeholder,
            onInput: (e: Event) => props.onQueryChange?.((e.currentTarget as HTMLInputElement).value),
          });
        }
        if (control.kind === 'date-range') {
          return h(DatePicker as Component, {
            key: i,
            mode: 'range',
            label: control.label,
            value: pickerValue,
            onChange: (value: unknown) => {
              if (!value) { props.onTimeRangeChange?.(null); return; }
              const r = value as { start: Date | null; end: Date | null };
              if (r.start && r.end) {
                props.onTimeRangeChange?.({ from: r.start.toISOString(), to: r.end.toISOString() });
              }
            },
          });
        }
        if (control.kind === 'relative-date') {
          const presets = control.presets ?? [];
          const options = presets.map((p) => ({
            value: `${p.from}|${p.to}|${p.label}`,
            label: p.label,
          }));
          return h(Select as Component, {
            key: i,
            label: control.label,
            options: [{ value: '', label: '—' }, ...options],
            onChange: (e: Event) => {
              const val = (e.currentTarget as HTMLSelectElement).value;
              if (!val) { props.onTimeRangeChange?.(null); return; }
              const [from, to, relativeLabel] = val.split('|');
              if (from && to) {
                props.onTimeRangeChange?.({ from, to, relativeLabel });
              }
            },
          });
        }
        if (control.kind === 'variable') {
          if (control.multiSelect) {
            return h(MultiSelect as Component, {
              key: i,
              label: control.label,
              options: [],
              onChange: (values: string[]) => {
                const filters = values.map((v) => ({
                  field: control.dimension,
                  operator: 'eq' as const,
                  value: v,
                }));
                props.onFiltersChange?.(filters);
              },
            });
          }
          return h(Select as Component, {
            key: i,
            label: control.label,
            options: [{ value: '', label: '—' }],
            onChange: (e: Event) => {
              const val = (e.currentTarget as HTMLSelectElement).value;
              const filters = val
                ? [{ field: control.dimension, operator: 'eq' as const, value: val }]
                : [];
              props.onFiltersChange?.(filters);
            },
          });
        }
        return null;
      });

      const exportNode = props.export
        ? h(Button as Component, { variant: 'secondary', onClick: () => props.onExport?.(props.export!) }, () => props.export!.label)
        : null;

      const chipsNode =
        props.chips && props.activeFilters.length > 0
          ? h(FilterBar as Component, { label: 'Filtres actifs' }, {
              default: () =>
                props.activeFilters.map((f, i) =>
                  h(FilterPill as Component, {
                    key: i,
                    field: f.label ?? f.field,
                    value: String(f.value),
                    onRemove: () => props.onFiltersChange?.(props.activeFilters.filter((_, j) => j !== i)),
                  }),
                ),
            })
          : null;

      return h(
        'div',
        { class: ['st-dashboardFilterBar', props.class].filter(Boolean).join(' ') || undefined },
        [...controlNodes, exportNode, chipsNode].filter(Boolean),
      );
    };
  },
});
