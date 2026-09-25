import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { WindBarbChart as DsWindBarbChart, type WindBarbChartDatum } from '@sentropic/design-system-angular';
import { buildWindBarbData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type WindBarbChartProps = {
  store: DashboardStore;
  viewId: string;
  at: string;
  speed: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular WindBarbChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-wind-barb-chart',
  standalone: true,
  imports: [DsWindBarbChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-wind-barb-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-wind-barb-chart>
  `,
})
export class WindBarbChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'WindBarbChart';

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
      throw new Error('WindBarbChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) at!: string;
  @NgInput({ required: true }) speed!: string;
  @NgInput({ required: true }) direction!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: WindBarbChartDatum[] = [];

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
    this.data = buildWindBarbData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        at: this.at,
        speed: this.speed,
        direction: this.direction,
      },
    );
  }
}
