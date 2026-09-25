import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { WaffleChart as DsWaffleChart, type WaffleChartDatum } from '@sentropic/design-system-angular';
import { buildItemChartData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type WaffleChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  value: string;
  totalCells?: number;
  columns?: number;
  label?: string;
  size?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular WaffleChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-waffle-chart',
  standalone: true,
  imports: [DsWaffleChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-waffle-chart
      [data]="data"
      [totalCells]="totalCells"
      [columns]="columns"
      [label]="label"
      [size]="size"
      [class]="classInput"
    ></st-waffle-chart>
  `,
})
export class WaffleChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'WaffleChart';

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
      throw new Error('WaffleChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) label_field!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() totalCells?: number;
  @NgInput() columns?: number;
  @NgInput() label?: string;
  @NgInput() size?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: WaffleChartDatum[] = [];

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
    this.data = buildItemChartData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        label: this.label_field,
        value: this.value,
      },
    );
  }
}
