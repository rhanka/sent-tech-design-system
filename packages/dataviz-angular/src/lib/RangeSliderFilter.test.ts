import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { numericDomain, rangeBoundsToSpec, RangeSliderFilter } from '../../dist/lib/RangeSliderFilter.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'score', label: 'Score', type: 'continuous' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'eu', score: 10, amount: 7 },
  { region: 'us', score: 20, amount: 5 },
  { region: 'eu', score: 30, amount: 9 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [RangeSliderFilter],
  template: `<st-dataviz-range-slider-filter [store]="store" dimension="score" class="probe"></st-dataviz-range-slider-filter>`,
})(Host);

describe('numericDomain / rangeBoundsToSpec (angular)', () => {
  it('ignores non-finite cells and reports { min: 0, max: 0 } when empty', () => {
    expect(numericDomain([{ s: 4 }, { s: 'x' }, { s: NaN }, { s: 9 }], 's')).toEqual({ min: 4, max: 9 });
    expect(numericDomain([{ s: 'x' }], 's')).toEqual({ min: 0, max: 0 });
  });

  it('returns null when the handles span the whole domain, normalising swapped bounds', () => {
    expect(rangeBoundsToSpec(10, 30, { min: 10, max: 30 })).toBeNull();
    expect(rangeBoundsToSpec(30, 10, { min: 10, max: 30 })).toBeNull();
    expect(rangeBoundsToSpec(10, 20, { min: 10, max: 30 })).toEqual({ kind: 'range', min: 10, max: 20 });
    expect(rangeBoundsToSpec(20, 10, { min: 10, max: 30 })).toEqual({ kind: 'range', min: 10, max: 20 });
  });
});

describe('RangeSliderFilter (angular)', () => {
  it('renders a DS RangeSlider labelled with the dimension label and leaves the full domain unfiltered', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-field__label')?.textContent?.trim()).toBe('Score');
    expect(root.querySelector('div.st-field')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
    expect(fixture.componentInstance.store.getState().filters.score).toBeUndefined();
  });

  it('writes a core range filter when the slider emits narrowed handles', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as RangeSliderFilter;

    adapter.handleValueChange([10, 20]);
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.score).toEqual({
      kind: 'range',
      min: 10,
      max: 20,
    });
  });
});
