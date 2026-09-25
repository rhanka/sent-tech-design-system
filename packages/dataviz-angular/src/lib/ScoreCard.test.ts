import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ScoreCard } from '../../dist/lib/ScoreCard.js';

const T0 = Date.UTC(2026, 0, 1);
const DAY = 86_400_000;

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', ts: T0, amount: 10 },
  { service: 'checkout', region: 'us', ts: T0 + 1_000, amount: 5 },
  { service: 'billing', region: 'eu', ts: T0 + DAY, amount: 7 },
];

function newStore() {
  return createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { revenue: { field: 'service' }, table: { field: 'service' } } },
  });
}

class ScoreCardHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [ScoreCard],
  template: `
    <st-dataviz-score-card [store]="store" viewId="revenue" measure="amount" label="Total amount" class="score"></st-dataviz-score-card>
  `,
})(ScoreCardHost);

/** Same card, asking the DS component for a currency it was never handed. */
class CurrencyScoreCardHost {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [ScoreCard],
  template: `
    <st-dataviz-score-card [store]="store" viewId="revenue" measure="amount" label="Revenue" format="currency" locale="en-US"></st-dataviz-score-card>
  `,
})(CurrencyScoreCardHost);

describe('ScoreCard (angular)', () => {
  it('renders one DS KpiCard from the cross-filtered rows, with the DS default size', () => {
    const fixture = TestBed.createComponent(ScoreCardHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const card = root.querySelector('article.st-kpiCard');
    expect(card, 'the DS KpiCard').not.toBeNull();
    expect(card?.getAttribute('data-st-component')).toBe('KpiCard');
    // `size` left unset must still resolve to the DS default `md`, not undefined.
    expect(card?.getAttribute('class')?.split(' ').sort()).toEqual(['score', 'st-kpiCard', 'st-kpiCard--md']);
    expect(card?.getAttribute('aria-label')).toBe('Total amount, 22');
    expect(root.querySelector('.st-kpiCard__label')?.textContent?.trim()).toBe('Total amount');
    expect(root.querySelector('.st-kpiCard__number')?.textContent?.trim()).toBe('22');
  });

  it('re-aggregates when a store filter narrows the rows', () => {
    const fixture = TestBed.createComponent(ScoreCardHost);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('service', { kind: 'include', values: ['billing'] });
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.st-kpiCard__number')?.textContent?.trim(),
    ).toBe('7');
  });

  /**
   * PATTERN.md trap 1: the DS KpiCard declares `currency = "EUR"` as a class field,
   * so binding it with `undefined` overwrites the default that React and Vue fall
   * back to. `Intl.NumberFormat` then has no currency to format with, so the
   * failure is not cosmetic — dropping `this.currencyValue = this.currency ?? 'EUR'`
   * from `recompute()` makes this case throw instead of rendering `€22.00`.
   */
  it('keeps the DS currency default when the caller sets none', () => {
    const fixture = TestBed.createComponent(CurrencyScoreCardHost);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.st-kpiCard__number')?.textContent?.trim(),
    ).toBe('€22.00');
  });
});
