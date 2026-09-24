import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row, type KpiCardConfig } from '@sentropic/dataviz-core';
import { KpiCardGroup } from '../../dist/lib/KpiCardGroup.js';

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

class KpiCardGroupHost {
  readonly store = newStore();
  readonly configs: KpiCardConfig[] = [
    { id: 'total', measure: 'amount', label: 'Total amount' },
    { id: 'latency', measure: 'latency', label: 'Mean latency' },
  ];
}

Component({
  standalone: true,
  imports: [KpiCardGroup],
  template: `
    <st-dataviz-kpi-card-group [store]="store" viewId="revenue" [configs]="configs" class="kpis"></st-dataviz-kpi-card-group>
  `,
})(KpiCardGroupHost);

describe('KpiCardGroup (angular)', () => {
  it('renders one DS KpiCard per config, with the DS default format and size', () => {
    const fixture = TestBed.createComponent(KpiCardGroupHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect((root.firstElementChild?.firstElementChild as HTMLElement | null)?.getAttribute('class')).toBe('kpis');
    const cards = Array.from(root.querySelectorAll('article.st-kpiCard'));
    expect(cards).toHaveLength(2);
    // `size` left unset must still resolve to the DS default `md`, not undefined.
    expect(cards.map((card) => card.getAttribute('class'))).toEqual([
      'st-kpiCard st-kpiCard--md',
      'st-kpiCard st-kpiCard--md',
    ]);
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
      'Total amount, 22',
      'Mean latency, 120',
    ]);
    expect(Array.from(root.querySelectorAll('.st-kpiCard__label')).map((p) => p.textContent?.trim())).toEqual([
      'Total amount',
      'Mean latency',
    ]);
    expect(Array.from(root.querySelectorAll('.st-kpiCard__number')).map((p) => p.textContent?.trim())).toEqual([
      '22',
      '120',
    ]);
  });

  it('re-aggregates the cards when a store filter narrows the rows', () => {
    const fixture = TestBed.createComponent(KpiCardGroupHost);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('service', { kind: 'include', values: ['billing'] });
    fixture.detectChanges();

    expect(
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.st-kpiCard__number')).map((p) =>
        p.textContent?.trim(),
      ),
    ).toEqual(['7', '150']);
  });
});
