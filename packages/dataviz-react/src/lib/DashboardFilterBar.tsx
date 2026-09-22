import {
  Search,
  DatePicker,
  Select,
  MultiSelect,
  Button,
  FilterBar,
  FilterPill,
  type DatePickerRange,
} from '@sentropic/design-system-react';
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
  className?: string;
};

export function DashboardFilterBar({
  controls,
  export: exportConfig,
  chips = false,
  activeFilters = [],
  timeRange,
  onQueryChange,
  onTimeRangeChange,
  onFiltersChange,
  onExport,
  className,
}: DashboardFilterBarProps) {
  const pickerValue: DatePickerRange | null = timeRange
    ? { start: new Date(timeRange.from), end: new Date(timeRange.to) }
    : null;

  return (
    <div className={['st-dashboardFilterBar', className].filter(Boolean).join(' ') || undefined}>
      {controls.map((control, i) => {
        if (control.kind === 'query-search') {
          return (
            <Search
              key={i}
              label={control.label}
              placeholder={control.placeholder}
              onChange={(e) => onQueryChange?.(e.currentTarget.value)}
            />
          );
        }
        if (control.kind === 'date-range') {
          return (
            <DatePicker
              key={i}
              mode="range"
              label={control.label}
              value={pickerValue}
              onChange={(value) => {
                if (!value) { onTimeRangeChange?.(null); return; }
                const r = value as DatePickerRange;
                if (r.start && r.end) {
                  onTimeRangeChange?.({ from: r.start.toISOString(), to: r.end.toISOString() });
                }
              }}
            />
          );
        }
        if (control.kind === 'relative-date') {
          const options = (control.presets ?? []).map((p) => ({
            value: `${p.from}|${p.to}|${p.label}`,
            label: p.label,
          }));
          return (
            <Select
              key={i}
              label={control.label}
              options={[{ value: '', label: '—' }, ...options]}
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (!val) { onTimeRangeChange?.(null); return; }
                const [from, to, relativeLabel] = val.split('|');
                if (from && to) {
                  onTimeRangeChange?.({ from, to, relativeLabel });
                }
              }}
            />
          );
        }
        if (control.kind === 'variable') {
          if (control.multiSelect) {
            return (
              <MultiSelect
                key={i}
                label={control.label}
                options={[]}
                onChange={(values: string[]) => {
                  const filters = values.map((v) => ({
                    field: control.dimension,
                    operator: 'eq' as const,
                    value: v,
                  }));
                  onFiltersChange?.(filters);
                }}
              />
            );
          }
          return (
            <Select
              key={i}
              label={control.label}
              options={[{ value: '', label: '—' }]}
              onChange={(e) => {
                const val = e.currentTarget.value;
                const filters = val
                  ? [{ field: control.dimension, operator: 'eq' as const, value: val }]
                  : [];
                onFiltersChange?.(filters);
              }}
            />
          );
        }
        return null;
      })}
      {exportConfig && (
        <Button variant="secondary" onClick={() => onExport?.(exportConfig)}>
          {exportConfig.label}
        </Button>
      )}
      {chips && activeFilters.length > 0 && (
        <FilterBar label="Filtres actifs">
          {activeFilters.map((f, i) => (
            <FilterPill
              key={i}
              field={f.label ?? f.field}
              value={String(f.value)}
              onRemove={() => onFiltersChange?.(activeFilters.filter((_, j) => j !== i))}
            />
          ))}
        </FilterBar>
      )}
    </div>
  );
}
