import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GeoChart as DsGeoChart, type GeoChartLayer } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { choroplethLayer, mapClass } from './geoMapLayers.js';

export type ChoroplethMapProps = {
  store: DashboardStore;
  viewId: string;
  region: string;
  measure: string;
  geometry?: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular GeoChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-choropleth-map',
  standalone: true,
  imports: [DsGeoChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-geo-chart
      [layers]="layers"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classValue"
    ></st-geo-chart>
  `,
})
export class ChoroplethMap implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ChoroplethMap';

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
      throw new Error('ChoroplethMap: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) region!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() geometry?: string;
  @NgInput() width: number = 520;
  @NgInput() height: number = 260;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  layers: GeoChartLayer[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-choroplethMap';

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
    this.classValue = mapClass('st-choroplethMap', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    this.layers = [
      choroplethLayer(
        this.signals.store,
        this.viewId,
        {
          region: this.region,
          measure: this.measure,
          geometry: this.geometry,
          labelText: this.label,
        },
      ),
    ];
  }
}
