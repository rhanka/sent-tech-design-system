import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DrillChart } from '../../dist/lib/DrillChart.js';

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
  { region: 'eu', service: 'billing', amount: 7 },
];

function newStore() {
  return createDashboardStore({ model, data: rows, crossfilter: { views: { v: { field: 'region' } } } });
}

class DonutHost {
  readonly store = newStore();
  readonly hierarchy = ['region', 'service'];
}

Component({
  standalone: true,
  imports: [DrillChart],
  template: `
    <st-dataviz-drill-chart
      [store]="store"
      viewId="v"
      [hierarchy]="hierarchy"
      measure="amount"
      label="Amount"
      kind="donut"
      class="probe"
    ></st-dataviz-drill-chart>
  `,
})(DonutHost);

class TreemapHost {
  readonly store = newStore();
  readonly hierarchy = ['region', 'service'];
}

Component({
  standalone: true,
  imports: [DrillChart],
  template: `
    <st-dataviz-drill-chart
      [store]="store"
      viewId="v"
      [hierarchy]="hierarchy"
      measure="amount"
      label="Amount"
      kind="treemap"
      class="probe"
    ></st-dataviz-drill-chart>
  `,
})(TreemapHost);

const buttons = (root: Element): HTMLButtonElement[] =>
  Array.from(root.querySelectorAll('st-button button'));

const buttonTexts = (root: Element): string[] => buttons(root).map((b) => b.textContent?.trim() ?? '');

describe('DrillChart (angular)', () => {
  it('renders the donut visual plus one drill button per level value', () => {
    const fixture = TestBed.createComponent(DonutHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-st-component="DonutChart"]')).not.toBeNull();
    expect(buttonTexts(root)).toEqual(['eu: 17', 'us: 5']);
    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Amount — drill');
  });

  it('drills through the button row and selects at the deepest level', () => {
    const fixture = TestBed.createComponent(DonutHost);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;

    buttons(fixture.nativeElement as HTMLElement)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['eu'] });
    expect(store.getState().drill.v).toEqual(['service']);
    const root = fixture.nativeElement as HTMLElement;
    expect(buttonTexts(root)).toEqual(['checkout: 10', 'billing: 7']);
    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Amount — select');

    buttons(root)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(store.getState().selections.v).toEqual(['checkout']);
  });

  it('renders the treemap visual for kind="treemap"', () => {
    const fixture = TestBed.createComponent(TreemapHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-st-component="TreemapChart"]')).not.toBeNull();
    expect(buttonTexts(root)).toEqual(['eu: 17', 'us: 5']);
  });
});
