import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ExportMenu, rowsToCsv } from '../../dist/lib/ExportMenu.js';

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
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { v: { field: 'service' } } },
  });
}

class Host {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [ExportMenu],
  template: `<st-dataviz-export-menu [store]="store" viewId="v" class="probe"></st-dataviz-export-menu>`,
})(Host);

describe('rowsToCsv (angular)', () => {
  it('renders a header only when there are no rows', () => {
    expect(rowsToCsv([], [{ key: 'service', label: 'Service' }])).toBe('Service');
  });

  it('escapes commas, quotes and newlines RFC-4180-ish', () => {
    expect(
      rowsToCsv([{ a: 'x,y', b: 'q"z', c: 'l1\nl2', d: null }], [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
        { key: 'c', label: 'C' },
        { key: 'd', label: 'D' },
      ]),
    ).toBe('A,B,C,D\n"x,y","q""z","l1\nl2",');
  });
});

describe('ExportMenu (angular)', () => {
  it('renders a secondary DS Button with the default label and the caller class', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-button')?.textContent?.trim()).toBe('Exporter (CSV)');
    expect(root.querySelector('.st-button')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['st-button--secondary', 'probe']),
    );
  });

  it('defaults the columns to every model field, dimensions then measures', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as ExportMenu;
    expect(adapter.columns).toEqual([
      { key: 'service', label: 'Service' },
      { key: 'region', label: 'Region' },
      { key: 'amount', label: 'Amount' },
    ]);
  });

  it('serialises the cross-filtered rows of the bound view', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as ExportMenu;
    const csv = rowsToCsv(fixture.componentInstance.store.applyCrossfilter('v'), adapter.columns);
    expect(csv).toBe('Service,Region,Amount\ncheckout,eu,10\nbilling,us,5');
  });
});
