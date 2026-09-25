import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FilterBar, FilterPill } from '@sentropic/design-system-angular';
import { describeFilterSpec, findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type DashboardActiveFiltersProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Aria-label of the filter group. */
  label?: string;
  /** Label of the "clear all" button (design-system default otherwise). */
  clearAllLabel?: string;
  class?: string;
};

/** One rendered chip: the DS FilterPill inputs plus its remove handler. */
type FilterPillView = {
  dimensionId: string;
  field: string;
  value: string;
  remove: () => void;
};

/**
 * Active filters rendered as design-system `FilterPill`s wired to the store.
 * "Clear all" clears only the filters, leaving any selections intact.
 *
 * tools/dataviz-angular-port refuses this shape: it reads reactive filter
 * state to build the pill list (see tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-dashboard-active-filters',
  standalone: true,
  imports: [FilterBar, FilterPill],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-filter-bar
      [label]="label"
      [clearAllLabel]="clearAllLabel"
      [onClearAll]="onClearAllInput"
      [class]="classInput"
    >
      @for (pill of pills; track pill.dimensionId) {
        <st-filter-pill [field]="pill.field" [value]="pill.value" [onRemove]="pill.remove"></st-filter-pill>
      }
    </st-filter-bar>
  `,
})
export class DashboardActiveFilters implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DashboardActiveFilters';

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
      throw new Error('DashboardActiveFilters: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() label = 'Filtres actifs';
  @NgInput() clearAllLabel?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  pills: FilterPillView[] = [];
  onClearAllInput?: () => void;

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
    const entries = Object.entries(state.filters);
    this.pills = entries.map(([dimensionId, spec]) => {
      const dimension = findDimension(store.model, dimensionId);
      return {
        dimensionId,
        field: dimension?.label ?? dimensionId,
        value: describeFilterSpec(spec, dimension),
        remove: () => store.clearFilter(dimensionId),
      };
    });
    this.onClearAllInput =
      entries.length > 0
        ? () => {
            for (const id of Object.keys(store.getState().filters)) store.clearFilter(id);
          }
        : undefined;
  }
}
