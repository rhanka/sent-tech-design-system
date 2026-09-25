import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DrillBreadcrumb } from '../../dist/lib/DrillBreadcrumb.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'service', label: 'Service', type: 'discrete' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'eu', service: 'checkout', amount: 10 },
  { region: 'us', service: 'checkout', amount: 5 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
  readonly hierarchy = ['region', 'service'];
}

Component({
  standalone: true,
  imports: [DrillBreadcrumb],
  template: `
    <st-dataviz-drill-breadcrumb
      [store]="store"
      viewId="v"
      [hierarchy]="hierarchy"
      class="probe"
    ></st-dataviz-drill-breadcrumb>
  `,
})(Host);

describe('DrillBreadcrumb (angular)', () => {
  it('renders only the top hierarchy level, current, with no "up" button, before any drill', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-inline')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
    expect(Array.from(root.querySelectorAll('.st-breadcrumb li')).map((li) => li.textContent?.trim())).toEqual([
      'Region',
    ]);
    expect(root.querySelector('span[aria-current="page"]')?.textContent?.trim()).toBe('Region');
    expect(root.querySelector('button')).toBeNull();
  });

  it('extends the trail and shows the "up" button once a drill has happened', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('region', { kind: 'include', values: ['eu'] });
    fixture.componentInstance.store.drillDown('v', 'service');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    // The DS Breadcrumb renders the "/" separator inside the preceding <li>,
    // not as its own node, so a non-final item's textContent carries it too.
    expect(Array.from(root.querySelectorAll('.st-breadcrumb li')).map((li) => li.textContent?.trim())).toEqual([
      'Region/',
      'Service',
    ]);
    expect(root.querySelector('span[aria-current="page"]')?.textContent?.trim()).toBe('Service');
    expect(root.querySelector('button')?.textContent?.trim()).toBe('Remonter');
  });

  it('pops the drill path and clears the level\'s filter when "up" is clicked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    store.setFilter('region', { kind: 'include', values: ['eu'] });
    store.drillDown('v', 'service');
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(store.getState().drill.v ?? []).toEqual([]);
    expect(store.getState().filters.region).toBeUndefined();
    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeNull();
  });
});
