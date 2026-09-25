import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-angular';
import { buildKpiCards, type DashboardStore, type Row } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

/**
 * State wiring for a single DS Angular KpiCard: one measure, one optional goal,
 * one optional sparkline dimension. `buildKpiCards` is asked for one card and the
 * adapter reads that card's members, which the port generator cannot express.
 */
@Component({
  selector: 'st-dataviz-score-card',
  standalone: true,
  imports: [KpiCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-kpi-card
      [value]="value"
      [label]="cardLabel"
      [delta]="delta"
      [deltaFormat]="deltaFormat"
      [unit]="unit"
      [currency]="currencyValue"
      [locale]="locale"
      [format]="formatValue"
      [size]="sizeValue"
      [tone]="tone"
      [sparkline]="sparkline"
      [class]="classInput"
    ></st-kpi-card>
  `,
})
export class ScoreCard implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ScoreCard';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private signals?: AngularSignalStore;
  private unsubscribe: () => void = () => {};

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
    this.unsubscribe();
    this.unsubscribe = value.subscribe(() => {
      this.recompute();
      this.changeDetector.markForCheck();
    });
  }

  get store(): DashboardStore {
    if (!this.signals) {
      throw new Error('ScoreCard: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() label?: string;
  @NgInput() goal?: number;
  @NgInput() sparklineDimension?: string;
  @NgInput() comparisonData?: readonly Row[];
  @NgInput() format?: KpiCardFormat;
  @NgInput() deltaFormat: KpiCardDeltaFormat = 'percent';
  @NgInput() unit?: string;
  @NgInput() currency?: string;
  @NgInput() locale?: string;
  @NgInput() size?: KpiCardSize;
  @NgInput() tone?: KpiCardTone;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  value: number = 0;
  cardLabel = '';
  delta?: number;
  sparkline?: number[];
  /**
   * DS KpiCard declares `format`, `size` and `currency` as class fields with
   * defaults, so an `undefined` binding would overwrite them where React/Vue fall
   * back to their default prop (PATTERN.md trap 1). Resolved here to the same
   * values the React/Vue DS KpiCard applies.
   */
  formatValue: KpiCardFormat = 'number';
  sizeValue: KpiCardSize = 'md';
  currencyValue = 'EUR';

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.signals?.destroy();
  }

  private recompute(): void {
    this.formatValue = this.format ?? 'number';
    this.sizeValue = this.size ?? 'md';
    this.currencyValue = this.currency ?? 'EUR';
    if (!this.signals) return;
    void this.signals.state();
    const [card] = buildKpiCards(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      [
        {
          id: 'card',
          label: this.label,
          measure: this.measure,
          goal: this.goal,
          sparklineDimension: this.sparklineDimension,
        },
      ],
      { comparisonData: this.comparisonData },
    );
    this.value = card!.value;
    this.cardLabel = card!.label;
    this.delta = finite(this.deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent);
    this.sparkline = card!.sparkline?.map((point) => point.value);
  }
}
