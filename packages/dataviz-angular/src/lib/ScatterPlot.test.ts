import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ScatterPlot } from '../../dist/lib/ScatterPlot.js';

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

class ScatterPlotHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [ScatterPlot],
  template: `
    <st-dataviz-scatter-plot
      [store]="store"
      viewId="revenue"
      x="amount"
      y="latency"
      label="Amount vs latency"
    ></st-dataviz-scatter-plot>
  `,
})(ScatterPlotHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('ScatterPlot (angular)', () => {
  it('renders one DS ScatterPlot point per row and the axis labels from the model', () => {
    const fixture = TestBed.createComponent(ScatterPlotHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-scatterPlot')).not.toBeNull();
    expect(root.querySelector('.st-scatterPlot__visual')?.getAttribute('aria-label')).toBe('Amount vs latency');
    expect(root.querySelectorAll('circle.st-scatterPlot__point')).toHaveLength(3);
    const axisLabels = Array.from(root.querySelectorAll('text.st-scatterPlot__axisLabel')).map((t) =>
      t.textContent?.trim(),
    );
    expect(axisLabels).toEqual(['Amount', 'Latency']);
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe(
      'Data values for Amount vs latency',
    );
    expect(dataList(root)).toEqual(['x 10, y 120', 'x 5, y 90', 'x 7, y 150']);
  });

  it('drops the points filtered out by another view', () => {
    const fixture = TestBed.createComponent(ScatterPlotHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('table', 'billing');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['x 7, y 150']);
  });
});
