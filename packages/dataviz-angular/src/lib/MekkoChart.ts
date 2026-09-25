import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MarimekkoChart as DsMarimekkoChart, type MarimekkoChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeMekkoModel, toMarimekkoData } from './partOfWholeData.js';

export type MekkoChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  series: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular MarimekkoChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-mekko-chart',
  standalone: true,
  imports: [DsMarimekkoChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-marimekko-chart
      [data]="model"
      [width]="width"
      [height]="height"
      [label]="label"
      [class]="classInput"
    ></st-marimekko-chart>
  `,
})
export class MekkoChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'MekkoChart';

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
      throw new Error('MekkoChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) series!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model: MarimekkoChartDatum[] = [];

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
    this.model = toMarimekkoData(
      buildSafeMekkoModel(
        this.signals.store.model,
        this.signals.store.applyCrossfilter(this.viewId),
        {
          category: this.category,
          series: this.series,
          measure: this.measure,
        },
      ),
    );
  }
}
