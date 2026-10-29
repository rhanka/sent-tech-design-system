/**
 * Fixed footprints and the measurement API (M3 §4.6.1/§4.6.2/§4.6.4).
 *
 * The engine holds no font metric and no DOM: text measurement is injected
 * through `LineMeasurer`, and the returned `LineLayout` is the shared result
 * that layout and rendering both consume. Layout never alters text; overflow
 * is reported, never truncated, clipped or ellipsised.
 */
import type { EntityRef, OccurrenceRef } from "@sentropic/diagram-core";

import type { TextRole } from "./types.js";

export type { TextRole };

/** Fixed card footprint, card pixels at zoom 1 (M3 §4.6.1). */
export const FIXED_CARD_WIDTH = 460;
export const FIXED_CARD_HEIGHT = 200;
/** Legend-key fixed height; its width follows the legend inner width. */
export const LEGEND_KEY_HEIGHT = 64;
/** Content insets on all four sides of an expanded box. */
export const CONTENT_INSET = 16;
/** Rule gaps of the frozen spacing values. */
export const RULE_GAP = 4;
/** Subtitle to rule gap inside an expanded header band. */
export const SUBTITLE_TO_RULE_GAP = 4;
/** Rule to first-child gap inside an expanded box. */
export const RULE_TO_FIRST_CHILD_GAP = 16;
/** Last-child to bottom gap inside an expanded box. */
export const LAST_CHILD_TO_BOTTOM_GAP = 16;
/** Fold-control reservation reducing title/kicker width when `toggle`. */
export const TOGGLE_ALLOCATION = 32;
/** Swatch reservation reducing a legend-key label width. */
export const SWATCH_ALLOCATION = 32;
/** Probing width for the unwrapped header width of §4.6.2 order (a). */
export const UNWRAPPED_PROBE_WIDTH = 100000;

export interface FootprintDecl {
  readonly width: number;
  readonly height: number;
  readonly fixedAxes: "both" | "height" | "none";
}

export interface MeasureRequest {
  readonly text: string;
  readonly role: TextRole;
  /** Available wrapping width in card pixels for this slot in this entity state. */
  readonly availableWidth: number;
  /** Allocated lines for this slot in this state; overflow is lines beyond this count. */
  readonly allocatedLines: number;
  /** True when the slot belongs to a collapsed (card-form) occurrence. */
  readonly folded: boolean;
}

export interface LineLayout {
  readonly lines: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly overflow: boolean;
}

export type LineMeasurer = (request: MeasureRequest) => LineLayout;

export interface EntityMeasurementInput {
  readonly entity: EntityRef;
  readonly occurrence: OccurrenceRef;
  readonly effectiveType: string;
  readonly folded: boolean;
  readonly toggle: boolean;
  readonly slots: Readonly<Partial<Record<TextRole, string>>>;
  readonly availableWidth: number;
  readonly allocatedLines: Readonly<Partial<Record<TextRole, number>>>;
}

export interface SlotMeasurement {
  readonly occurrence: OccurrenceRef;
  readonly role: TextRole;
  readonly layout: LineLayout;
}

export interface HeaderMeasurement {
  readonly occurrence: OccurrenceRef;
  readonly kicker?: LineLayout;
  readonly title: LineLayout;
  readonly subtitle?: LineLayout;
  readonly height: number;
  readonly overflow: boolean;
}

export interface MeasurementOverflow {
  readonly occurrence: OccurrenceRef;
  readonly slot: TextRole;
  readonly neededHeight: number;
  readonly allocatedHeight: number;
  readonly lines: number;
  readonly allocatedLines: number;
}

export interface LayoutMeasurements {
  readonly headers: readonly HeaderMeasurement[];
  readonly slots: readonly SlotMeasurement[];
  readonly overflows: readonly MeasurementOverflow[];
}

/** Frozen line allocation per slot (M3 §4.6.2). */
export const DEFAULT_ALLOCATED_LINES: Readonly<Record<TextRole, number>> = {
  kicker: 1,
  title: 2,
  body: 4,
  detail: 3,
  footer: 1,
  subtitle: 2,
  "legend-label": 2,
  "edge-label": 1,
};

/** Card inner width for a state: outer width minus content insets. */
export function innerWidthOf(outerWidth: number): number {
  return outerWidth - 2 * CONTENT_INSET;
}

/**
 * Header wrapping width for title/kicker: the card inner width, reduced by
 * the toggle allocation when a fold control is rendered (M3 §4.6.2).
 */
export function headerAvailableWidth(innerWidth: number, toggle: boolean): number {
  return toggle ? innerWidth - TOGGLE_ALLOCATION : innerWidth;
}

/** Header band height consumed by placement (M3 §4.6.2/§4.6.3). */
export function headerBandHeight(kicker: LineLayout | undefined, title: LineLayout, subtitle: LineLayout | undefined): number {
  let height = title.height;
  if (kicker !== undefined) height += RULE_GAP + kicker.height;
  if (subtitle !== undefined) height += SUBTITLE_TO_RULE_GAP + subtitle.height;
  return height;
}

/** Measure one header through the shared measurer (M3 §4.6.3 step 3). */
export function measureHeader(input: EntityMeasurementInput, measure: LineMeasurer): HeaderMeasurement {
  const allocated = (role: TextRole): number => input.allocatedLines[role] ?? DEFAULT_ALLOCATED_LINES[role];
  const at = (role: TextRole, text: string, availableWidth: number): LineLayout =>
    measure({ text, role, availableWidth, allocatedLines: allocated(role), folded: input.folded });
  const titleWidth = headerAvailableWidth(input.availableWidth, input.toggle);
  const kicker = input.slots.kicker === undefined ? undefined : at("kicker", input.slots.kicker, titleWidth);
  const title = at("title", input.slots.title ?? "", titleWidth);
  const subtitle =
    input.slots.subtitle === undefined ? undefined : at("subtitle", input.slots.subtitle, input.availableWidth);
  const height = headerBandHeight(kicker, title, subtitle);
  return {
    occurrence: input.occurrence,
    ...(kicker === undefined ? {} : { kicker }),
    title,
    ...(subtitle === undefined ? {} : { subtitle }),
    height,
    overflow: (kicker?.overflow ?? false) || title.overflow || (subtitle?.overflow ?? false),
  };
}

/** Collect overflow outcomes for header slots (M3 §4.6.4). */
export function headerOverflows(
  input: EntityMeasurementInput,
  header: HeaderMeasurement,
  lineHeightOf: (role: TextRole) => number,
): MeasurementOverflow[] {
  const out: MeasurementOverflow[] = [];
  const entries: readonly (readonly [TextRole, LineLayout | undefined])[] = [
    ["kicker", header.kicker],
    ["title", header.title],
    ["subtitle", header.subtitle],
  ];
  for (const [role, layout] of entries) {
    if (layout === undefined || !layout.overflow) continue;
    const allocatedLines = input.allocatedLines[role] ?? DEFAULT_ALLOCATED_LINES[role];
    out.push({
      occurrence: header.occurrence,
      slot: role,
      neededHeight: layout.height,
      allocatedHeight: allocatedLines * lineHeightOf(role),
      lines: layout.lines.length,
      allocatedLines,
    });
  }
  return out;
}
