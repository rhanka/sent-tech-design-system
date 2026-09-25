import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FlamegraphChart as DsFlamegraphChart, type FlamegraphNode } from '@sentropic/design-system-angular';
import { buildFlamegraphData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type FlamegraphChartProps = {
  store: DashboardStore;
  viewId: string;
  id: string;
  parentId: string;
  name: string;
  value: string;
  width?: number;
  height?: number;
  size?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular FlamegraphChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-flamegraph-chart',
  standalone: true,
  imports: [DsFlamegraphChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-flamegraph-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [size]="size"
      [class]="classInput"
    ></st-flamegraph-chart>
  `,
})
export class FlamegraphChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'FlamegraphChart';

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
      throw new Error('FlamegraphChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) id!: string;
  @NgInput({ required: true }) parentId!: string;
  @NgInput({ required: true }) name!: string;
  @NgInput({ required: true }) value!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data!: FlamegraphNode;

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
    this.data = buildFlamegraphData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        id: this.id,
        parentId: this.parentId,
        name: this.name,
        value: this.value,
      },
    );
  }
}
