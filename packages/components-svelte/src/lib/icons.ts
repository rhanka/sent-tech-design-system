import {
  Settings,
  Eye,
  EyeOff,
  Layers,
  Target,
  X,
  ChevronDown,
  ChevronRight,
} from "@lucide/svelte";
import type { Component } from "svelte";

/** Props a canonical glyph accepts. Kept minimal so the dynamic component type
 * stays simple (lucide's own prop unions are too large to index over). */
export interface IconGlyphProps {
  size?: number;
  strokeWidth?: number;
  color?: string | null;
  class?: string;
  [key: string]: unknown;
}

/**
 * Canonical Sentropic icon set (day-one).
 *
 * The DS PRESCRIBES one icon set and exposes it under DS-owned names via the
 * {@link Icon} component. The visual source is lucide (stroke-24), which is
 * already the de-facto internal standard across the DS, but consumers address
 * icons by these stable DS names — never by lucide component names — so the
 * source can evolve without breaking the public API.
 *
 * Names are ADDITIVE: new glyphs extend this map; existing names never change
 * meaning. The full set is frozen against the cross-consumer glyph inventory.
 */
const GLYPHS = {
  settings: Settings,
  eye: Eye,
  "eye-off": EyeOff,
  layers: Layers,
  target: Target,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
};

/** A canonical DS icon name accepted by {@link Icon}. */
export type IconName = keyof typeof GLYPHS;

/** Canonical name → glyph component, addressed by DS-owned {@link IconName}. */
export const ICONS = GLYPHS as Record<IconName, Component<IconGlyphProps>>;

/** All canonical icon names, ordered — useful for docs/catalogs. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
