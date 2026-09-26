import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import {
  DEFAULT_RELATIVE_PRESETS,
  relativeRangeToSpec,
  RelativeDateFilter,
} from '../../dist/lib/RelativeDateFilter.js';

const NOW = new Date(Date.UTC(2026, 3, 10, 12, 0, 0));
const DAY = 86_400_000;

const model: DataModel = {
  dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { ts: NOW.getTime() - DAY, amount: 10 },
  { ts: NOW.getTime() - 40 * DAY, amount: 5 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
  readonly now = NOW;
}

Component({
  standalone: true,
  imports: [RelativeDateFilter],
  template: `<st-dataviz-relative-date-filter [store]="store" dimension="ts" [now]="now" class="probe"></st-dataviz-relative-date-filter>`,
})(Host);

describe('relativeRangeToSpec (angular)', () => {
  it('returns null for the "all" preset and a trailing window otherwise', () => {
    expect(relativeRangeToSpec(null, NOW)).toBeNull();
    expect(relativeRangeToSpec(7, NOW)).toEqual({
      kind: 'range',
      min: NOW.getTime() - 7 * DAY,
      max: NOW.getTime(),
    });
  });

  it('ships the five documented default presets', () => {
    expect(DEFAULT_RELATIVE_PRESETS.map((p) => p.value)).toEqual(['all', '7d', '30d', '90d', '365d']);
  });
});

describe('RelativeDateFilter (angular)', () => {
  it('renders a DS Select with the default label and clears the filter for "all"', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-field__label')?.textContent?.trim()).toBe('Période');
    expect(fixture.componentInstance.store.getState().filters.ts).toBeUndefined();
  });

  it('writes a trailing-window range filter when a preset is picked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as RelativeDateFilter;

    adapter.handleSelect('7d');
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.ts).toEqual({
      kind: 'range',
      min: NOW.getTime() - 7 * DAY,
      max: NOW.getTime(),
    });
  });
});
