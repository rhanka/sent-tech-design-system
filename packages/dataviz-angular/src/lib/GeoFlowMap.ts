import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GeoChart as DsGeoChart, type GeoChartLayer } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { flowLayer, mapClass } from './geoMapLayers.js';

export type GeoFlowMapProps = {
  store: DashboardStore;
  viewId: string;
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
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
  selector: 'st-dataviz-geo-flow-map',
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
export class GeoFlowMap implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'GeoFlowMap';

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
      throw new Error('GeoFlowMap: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) sourceLatitude!: string;
  @NgInput({ required: true }) sourceLongitude!: string;
  @NgInput({ required: true }) targetLatitude!: string;
  @NgInput({ required: true }) targetLongitude!: string;
  @NgInput() value?: string;
  @NgInput() width: number = 520;
  @NgInput() height: number = 320;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  layers: GeoChartLayer[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-geoFlowMap';

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
    this.classValue = mapClass('st-geoFlowMap', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    this.layers = [
      flowLayer(
        this.signals.store,
        this.viewId,
        {
          sourceLatitude: this.sourceLatitude,
          sourceLongitude: this.sourceLongitude,
          targetLatitude: this.targetLatitude,
          targetLongitude: this.targetLongitude,
          value: this.value,
          labelText: this.label,
        },
      ),
    ];
  }
}
