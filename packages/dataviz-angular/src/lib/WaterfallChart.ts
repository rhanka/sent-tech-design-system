import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { WaterfallChart as DsWaterfallChart, type WaterfallChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeWaterfallModel, toWaterfallData } from './partOfWholeData.js';

export type WaterfallChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  totalLabel?: string;
  connectors?: boolean;
  format?: (value: number) => string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular WaterfallChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-waterfall-chart',
  standalone: true,
  imports: [DsWaterfallChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-waterfall-chart
      [data]="model"
      [label]="label"
      [connectors]="connectors"
      [format]="format"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-waterfall-chart>
  `,
})
export class WaterfallChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'WaterfallChart';

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
      throw new Error('WaterfallChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() totalLabel?: string;
  @NgInput() connectors: boolean = true;
  @NgInput() format?: (value: number) => string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model: WaterfallChartDatum[] = [];

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
    if (!this.signals) return;
    void this.signals.state();
    this.model = toWaterfallData(
      buildSafeWaterfallModel(
        this.signals.store.model,
        this.signals.store.applyCrossfilter(this.viewId),
        {
          category: this.category,
          measure: this.measure,
          totalLabel: this.totalLabel,
        },
      ),
    );
  }
}
