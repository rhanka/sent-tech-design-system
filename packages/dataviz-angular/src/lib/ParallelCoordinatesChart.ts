import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ParallelCoordinatesChart as DsParallelCoordinatesChart } from '@sentropic/design-system-angular';
import { buildParallelCoordinatesModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ParallelCoordinatesChartProps = {
  store: DashboardStore;
  viewId: string;
  /** List of measure field ids that become the parallel axes (left to right). */
  measures: string[];
  /** Optional dimension field id used to assign a tone per row. */
  series?: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular ParallelCoordinatesChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-parallel-coordinates-chart',
  standalone: true,
  imports: [DsParallelCoordinatesChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-parallel-coordinates-chart
      [axes]="pcModel.axes"
      [data]="pcModel.data"
      [tones]="pcModel.tones"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-parallel-coordinates-chart>
  `,
})
export class ParallelCoordinatesChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ParallelCoordinatesChart';

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
      throw new Error('ParallelCoordinatesChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) measures!: string[];
  @NgInput() series?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  pcModel!: ReturnType<typeof buildParallelCoordinatesModel>;

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
    this.pcModel = buildParallelCoordinatesModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        measures: this.measures,
        series: this.series,
      },
    );
  }
}
