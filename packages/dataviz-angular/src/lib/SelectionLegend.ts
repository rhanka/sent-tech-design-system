import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Inline, SelectionChip } from '@sentropic/design-system-angular';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type SelectionLegendProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Map of viewId -> human label for the legend chips (falls back to the id). */
  labels?: Record<string, string>;
  /** Aria-label of the legend group. */
  label?: string;
  class?: string;
};

/** One chip: a view with at least one active selection key. */
type SelectionLegendEntry = {
  viewId: string;
  label: string;
  count: number;
  clear: () => void;
};

/**
 * Per-view selections rendered as design-system `SelectionChip`s. Renders
 * nothing while there is no active selection.
 */
@Component({
  selector: 'st-dataviz-selection-legend',
  standalone: true,
  imports: [Inline, SelectionChip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (entries.length > 0) {
      <st-inline role="group" [attr.aria-label]="label" [gap]="2" [wrap]="true" [class]="classInput">
        @for (entry of entries; track entry.viewId) {
          <st-selection-chip
            [label]="entry.label"
            [count]="entry.count"
            [onClear]="entry.clear"
          ></st-selection-chip>
        }
      </st-inline>
    }
  `,
})
export class SelectionLegend implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'SelectionLegend';

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
      throw new Error('SelectionLegend: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() labels: Record<string, string> = {};
  @NgInput() label = 'Sélections actives';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  entries: SelectionLegendEntry[] = [];

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
    const store = this.signals.store;
    this.entries = Object.entries(this.signals.state().selections)
      .filter(([, keys]) => keys.length > 0)
      .map(([viewId, keys]) => ({
        viewId,
        label: this.labels[viewId] ?? viewId,
        count: keys.length,
        clear: () => store.clearSelection(viewId),
      }));
  }
}
