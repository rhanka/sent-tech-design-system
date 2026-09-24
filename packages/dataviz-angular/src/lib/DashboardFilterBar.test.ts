import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DashboardFilterBar, type ActiveFilter, type ExportConfig, type FilterControl } from '../../dist/lib/DashboardFilterBar.js';
import type { TimeRange } from '@sentropic/dataviz-core';
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

class DashboardFilterBarHost {
  readonly controls: FilterControl[] = [
    { kind: 'query-search', label: 'Query', placeholder: 'Search rows', fields: ['service'] },
    { kind: 'date-range', label: 'Window' },
    { kind: 'relative-date', label: 'Preset', presets: [{ label: 'Last 7 days', from: 'now-7d', to: 'now' }] },
    { kind: 'variable', label: 'Service', dimension: 'service' },
    { kind: 'variable', label: 'Regions', dimension: 'region', multiSelect: true },
  ];
  readonly exportConfig: ExportConfig = {
    label: 'Export CSV',
    fields: ['service', 'amount'],
    filenameTemplate: 'rows-{date}',
  };
  readonly activeFilters: ActiveFilter[] = [
    { field: 'service', operator: 'eq', value: 'checkout', label: 'Service' },
  ];

  queries: string[] = [];
  ranges: (TimeRange | null)[] = [];
  filterSets: ActiveFilter[][] = [];
  exports: ExportConfig[] = [];

  readonly onQueryChange = (query: string) => this.queries.push(query);
  readonly onTimeRangeChange = (range: TimeRange | null) => this.ranges.push(range);
  readonly onFiltersChange = (filters: ActiveFilter[]) => this.filterSets.push(filters);
  readonly onExport = (config: ExportConfig) => this.exports.push(config);
}

Component({
  standalone: true,
  imports: [DashboardFilterBar],
  template: `
    <st-dataviz-dashboard-filter-bar
      [controls]="controls"
      [export]="exportConfig"
      [chips]="true"
      [activeFilters]="activeFilters"
      [onQueryChange]="onQueryChange"
      [onTimeRangeChange]="onTimeRangeChange"
      [onFiltersChange]="onFiltersChange"
      [onExport]="onExport"
      class="lot1-bar"
    ></st-dataviz-dashboard-filter-bar>
  `,
})(DashboardFilterBarHost);

describe('DashboardFilterBar (angular)', () => {
  it('renders one DS control per declared control, plus the export button and the chips', () => {
    const fixture = TestBed.createComponent(DashboardFilterBarHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('div.st-dashboardFilterBar')?.getAttribute('class')).toBe(
      'st-dashboardFilterBar lot1-bar',
    );
    expect(Array.from(root.querySelectorAll('.st-field__label')).map((l) => l.textContent?.trim())).toEqual([
      'Query',
      'Window',
      'Preset',
      'Service',
      'Regions',
    ]);
    expect(root.querySelector('input.st-search__control')?.getAttribute('placeholder')).toBe('Search rows');
    expect(root.querySelectorAll('.st-datepicker').length).toBe(1);
    expect(Array.from(root.querySelectorAll('option')).map((o) => o.textContent?.trim())).toEqual([
      '—',
      'Last 7 days',
      '—',
    ]);
    expect(root.querySelector('.st-multiSelect')).not.toBeNull();
    expect(root.querySelector('button.st-button--secondary')?.textContent?.trim()).toBe('Export CSV');

    const pillBar = root.querySelector('.st-filterBar');
    expect(pillBar?.getAttribute('aria-label')).toBe('Filtres actifs');
    const pill = root.querySelector('.st-filterPill');
    expect(pill?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Servicecheckout');
  });

  it('reports the typed query, the picked preset and the export through the callbacks', () => {
    const fixture = TestBed.createComponent(DashboardFilterBarHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;

    const search = root.querySelector<HTMLInputElement>('input.st-search__control')!;
    search.value = 'payment';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(host.queries).toEqual(['payment']);

    const preset = root.querySelectorAll<HTMLSelectElement>('select.st-select')[0]!;
    preset.value = 'now-7d|now|Last 7 days';
    preset.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(host.ranges).toEqual([{ from: 'now-7d', to: 'now', relativeLabel: 'Last 7 days' }]);

    root.querySelector<HTMLButtonElement>('button.st-button--secondary')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    fixture.detectChanges();
    expect(host.exports).toEqual([host.exportConfig]);
  });

  it('drops the removed chip from the reported filter list', () => {
    const fixture = TestBed.createComponent(DashboardFilterBarHost);
    fixture.detectChanges();
    const remove = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.st-filterPill__remove',
    );
    remove?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.filterSets).toEqual([[]]);
  });
});
