import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { RangeSlider } from '@sentropic/design-system-angular';
import { findDimension, type DashboardStore, type FilterSpec, type Row } from '@sentropic/dataviz-core';

export type NumericDomain = { min: number; max: number };

export type RangeSliderFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Continuous numeric dimension to filter. */
  dimension: string;
  label?: string;
  /** Lower bound of the track; defaults to the data minimum. */
  min?: number;
  /** Upper bound of the track; defaults to the data maximum. */
  max?: number;
  step?: number;
  class?: string;
};

/**
 * Pure: the numeric `[min, max]` domain of a dimension across rows (finite
 * values only). Returns `{ min: 0, max: 0 }` when no finite value is present.
 */
export function numericDomain(data: readonly Row[], dimension: string): NumericDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const v = row[dimension];
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/**
 * Pure: the two range-slider handles → a core `range` FilterSpec (bounds
 * normalized so `lo <= hi`), or `null` when they span the whole domain.
 */
export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  if (lo <= domain.min && hi >= domain.max) return null;
  return { kind: 'range', min: lo, max: hi };
}

/**
 * A two-handle numeric range filter built on the design-system RangeSlider,
 * bound to a core `range` filter on a continuous dimension.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` keeps its handles
 * in a plain `ref` watched for its side effect, never read as a rendered
 * value, so there is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md). The domain is captured once, like the
 * React `useState` initializer: a later `dimension` re-applies the current
 * handles against the first domain.
 */
@Component({
  selector: 'st-dataviz-range-slider-filter',
  standalone: true,
  imports: [RangeSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-range-slider
      [label]="sliderLabel"
      [modelValue]="sliderValue"
      [min]="domain.min"
      [max]="domain.max"
      [step]="step"
      [showValue]="true"
      [class]="classInput"
      (valueChange)="handleValueChange($event)"
    ></st-range-slider>
  `,
})
export class RangeSliderFilter implements OnInit, OnChanges {
  static readonly stComponentName = 'RangeSliderFilter';

  private storeValue?: DashboardStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    this.storeValue = value;
  }

  get store(): DashboardStore {
    if (!this.storeValue) {
      throw new Error('RangeSliderFilter: store is required.');
    }
    return this.storeValue;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput() label?: string;
  @NgInput() min?: number;
  @NgInput() max?: number;
  @NgInput() step = 1;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  domain: NumericDomain = { min: 0, max: 0 };
  sliderValue: [number, number] = [0, 0];
  sliderLabel = '';

  private domainInit = false;

  ngOnInit(): void {
    this.recompute();
    this.apply();
  }

  /**
   * Mirrors the React effect dependency list (`[store, dimension, value,
   * domain]`): a new `store` or `dimension` re-applies the handles the slider
   * currently holds.
   */
  ngOnChanges(): void {
    this.recompute();
    this.apply();
  }

  handleValueChange(value: [number, number]): void {
    this.sliderValue = value;
    this.apply();
  }

  private recompute(): void {
    const store = this.storeValue;
    if (!store) return;
    if (!this.domainInit) {
      const d = numericDomain(store.data, this.dimension);
      this.domain = { min: this.min ?? d.min, max: this.max ?? d.max };
      this.sliderValue = [this.domain.min, this.domain.max];
      this.domainInit = true;
    }
    this.sliderLabel = this.label ?? findDimension(store.model, this.dimension)?.label ?? this.dimension;
  }

  private apply(): void {
    if (!this.storeValue) return;
    const spec = rangeBoundsToSpec(this.sliderValue[0], this.sliderValue[1], this.domain);
    if (spec) this.store.setFilter(this.dimension, spec);
    else this.store.clearFilter(this.dimension);
  }
}
