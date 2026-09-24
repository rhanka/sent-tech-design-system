import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { OrganizationChart as DsOrganizationChart, type OrganizationChartNode } from '@sentropic/design-system-angular';
import { buildHierarchyData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type OrganizationChartProps = {
  store: DashboardStore;
  viewId: string;
  id_field: string;
  parent_field: string;
  label_field: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular OrganizationChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-organization-chart',
  standalone: true,
  imports: [DsOrganizationChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-organization-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-organization-chart>
  `,
})
export class OrganizationChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'OrganizationChart';

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
      throw new Error('OrganizationChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) id_field!: string;
  @NgInput({ required: true }) parent_field!: string;
  @NgInput({ required: true }) label_field!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: OrganizationChartNode[] = [];

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
    this.data = buildHierarchyData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        id: this.id_field,
        parentId: this.parent_field,
        label: this.label_field,
      },
    );
  }
}
