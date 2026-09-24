import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ScatterPlot as DsScatterPlot, type ScatterPlotDatum } from '@sentropic/design-system-angular';
import { buildScatterModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ScatterPlotProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  series?: string;
  labelField?: string;
  width?: number;
  height?: number;
  radius?: number;
  label: string;
  class?: string;
};

/** State wiring for a DS Angular ScatterPlot over a core scatter model. */
@Component({
  selector: 'st-dataviz-scatter-plot',
  standalone: true,
  imports: [DsScatterPlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-scatter-plot
      [data]="data"
      [xLabel]="xLabel"
      [yLabel]="yLabel"
      [width]="width"
      [height]="height"
      [radius]="radius"
      [label]="label"
      [class]="classInput"
    ></st-scatter-plot>
  `,
})
export class ScatterPlot implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ScatterPlot';

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
      throw new Error('ScatterPlot: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput() series?: string;
  @NgInput() labelField?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() radius?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: ScatterPlotDatum[] = [];
  xLabel = '';
  yLabel = '';

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
    const model = buildScatterModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      { x: this.x, y: this.y, series: this.series, labelField: this.labelField },
    );
    this.data = model.data as ScatterPlotDatum[];
    this.xLabel = model.xLabel;
    this.yLabel = model.yLabel;
  }
}
