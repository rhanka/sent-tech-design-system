<script lang="ts" module>
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
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Search,
    DatePicker,
    Select,
    MultiSelect,
    Button,
    FilterBar,
    FilterPill,
    type DatePickerRange,
  } from '@sentropic/design-system-svelte';

  let {
    controls,
    export: exportConfig,
    chips = false,
    activeFilters = [],
    timeRange,
    onQueryChange,
    onTimeRangeChange,
    onFiltersChange,
    onExport,
    class: className,
  }: DashboardFilterBarProps = $props();

  let pickerState = $state<DatePickerRange | null>(null);

  $effect(() => {
    pickerState = timeRange
      ? { start: new Date(timeRange.from), end: new Date(timeRange.to) }
      : null;
  });

  $effect(() => {
    const p = pickerState;
    if (!p?.start || !p.end) return;
    const tr = untrack(() => timeRange);
    const pFrom = p.start.toISOString();
    const pTo = p.end.toISOString();
    if (tr?.from === pFrom && tr?.to === pTo) return;
    onTimeRangeChange?.({ from: pFrom, to: pTo });
  });

  function handleRelativeChange(e: Event) {
    const val = (e.currentTarget as HTMLSelectElement).value;
    if (!val) { onTimeRangeChange?.(null); return; }
    const [from, to, relativeLabel] = val.split('|');
    if (from && to) onTimeRangeChange?.({ from, to, relativeLabel });
  }

  function handleVariableChange(e: Event, dimension: string) {
    const val = (e.currentTarget as HTMLSelectElement).value;
    const filters = val ? [{ field: dimension, operator: 'eq' as const, value: val }] : [];
    onFiltersChange?.(filters);
  }

  function handleMultiChange(values: string[], dimension: string) {
    const filters = values.map((v) => ({ field: dimension, operator: 'eq' as const, value: v }));
    onFiltersChange?.(filters);
  }

  function removeChip(index: number) {
    onFiltersChange?.(activeFilters.filter((_, j) => j !== index));
  }
</script>

<div class={['st-dashboardFilterBar', className].filter(Boolean).join(' ') || undefined}>
  {#each controls as control, i (i)}
    {#if control.kind === 'query-search'}
      <Search
        label={control.label}
        placeholder={control.placeholder}
        oninput={(e) => onQueryChange?.((e.currentTarget as HTMLInputElement).value)}
      />
    {:else if control.kind === 'date-range'}
      <DatePicker
        mode="range"
        label={control.label}
        bind:value={pickerState}
      />
    {:else if control.kind === 'relative-date'}
      <Select label={control.label} onchange={handleRelativeChange}>
        <option value="">—</option>
        {#each control.presets ?? [] as preset}
          <option value="{preset.from}|{preset.to}|{preset.label}">{preset.label}</option>
        {/each}
      </Select>
    {:else if control.kind === 'variable'}
      {#if control.multiSelect}
        <MultiSelect
          label={control.label}
          options={[]}
          onchange={(values) => handleMultiChange(values, control.dimension)}
        />
      {:else}
        <Select label={control.label} onchange={(e) => handleVariableChange(e, control.dimension)}>
          <option value="">—</option>
        </Select>
      {/if}
    {/if}
  {/each}

  {#if exportConfig}
    <Button variant="secondary" onclick={() => onExport?.(exportConfig)}>
      {exportConfig.label}
    </Button>
  {/if}

  {#if chips && activeFilters.length > 0}
    <FilterBar label="Filtres actifs">
      {#each activeFilters as f, i (i)}
        <FilterPill
          field={f.label ?? f.field}
          value={String(f.value)}
          onRemove={() => removeChip(i)}
        />
      {/each}
    </FilterBar>
  {/if}
</div>
