import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { SankeyChart as DsSankeyChart } from '@sentropic/design-system-angular';
import { type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeFlowModel } from './partOfWholeData.js';

export type SankeyChartProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  measure: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular SankeyChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-sankey-chart',
  standalone: true,
  imports: [DsSankeyChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-sankey-chart
      [nodes]="model.nodes"
      [links]="model.links"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-sankey-chart>
  `,
})
export class SankeyChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'SankeyChart';

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
      throw new Error('SankeyChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) source!: string;
  @NgInput({ required: true }) target!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  model!: ReturnType<typeof buildSafeFlowModel>;

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
    this.model = buildSafeFlowModel(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        source: this.source,
        target: this.target,
        measure: this.measure,
      },
    );
  }
}
