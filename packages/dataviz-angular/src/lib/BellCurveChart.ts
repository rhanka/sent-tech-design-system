import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BellCurveChart as DsBellCurveChart, type BellCurveChartTone } from '@sentropic/design-system-angular';
import { buildBellCurveData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type BellCurveChartProps = {
  store: DashboardStore;
  viewId: string;
  measure: string;
  tone?: string;
  smooth?: boolean;
  intervals?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular BellCurveChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-bell-curve-chart',
  standalone: true,
  imports: [DsBellCurveChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bell-curve-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [tone]="tone"
      [smooth]="smooth"
      [intervals]="intervals"
      [class]="classInput"
    ></st-bell-curve-chart>
  `,
})
export class BellCurveChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'BellCurveChart';

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
      throw new Error('BellCurveChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: BellCurveChartTone;
  @NgInput() smooth?: boolean;
  @NgInput() intervals?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: number[] = [];

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
    this.data = buildBellCurveData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        measure: this.measure,
      },
    );
  }
}
