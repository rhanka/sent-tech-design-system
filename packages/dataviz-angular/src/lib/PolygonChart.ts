import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PolygonChart as DsPolygonChart, type PolygonChartPoint, type PolygonChartTone } from '@sentropic/design-system-angular';
import { buildPolygonData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type PolygonChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  tone?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular PolygonChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-polygon-chart',
  standalone: true,
  imports: [DsPolygonChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-polygon-chart
      [data]="data"
      [label]="label"
      [tone]="tone"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-polygon-chart>
  `,
})
export class PolygonChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'PolygonChart';

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
      throw new Error('PolygonChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput() tone: PolygonChartTone = "category1";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: PolygonChartPoint[] = [];

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
    this.data = buildPolygonData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        x: this.x,
        y: this.y,
      },
    );
  }
}
