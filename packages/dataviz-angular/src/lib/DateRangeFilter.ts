import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  DatePicker,
  type DatePickerRange,
  type DatePickerValue,
} from '@sentropic/design-system-angular';
import type { DashboardStore, FilterSpec } from '@sentropic/dataviz-core';

export type DateRangeFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  class?: string;
};

/**
 * Pure: a DatePicker `{ start, end }` range → a core `range` FilterSpec in epoch
 * milliseconds (bounds optional), or `null` when the range is empty.
 */
export function dateRangeToSpec(range: { start: Date | null; end: Date | null }): FilterSpec | null {
  const min = range.start ? range.start.getTime() : undefined;
  const max = range.end ? range.end.getTime() : undefined;
  if (min === undefined && max === undefined) return null;
  return { kind: 'range', min, max };
}

const asRange = (value: DatePickerValue): DatePickerRange =>
  value && typeof value === 'object' && 'start' in value ? value : { start: null, end: null };

/**
 * A date-range filter: a design-system DatePicker (range mode) bound to a core
 * `range` filter on a date dimension (epoch-millisecond cells).
 */
@Component({
  selector: 'st-dataviz-date-range-filter',
  standalone: true,
  imports: [DatePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-date-picker
      mode="range"
      [label]="label"
      [value]="range"
      [class]="classInput"
      (modelValueChange)="handleValueChange($event)"
    ></st-date-picker>
  `,
})
export class DateRangeFilter implements OnInit, OnChanges {
  static readonly stComponentName = 'DateRangeFilter';

  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('DateRangeFilter: store is required.');
    }
    return this.storeValue;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput() label = 'Période';
  @NgInput('class') classInput?: string;

  /** Local picker state; mirrors the React `useState` / Vue `ref` range. */
  range: DatePickerRange = { start: null, end: null };

  ngOnInit(): void {
    this.apply();
  }

  /**
   * Mirrors the React effect dependency list (`[store, dimension, range]`): a
   * new `store` or `dimension` re-applies the range the picker currently holds.
   */
  ngOnChanges(): void {
    this.apply();
  }

  handleValueChange(value: DatePickerValue): void {
    this.range = asRange(value);
    this.apply();
  }

  private apply(): void {
    const spec = dateRangeToSpec(this.range);
    if (spec) this.store.setFilter(this.dimension, spec);
    else this.store.clearFilter(this.dimension);
  }
}
