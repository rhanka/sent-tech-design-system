import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HeatmapChart as DsHeatmapChart, type HeatmapChartDatum } from '@sentropic/design-system-angular';
import { buildCorrelationMatrix, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type CorrelationMatrixProps = {
  store: DashboardStore;
  viewId?: string;
  measures: string[];
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular HeatmapChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-correlation-matrix',
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
export class CorrelationMatrix implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'CorrelationMatrix';

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
      throw new Error('CorrelationMatrix: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) measures!: string[];
  @NgInput() legend: boolean = true;
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
    this.data = buildCorrelationMatrix(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        measures: this.measures,
      },
    );
  }
}
