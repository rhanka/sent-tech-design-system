import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Breadcrumb, Button, Inline, type BreadcrumbItem } from '@sentropic/design-system-angular';
import { findDimension, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type DrillBreadcrumbProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** This view's id (must match the DrillBarChart it accompanies). */
  viewId: string;
  /** The same ordered dimension hierarchy used by the DrillBarChart. */
  hierarchy: string[];
  /** Aria-label of the breadcrumb trail. */
  label?: string;
  /** Label of the "go up one level" button. */
  backLabel?: string;
  class?: string;
};

/**
 * Drill trail (design-system Breadcrumb) plus a "go up one level" button that
 * pops the drill path and clears the value-filter applied at that level.
 *
 * tools/dataviz-angular-port refuses this shape like `DrillBarChart`: it reads
 * reactive drill state to build the trail (see
 * tools/dataviz-angular-port/README.md).
 */
@Component({
  selector: 'st-dataviz-drill-breadcrumb',
  standalone: true,
  imports: [Breadcrumb, Button, Inline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-inline [gap]="2" [class]="classValue">
      <st-breadcrumb [items]="items" [label]="label"></st-breadcrumb>
      @if (canGoBack) {
        <st-button variant="ghost" (click)="back()">{{ backLabel }}</st-button>
      }
    </st-inline>
  `,
})
export class DrillBreadcrumb implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'DrillBreadcrumb';

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
      throw new Error('DrillBreadcrumb: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) hierarchy!: string[];
  @NgInput() label = 'Chemin de drill';
  @NgInput() backLabel = 'Remonter';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  items: BreadcrumbItem[] = [];
  canGoBack = false;
  classValue = 'st-drillBreadcrumb';

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

  back(): void {
    if (!this.signals) return;
    const store = this.signals.store;
    const path = store.getState().drill[this.viewId] ?? [];
    if (path.length === 0) return;
    store.drillUp(this.viewId);
    store.clearFilter(this.hierarchy[path.length - 1]);
  }

  private recompute(): void {
    this.classValue = classNames('st-drillBreadcrumb', this.classInput);
    if (!this.signals) return;
    const state = this.signals.state();
    const store = this.signals.store;
    const path = state.drill[this.viewId] ?? [];
    this.items = this.hierarchy.slice(0, path.length + 1).map((dim, i) => ({
      label: findDimension(store.model, dim)?.label ?? dim,
      current: i === path.length,
    }));
    this.canGoBack = path.length > 0;
  }
}
