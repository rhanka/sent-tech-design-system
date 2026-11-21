/**
 * DC-2b seam (SPEC_EVOL_DC2A §6.6): the fingerprint of everything a measured
 * layout call depends on besides the document and the injected measurer, as
 * RESOLVED numbers — defaults applied in the one place the engine applies
 * them. A layout cache keys on it; `diagram-canvas` holds no cache itself.
 *
 * It covers: the engine version, the fold state, the resolved row-pack
 * objective (hysteresis included), the resolved sibling gaps and caps, the
 * engine metrics, the previous-orientation map, the authored hints, the view
 * id, and — when the caller has them — a digest of the measured sizes and the
 * resolved token numbers. `targetWidth` is absent on purpose: it never
 * re-packs a measured view (D-3).
 *
 * The token version is the digest of the resolved token numbers: tokens reach
 * the engine as numbers (§6.2), so a token change changes the fingerprint in
 * the call that observes it, with no token-version export.
 */
import { DEFAULT_EDGE_LABEL_SIZE } from "../camera.js";
import { isR7ConnectorPresentation } from "../r7Mode.js";
import { isLayoutGroup, resolveRowGaps, type LayoutGroup, type LayoutHints } from "./hints.js";
import type { LayoutMeasurements } from "./measure.js";
import { channelMetrics } from "./channels.js";
import { DEFAULT_ROUTE_BORDER_CLEARANCE, DEFAULT_ROUTE_SPACING } from "./routeSpacing.js";
import { DEFAULT_LAYOUT_METRICS, resolveRowPack, type LayoutMetrics, type LayoutOptions } from "./types.js";

/** Bumped whenever measured placement changes for unchanged inputs. */
export const LAYOUT_ENGINE_VERSION = "de2.gutter.1";

export interface LayoutFingerprintInput {
  readonly options: Pick<LayoutOptions, "collapsed" | "hints" | "metrics" | "presentation" | "rowPack" | "previousOrientation" | "viewId" | "flows" | "flowTokens">;
  /** Measured sizes of a previous call on the same document and measurer, when a cache has them. */
  readonly measurements?: LayoutMeasurements;
  /** Resolved token numbers the host read (gaps, caps, target aspect, display scales, …), by token name. */
  readonly tokens?: Readonly<Record<string, number>>;
  /** Explicit override when the caller also inspects a retained source view for r7 connector attributes. */
  readonly r7Routing?: boolean;
}

const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

/** JSON with object keys sorted: equal values give equal text, whatever the insertion order. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort(byString)
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** FNV-1a over UTF-16 code units, two seeds: 16 hex digits. A cache key, not a security digest. */
export function digestOf(text: string): string {
  let high = 0x811c9dc5;
  let low = 0x01000193;
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    high = Math.imul(high ^ unit, 0x01000193) >>> 0;
    low = Math.imul(low ^ (unit + index), 0x811c9dc5) >>> 0;
  }
  return high.toString(16).padStart(8, "0") + low.toString(16).padStart(8, "0");
}

const groupOf = (group: LayoutGroup): unknown => ({
  id: group.id,
  direction: group.direction,
  stretch: group.stretch,
  gapAfter: group.gapAfter,
  items: group.items.map((item) => (isLayoutGroup(item) ? groupOf(item) : item)),
});

/** The resolved inputs behind the fingerprint, for a cache that wants to compare or log them. */
export function layoutFingerprintInputs(input: LayoutFingerprintInput): Readonly<Record<string, unknown>> {
  const { options } = input;
  const r7Routing = input.r7Routing ?? isR7ConnectorPresentation(options.presentation);
  const metrics: LayoutMetrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
  const hints: LayoutHints = options.hints ?? {};
  const gaps = resolveRowGaps(hints, metrics, r7Routing);
  const tokens = input.tokens ?? {};
  const routeSpacing = r7Routing ? (options.metrics?.routeSpacing ?? DEFAULT_ROUTE_SPACING) : 0;
  const routeBorderClearance = r7Routing
    ? (options.metrics?.routeBorderClearance ?? DEFAULT_ROUTE_BORDER_CLEARANCE)
    : metrics.clearance;
  const baseSlotSpacing = options.metrics?.trackSpacing ?? channelMetrics({}, true).trackSpacing;
  const slotSpacing =
    options.metrics?.slotSpacing ??
    (r7Routing ? Math.max(routeSpacing, baseSlotSpacing) : baseSlotSpacing);
  const edgeLabelSize =
    metrics.edgeLabelSize !== undefined && Number.isFinite(metrics.edgeLabelSize) && metrics.edgeLabelSize > 0
      ? metrics.edgeLabelSize
      : DEFAULT_EDGE_LABEL_SIZE;
  return {
    engine: LAYOUT_ENGINE_VERSION,
    flows: options.flows,
    flowTokens: options.flowTokens,
    fold: [...(options.collapsed ?? [])].map(String).sort(byString),
    rowPack: resolveRowPack(options.rowPack),
    gaps,
    channels: { inline: channelMetrics(metrics, true), block: channelMetrics(metrics, false), bundleLabelMaxWidth: metrics.bundleLabelMaxWidth ?? 320 },
    metrics: {
      clearance: metrics.clearance,
      labelMargin: metrics.labelMargin,
      routeSpacing,
      routeBorderClearance,
      slotSpacing,
      nodeGap: metrics.nodeGap,
      edgeLabelSize,
    },
    previousOrientation: Object.entries(options.previousOrientation ?? {}).sort(([left], [right]) => byString(left, right)),
    hints: {
      ordering: hints.ordering,
      rootOrder: hints.rootOrder,
      grouping: (hints.grouping ?? []).map(groupOf),
      stretch: hints.stretch ?? false,
    },
    viewId: options.viewId,
    measuredSizes: input.measurements === undefined ? undefined : digestOf(canonical(input.measurements)),
    // Token version = digest of the resolved token numbers (no token-version export).
    tokens: digestOf(canonical({ ...tokens, ...gaps, targetAspect: resolveRowPack(options.rowPack).targetAspect })),
  };
}

/** The cache-key fingerprint of a measured layout call (§6.6). */
export function layoutFingerprint(input: LayoutFingerprintInput): string {
  return digestOf(canonical(layoutFingerprintInputs(input)));
}
