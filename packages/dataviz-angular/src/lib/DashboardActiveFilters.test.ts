import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DashboardActiveFilters } from '../../dist/lib/DashboardActiveFilters.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', amount: 10 },
  { service: 'billing', region: 'us', amount: 5 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [DashboardActiveFilters],
  template: `<st-dataviz-dashboard-active-filters [store]="store" class="probe"></st-dataviz-dashboard-active-filters>`,
})(Host);

describe('DashboardActiveFilters (angular)', () => {
  it('renders an empty, label-only bar with no clear-all button when there is no filter', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-filterBar')?.getAttribute('aria-label')).toBe('Filtres actifs');
    expect(root.querySelector('.st-filterBar')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
    expect(root.querySelectorAll('.st-filterPill').length).toBe(0);
    expect(root.querySelector('.st-filterBar__clearAll')).toBeNull();
  });

  it('renders one pill per active filter and a clear-all button', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('service', { kind: 'include', values: ['checkout', 'billing'] });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    // FilterPill has no operator here, so its field/value spans are adjacent
    // with no separator: this is DashboardFilterBar's own established
    // assertion shape (`'Servicecheckout'`), not a rendering defect.
    const pill = root.querySelector('.st-filterPill');
    expect(pill?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Servicecheckout, billing');
    expect(root.querySelector('.st-filterBar__clearAll')?.textContent?.trim()).toBe('Tout effacer');
  });

  it('clears one filter when its pill is removed', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    store.setFilter('service', { kind: 'include', values: ['checkout'] });
    store.setFilter('region', { kind: 'include', values: ['eu'] });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector<HTMLButtonElement>('.st-filterPill__remove')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(store.getState().filters.service).toBeUndefined();
    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['eu'] });
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.st-filterPill').length).toBe(1);
  });

  it('clears every filter, and only the filters, when "clear all" is clicked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    store.setFilter('service', { kind: 'include', values: ['checkout'] });
    store.setFilter('region', { kind: 'include', values: ['eu'] });
    store.toggleSelection('v', 'checkout');
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.st-filterBar__clearAll')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(store.getState().filters).toEqual({});
    expect(store.getState().selections.v).toEqual(['checkout']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.st-filterBar__clearAll')).toBeNull();
  });
});
