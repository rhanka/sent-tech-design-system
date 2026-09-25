import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChordDiagram as DsChordDiagram, type ChordDiagramFlow } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafeFlowModel, toFlowData } from './partOfWholeData.js';

export type ChordChartProps = {
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
 * State wiring for a DS Angular ChordDiagram over a flow model. `toFlowData`
 * returns two members — the links and the node-label map — and both are bound,
 * which is the two-member destructuring the port generator refuses.
 */
@Component({
  selector: 'st-dataviz-chord-chart',
  standalone: true,
  imports: [DsChordDiagram],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-chord-diagram
      [data]="data"
      [labels]="labels"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-chord-diagram>
  `,
})
export class ChordChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ChordChart';

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
      throw new Error('ChordChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) source!: string;
  @NgInput({ required: true }) target!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() width = 480;
  @NgInput() height = 360;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: ChordDiagramFlow[] = [];
  labels: Record<string, string> = {};

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
    const flow = toFlowData(
      buildSafeFlowModel(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
        source: this.source,
        target: this.target,
        measure: this.measure,
      }),
    );
    this.data = flow.data;
    this.labels = flow.labels;
  }
}
