import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildClusterScatterData } from './analyticsDsData.js';
import { classNames } from './classNames.js';

export type AnalyticsClusterPlotProps = {
  store: DashboardStore;
  viewId: string;
  fields: string[];
  k: number;
  maxIterations?: number;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular ScatterPlot.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-analytics-cluster-plot',
  standalone: true,
  imports: [DsScatterPlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-scatter-plot
      [data]="model.data"
      [centroids]="model.centroids"
      [xLabel]="model.xLabel"
      [yLabel]="model.yLabel"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classValue"
    ></st-scatter-plot>
  `,
})
export class AnalyticsClusterPlot implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AnalyticsClusterPlot';

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
      throw new Error('AnalyticsClusterPlot: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) fields!: string[];
  @NgInput({ required: true }) k!: number;
  @NgInput() maxIterations?: number;
  @NgInput() width: number = 360;
  @NgInput() height: number = 240;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model!: ReturnType<typeof buildClusterScatterData>;
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-analyticsClusterPlot';

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
    this.classValue = classNames('st-analyticsClusterPlot', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    this.model = buildClusterScatterData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        fields: this.fields,
        k: this.k,
        maxIterations: this.maxIterations,
      },
    );
  }
}
