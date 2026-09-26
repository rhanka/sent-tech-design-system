import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { RadarChart as DsRadarChart, type RadarChartSeries } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeRadarModel, toRadarAxes, toRadarSeries } from './partOfWholeData.js';

export type RadarChartProps = {
  store: DashboardStore;
  viewId: string;
  axes: string[];
  series?: string;
  maxValue?: number;
  levels?: number;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular RadarChart over a safe radar model.
 *
 * tools/dataviz-angular-port refuses this shape: two bindings wrap the same
 * derived model in two different calls (`toRadarAxes(model)` and
 * `toRadarSeries(model)`), and the descriptor allows at most one wrapping
 * call (`two wrapping calls`; see tools/dataviz-angular-port/README.md). The
 * derivation is otherwise the recipe PATTERN.md documents, so the adapter is
 * hand-written and was never extracted.
 *
 * The public `axes`/`series` @Inputs keep their contract names; the
 * DS-facing derived arrays are `radarAxes`/`radarSeries` instead (the same
 * shadowing split lot 7 used for `PivotDataTable`'s `tableRows`/
 * `tableColumns`).
 */
@Component({
  selector: 'st-dataviz-radar-chart',
  standalone: true,
  imports: [DsRadarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-radar-chart
      [axes]="radarAxes"
      [series]="radarSeries"
      [maxValue]="maxValue"
      [levels]="levels"
      [legend]="legend"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classInput"
    ></st-radar-chart>
  `,
})
export class RadarChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'RadarChart';

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
      throw new Error('RadarChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) axes!: string[];
  @NgInput() series?: string;
  @NgInput() maxValue?: number;
  @NgInput() levels?: number;
  @NgInput() legend = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  radarAxes: string[] = [];
  radarSeries: RadarChartSeries[] = [];

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
    const model = buildSafeRadarModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      { axes: this.axes, series: this.series },
    );
    this.radarAxes = toRadarAxes(model);
    this.radarSeries = toRadarSeries(model);
  }
}
