import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Sparkline as DsSparkline, type SparklineTone } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSimpleCategoricalSeries } from './categoricalData.js';

export type { SparklineTone };

export type SparklineProps = {
  store: DashboardStore;
  viewId: string;
  dimension: string;
  measure: string;
  tone?: SparklineTone;
  strokeWidth?: number;
  area?: boolean;
  width?: number;
  height?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular Sparkline over the first series of a categorical
 * model: the DS component takes bare numbers, so the adapter reads
 * `series[0].values` rather than a datum array — which is why the port generator
 * refuses this shape (see tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-sparkline',
  standalone: true,
  imports: [DsSparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-sparkline
      [data]="data"
      [tone]="tone"
      [strokeWidth]="strokeWidth"
      [area]="area"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classInput"
    ></st-sparkline>
  `,
})
export class Sparkline implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'Sparkline';

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
      throw new Error('Sparkline: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) dimension!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() tone?: SparklineTone;
  @NgInput() strokeWidth?: number;
  @NgInput() area?: boolean;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: number[] = [];

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
    const series = buildSimpleCategoricalSeries(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      this.dimension,
      this.measure,
    );
    this.data = series.series[0]?.values ?? [];
  }
}
