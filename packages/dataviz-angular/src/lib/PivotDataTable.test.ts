import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PivotDataTable } from '../../dist/lib/PivotDataTable.js';
import type { ConditionalFormat } from '@sentropic/dataviz-core';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'FR', sales: 5 },
  { country: 'US', sales: 20 },
];

function newStore() {
  return createDashboardStore({ model, data });
}

class PivotDataTableHost {
  readonly store = newStore();
  // Keyed by the pivot engine's own generated column key (`value:<measureId>`
  // with no column dimension), as the PivotDataTableProps doc comment says.
  readonly conditionalFormat: Record<string, ConditionalFormat> = {
    'value:sales': [{ condition: { comparator: 'eq', value: 15 }, intent: 'positive' }],
  };
}

Component({
  standalone: true,
  imports: [PivotDataTable],
  template: `
    <st-dataviz-pivot-data-table
      [store]="store"
      [rows]="['country']"
      [measures]="['sales']"
      [conditionalFormat]="conditionalFormat"
      caption="Pivot"
      class="lot7-pivot"
    ></st-dataviz-pivot-data-table>
  `,
})(PivotDataTableHost);

const headers = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent?.trim().split('↕')[0]);

/** Cell text without the DS visually-hidden decoration label. */
const cells = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('tbody td')).map((td) => {
    const clone = td.cloneNode(true) as Element;
    for (const hidden of Array.from(clone.querySelectorAll('.st-visually-hidden'))) hidden.remove();
    return clone.textContent?.trim();
  });

describe('PivotDataTable (angular)', () => {
  it('renders a DS DataTable from the core pivot model', () => {
    const fixture = TestBed.createComponent(PivotDataTableHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-dataTable-wrap')).not.toBeNull();
    expect(root.querySelector('table')?.getAttribute('class')?.split(' ')).toContain('lot7-pivot');
    expect(root.querySelector('caption')?.textContent?.trim()).toBe('Pivot');
    expect(headers(root)).toEqual(['Pays', 'Ventes']);
    expect(cells(root)).toEqual(['FR', '15', 'US', '20']);
    // The value column is right-aligned, the row dimension start-aligned (same
    // rule as RecordsTable / the React and Vue counterparts).
    expect(
      Array.from(root.querySelectorAll('thead th')).map((th) => th.className.includes('st-dataTable__cell--end')),
    ).toEqual([false, true]);
  });

  it('forwards the FR-6 conditional-format decorations, keyed by the pivot column key', () => {
    const fixture = TestBed.createComponent(PivotDataTableHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const decorated = Array.from(root.querySelectorAll('tbody td.st-cell--intent-positive'));
    expect(decorated).toHaveLength(1);
    expect(decorated[0]?.textContent).toContain('15');
  });

  it('re-pivots when a shared filter narrows the underlying rows', () => {
    const fixture = TestBed.createComponent(PivotDataTableHost);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('country', { kind: 'include', values: ['FR'] });
    fixture.detectChanges();

    expect(cells(fixture.nativeElement as HTMLElement)).toEqual(['FR', '15']);
  });

  it('degrades to an empty table instead of throwing when the pivot config names an unknown dimension', () => {
    class BadHost {
      readonly store = newStore();
    }
    Component({
      standalone: true,
      imports: [PivotDataTable],
      template: `<st-dataviz-pivot-data-table [store]="store" [rows]="['not-a-dimension']" [measures]="['sales']"></st-dataviz-pivot-data-table>`,
    })(BadHost);
    const fixture = TestBed.createComponent(BadHost);

    expect(() => fixture.detectChanges()).not.toThrow();
    const root = fixture.nativeElement as HTMLElement;
    // The DS DataTable renders its own "No data" row for an empty `rows` array;
    // the adapter degrades to that rather than throwing or hand-rolling a state.
    expect(root.querySelector('td.st-dataTable__empty')).not.toBeNull();
  });
});
