import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BarChart as DsBarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-angular';
import { findDimension, findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type CrossfilteredBarChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This chart's view id in the cross-filter graph. */
  viewId: string;
  /** Dimension id to group rows by (one bar per distinct value). */
  dimension: string;
  /** Measure id to aggregate into each bar's value. */
  measure: string;
  /** Accessible label of the chart (required by the design-system BarChart). */
  label: string;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  /**
   * When true (default) clicking a bar toggles this view's selection (brushing
   * input → `store.toggleSelection`); selected bars are highlighted. Set false
   * for an output-only facet.
   */
  selectable?: boolean;
  /** Fixed value-axis domain `[min, max]` for a shared scale across facets. */
  domain?: [number, number];
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

/**
 * State wiring for a DS Angular BarChart whose data is the cross-filtered,
 * aggregated view of the shared store. tools/dataviz-angular-port refuses this
 * shape: `setup()` reads reactive state (`state.value.selections`) to compute
 * `selectedKeys`, but Vue names that local `state` and the extractor's `void
 * <state>.value` anchor only recognises a local read as a *derivation* input,
 * not as a value forwarded straight into a binding (see
 * tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-crossfiltered-bar-chart',
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
      [domain]="domain"
      [selectedKeys]="selectedKeys"
      [onSelect]="onSelectInput"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="classInput"
    ></st-bar-chart>
  `,
})
export class CrossfilteredBarChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'CrossfilteredBarChart';

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
      throw new Error('CrossfilteredBarChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) dimension!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() tone?: BarChartTone;
  @NgInput() selectable = true;
  @NgInput() domain?: [number, number];
  @NgInput() orientation: 'vertical' | 'horizontal' = 'vertical';
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: BarChartDatum[] = [];
  selectedKeys: string[] = [];
  onSelectInput?: (key: string) => void;

  private readonly onSelectHandler = (key: string): void => {
    this.store.toggleSelection(this.viewId, key);
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
    const dim = findDimension(store.model, this.dimension);
    const m = findMeasure(store.model, this.measure);
    this.data =
      dim && m
        ? groupAggregate(store.applyCrossfilter(this.viewId), this.dimension, m).map(({ key, value }) =>
            this.tone ? { label: key, value, tone: this.tone } : { label: key, value },
          )
        : [];
    this.selectedKeys = this.selectable ? (state.selections[this.viewId] ?? []) : [];
    this.onSelectInput = this.selectable ? this.onSelectHandler : undefined;
  }
}
