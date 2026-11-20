import { DIAGRAM_SCENE_SPACING as spacing } from './spacing.generated.js';
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
    gapMin: (horizontal ? metrics.gapMin : metrics.gapMinBlock) ?? (horizontal ? spacing.gapMin : spacing.gapMinBlock),
    gapBase: (horizontal ? metrics.gapBase : metrics.gapBaseBlock) ?? (horizontal ? spacing.gapBase : spacing.gapBaseBlock),
    trackSpacing: (horizontal ? metrics.trackSpacing : metrics.trackSpacingBlock) ?? (horizontal ? spacing.trackSpacing : spacing.trackSpacingBlock),
    labelBand: metrics.labelBand ?? spacing.labelBand,
    gapMax: (horizontal ? metrics.gapInlineMax : metrics.gapBlockMax) ?? metrics.gapMax ?? spacing.gapMax,
  };
}
export function channelGap(n: number, labelled: boolean, metrics: ChannelMetrics): number {
  return n === 0 ? metrics.gapMin : Math.min(metrics.gapMax,
    Math.max(metrics.gapMin, metrics.gapBase + n * metrics.trackSpacing + (labelled ? metrics.labelBand : 0)));
}
/** Maximum number of parallel longitudinal tracks a gutter of width `gap` holds at `routeSpacing` with `borderClearance` on both sides. */
export function channelCapacity(
  gap: number,
  routeSpacing: number = spacing.routeSpacing,
  borderClearance: number = spacing.routeBorderClearance,
): number {
  const usable = gap - 2 * borderClearance;
  if (usable < 0) return 0;
  if (!(routeSpacing > 0)) return 1;
  return Math.floor(usable / routeSpacing) + 1;
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
  /** Parallel longitudinal track capacity of this gutter at current spacing tokens (DE-2). */
  readonly capacity?: number;
}
