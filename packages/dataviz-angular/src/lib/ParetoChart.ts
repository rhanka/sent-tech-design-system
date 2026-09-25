import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  ParetoChart as DsParetoChart,
  type ParetoChartDatum,
  type ParetoChartTone,
} from '@sentropic/design-system-angular';
import {
  buildParetoModel,
  findDimension,
  findMeasure,
  type DashboardStore,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ParetoChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id used as Pareto categories. */
  category: string;
  /** Measure id aggregated per category. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Optional design-system tone applied to every Pareto bar. */
  tone?: ParetoChartTone;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular ParetoChart. The model is built only when both
 * the dimension and the measure exist, and the tone is folded into each datum —
 * a guard the port generator's descriptor cannot express.
 */
@Component({
  selector: 'st-dataviz-pareto-chart',
  standalone: true,
  imports: [DsParetoChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-pareto-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-pareto-chart>
  `,
})
export class ParetoChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ParetoChart';

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
      throw new Error('ParetoChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() tone?: ParetoChartTone;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: ParetoChartDatum[] = [];

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
    const model = this.signals.store.model;
    const tone = this.tone;
    this.data =
      findDimension(model, this.category) && findMeasure(model, this.measure)
        ? buildParetoModel(model, this.signals.store.applyCrossfilter(this.viewId), {
            category: this.category,
            measure: this.measure,
          }).items.map((item) =>
            tone ? { label: item.label, value: item.value, tone } : { label: item.label, value: item.value },
          )
        : [];
  }
}
