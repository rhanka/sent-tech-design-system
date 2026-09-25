import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BarChart as DsBarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-angular';
import { findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type DrillBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; bars group by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  class?: string;
};

/**
 * A bar chart that drills through a dimension hierarchy: clicking a bar filters
 * the clicked value and pushes the next level as group-by. At the deepest level
 * a click toggles this view's selection (brushing) instead.
 *
 * tools/dataviz-angular-port refuses this shape for the same reason as
 * `CrossfilteredBarChart`: `setup()` reads reactive drill state to pick the
 * current hierarchy level, and the extractor's `void <state>.value` anchor does
 * not recognise a local read used to drive branching logic (see
 * tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-drill-bar-chart',
  standalone: true,
  imports: [DsBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bar-chart
      [data]="data"
      [label]="label"
      [orientation]="orientation"
      [width]="width"
      [height]="height"
      [selectedKeys]="selectedKeys"
      [onSelect]="onSelectHandler"
      [class]="classInput"
    ></st-bar-chart>
  `,
})
export class DrillBarChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DrillBarChart';

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
      throw new Error('DrillBarChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) hierarchy!: string[];
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() tone?: BarChartTone;
  @NgInput() orientation: 'vertical' | 'horizontal' = 'vertical';
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: BarChartDatum[] = [];
  selectedKeys: string[] = [];

  private currentLevel = 0;
  private currentDim = '';
  private canDrill = false;

  readonly onSelectHandler = (key: string): void => {
    if (this.canDrill) {
      this.store.setFilter(this.currentDim, { kind: 'include', values: [key] });
      this.store.drillDown(this.viewId, this.hierarchy[this.currentLevel + 1]);
    } else {
      this.store.toggleSelection(this.viewId, key);
    }
  };

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
    const state = this.signals.state();
    const store = this.signals.store;
    const path = state.drill[this.viewId] ?? [];
    this.currentLevel = Math.min(path.length, Math.max(this.hierarchy.length - 1, 0));
    this.currentDim = this.hierarchy[this.currentLevel];
    this.canDrill = this.currentLevel < this.hierarchy.length - 1;
    const m = findMeasure(store.model, this.measure);
    this.data =
      m && this.currentDim
        ? groupAggregate(store.applyCrossfilter(this.viewId), this.currentDim, m).map(({ key, value }) =>
            this.tone ? { label: key, value, tone: this.tone } : { label: key, value },
          )
        : [];
    this.selectedKeys = this.canDrill ? [] : (state.selections[this.viewId] ?? []);
  }
}
