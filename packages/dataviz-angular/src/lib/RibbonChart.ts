import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { RibbonChart as DsRibbonChart, type RibbonChartDatum } from '@sentropic/design-system-angular';
import { buildRibbonData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type RibbonChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  period: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular RibbonChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-ribbon-chart',
  standalone: true,
  imports: [DsRibbonChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-ribbon-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-ribbon-chart>
  `,
})
export class RibbonChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'RibbonChart';

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
      throw new Error('RibbonChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) period!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: RibbonChartDatum[] = [];

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
    this.data = buildRibbonData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        category: this.category,
        period: this.period,
        value: this.value,
      },
    );
  }
}
