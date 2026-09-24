import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { SunburstChart as DsSunburstChart, type SunburstChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafePartWholeHierarchy, toHierarchyDatum } from './partOfWholeData.js';

export type SunburstChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular SunburstChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-sunburst-chart',
  standalone: true,
  imports: [DsSunburstChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-sunburst-chart
      [data]="model"
      [label]="label"
      [legend]="legend"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-sunburst-chart>
  `,
})
export class SunburstChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'SunburstChart';

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
      throw new Error('SunburstChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) hierarchy!: string[];
  @NgInput({ required: true }) measure!: string;
  @NgInput() legend: boolean = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model!: SunburstChartDatum;

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
    this.model = toHierarchyDatum(
      buildSafePartWholeHierarchy(
        this.signals.store.model,
        this.signals.store.applyCrossfilter(this.viewId),
        {
          hierarchy: this.hierarchy,
          measure: this.measure,
        },
      ),
    );
  }
}
