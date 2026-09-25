import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DivergentBarChart, type DivergentBarChartDatum } from '@sentropic/design-system-angular';
import {
  buildDivergingBarModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type DivergingBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as diverging bar categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional fixed value-axis domain. Defaults to the core model domain. */
  domain?: [number, number];
  format?: (value: number) => string;
  showLegend?: boolean;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular DivergentBarChart. The domain falls back to the
 * core model's own domain, so the derivation has to keep the model around — which
 * is why the port generator refuses this shape.
 */
@Component({
  selector: 'st-dataviz-diverging-bar-chart',
  standalone: true,
  imports: [DivergentBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-divergent-bar-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [domain]="domainValue"
      [format]="format"
      [showLegend]="showLegend"
      [class]="classInput"
    ></st-divergent-bar-chart>
  `,
})
export class DivergingBarChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DivergingBarChart';

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
      throw new Error('DivergingBarChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() domain?: [number, number];
  @NgInput() format?: (value: number) => string;
  @NgInput() showLegend = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: DivergentBarChartDatum[] = [];
  /** `domain` when the caller set one, the core model's own domain otherwise. */
  domainValue?: [number, number];

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
    const dataModel = this.signals.store.model;
    const model =
      findDimension(dataModel, this.category) && findMeasure(dataModel, this.measure)
        ? buildDivergingBarModel(dataModel, this.signals.store.applyCrossfilter(this.viewId), {
            category: this.category,
            measure: this.measure,
          })
        : undefined;
    this.data = model?.items.map((item) => ({ label: item.label, value: item.value, tone: item.direction })) ?? [];
    this.domainValue = this.domain ?? model?.domain;
  }
}
