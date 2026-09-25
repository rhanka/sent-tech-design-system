import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TileMapChart as DsTileMapChart, type TileMapChartTile } from '@sentropic/design-system-angular';
import { buildTileMapData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  label_field: string;
  col: string;
  row: string;
  value: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular TileMapChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-tile-map-chart',
  standalone: true,
  imports: [DsTileMapChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-tile-map-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-tile-map-chart>
  `,
})
export class TileMapChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'TileMapChart';

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
      throw new Error('TileMapChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) label_field!: string;
  @NgInput({ required: true }) col!: string;
  @NgInput({ required: true }) row!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: TileMapChartTile[] = [];

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
    this.data = buildTileMapData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        label: this.label_field,
        col: this.col,
        row: this.row,
        value: this.value,
      },
    );
  }
}
