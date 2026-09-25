import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DrillBarChart } from '../../dist/lib/DrillBarChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'service', label: 'Service', type: 'discrete' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'eu', service: 'checkout', amount: 10 },
  { region: 'us', service: 'checkout', amount: 5 },
  { region: 'eu', service: 'billing', amount: 7 },
];

function newStore() {
  return createDashboardStore({ model, data: rows, crossfilter: { views: { v: { field: 'region' } } } });
}

class Host {
  readonly store = newStore();
  readonly hierarchy = ['region', 'service'];
}

Component({
  standalone: true,
  imports: [DrillBarChart],
  template: `
    <st-dataviz-drill-bar-chart
      [store]="store"
      viewId="v"
      [hierarchy]="hierarchy"
      measure="amount"
      label="Amount"
      class="probe"
    ></st-dataviz-drill-bar-chart>
  `,
})(Host);

const dataList = (root: Element): string[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim() ?? '');

const bars = (root: Element): SVGRectElement[] => Array.from(root.querySelectorAll('rect.st-barChart__bar'));

describe('DrillBarChart (angular)', () => {
  it('starts at the top of the hierarchy, grouped by its first dimension', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const marker = root.querySelector('[data-st-component]');
    expect(marker?.getAttribute('class')?.split(' ')).toEqual(expect.arrayContaining(['probe']));
    expect(dataList(root)).toEqual(['eu: 17', 'us: 5']);
  });

  it('drills into the next dimension and filters to the clicked value', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const store = fixture.componentInstance.store;

    bars(root)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['eu'] });
    expect(store.getState().drill.v).toEqual(['service']);
    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['checkout: 10', 'billing: 7']);
  });

  it('toggles a selection instead of drilling once the deepest level is reached', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const store = fixture.componentInstance.store;

    bars(root)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true })); // drill into 'eu'
    fixture.detectChanges();

    const leafBar = bars(fixture.nativeElement as HTMLElement)[0]!;
    leafBar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().selections.v).toEqual(['checkout']);
    expect(store.getState().drill.v).toEqual(['service']);
  });
});
