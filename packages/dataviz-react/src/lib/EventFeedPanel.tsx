import {
  EventFeedPanel as DsEventFeedPanel,
  type EventFeedPanelEvent as DsEventFeedPanelEvent,
} from '@sentropic/design-system-react';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildEventFeedData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type EventFeedPanelProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose numeric value becomes the event timestamp (epoch ms). */
  at: string;
  /** Field id whose value becomes the event type/category (string-coerced). */
  type: string;
  /** Field id whose value becomes the severity (string-coerced, default 'info'). */
  severity: string;
  /** Field id whose value becomes the displayed message (string-coerced). */
  message: string;
  /** Max height in px (triggers vertical scroll). */
  maxHeight?: number;
  /** Fixed height in px (alias of maxHeight). */
  height?: number;
  /** Accessible label for the feed (aria-label). */
  label?: string;
  className?: string;
};

export function EventFeedPanel({
  store,
  viewId,
  at,
  type,
  severity,
  message,
  maxHeight,
  height,
  label,
  className,
}: EventFeedPanelProps) {
  const state = useDashboard(store);
  void state;

  const data = buildEventFeedData(store.model, store.applyCrossfilter(viewId), {
    at,
    type,
    severity,
    message,
  });

  return (
    <DsEventFeedPanel
      data={data as DsEventFeedPanelEvent[]}
      label={label}
      maxHeight={maxHeight}
      height={height}
      className={className}
    />
  );
}
