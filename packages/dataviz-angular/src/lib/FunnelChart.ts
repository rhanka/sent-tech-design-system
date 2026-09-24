import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FunnelChart as DsFunnelChart, type FunnelChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore, type PartWholeSort } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafePartWholeModel, toPartWholeData } from './partOfWholeData.js';

export type FunnelChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  orientation?: 'vertical' | 'horizontal';
  showPercentages?: boolean;
  percentMode?: 'ofFirst' | 'ofPrevious';
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular FunnelChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-funnel-chart',
  standalone: true,
  imports: [DsFunnelChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-funnel-chart
      [data]="data"
      [label]="label"
      [orientation]="orientation"
      [showPercentages]="showPercentages"
      [percentMode]="percentMode"
      [legend]="legend"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-funnel-chart>
  `,
})
export class FunnelChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'FunnelChart';

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
      throw new Error('FunnelChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() sort: PartWholeSort = 'value-desc';
  @NgInput() orientation: "vertical" | "horizontal" = 'vertical';
  @NgInput() showPercentages: boolean = true;
  @NgInput() percentMode: "ofFirst" | "ofPrevious" = 'ofFirst';
  @NgInput() legend: boolean = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: FunnelChartDatum[] = [];

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
      {
        category: this.category,
        measure: this.measure,
        sort: this.sort,
      },
    );
    this.data = toPartWholeData(model.items);
  }
}
