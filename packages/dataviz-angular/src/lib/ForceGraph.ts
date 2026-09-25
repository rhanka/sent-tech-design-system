import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ForceGraph as DsForceGraph } from '@sentropic/design-system-angular';
import { buildForceGraphData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type ForceGraphProps = {
  store: DashboardStore;
  viewId: string;
  source: string;
  target: string;
  weight?: string;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * State wiring for a DS Angular ForceGraph.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-force-graph',
  standalone: true,
  imports: [DsForceGraph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-force-graph
      [nodes]="graph.nodes"
      [edges]="graph.edges"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-force-graph>
  `,
})
export class ForceGraph implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ForceGraph';

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
      throw new Error('ForceGraph: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) source!: string;
  @NgInput({ required: true }) target!: string;
  @NgInput() weight?: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  graph!: ReturnType<typeof buildForceGraphData>;

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
    this.graph = buildForceGraphData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        source: this.source,
        target: this.target,
        weight: this.weight,
      },
    );
  }
}
