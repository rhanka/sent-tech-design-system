import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { HeatmapChart } from '../../dist/lib/HeatmapChart.js';

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

class HeatmapChartHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [HeatmapChart],
  template: `
    <st-dataviz-heatmap-chart
      [store]="store"
      viewId="revenue"
      x="service"
      y="region"
      measure="amount"
      label="Revenue heatmap"
    ></st-dataviz-heatmap-chart>
  `,
})(HeatmapChartHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('HeatmapChart (angular)', () => {
  it('renders one DS Heatmap cell per x/y pair of the cross-filtered rows', () => {
    const fixture = TestBed.createComponent(HeatmapChartHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-heatmapChart')).not.toBeNull();
    expect(root.querySelector('.st-heatmapChart__visual')?.getAttribute('aria-label')).toBe('Revenue heatmap');
    expect(root.querySelectorAll('rect.st-heatmapChart__cell')).toHaveLength(4);
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe('Data values for Revenue heatmap');
    expect(dataList(root)).toEqual([
      'eu, checkout: 10',
      'eu, billing: 7',
      'us, checkout: 5',
      'us, billing: 0',
    ]);
  });

  it('drops the empty pairs once another view narrows the rows', () => {
    const fixture = TestBed.createComponent(HeatmapChartHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('table', 'billing');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['eu, billing: 7']);
  });
});
