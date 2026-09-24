import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AreaChart } from '../../dist/lib/AreaChart.js';

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

class AreaChartHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [AreaChart],
  template: `
    <st-dataviz-area-chart
      [store]="store"
      viewId="revenue"
      category="service"
      measure="amount"
      label="Revenue by service"
      class="lot1-area"
    ></st-dataviz-area-chart>
  `,
})(AreaChartHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('AreaChart (angular)', () => {
  it('renders the DS AreaChart for the cross-filtered categorical series', () => {
    const fixture = TestBed.createComponent(AreaChartHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-areaChart')?.getAttribute('class')?.split(' ')).toContain('lot1-area');
    expect(root.querySelector('.st-areaChart__visual')?.getAttribute('aria-label')).toBe('Revenue by service');
    expect(root.querySelectorAll('circle.st-areaChart__dot')).toHaveLength(2);
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe(
      'Data values for Revenue by service',
    );
    expect(dataList(root)).toEqual(['checkout: 15', 'billing: 7']);
  });

  it('follows a selection made in another cross-filter view', () => {
    const fixture = TestBed.createComponent(AreaChartHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('table', 'checkout');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['checkout: 15']);
  });
});
