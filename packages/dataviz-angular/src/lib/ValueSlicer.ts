import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { CheckboxGroup, type CheckboxGroupOption } from '@sentropic/design-system-angular';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type ValueSlicerProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Dimension whose distinct values become the slicer's checkboxes. */
  dimension: string;
  /** Legend; defaults to the dimension label. */
  legend?: string;
  orientation?: 'vertical' | 'horizontal';
  class?: string;
};

const keyOf = (v: unknown): string => (v == null ? 'null' : String(v));

/**
 * A checkbox slicer over a dimension's distinct values: checked values become
 * an `include` filter (an OR within the dimension). Design-system
 * CheckboxGroup.
 *
 * tools/dataviz-angular-port refuses this shape: it reads the current filter
 * from reactive state to keep the checkboxes in sync when another component
 * clears or replaces the filter (see tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-value-slicer',
  standalone: true,
  imports: [CheckboxGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-checkbox-group
      [legend]="legendValue"
      [options]="options"
      [value]="value"
      [orientation]="orientation"
      [onChange]="onChangeHandler"
      [class]="classValue"
    ></st-checkbox-group>
  `,
})
export class ValueSlicer implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'ValueSlicer';

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
      throw new Error('ValueSlicer: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) dimension!: string;
  @NgInput() legend?: string;
  @NgInput() orientation: 'vertical' | 'horizontal' = 'vertical';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  legendValue = '';
  options: CheckboxGroupOption[] = [];
  value: string[] = [];
  classValue = 'st-valueSlicer';

  readonly onChangeHandler = (values: string[]): void => {
    if (values.length) this.store.setFilter(this.dimension, { kind: 'include', values });
    else this.store.clearFilter(this.dimension);
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
    this.classValue = classNames('st-valueSlicer', this.classInput);
    if (!this.signals) return;
    const state = this.signals.state();
    const store = this.signals.store;
    this.legendValue = this.legend ?? findDimension(store.model, this.dimension)?.label ?? this.dimension;
    const seen = new Set<string>();
    const options: CheckboxGroupOption[] = [];
    for (const row of store.data) {
      const k = keyOf(row[this.dimension]);
      if (!seen.has(k)) {
        seen.add(k);
        options.push({ label: k, value: k });
      }
    }
    this.options = options;
    const f = state.filters[this.dimension];
    this.value = f && f.kind === 'include' ? [...f.values] : [];
  }
}
