import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { PackedBubblesChart as DsPackedBubblesChart, type PackedBubblesChartDatum } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafePackedBubbleModel, toPackedBubbleData } from './partOfWholeData.js';

export type PackedBubbleChartProps = {
  store: DashboardStore;
  viewId: string;
  category: string;
  measure: string;
  sort?: PartWholeSort;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular PackedBubblesChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-packed-bubble-chart',
  standalone: true,
  imports: [DsPackedBubblesChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-packed-bubbles-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-packed-bubbles-chart>
  `,
})
export class PackedBubbleChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'PackedBubbleChart';

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
      throw new Error('PackedBubbleChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) category!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() sort = 'value-desc';
  @NgInput() width = 420;
  @NgInput() height = 320;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: PackedBubblesChartDatum[] = [];

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
    this.data = toPackedBubbleData(
      buildSafePackedBubbleModel(
        this.signals.store.model,
        this.signals.store.applyCrossfilter(this.viewId),
        {
          category: this.category,
          measure: this.measure,
          sort: this.sort,
        },
      ),
    );
  }
}
