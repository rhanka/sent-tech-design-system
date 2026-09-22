import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createDashboardStore,
  rangeSelectionKey,
  type DataModel,
  type DateHistogramBin,
  type Row,
} from '@sentropic/dataviz-core';
import { describe, expect, it } from 'vitest';
import { DateHistogramChart } from '../../dist/lib/DateHistogramChart.js';
import { QueryBar } from '../../dist/lib/QueryBar.js';

const DAY = 24 * 60 * 60 * 1000;
const start = Date.UTC(2026, 0, 1);

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'message', label: 'Message', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
  ],
  measures: [],
};

const rows: Row[] = [
  { service: 'checkout', message: 'payment accepted', ts: start + 1_000 },
  { service: 'billing', message: 'payment retried', ts: start + 2_000 },
  { service: 'auth', message: 'token refreshed', ts: start + DAY + 1_000 },
];

class DatavizAngularSmokeHost {
  readonly store = createDashboardStore({
    model,
    data: rows,
    crossfilter: {
      views: {
        events: { field: 'ts', selection: 'range' },
        table: { field: 'ts' },
      },
    },
  });

  readonly formatLabel = (bin: DateHistogramBin) => `day ${bin.index + 1}`;
}

Component({
  standalone: true,
  imports: [QueryBar, DateHistogramChart],
  template: `
    <st-dataviz-query-bar
      [store]="store"
      dimension="service"
      [fields]="['message']"
      label="Messages"
      placeholder="Search messages"
    ></st-dataviz-query-bar>
    <st-dataviz-date-histogram-chart
      [store]="store"
      viewId="events"
      date="ts"
      interval="day"
      label="Events by day"
      [formatLabel]="formatLabel"
    ></st-dataviz-date-histogram-chart>
  `,
})(DatavizAngularSmokeHost);

describe('dataviz angular DOM smoke', () => {
  it('renders real DS Angular Search and BarChart surfaces', async () => {
    const fixture = TestBed.createComponent(DatavizAngularSmokeHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input.st-search__input') as HTMLInputElement | null;
    expect(input).not.toBeNull();

    input!.value = 'payment';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.service).toEqual({
      kind: 'include',
      values: ['checkout', 'billing'],
    });

    const bars = Array.from(root.querySelectorAll<SVGRectElement>('rect.st-barChart__bar'));
    expect(bars).toHaveLength(1);
    bars[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().selections.events).toEqual([
      rangeSelectionKey(start, start + DAY - 1),
    ]);
  });
});
