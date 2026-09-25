import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BulletChart as DsBulletChart, type BulletChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore, type BulletChartConfig } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildBulletData } from './distributionData.js';

export type BulletChartProps = {
  store: DashboardStore;
  viewId?: string;
  value: BulletChartConfig['value'];
  target: BulletChartConfig['target'];
  category?: BulletChartConfig['category'];
  ranges?: BulletChartConfig['ranges'];
  label: string;
  orientation?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular BulletChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-bullet-chart',
  standalone: true,
  imports: [DsBulletChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bullet-chart
      [data]="data"
      [label]="label"
      [orientation]="orientation"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-bullet-chart>
  `,
})
export class BulletChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'BulletChart';

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
      throw new Error('BulletChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) value!: BulletChartConfig['value'];
  @NgInput({ required: true }) target!: BulletChartConfig['target'];
  @NgInput() category?: BulletChartConfig['category'];
  @NgInput() ranges?: BulletChartConfig['ranges'];
  @NgInput({ required: true }) label!: string;
  @NgInput() orientation?: "horizontal" | "vertical";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: BulletChartDatum[] = [];

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
    this.data = buildBulletData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        value: this.value,
        target: this.target,
        category: this.category,
        ranges: this.ranges,
        label: this.label,
      },
    );
  }
}
