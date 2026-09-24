import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TreemapChart as DsTreemapChart, type TreemapChartDatum } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { buildSafePartWholeHierarchy, toTreemapData } from './partOfWholeData.js';

export type TreemapChartProps = {
  store: DashboardStore;
  viewId: string;
  hierarchy: string[];
  measure: string;
  showLabels?: boolean;
  legend?: boolean;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/** State wiring for a DS Angular TreemapChart over a part-of-whole hierarchy. */
@Component({
  selector: 'st-dataviz-treemap-chart',
  standalone: true,
  imports: [DsTreemapChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-treemap-chart
      [data]="data"
      [label]="label"
      [showLabels]="showLabels"
      [legend]="legend"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-treemap-chart>
  `,
})
export class TreemapChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'TreemapChart';

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
      throw new Error('TreemapChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) hierarchy!: string[];
  @NgInput({ required: true }) measure!: string;
  @NgInput() showLabels = true;
  @NgInput() legend = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: TreemapChartDatum[] = [];

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
    const node = buildSafePartWholeHierarchy(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      { hierarchy: this.hierarchy, measure: this.measure },
    );
    this.data = toTreemapData(node);
  }
}
