import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { CrossfilteredBarChart } from '../../dist/lib/CrossfilteredBarChart.js';

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
    crossfilter: { views: { v: { field: 'service' }, other: { field: 'service' } } },
  });
}

class Host {
  readonly store = newStore();
  selectable = true;
}

Component({
  standalone: true,
  imports: [CrossfilteredBarChart],
  template: `
    <st-dataviz-crossfiltered-bar-chart
      [store]="store"
      viewId="v"
      dimension="service"
      measure="amount"
      label="Revenue"
      [selectable]="selectable"
      class="probe"
    ></st-dataviz-crossfiltered-bar-chart>
  `,
})(Host);

const dataList = (root: Element): string[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim() ?? '');

describe('CrossfilteredBarChart (angular)', () => {
  it('renders one bar per distinct dimension value, aggregated from the crossfiltered rows', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const marker = root.querySelector('[data-st-component]');
    expect(marker?.getAttribute('data-st-component')).toBe('BarChart');
    expect(marker?.getAttribute('class')?.split(' ')).toEqual(expect.arrayContaining(['probe']));
    expect(dataList(root)).toEqual(['checkout: 15', 'billing: 7']);
    expect(root.querySelectorAll('rect.st-barChart__bar--interactive').length).toBe(2);
  });

  it('toggles this view\'s selection when a bar is clicked, and highlights it', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const store = fixture.componentInstance.store;

    const bar = root.querySelector<SVGRectElement>('rect.st-barChart__bar');
    bar!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().selections.v).toEqual(['checkout']);
    expect(root.querySelector('rect.st-barChart__bar')?.getAttribute('class')).toContain(
      'st-barChart__bar--selected',
    );

    bar!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(store.getState().selections.v ?? []).toEqual([]);
  });

  it('narrows its own bars when another view selects a value', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('other', 'billing');
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['billing: 7']);
  });

  it('renders no interactive affordance and ignores clicks when selectable is false', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.selectable = false;
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const store = fixture.componentInstance.store;

    expect(root.querySelectorAll('rect.st-barChart__bar--interactive').length).toBe(0);
    const bar = root.querySelector<SVGRectElement>('rect.st-barChart__bar');
    bar!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(store.getState().selections.v ?? []).toEqual([]);
  });
});
