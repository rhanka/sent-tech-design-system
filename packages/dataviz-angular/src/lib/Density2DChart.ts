import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Density2DChart as DsDensity2DChart, type Density2DPoint } from '@sentropic/design-system-angular';
import { buildDensity2DData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type Density2DChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  weight?: string;
  bins?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular Density2DChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-density2-d-chart',
  standalone: true,
  imports: [DsDensity2DChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-density2-d-chart
      [data]="data"
      [bins]="bins"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-density2-d-chart>
  `,
})
export class Density2DChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'Density2DChart';

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
      throw new Error('Density2DChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput() weight?: string;
  @NgInput() bins?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: Density2DPoint[] = [];

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
    this.data = buildDensity2DData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        x: this.x,
        y: this.y,
        weight: this.weight,
      },
    );
  }
}
