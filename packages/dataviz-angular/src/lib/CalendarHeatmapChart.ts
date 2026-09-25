import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  CalendarHeatmapChart as DsCalendarHeatmapChart,
  type CalendarHeatmapChartDatum,
} from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildCalendarHeatmapData } from './distributionData.js';

export type CalendarHeatmapChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: string;
  measure: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular CalendarHeatmapChart. `buildCalendarHeatmapData`
 * takes its date and measure as positional arguments rather than a config object,
 * which is the shape the port generator refuses.
 */
@Component({
  selector: 'st-dataviz-calendar-heatmap-chart',
  standalone: true,
  imports: [DsCalendarHeatmapChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-calendar-heatmap-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-calendar-heatmap-chart>
  `,
})
export class CalendarHeatmapChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'CalendarHeatmapChart';

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
      throw new Error('CalendarHeatmapChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) date!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: CalendarHeatmapChartDatum[] = [];

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
    this.data = buildCalendarHeatmapData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      this.date,
      this.measure,
    );
  }
}
