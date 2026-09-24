import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-angular';
import { buildKpiCards, type DashboardStore, type KpiCardConfig, type Row } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type KpiCardGroupProps = {
  store: DashboardStore;
  viewId?: string;
  configs: KpiCardConfig[];
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  class?: string;
};

/** One rendered card: the core KPI model reduced to the DS KpiCard inputs. */
type KpiCardView = {
  id: string;
  label: string;
  value: number;
  delta?: number;
  sparkline?: number[];
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

/** State wiring for a row of DS Angular KpiCards. */
@Component({
  selector: 'st-dataviz-kpi-card-group',
  standalone: true,
  imports: [KpiCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [attr.class]="classInput ?? null">
      @for (card of cards; track card.id) {
        <st-kpi-card
          [value]="card.value"
          [label]="card.label"
          [delta]="card.delta"
          [deltaFormat]="deltaFormat"
          [format]="formatValue"
          [size]="sizeValue"
          [tone]="tone"
          [sparkline]="card.sparkline"
        ></st-kpi-card>
      }
    </div>
  `,
})
export class KpiCardGroup implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'KpiCardGroup';

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
      throw new Error('KpiCardGroup: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) configs!: KpiCardConfig[];
  @NgInput() comparisonData?: readonly Row[];
  @NgInput() format?: KpiCardFormat;
  @NgInput() deltaFormat: KpiCardDeltaFormat = 'percent';
  @NgInput() size?: KpiCardSize;
  @NgInput() tone?: KpiCardTone;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  cards: KpiCardView[] = [];
  /**
   * DS KpiCard declares `format`/`size` as class fields with defaults, so an
   * `undefined` binding would overwrite them (unlike React/Vue default props).
   * Resolved here to the same defaults the React/Vue DS KpiCard applies.
   */
  formatValue: KpiCardFormat = 'number';
  sizeValue: KpiCardSize = 'md';

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
    if (!this.signals) return;
    void this.signals.state();
    const cards = buildKpiCards(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      this.configs,
      { comparisonData: this.comparisonData },
    );
    this.cards = cards.map((card) => ({
      id: card.id,
      label: card.label,
      value: card.value,
      delta: finite(this.deltaFormat === 'absolute' ? card.delta : card.deltaPercent),
      sparkline: card.sparkline?.map((point) => point.value),
    }));
  }
}
