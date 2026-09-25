import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { EventFeedPanel as DsEventFeedPanel, type EventFeedPanelEvent } from '@sentropic/design-system-angular';
import { buildEventFeedData, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type EventFeedPanelProps = {
  store: DashboardStore;
  viewId: string;
  at: string;
  type: string;
  severity: string;
  message: string;
  maxHeight?: number;
  height?: number;
  label?: string;
  class?: string;
};

/**
 * State wiring for a DS Angular EventFeedPanel.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: 'st-dataviz-event-feed-panel',
  standalone: true,
  imports: [DsEventFeedPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-event-feed-panel
      [data]="data"
      [label]="label"
      [maxHeight]="maxHeight"
      [height]="height"
      [class]="classInput"
    ></st-event-feed-panel>
  `,
})
export class EventFeedPanel implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'EventFeedPanel';

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
      throw new Error('EventFeedPanel: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) at!: string;
  @NgInput({ required: true }) type!: string;
  @NgInput({ required: true }) severity!: string;
  @NgInput({ required: true }) message!: string;
  @NgInput() maxHeight?: number;
  @NgInput() height?: number;
  @NgInput() label?: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: EventFeedPanelEvent[] = [];

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
    this.data = buildEventFeedData(
      this.signals.store.model,
      this.signals.store.applyCrossfilter(this.viewId),
      {
        at: this.at,
        type: this.type,
        severity: this.severity,
        message: this.message,
      },
    );
  }
}
