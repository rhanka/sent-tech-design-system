import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import {
  createDashboardStore,
  rangeSelectionKey,
  type DataModel,
  type DateHistogramBin,
  type Row,
} from '@sentropic/dataviz-core';
import { DateHistogramChart } from '../../dist/lib/DateHistogramChart.js';

const DAY = 24 * 60 * 60 * 1000;
const start = Date.UTC(2026, 0, 1);

const model: DataModel = {
  dimensions: [{ id: 'ts', label: 'Timestamp', type: 'continuous' }],
  measures: [],
};

const rows: Row[] = [
  { ts: start + 1_000 },
  { ts: start + 2_000 },
  { ts: start + DAY + 1_000 },
];

class DateHistogramChartHost {
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
  imports: [DateHistogramChart],
  template: `
    <st-dataviz-date-histogram-chart
      [store]="store"
      viewId="events"
      date="ts"
      interval="day"
      label="Events by day"
      [formatLabel]="formatLabel"
    ></st-dataviz-date-histogram-chart>
  `,
})(DateHistogramChartHost);

const dataList = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim());

describe('DateHistogramChart (angular)', () => {
  it('maps date buckets to DS BarChart data and its accessible value list', () => {
    const fixture = TestBed.createComponent(DateHistogramChartHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const chart = fixture.debugElement.query(By.directive(DateHistogramChart))
      .componentInstance as InstanceType<typeof DateHistogramChart>;

    expect(root.querySelector('div.st-barChart')?.getAttribute('class')?.split(' ')).toContain(
      'st-dateHistogramChart',
    );
    expect(root.querySelectorAll('rect.st-barChart__bar')).toHaveLength(2);
    expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe(
      'Data values for Events by day',
    );
    expect(dataList(root)).toEqual(['day 1: 2', 'day 2: 1']);
    expect(chart.data).toEqual([
      { label: 'day 1', value: 2 },
      { label: 'day 2', value: 1 },
    ]);
    expect(chart.chartSelectedKeys).toEqual([]);
  });

  it('stores a scoped range selection that filters the other views only', () => {
    const fixture = TestBed.createComponent(DateHistogramChartHost);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    const chart = fixture.debugElement.query(By.directive(DateHistogramChart))
      .componentInstance as InstanceType<typeof DateHistogramChart>;

    chart.handleBarSelect('day 1');
    fixture.detectChanges();

    expect(store.getState().filters.ts).toBeUndefined();
    expect(store.getState().selections.events).toEqual([rangeSelectionKey(start, start + DAY - 1)]);
    expect(chart.chartSelectedKeys).toEqual(['day 1']);
    expect(store.applyCrossfilter('events').map((row) => row.ts)).toEqual([
      start + 1_000,
      start + 2_000,
      start + DAY + 1_000,
    ]);
    expect(store.applyCrossfilter('table').map((row) => row.ts)).toEqual([start + 1_000, start + 2_000]);
  });

  it('follows a click on the rendered DS bar', () => {
    const fixture = TestBed.createComponent(DateHistogramChartHost);
    fixture.detectChanges();
    const bars = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<SVGRectElement>('rect.st-barChart__bar'),
    );

    bars[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().selections.events).toEqual([
      rangeSelectionKey(start, start + DAY - 1),
    ]);
  });
});
