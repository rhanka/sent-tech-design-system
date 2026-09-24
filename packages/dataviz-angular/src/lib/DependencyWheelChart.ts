import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DependencyWheelChart as DsDependencyWheelChart, type DependencyWheelChartLink } from '@sentropic/design-system-angular';
import { buildDependencyWheelData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type DependencyWheelChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight: string;
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular DependencyWheelChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-dependency-wheel-chart',
  standalone: true,
  imports: [DsDependencyWheelChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-dependency-wheel-chart
      [data]="data"
      [labels]="labels"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-dependency-wheel-chart>
  `,
})
export class DependencyWheelChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DependencyWheelChart';

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
      throw new Error('DependencyWheelChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) source!: string;
  @NgInput({ required: true }) target!: string;
  @NgInput({ required: true }) weight!: string;
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: DependencyWheelChartLink[] = [];

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
    this.data = buildDependencyWheelData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        source: this.source,
        target: this.target,
        weight: this.weight,
      },
    );
  }
}
