import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HeatmapChart as DsHeatmapChart, type HeatmapChartDatum } from '@sentropic/design-system-angular';
import type { DashboardStore, HeatmapConfig } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildHeatmapData } from './distributionData.js';

export type HeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  x: HeatmapConfig['x'];
  y: HeatmapConfig['y'];
  measure: HeatmapConfig['measure'];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/** State wiring for a DS Angular HeatmapChart over an x/y/measure grid. */
@Component({
  selector: 'st-dataviz-heatmap-chart',
  standalone: true,
  imports: [DsHeatmapChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-heatmap-chart
      [data]="data"
      [legend]="legend"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-heatmap-chart>
  `,
})
export class HeatmapChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'HeatmapChart';

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
      throw new Error('HeatmapChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) x!: HeatmapConfig['x'];
  @NgInput({ required: true }) y!: HeatmapConfig['y'];
  @NgInput({ required: true }) measure!: HeatmapConfig['measure'];
  @NgInput() legend = true;
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: HeatmapChartDatum[] = [];

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
    this.data = buildHeatmapData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      { x: this.x, y: this.y, measure: this.measure },
    );
  }
}
