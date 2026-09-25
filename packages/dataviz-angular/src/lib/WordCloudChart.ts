import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { WordCloudChart as DsWordCloudChart, type WordCloudChartWord } from '@sentropic/design-system-angular';
import { buildWordCloudData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type WordCloudChartProps = {
  store: DashboardStore;
  viewId: string;
  word_field: string;
  weight: string;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * State wiring for a DS Angular WordCloudChart.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-word-cloud-chart',
  standalone: true,
  imports: [DsWordCloudChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-word-cloud-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-word-cloud-chart>
  `,
})
export class WordCloudChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'WordCloudChart';

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
      throw new Error('WordCloudChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) word_field!: string;
  @NgInput({ required: true }) weight!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: WordCloudChartWord[] = [];

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
    this.data = buildWordCloudData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        word: this.word_field,
        weight: this.weight,
      },
    );
  }
}
