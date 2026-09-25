import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { Sparkline } from '../../dist/lib/Sparkline.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', amount: 10 },
  { service: 'checkout', region: 'us', amount: 5 },
  { service: 'billing', region: 'eu', amount: 7 },
];

function newStore() {
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { trend: { field: 'service' }, table: { field: 'service' } } },
  });
}

class SparklineHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [Sparkline],
  template: `
    <st-dataviz-sparkline [store]="store" viewId="trend" dimension="region" measure="amount" label="Amount trend" [area]="true" class="trend"></st-dataviz-sparkline>
  `,
})(SparklineHost);

/** The `d` of the line path, which is the only rendered trace of the values. */
function linePath(root: HTMLElement): string | null {
  return root.querySelector('path.st-sparkline__line')?.getAttribute('d') ?? null;
}

describe('Sparkline (angular)', () => {
  it('renders the DS Sparkline over the first series of the categorical model', () => {
    const fixture = TestBed.createComponent(SparklineHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const host = root.querySelector('[data-st-component="Sparkline"]');
    expect(host, 'the DS Sparkline').not.toBeNull();
    expect(host?.getAttribute('class')?.split(' ').sort()).toEqual([
      'st-sparkline',
      'st-sparkline--neutral',
      'trend',
    ]);
    // The DS component renders no value list, so the accessible name is what an
    // assistive technology reads, and the path is what a sighted reader sees.
    expect(host?.getAttribute('role')).toBe('img');
    expect(host?.getAttribute('aria-label')).toBe('Amount trend');
    // eu = 10 + 7 = 17, us = 5: two points, so a two-segment path, high then low.
    expect(linePath(root)).toBe('M2.00,2.00 L118.00,26.00');
    expect(root.querySelector('path.st-sparkline__area'), 'area path').not.toBeNull();
  });

  it('redraws when a store filter narrows the rows to one category', () => {
    const fixture = TestBed.createComponent(SparklineHost);
    fixture.detectChanges();
    const before = linePath(fixture.nativeElement as HTMLElement);

    fixture.componentInstance.store.setFilter('service', { kind: 'include', values: ['billing'] });
    fixture.detectChanges();

    const after = linePath(fixture.nativeElement as HTMLElement);
    // One category left: a single point, so the path collapses to one `M`, and a
    // flat series pins it to the bottom of the box (min === max).
    expect(after).not.toBe(before);
    expect(after).toBe('M2.00,26.00');
  });
});
