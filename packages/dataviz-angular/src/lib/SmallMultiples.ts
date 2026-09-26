import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Grid as DsGrid } from '@sentropic/design-system-angular';
import { BarChart as DsBarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-angular';
import { findDimension, findMeasure, groupAggregate, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type SmallMultiplesProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id in the cross-filter graph. */
  viewId: string;
  /** Dimension whose distinct values each produce one facet (panel). */
  facetBy: string;
  /** Dimension to group rows by inside each facet (bar categories). */
  dimension: string;
  /** Measure id aggregated into each bar's value. */
  measure: string;
  /** Accessible label; each facet chart is "<label> — <facet key>". */
  label: string;
  /** Number of grid columns (design-system Grid). Defaults to 2. */
  columns?: number;
  /** Bar colour tone from the design system. */
  tone?: BarChartTone;
  class?: string;
};

/** One facet panel: a shared-domain bar dataset with its heading. */
type FacetPanel = {
  key: string;
  data: BarChartDatum[];
  label: string;
};

const keyOf = (v: unknown): string => (v == null ? 'null' : String(v));

/**
 * Faceting / trellis: one design-system `BarChart` per distinct `facetBy`
 * value, laid out in a `Grid`, all sharing a single value `domain` so the
 * facets are visually comparable.
 *
 * tools/dataviz-angular-port refuses this shape: the setup builds the panels
 * with hand-written data construction (distinct-key scan, per-facet
 * aggregation, shared min/max domain) instead of one supported builder call
 * (`setup body matches no supported shape`; see
 * tools/dataviz-angular-port/README.md). The state wiring is otherwise the
 * recipe PATTERN.md documents, so the adapter is hand-written and was never
 * extracted. Every builder it needs (`findDimension`, `findMeasure`,
 * `groupAggregate`) is already in `@sentropic/dataviz-core`.
 *
 * `role`/`aria-label` ride on the `st-grid` host: the DS `Grid` declares no
 * inputs for them, and the parity flattener unwraps `st-*` hosts, so the run
 * measures that framework-position residue instead of hiding it.
 */
@Component({
  selector: 'st-dataviz-small-multiples',
  standalone: true,
  imports: [DsGrid, DsBarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-grid [columns]="columns" [gap]="4" [class]="classInput" role="group" [attr.aria-label]="label">
      @for (panel of panels; track panel.key) {
        <st-bar-chart [data]="panel.data" [label]="panel.label" [domain]="domain"></st-bar-chart>
      }
    </st-grid>
  `,
})
export class SmallMultiples implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'SmallMultiples';

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
      throw new Error('SmallMultiples: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) facetBy!: string;
  @NgInput({ required: true }) dimension!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() columns = 2;
  @NgInput() tone?: BarChartTone;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  panels: FacetPanel[] = [];
  domain?: [number, number];

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
    const store = this.signals.store;
    const fdim = findDimension(store.model, this.facetBy);
    const dim = findDimension(store.model, this.dimension);
    const m = findMeasure(store.model, this.measure);
    let panels: FacetPanel[] = [];
    let domain: [number, number] | undefined;
    if (fdim && dim && m) {
      const rows = store.applyCrossfilter(this.viewId);
      const keys: string[] = [];
      const seen = new Set<string>();
      for (const row of rows) {
        const k = keyOf(row[this.facetBy]);
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
      let min = 0;
      let max = 0;
      panels = keys.map((k) => {
        const facetRows = rows.filter((row) => keyOf(row[this.facetBy]) === k);
        const data = groupAggregate(facetRows, this.dimension, m).map(({ key: barKey, value }) => {
          if (value < min) min = value;
          if (value > max) max = value;
          return this.tone ? { label: barKey, value, tone: this.tone } : { label: barKey, value };
        });
        return { key: k, data, label: `${this.label} — ${k}` };
      });
      // Shared domain anchored at 0 (keeps negatives in view for mixed facets).
      domain = panels.length ? [min, max] : undefined;
    }
    this.panels = panels;
    this.domain = domain;
  }
}
