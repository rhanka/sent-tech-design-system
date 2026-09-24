import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  DonutChart as DsDonutChart,
  type DonutChartDatum,
  type DataLabelsProp as ChartDataLabels,
} from '@sentropic/design-system-angular';
import type { DashboardStore, PartWholeSort } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type DonutChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  label: string;
  dataLabels?: ChartDataLabels;
  class?: string;
};

/** State wiring for a DS Angular DonutChart over a part-of-whole model. */
@Component({
  selector: 'st-dataviz-donut-chart',
  standalone: true,
  imports: [DsDonutChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-donut-chart
      [data]="data"
      [label]="label"
      [size]="size"
      [thickness]="thickness"
      [centerLabel]="centerLabel"
      [dataLabels]="dataLabels"
      [class]="classInput"
    ></st-donut-chart>
  `,
})
export class DonutChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DonutChart';

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
      throw new Error('DonutChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() sort: PartWholeSort = 'input';
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput() centerLabel?: string | null;
  @NgInput({ required: true }) label!: string;
  @NgInput() dataLabels?: ChartDataLabels;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: DonutChartDatum[] = [];

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
    const model = buildSafePartWholeModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      { category: this.category, measure: this.measure, sort: this.sort },
    );
    this.data = toPartWholeData(model.items);
  }
}
