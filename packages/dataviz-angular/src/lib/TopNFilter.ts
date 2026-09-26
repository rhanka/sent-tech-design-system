import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { NumberInput } from '@sentropic/design-system-angular';
import { findMeasure, groupAggregate, type DashboardStore, type Row } from '@sentropic/dataviz-core';

export type TopNFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension to restrict to its top-N values. */
  dimension: string;
  /** Measure used to rank the dimension's values (descending). */
  measure: string;
  /** Initial N. Defaults to 5. */
  defaultN?: number;
  /** Field label of the number input. */
  label?: string;
  class?: string;
};

/**
 * Restricts a dimension to its top-N values by a measure (ranked over the full
 * dataset), via a design-system NumberInput. Applies on mount and on change.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` keeps N in a plain
 * `ref` watched for its side effect, never read as a rendered value, so there
 * is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-top-n-filter',
  standalone: true,
  imports: [NumberInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-number-input
      [label]="label"
      [modelValue]="n"
      [min]="1"
      [step]="1"
      [class]="classInput"
      (modelValueChange)="handleValueChange($event)"
    ></st-number-input>
  `,
})
export class TopNFilter implements OnInit, OnChanges {
  static readonly stComponentName = 'TopNFilter';

  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('TopNFilter: store is required.');
    }
    return this.storeValue;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput({ required: true }) measure!: string;
  @NgInput() defaultN = 5;
  @NgInput() label = 'Top N';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  n = 5;

  private nInit = false;

  ngOnInit(): void {
    this.recompute();
    this.apply();
  }

  /**
   * Mirrors the React effect dependency list (`[store, dimension, measure,
   * n]`): a new `store`, `dimension` or `measure` re-applies the N the input
   * currently holds.
   */
  ngOnChanges(): void {
    this.recompute();
    this.apply();
  }

  handleValueChange(value: number | null): void {
    const num = Number(value);
    if (Number.isFinite(num)) {
      this.n = num;
      this.apply();
    }
  }

  private recompute(): void {
    if (!this.nInit) {
      this.n = this.defaultN;
      this.nInit = true;
    }
  }

  private apply(): void {
    if (!this.storeValue) return;
    const m = findMeasure(this.store.model, this.measure);
    if (!m || !Number.isFinite(this.n) || this.n < 1) return;
    const ranked = groupAggregate([...(this.store.data as readonly Row[])], this.dimension, m)
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, this.n)
      .map((r) => r.key);
    this.store.setFilter(this.dimension, { kind: 'include', values: ranked });
  }
}
