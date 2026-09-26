import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AdvancedPivotDataTable } from '../../dist/lib/AdvancedPivotDataTable.js';
import type { AdvancedPivotTableRowView } from '../../dist/lib/advancedPivotData.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'channel', label: 'Channel', type: 'discrete' },
    { id: 'month', label: 'Month', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', category: 'A', channel: 'web', month: 'Jan', revenue: 100 },
  { country: 'FR', category: 'B', channel: 'web', month: 'Feb', revenue: 50 },
  { country: 'US', category: 'A', channel: 'store', month: 'Jan', revenue: 200 },
  { country: 'US', category: 'B', channel: 'store', month: 'Feb', revenue: 100 },
];

function newStore() {
  return createDashboardStore({ model, data });
}

class FullHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [AdvancedPivotDataTable],
  template: `
    <st-dataviz-advanced-pivot-data-table
      [store]="store"
      [rows]="['country', 'category']"
      [columns]="['channel']"
      [measures]="['revenue']"
      [includeSubtotals]="true"
      [heatmap]="true"
      sparklineDimension="month"
      caption="Advanced pivot"
      class="lot10-pivot"
    ></st-dataviz-advanced-pivot-data-table>
  `,
})(FullHost);

class CollapsedHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [AdvancedPivotDataTable],
  template: `
    <st-dataviz-advanced-pivot-data-table
      [store]="store"
      [rows]="['country', 'category']"
      [measures]="['revenue']"
      [includeSubtotals]="true"
      [collapsedRowPaths]="['FR']"
    ></st-dataviz-advanced-pivot-data-table>
  `,
})(CollapsedHost);

class ToggleHost {
  readonly store = newStore();
  readonly onToggleRowPath = vi.fn(
    (_rowId: string, _row: AdvancedPivotTableRowView): void => undefined,
  );
}

Component({
  standalone: true,
  imports: [AdvancedPivotDataTable],
  template: `
    <st-dataviz-advanced-pivot-data-table
      [store]="store"
      [rows]="['country', 'category']"
      [measures]="['revenue']"
      [includeSubtotals]="true"
      [onToggleRowPath]="onToggleRowPath"
    ></st-dataviz-advanced-pivot-data-table>
  `,
})(ToggleHost);

class FilterHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [AdvancedPivotDataTable],
  template: `
    <st-dataviz-advanced-pivot-data-table
      [store]="store"
      [rows]="['country', 'category']"
      [measures]="['revenue']"
    ></st-dataviz-advanced-pivot-data-table>
  `,
})(FilterHost);

const headers = (root: Element): (string | undefined)[] =>
  Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent?.trim().split('↕')[0]);

const rowWith = (root: Element, text: string): HTMLTableRowElement | undefined =>
  Array.from(root.querySelectorAll('tbody tr')).find((tr) =>
    tr.textContent?.includes(text),
  ) as HTMLTableRowElement | undefined;

describe('AdvancedPivotDataTable (angular)', () => {
  it('renders subtotals, heat metadata and sparkline summaries', () => {
    const fixture = TestBed.createComponent(FullHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-st-component="DataTable"]')).not.toBeNull();
    expect(root.querySelector('table.lot10-pivot')).not.toBeNull();
    expect(root.querySelector('caption')?.textContent?.trim()).toBe('Advanced pivot');
    expect(headers(root)).toEqual(['Country', 'Category', 'web · Revenue', 'store · Revenue']);
    expect(root.textContent).toContain('FR subtotal');
    expect(root.textContent).toContain('150 heat 50% sparkline Jan 100, Feb 50');
    expect(root.textContent).toContain('0 heat 0% sparkline');
  });

  it('hides descendants of collapsed subtotal paths', () => {
    const fixture = TestBed.createComponent(CollapsedHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('FR subtotal');
    expect(root.textContent).not.toContain('FR A');
    expect(root.textContent).toContain('US subtotal');
    expect(root.textContent).toContain('US A');
  });

  it('emits subtotal row toggles from DS row clicks, and ignores leaf rows', () => {
    const fixture = TestBed.createComponent(ToggleHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const spy = fixture.componentInstance.onToggleRowPath;

    rowWith(root, 'FR A')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).not.toHaveBeenCalled();

    rowWith(root, 'FR subtotal')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).toHaveBeenCalledWith('FR', expect.objectContaining({ __kind: 'subtotal' }));
  });

  it('updates when the shared filter state changes', () => {
    const fixture = TestBed.createComponent(FilterHost);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('US A');

    store.setFilter('country', { kind: 'include', values: ['FR'] });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('US A');
    expect(text).toContain('FR A');
  });
});
