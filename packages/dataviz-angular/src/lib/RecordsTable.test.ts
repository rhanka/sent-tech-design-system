import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RecordsTable } from '../../dist/lib/RecordsTable.js';
import type { ConditionalFormat } from '@sentropic/dataviz-core';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';

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

class RecordsTableHost {
  readonly store = newStore();
  readonly conditionalFormat: Record<string, ConditionalFormat> = {
    amount: [{ condition: { comparator: 'gt', value: 8 }, intent: 'positive' }],
  };
}

Component({
  standalone: true,
  imports: [RecordsTable],
  template: `
    <st-dataviz-records-table
      [store]="store"
      viewId="table"
      caption="Records"
      [conditionalFormat]="conditionalFormat"
      class="lot1-table"
    ></st-dataviz-records-table>
  `,
})(RecordsTableHost);

const headers = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent?.trim().split('↕')[0]);

/** Cell text without the DS visually-hidden decoration label. */
const cells = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('tbody td')).map((td) => {
    const clone = td.cloneNode(true) as Element;
    for (const hidden of Array.from(clone.querySelectorAll('.st-visually-hidden'))) hidden.remove();
    return clone.textContent?.trim();
  });

describe('RecordsTable (angular)', () => {
  it('renders the model fields as DS DataTable columns and the view rows as cells', () => {
    const fixture = TestBed.createComponent(RecordsTableHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-dataTable-wrap')).not.toBeNull();
    expect(root.querySelector('table')?.getAttribute('class')?.split(' ')).toContain('lot1-table');
    expect(root.querySelector('caption')?.textContent?.trim()).toBe('Records');
    expect(headers(root)).toEqual(['Service', 'Region', 'Timestamp', 'Amount', 'Latency']);
    expect(cells(root)).toEqual([
      'checkout',
      'eu',
      String(T0),
      '10',
      '120',
      'checkout',
      'us',
      String(T0 + 1_000),
      '5',
      '90',
      'billing',
      'eu',
      String(T0 + DAY),
      '7',
      '150',
    ]);
    // Measures are right-aligned, dimensions start-aligned (same rule as React/Vue).
    expect(Array.from(root.querySelectorAll('thead th')).map((th) => th.className.includes('st-dataTable__cell--end'))).toEqual(
      [false, false, false, true, true],
    );
  });

  it('forwards the core conditional-format decorations to the DS cells', () => {
    const fixture = TestBed.createComponent(RecordsTableHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const decorated = Array.from(root.querySelectorAll('tbody td.st-cell--intent-positive'));
    expect(decorated).toHaveLength(1);
    expect(decorated[0]?.textContent).toContain('10');
  });

  it('shows only the rows another view leaves visible', () => {
    const fixture = TestBed.createComponent(RecordsTableHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('revenue', 'billing');
    fixture.detectChanges();

    expect(cells(fixture.nativeElement as HTMLElement)).toEqual([
      'billing',
      'eu',
      String(T0 + DAY),
      '7',
      '150',
    ]);
  });
});
