import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DateRangeFilter, dateRangeToSpec } from '../../dist/lib/DateRangeFilter.js';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';

const T0 = Date.UTC(2026, 0, 1);
const DAY = 86_400_000;

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
    { id: 'closedAt', label: 'Closed at', type: 'continuous' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'latency', label: 'Latency', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', ts: T0, closedAt: T0 + DAY, amount: 10, latency: 120 },
  { service: 'checkout', region: 'us', ts: T0 + 1_000, closedAt: T0 + 2 * DAY, amount: 5, latency: 90 },
  { service: 'billing', region: 'eu', ts: T0 + DAY, closedAt: T0 + 3 * DAY, amount: 7, latency: 150 },
];

function newStore() {
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { revenue: { field: 'service' }, table: { field: 'service' } } },
  });
}

class DateRangeFilterHost {
  readonly store = newStore();
  dimension = 'ts';
}

Component({
  standalone: true,
  imports: [DateRangeFilter],
  template: `
    <st-dataviz-date-range-filter
      [store]="store"
      [dimension]="dimension"
      class="lot1-range"
    ></st-dataviz-date-range-filter>
  `,
})(DateRangeFilterHost);

describe('DateRangeFilter (angular)', () => {
  it('renders a DS DatePicker in range mode and leaves the dimension unfiltered on mount', () => {
    const fixture = TestBed.createComponent(DateRangeFilterHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-field')?.getAttribute('class')?.split(' ')).toContain('lot1-range');
    expect(root.querySelector('.st-field__label')?.textContent?.trim()).toBe('Période');
    const input = root.querySelector<HTMLInputElement>('input.st-datepicker__control');
    expect(input?.getAttribute('placeholder')).toBe('jj/mm/aaaa - jj/mm/aaaa');
    expect(input?.hasAttribute('readonly')).toBe(true);
    expect(fixture.componentInstance.store.getState().filters.ts).toBeUndefined();
  });

  it('writes a core range filter in epoch milliseconds when the picker emits a range', () => {
    const fixture = TestBed.createComponent(DateRangeFilterHost);
    fixture.detectChanges();
    const filter = fixture.debugElement.query(By.directive(DateRangeFilter))
      .componentInstance as InstanceType<typeof DateRangeFilter>;

    filter.handleValueChange({ start: new Date(T0), end: new Date(T0 + DAY) });
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.ts).toEqual({
      kind: 'range',
      min: T0,
      max: T0 + DAY,
    });
    expect(fixture.componentInstance.store.applyCrossfilter('table').map((row) => row.ts)).toEqual([
      T0,
      T0 + 1_000,
      T0 + DAY,
    ]);

    filter.handleValueChange(null);
    fixture.detectChanges();
    expect(fixture.componentInstance.store.getState().filters.ts).toBeUndefined();
  });

  it('re-applies the held range when the dimension input changes', () => {
    const fixture = TestBed.createComponent(DateRangeFilterHost);
    fixture.detectChanges();
    const filter = fixture.debugElement.query(By.directive(DateRangeFilter))
      .componentInstance as InstanceType<typeof DateRangeFilter>;
    const store = fixture.componentInstance.store;

    filter.handleValueChange({ start: new Date(T0), end: new Date(T0 + DAY) });
    fixture.detectChanges();
    expect(store.getState().filters.ts).toEqual({ kind: 'range', min: T0, max: T0 + DAY });

    fixture.componentInstance.dimension = 'closedAt';
    // No zone.js in this setup, so `detectChanges()` only refreshes dirty views:
    // a plain host-field mutation needs an explicit `markForCheck()` first.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(store.getState().filters.closedAt).toEqual({ kind: 'range', min: T0, max: T0 + DAY });
  });

  it('maps an open-ended range to a one-sided spec, and an empty range to null', () => {
    expect(dateRangeToSpec({ start: new Date(T0), end: null })).toEqual({ kind: 'range', min: T0, max: undefined });
    expect(dateRangeToSpec({ start: null, end: new Date(T0) })).toEqual({ kind: 'range', min: undefined, max: T0 });
    expect(dateRangeToSpec({ start: null, end: null })).toBeNull();
  });
});
