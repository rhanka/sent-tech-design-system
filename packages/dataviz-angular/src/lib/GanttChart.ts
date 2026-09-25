import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GanttChart as DsGanttChart, type GanttChartTask } from '@sentropic/design-system-angular';
import { buildGanttData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type GanttChartProps = {
  store: DashboardStore;
  viewId: string;
  task: string;
  start: string;
  end: string;
  category?: string;
  width?: number;
  height?: number;
  marker?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular GanttChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-gantt-chart',
  standalone: true,
  imports: [DsGanttChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-gantt-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [marker]="marker"
      [class]="classInput"
    ></st-gantt-chart>
  `,
})
export class GanttChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'GanttChart';

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
      throw new Error('GanttChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) task!: string;
  @NgInput({ required: true }) start!: string;
  @NgInput({ required: true }) end!: string;
  @NgInput() category?: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() marker?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: GanttChartTask[] = [];

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
    this.data = buildGanttData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        task: this.task,
        start: this.start,
        end: this.end,
        category: this.category,
      },
    );
  }
}
