import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { Select, type SelectOption } from '@sentropic/design-system-angular';
import type { DashboardStore, FilterSpec } from '@sentropic/dataviz-core';

/**
 * A relative-date preset: a labelled choice resolving to a trailing window of
 * `days` ending "now", or `null` days for "all" (no filter).
 */
export type RelativeDatePreset = {
  value: string;
  label: string;
  /** Trailing window length in days, or `null` for "all" (clears the filter). */
  days: number | null;
};

export type RelativeDateFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  /** Selectable presets; defaults to {@link DEFAULT_RELATIVE_PRESETS}. */
  presets?: RelativeDatePreset[];
  /** Reference "now" for the trailing windows; defaults to the current time. */
  now?: Date;
  class?: string;
};

/** Default relative-date presets: all / 7 / 30 / 90 days / 12 months. */
export const DEFAULT_RELATIVE_PRESETS: RelativeDatePreset[] = [
  { value: 'all', label: 'Tout', days: null },
  { value: '7d', label: '7 derniers jours', days: 7 },
  { value: '30d', label: '30 derniers jours', days: 30 },
  { value: '90d', label: '90 derniers jours', days: 90 },
  { value: '365d', label: '12 derniers mois', days: 365 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure: a trailing window of `days` ending at `now` → a core `range` FilterSpec
 * in epoch milliseconds, or `null` when `days` is `null` ("all", no filter).
 */
export function relativeRangeToSpec(days: number | null, now: Date): FilterSpec | null {
  if (days == null) return null;
  const max = now.getTime();
  return { kind: 'range', min: max - days * DAY_MS, max };
}

/**
 * A relative-date filter: a design-system Select of trailing-window presets
 * bound to a core `range` filter on a date dimension (epoch-millisecond cells).
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` keeps the selected
 * preset in a plain `ref` watched for its side effect, never read as a
 * rendered value, so there is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-relative-date-filter',
  standalone: true,
  imports: [Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-select
      [label]="label"
      [modelValue]="selected"
      [options]="presetOptions"
      [class]="classInput"
      (modelValueChange)="handleSelect($event)"
    ></st-select>
  `,
})
export class RelativeDateFilter implements OnInit, OnChanges {
  static readonly stComponentName = 'RelativeDateFilter';

  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('RelativeDateFilter: store is required.');
    }
    return this.storeValue;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput() label = 'Période';
  @NgInput() presets: RelativeDatePreset[] = DEFAULT_RELATIVE_PRESETS;
  @NgInput() now?: Date;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  selected = 'all';
  presetOptions: SelectOption[] = [];

  private selectedInit = false;
  private baseNow?: Date;

  ngOnInit(): void {
    this.recompute();
    this.apply();
  }

  /**
   * Mirrors the React effect dependency list (`[store, dimension, selected,
   * presets]`): a new `store` or `dimension` re-applies the preset the select
   * currently holds.
   */
  ngOnChanges(): void {
    this.recompute();
    this.apply();
  }

  handleSelect(value: string): void {
    this.selected = value;
    this.apply();
  }

  private recompute(): void {
    if (!this.selectedInit) {
      this.selected = this.presets[0]?.value ?? 'all';
      this.selectedInit = true;
    }
    this.presetOptions = this.presets.map((p) => ({ value: p.value, label: p.label }));
  }

  private apply(): void {
    if (!this.storeValue) return;
    if (!this.baseNow) this.baseNow = this.now ?? new Date();
    const preset = this.presets.find((p) => p.value === this.selected);
    const spec = preset ? relativeRangeToSpec(preset.days, this.baseNow) : null;
    if (spec) this.store.setFilter(this.dimension, spec);
    else this.store.clearFilter(this.dimension);
  }
}
