import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SelectionLegend } from '../../dist/lib/SelectionLegend.js';
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

class SelectionLegendHost {
  readonly store = newStore();
  readonly labels = { revenue: 'Service', table: 'Rows' };
}

Component({
  standalone: true,
  imports: [SelectionLegend],
  template: `
    <st-dataviz-selection-legend [store]="store" [labels]="labels"></st-dataviz-selection-legend>
  `,
})(SelectionLegendHost);

describe('SelectionLegend (angular)', () => {
  it('renders nothing while no view holds a selection', () => {
    const fixture = TestBed.createComponent(SelectionLegendHost);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.st-selectionChip')).toBeNull();
  });

  it('renders one DS SelectionChip per selecting view, labelled from the map', () => {
    const fixture = TestBed.createComponent(SelectionLegendHost);
    fixture.detectChanges();
    fixture.componentInstance.store.toggleSelection('revenue', 'checkout');
    fixture.componentInstance.store.toggleSelection('revenue', 'billing');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    // `role`/`aria-label` sit on the `<st-inline>` host: DS Angular `Inline`
    // takes no ARIA input, so they cannot reach its inner `.st-inline` div
    // (React/Vue spread them onto that div instead).
    const group = root.querySelector('[role="group"]');
    expect(group?.tagName.toLowerCase()).toBe('st-inline');
    expect(group?.getAttribute('aria-label')).toBe('Sélections actives');
    expect(group?.querySelector('div.st-inline')).not.toBeNull();

    const chips = Array.from(root.querySelectorAll('.st-selectionChip'));
    expect(chips).toHaveLength(1);
    expect(chips[0]?.querySelector('.st-selectionChip__label')?.textContent?.trim()).toBe('Service');
    expect(chips[0]?.querySelector('.st-selectionChip__count')?.textContent?.trim()).toBe('(2)');
  });

  it('clears the view selection from the chip button and empties itself', () => {
    const fixture = TestBed.createComponent(SelectionLegendHost);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    store.toggleSelection('revenue', 'checkout');
    fixture.detectChanges();

    const clear = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button.st-selectionChip__clear',
    );
    expect(clear?.getAttribute('aria-label')).toBe('Effacer Service');
    clear?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().selections.revenue ?? []).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.st-selectionChip')).toBeNull();
  });
});
