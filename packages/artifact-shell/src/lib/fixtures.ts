// Fixture factories for the AS-1 fixture matrix (spec §5.4). Factories return
// plain display models — no component imports. All sentinel strings are
// non-real so witnesses prove nothing is hard-coded in components.
import { foundation } from "@sentropic/design-system-tokens";
import type { BlockDisplay, RectDisplay } from "./types.js";

const SENTINEL = "SENTINEL";

/** The label set every mode fixture swaps as a whole (witness F-X1). */
export type FixtureLabels = {
  toggleLabel: string;
  shortcutLabel: string;
  ariaKeyshortcuts: string;
  tooltip: string;
  statusText: string;
  announcementText: string;
  hintText: string;
  chipLabel: string;
  headingLabel: string;
};

export function modeLabels(overrides: Partial<FixtureLabels> = {}): FixtureLabels {
  const shortcutLabel = overrides.shortcutLabel ?? `${SENTINEL}-SHORTCUT+Alt+Z`;
  return {
    toggleLabel: overrides.toggleLabel ?? `${SENTINEL}-TOGGLE-LABEL`,
    shortcutLabel,
    // Non-real but WAI-ARIA-grammar-valid sentinel (Alt+Shift+Z).
    ariaKeyshortcuts: overrides.ariaKeyshortcuts ?? "Alt+Shift+Z",
    // The tooltip must contain shortcutLabel verbatim (W-1.1).
    tooltip: overrides.tooltip ?? `${SENTINEL}-TOOLTIP (${shortcutLabel})`,
    statusText: overrides.statusText ?? `${SENTINEL}-STATUS-TEXT`,
    announcementText: overrides.announcementText ?? `${SENTINEL}-ANNOUNCEMENT-TEXT`,
    hintText: overrides.hintText ?? `${SENTINEL}-HINT-TEXT`,
    chipLabel: overrides.chipLabel ?? `${SENTINEL}-CHIP-LABEL`,
    headingLabel: overrides.headingLabel ?? `${SENTINEL}-HEADING-LABEL`
  };
}

export function makeBlock(overrides: Partial<BlockDisplay> = {}): BlockDisplay {
  const rect: RectDisplay = { x: 8, y: 16, width: 120, height: 24, ...overrides.rect };
  return {
    key: overrides.key ?? "sentinel-block-key-1",
    label: overrides.label ?? `${SENTINEL}-BLOCK-LABEL-1`,
    rect,
    kindLabel: overrides.kindLabel ?? `${SENTINEL}-KIND-HEADING`,
    threadCount: overrides.threadCount ?? 0
  };
}

/** n candidate blocks in reading order, with distinct keys and labels. */
export function makeBlocks(n: number, overrides: Partial<BlockDisplay> = {}): BlockDisplay[] {
  return Array.from({ length: n }, (_, i) =>
    makeBlock({
      ...overrides,
      key: overrides.key !== undefined ? `${overrides.key}-${i + 1}` : `sentinel-block-key-${i + 1}`,
      label: overrides.label !== undefined ? `${overrides.label}-${i + 1}` : `${SENTINEL}-BLOCK-LABEL-${i + 1}`,
      rect: { x: 8, y: 16 + i * 32, width: 120, height: 24, ...overrides.rect }
    })
  );
}

/** Authored-page background fixtures for highlight contrast (F-H1 cells):
 *  a light authored page and a dark authored page, as fixture wrapper
 *  backgrounds. Values come from the foundation token table — spec §11 bars
 *  any raw colour literal outside the token table, so no hex is written here
 *  (the import-graph gate scans for them). */
export const pageBackgrounds = {
  pageLight: { background: foundation.color.slate[10] },
  pageDark: { background: foundation.color.slate[90] }
} as const;
