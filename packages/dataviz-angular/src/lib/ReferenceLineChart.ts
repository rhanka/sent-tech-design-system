import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  LineChart as DsLineChart,
  type ChartReferenceLine,
  type LineChartDatum,
} from '@sentropic/design-system-angular';
import { buildReferenceLineModel, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type ReferenceLineChartProps = {
  store: DashboardStore;
  viewId: string;
  value?: number;
  measure?: string;
  referenceId?: string;
  referenceLabel?: string;
  domainMin?: number;
  domainMax?: number;
  width?: number;
  height?: number;
  label: string;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  class?: string;
};

function xDomain(value: number, domainMin: number | undefined, domainMax: number | undefined): [number, number] {
  const min = domainMin ?? Math.min(0, value);
  const max = domainMax ?? Math.max(1, value);
  return min < max ? [min, max] : [min, min + 1];
}

/**
 * State wiring for a DS Angular LineChart drawing a flat line at the reference
 * value (a fixed number or a measure's aggregate over the cross-filtered rows)
 * plus a vertical reference line at that same value. tools/dataviz-angular-port
 * refuses this shape: `data` is a two-point array literal built from a local
 * `xDomain()` helper, not a bare member read or a single wrapping call.
 */
@Component({
  selector: 'st-dataviz-reference-line-chart',
  standalone: true,
  imports: [DsLineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-line-chart
      [data]="data"
      [width]="width"
      [height]="height"
      [label]="label"
      [referenceLines]="referenceLines"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="classValue"
    ></st-line-chart>
  `,
})
export class ReferenceLineChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ReferenceLineChart';

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
      throw new Error('ReferenceLineChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput() value?: number;
  @NgInput() measure?: string;
  @NgInput() referenceId?: string;
  @NgInput() referenceLabel?: string;
  @NgInput() domainMin?: number;
  @NgInput() domainMax?: number;
  @NgInput() width = 360;
  @NgInput() height = 96;
  @NgInput({ required: true }) label!: string;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: LineChartDatum[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  referenceLines: ChartReferenceLine[] = [];
  /** Recomputed by `recompute()`; never derived in a template getter. */
  classValue = 'st-referenceLineChart';

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
    this.classValue = classNames('st-referenceLineChart', this.classInput);
    if (!this.signals) return;
    void this.signals.state();
    const model = buildReferenceLineModel(this.signals.store.model, this.signals.store.applyCrossfilter(this.viewId), {
      id: this.referenceId,
      label: this.referenceLabel,
      value: this.value,
      measure: this.measure,
    });
    const [min, max] = xDomain(model.value, this.domainMin, this.domainMax);
    this.data = [
      { x: min, y: 0 },
      { x: max, y: 0 },
    ];
    this.referenceLines = [{ axis: 'x', value: model.value, label: model.label, tone: 'info' }];
  }
}
