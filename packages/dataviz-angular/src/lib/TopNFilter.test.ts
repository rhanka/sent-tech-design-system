import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { TopNFilter } from '../../dist/lib/TopNFilter.js';

const model: DataModel = {
  dimensions: [{ id: 'region', label: 'Region', type: 'discrete' }],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'eu', amount: 10 },
  { region: 'us', amount: 5 },
  { region: 'eu', amount: 3 },
  { region: 'apac', amount: 2 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [TopNFilter],
  template: `<st-dataviz-top-n-filter [store]="store" dimension="region" measure="amount" [defaultN]="1" class="probe"></st-dataviz-top-n-filter>`,
})(Host);

describe('TopNFilter (angular)', () => {
  it('renders a DS NumberInput and restricts the dimension to the top-N values on mount', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-field__label')?.textContent?.trim()).toBe('Top N');
    // eu totals 13, us 5, apac 2: top-1 is eu.
    expect(fixture.componentInstance.store.getState().filters.region).toEqual({
      kind: 'include',
      values: ['eu'],
    });
  });

  it('re-ranks when N changes through the input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as TopNFilter;

    adapter.handleValueChange(2);
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.region).toEqual({
      kind: 'include',
      values: ['eu', 'us'],
    });
  });

  it('ignores a non-finite N instead of writing a filter', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as TopNFilter;

    adapter.handleValueChange(NaN);
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.region).toEqual({
      kind: 'include',
      values: ['eu'],
    });
  });
});
