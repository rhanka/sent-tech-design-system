import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DonutChart } from '../../dist/lib/DonutChart.js';

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

class DonutChartHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [DonutChart],
  template: `
    <st-dataviz-donut-chart
      [store]="store"
      viewId="revenue"
      category="service"
      measure="amount"
      label="Revenue share"
    ></st-dataviz-donut-chart>
  `,
})(DonutChartHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('DonutChart (angular)', () => {
  it('renders the DS DonutChart slices for the part-of-whole model', () => {
    const fixture = TestBed.createComponent(DonutChartHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-donutChart')).not.toBeNull();
    expect(root.querySelector('.st-donutChart__visual')?.getAttribute('aria-label')).toBe('Revenue share');
    expect(root.querySelectorAll('path.st-donutChart__slice').length).toBeGreaterThan(0);
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe(
      'Data values for Revenue share',
    );
    expect(dataList(root)).toEqual(['checkout: 15 (68%)', 'billing: 7 (32%)']);
  });

  it('recomputes the shares when another view narrows the rows', () => {
    const fixture = TestBed.createComponent(DonutChartHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('table', 'billing');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['billing: 7 (100%)']);
  });
});
