import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { TreemapChart } from '../../dist/lib/TreemapChart.js';

const T0 = Date.UTC(2026, 0, 1);
const DAY = 86_400_000;

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'latency', label: 'Latency', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', ts: T0, amount: 10, latency: 120 },
  { service: 'checkout', region: 'us', ts: T0 + 1_000, amount: 5, latency: 90 },
  { service: 'billing', region: 'eu', ts: T0 + DAY, amount: 7, latency: 150 },
];

function newStore() {
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { revenue: { field: 'service' }, table: { field: 'service' } } },
  });
}

class TreemapChartHost {
  readonly store = newStore();
  readonly hierarchy = ['region', 'service'];
}

Component({
  standalone: true,
  imports: [TreemapChart],
  template: `
    <st-dataviz-treemap-chart
      [store]="store"
      viewId="revenue"
      [hierarchy]="hierarchy"
      measure="amount"
      label="Revenue treemap"
    ></st-dataviz-treemap-chart>
  `,
})(TreemapChartHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('TreemapChart (angular)', () => {
  it('renders one DS Treemap leaf per hierarchy path of the cross-filtered rows', () => {
    const fixture = TestBed.createComponent(TreemapChartHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-treemapChart')).not.toBeNull();
    expect(root.querySelector('.st-treemapChart__visual')?.getAttribute('aria-label')).toBe('Revenue treemap');
    expect(root.querySelectorAll('rect.st-treemapChart__rect')).toHaveLength(3);
    // The DS Angular TreemapChart labels its data list `<label> data`; the DS
    // React one labels it `Data values for <label>` (a components-* divergence).
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe('Revenue treemap data');
    expect(dataList(root)).toEqual(['eu, checkout: 10', 'eu, billing: 7', 'us, checkout: 5']);
  });

  it('rebuilds the hierarchy when another view narrows the rows', () => {
    const fixture = TestBed.createComponent(TreemapChartHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('table', 'checkout');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['eu, checkout: 10', 'us, checkout: 5']);
  });
});
