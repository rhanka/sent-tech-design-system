import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  Button,
  DatePicker,
  FilterBar,
  FilterPill,
  MultiSelect,
  Search,
  Select,
  type DatePickerRange,
  type DatePickerValue,
  type SelectOption,
} from '@sentropic/design-system-angular';
import type { TimeRange } from '@sentropic/dataviz-core';
import { classNames } from './classNames.js';

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

/**
 * Flattened control: the discriminated `FilterControl` union resolved into the
 * fields the template needs, so the template never narrows a union itself.
 */
type FilterControlView = {
  index: number;
  kind: FilterControl['kind'];
  label: string;
  placeholder?: string;
  options: SelectOption[];
  multiSelect: boolean;
  dimension: string;
};

/** One rendered chip: the DS FilterPill inputs plus its remove handler. */
type FilterPillView = {
  index: number;
  field: string;
  value: string;
  remove: () => void;
};

/** Dashboard-level filter controls bound to a design-system FilterBar row. */
@Component({
  selector: 'st-dataviz-dashboard-filter-bar',
  standalone: true,
  imports: [Search, DatePicker, Select, MultiSelect, Button, FilterBar, FilterPill],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [attr.class]="hostClassValue">
      @for (control of controlViews; track control.index) {
        @switch (control.kind) {
          @case ('query-search') {
            <st-search
              [label]="control.label"
              [placeholder]="control.placeholder"
              (modelValueChange)="handleQueryChange($event)"
            ></st-search>
          }
          @case ('date-range') {
            <st-date-picker
              mode="range"
              [label]="control.label"
              [value]="pickerValue"
              (modelValueChange)="handleDateRangeChange($event)"
            ></st-date-picker>
          }
          @case ('relative-date') {
            <st-select
              [label]="control.label"
              [options]="control.options"
              (modelValueChange)="handleRelativeDateChange($event)"
            ></st-select>
          }
          @case ('variable') {
            @if (control.multiSelect) {
              <st-multi-select
                [label]="control.label"
                [options]="control.options"
                (selectedChange)="handleMultiSelectChange(control, $event)"
              ></st-multi-select>
            } @else {
              <st-select
                [label]="control.label"
                [options]="control.options"
                (modelValueChange)="handleVariableChange(control, $event)"
              ></st-select>
            }
          }
        }
      }
      @if (exportConfig) {
        <st-button variant="secondary" (click)="handleExport()">{{ exportConfig.label }}</st-button>
      }
      @if (chips && pillViews.length > 0) {
        <st-filter-bar label="Filtres actifs">
          @for (pill of pillViews; track pill.index) {
            <st-filter-pill [field]="pill.field" [value]="pill.value" [onRemove]="pill.remove"></st-filter-pill>
          }
        </st-filter-bar>
      }
    </div>
  `,
})
export class DashboardFilterBar implements OnInit, OnChanges {
  static readonly stComponentName = 'DashboardFilterBar';

  @NgInput({ required: true }) controls!: FilterControl[];
  @NgInput('export') exportConfig?: ExportConfig;
  @NgInput() chips = false;
  @NgInput() activeFilters: ActiveFilter[] = [];
  @NgInput() timeRange?: TimeRange | null;
  @NgInput() onQueryChange?: (q: string) => void;
  @NgInput() onTimeRangeChange?: (range: TimeRange | null) => void;
  @NgInput() onFiltersChange?: (filters: ActiveFilter[]) => void;
  @NgInput() onExport?: (config: ExportConfig) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  controlViews: FilterControlView[] = [];
  pillViews: FilterPillView[] = [];
  pickerValue: DatePickerRange | null = null;
  hostClassValue = 'st-dashboardFilterBar';

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  handleQueryChange(query: string): void {
    this.onQueryChange?.(query);
  }

  handleDateRangeChange(value: DatePickerValue): void {
    if (!value) {
      this.onTimeRangeChange?.(null);
      return;
    }
    const range = value as DatePickerRange;
    if (range.start && range.end) {
      this.onTimeRangeChange?.({ from: range.start.toISOString(), to: range.end.toISOString() });
    }
  }

  handleRelativeDateChange(value: string): void {
    if (!value) {
      this.onTimeRangeChange?.(null);
      return;
    }
    const [from, to, relativeLabel] = value.split('|');
    if (from && to) {
      this.onTimeRangeChange?.({ from, to, relativeLabel });
    }
  }

  handleVariableChange(control: FilterControlView, value: string): void {
    const filters: ActiveFilter[] = value
      ? [{ field: control.dimension, operator: 'eq', value }]
      : [];
    this.onFiltersChange?.(filters);
  }

  handleMultiSelectChange(control: FilterControlView, values: string[]): void {
    this.onFiltersChange?.(
      values.map((value) => ({ field: control.dimension, operator: 'eq' as const, value })),
    );
  }

  handleExport(): void {
    if (this.exportConfig) this.onExport?.(this.exportConfig);
  }

  private recompute(): void {
    this.hostClassValue = classNames('st-dashboardFilterBar', this.classInput);
    this.pickerValue = this.timeRange
      ? { start: new Date(this.timeRange.from), end: new Date(this.timeRange.to) }
      : null;
    this.controlViews = (this.controls ?? []).map((control, index) => {
      if (control.kind === 'relative-date') {
        const presets = control.presets ?? [];
        return {
          index,
          kind: control.kind,
          label: control.label,
          options: [
            { value: '', label: '—' },
            ...presets.map((preset) => ({
              value: `${preset.from}|${preset.to}|${preset.label}`,
              label: preset.label,
            })),
          ],
          multiSelect: false,
          dimension: '',
        };
      }
      if (control.kind === 'variable') {
        return {
          index,
          kind: control.kind,
          label: control.label,
          options: control.multiSelect ? [] : [{ value: '', label: '—' }],
          multiSelect: control.multiSelect === true,
          dimension: control.dimension,
        };
      }
      if (control.kind === 'query-search') {
        return {
          index,
          kind: control.kind,
          label: control.label,
          placeholder: control.placeholder,
          options: [],
          multiSelect: false,
          dimension: '',
        };
      }
      return {
        index,
        kind: control.kind,
        label: control.label,
        options: [],
        multiSelect: false,
        dimension: '',
      };
    });
    const activeFilters = this.activeFilters ?? [];
    this.pillViews = activeFilters.map((filter, index) => ({
      index,
      field: filter.label ?? filter.field,
      value: String(filter.value),
      remove: () => this.onFiltersChange?.(activeFilters.filter((_value, j) => j !== index)),
    }));
  }
}
