/** Flow-sized channels. All dimensions are world px, independent of the viewport. */
import type { LayoutMetrics } from './types.js';
export interface ChannelMetrics {
  readonly gapMin: number;
  readonly gapBase: number;
  readonly trackSpacing: number;
  readonly labelBand: number;
  readonly gapMax: number;
}
export function channelMetrics(metrics: Partial<LayoutMetrics>, horizontal: boolean): ChannelMetrics {
  return {
    gapMin: (horizontal ? metrics.gapMin : metrics.gapMinBlock) ?? (horizontal ? 96 : 72),
    gapBase: (horizontal ? metrics.gapBase : metrics.gapBaseBlock) ?? (horizontal ? 64 : 8),
    trackSpacing: (horizontal ? metrics.trackSpacing : metrics.trackSpacingBlock) ?? (horizontal ? 14 : 7),
    labelBand: metrics.labelBand ?? 30,
    gapMax: (horizontal ? metrics.gapInlineMax : metrics.gapBlockMax) ?? metrics.gapMax ?? 240,
  };
}
export function channelGap(n: number, labelled: boolean, metrics: ChannelMetrics): number {
  return n === 0 ? metrics.gapMin : Math.min(metrics.gapMax,
    Math.max(metrics.gapMin, metrics.gapBase + n * metrics.trackSpacing + (labelled ? metrics.labelBand : 0)));
}
export interface LayoutChannel {
  readonly id: string;
  /** Axis of the gap (horizontal gap separates columns). */
  readonly axis: 'horizontal' | 'vertical';
  readonly edges: readonly string[];
  readonly strips: readonly { readonly x: number; readonly y: number; readonly width: number; readonly height: number }[];
  readonly n: number;
  readonly labelled: boolean;
  readonly gap: number;
  readonly expected: number;
}
