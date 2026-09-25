import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { VectorFieldChart as DsVectorFieldChart, type VectorFieldChartDatum } from '@sentropic/design-system-angular';
import { buildVectorFieldData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type VectorFieldChartProps = {
  store: DashboardStore;
  viewId: string;
  x: string;
  y: string;
  length: string;
  direction: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular VectorFieldChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-vector-field-chart',
  standalone: true,
  imports: [DsVectorFieldChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-vector-field-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-vector-field-chart>
  `,
})
export class VectorFieldChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'VectorFieldChart';

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
      throw new Error('VectorFieldChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput({ required: true }) length!: string;
  @NgInput({ required: true }) direction!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: VectorFieldChartDatum[] = [];

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
    this.data = buildVectorFieldData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        x: this.x,
        y: this.y,
        length: this.length,
        direction: this.direction,
      },
    );
  }
}
