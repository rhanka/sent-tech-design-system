import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Button as DsButton, Inline as DsInline, type BarChartTone } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { drillLevel, onDrillSelect, type DrillDatum } from './drill.js';
import { DrillBarChart } from './DrillBarChart.js';
import { DonutChart } from './DonutChart.js';
import { TreemapChart } from './TreemapChart.js';

/** Which design-system chart renders the current drill level. */
export type DrillChartKind = 'bar' | 'donut' | 'treemap';

export type DrillChartProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (drill state + cross-filter scope live under it). */
  viewId: string;
  /** Ordered dimension hierarchy; the chart groups by the current drill level. */
  hierarchy: string[];
  /** Measure id aggregated into each datum's value. */
  measure: string;
  /** Accessible label of the chart. */
  label: string;
  /** Design-system chart to render for the current level. Defaults to `'bar'`. */
  kind?: DrillChartKind;
  /** Bar tone (only used by `kind="bar"`). */
  tone?: BarChartTone;
  orientation?: 'vertical' | 'horizontal';
  width?: number;
  height?: number;
  /** Donut diameter (only used by `kind="donut"`). */
  size?: number;
  /** Donut ring thickness (only used by `kind="donut"`). */
  thickness?: number;
  class?: string;
};

/** One drill/select control: the button text and variant are recomputed, not templated. */
type DrillButton = {
  key: string;
  text: string;
  variant: 'primary' | 'ghost';
};

/**
 * A categorical chart that drills through a dimension hierarchy, generalised
 * over the design-system chart kind. The drill state + level maths + the
 * drill-vs-select decision come from the shared engine in `./drill` (a
 * byte-identical copy of the Vue/React helper — see PATTERN.md §3); the
 * visual comes entirely from the already-ported `DrillBarChart`,
 * `DonutChart` and `TreemapChart` adapters.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` branches over
 * `kind`, delegates to three sibling wrappers and renders an accessible row
 * of buttons besides the visual (`setup body matches no supported shape`;
 * see tools/dataviz-angular-port/README.md). The state wiring is otherwise
 * the recipe PATTERN.md documents, so the adapter is hand-written and was
 * never extracted.
 *
 * `kind="bar"` delegates to {@link DrillBarChart}, whose BarChart already
 * owns the click surface. `kind="donut" | "treemap"` render the matching
 * adapter for the visual (DS donut/treemap are presentational) plus an
 * accessible row of DS Buttons that performs the drill — composition, no new
 * visuals.
 */
@Component({
  selector: 'st-dataviz-drill-chart',
  standalone: true,
  imports: [DsButton, DsInline, DrillBarChart, DonutChart, TreemapChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (kind === 'bar') {
      <st-dataviz-drill-bar-chart
        [store]="store"
        [viewId]="viewId"
        [hierarchy]="hierarchy"
        [measure]="measure"
        [label]="label"
        [tone]="tone"
        [orientation]="orientation"
        [width]="width"
        [height]="height"
        [class]="classInput"
      ></st-dataviz-drill-bar-chart>
    } @else {
      <st-inline [gap]="2" [class]="classInput">
        @if (kind === 'donut') {
          <st-dataviz-donut-chart
            [store]="store"
            [viewId]="viewId"
            [category]="donutCategory"
            [measure]="measure"
            [label]="label"
            [size]="size"
            [thickness]="thickness"
          ></st-dataviz-donut-chart>
        } @else {
          <st-dataviz-treemap-chart
            [store]="store"
            [viewId]="viewId"
            [hierarchy]="treemapHierarchy"
            [measure]="measure"
            [label]="label"
            [width]="width"
            [height]="height"
          ></st-dataviz-treemap-chart>
        }
        <st-inline [gap]="1" role="group" [ariaLabel]="controlsLabel">
          @for (button of buttons; track button.key) {
            <st-button [variant]="button.variant" (click)="select(button.key)">{{ button.text }}</st-button>
          }
        </st-inline>
      </st-inline>
    }
  `,
})
export class DrillChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DrillChart';

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
      throw new Error('DrillChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) hierarchy!: string[];
  @NgInput({ required: true }) measure!: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() kind: DrillChartKind = 'bar';
  @NgInput() tone?: BarChartTone;
  @NgInput() orientation: 'vertical' | 'horizontal' = 'vertical';
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() size?: number;
  @NgInput() thickness?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  donutCategory = '';
  treemapHierarchy: string[] = [];
  controlsLabel = '';
  buttons: DrillButton[] = [];

  readonly select = (key: string): void => {
    if (!this.signals) return;
    onDrillSelect(this.signals.store, this.viewId, this.hierarchy, key);
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
    const level = drillLevel(store, this.viewId, this.hierarchy, this.measure);
    const selectedKeys = state.selections[this.viewId] ?? [];
    this.donutCategory = level.dimension ?? this.hierarchy[0] ?? '';
    this.treemapHierarchy = level.dimension ? [level.dimension] : [...this.hierarchy];
    this.controlsLabel = `${this.label} — ${level.canDrill ? 'drill' : 'select'}`;
    this.buttons = level.data.map((datum: DrillDatum) => ({
      key: datum.key,
      text: `${datum.key}: ${datum.value}`,
      variant: !level.canDrill && selectedKeys.includes(datum.key) ? 'primary' : 'ghost',
    }));
  }
}
