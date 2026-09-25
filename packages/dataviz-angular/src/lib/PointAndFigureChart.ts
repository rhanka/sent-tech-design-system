import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PointAndFigureChart as DsPointAndFigureChart, type PointAndFigureChartDatum } from '@sentropic/design-system-angular';
import { buildPointAndFigureData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type PointAndFigureChartProps = {
  store: DashboardStore;
  viewId: string;
  date: string;
  close: string;
  boxSize?: number;
  reversal?: number;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular PointAndFigureChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-point-and-figure-chart',
  standalone: true,
  imports: [DsPointAndFigureChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-point-and-figure-chart
      [data]="data"
      [boxSize]="boxSize"
      [reversal]="reversal"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-point-and-figure-chart>
  `,
})
export class PointAndFigureChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'PointAndFigureChart';

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
      throw new Error('PointAndFigureChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) date!: string;
  @NgInput({ required: true }) close!: string;
  @NgInput() boxSize?: number;
  @NgInput() reversal?: number;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: PointAndFigureChartDatum[] = [];

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
    this.data = buildPointAndFigureData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        date: this.date,
        close: this.close,
      },
    );
  }
}
