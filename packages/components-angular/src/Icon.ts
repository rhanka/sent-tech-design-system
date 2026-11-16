/**
 * @license
 * This file REDISTRIBUTES third-party work.
 *
 * The SVG path data of the nine glyphs in ICON_NODES below — settings, eye,
 * eye-off, layers, target, close (`x` upstream), chevron-down, chevron-right,
 * circle-dashed —
 * is copied verbatim from lucide (lucide-react 0.562.0). The other framework
 * ports depend on a lucide package; this one inlines the data instead, so the
 * copy ships inside dist/Icon.js and inside the published tarball. That makes
 * it a redistribution of lucide, and lucide's notices must travel with it.
 *
 * lucide carries a dual regime, both of which require the copyright notice and
 * the permission notice to appear in every copy:
 *
 *   ISC License
 *   Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as
 *   part of Feather (MIT). All other copyright (c) for Lucide are held by
 *   Lucide Contributors 2025.
 *
 *   The MIT License (MIT) (for portions derived from Feather)
 *   Copyright (c) 2013-2023 Cole Bemis
 *
 * The full permission and warranty text of both is reproduced, unabridged, in
 * this package's LICENSE.THIRD-PARTY.md, which ships in the tarball.
 * Source: https://github.com/lucide-icons/lucide — LICENSE.
 *
 * This file is the canonical set, not the whole extent: other components in
 * this package, and in the React, Vue and Svelte ports, also inline lucide
 * path data. The exhaustive, per-file inventory is MEASURED rather than
 * listed - scripts/generate-third-party-notices.mjs re-derives it on every run
 * by comparing our sources to the installed lucide, and writes it into each
 * package's LICENSE.THIRD-PARTY.md. Adding, replacing or removing a glyph
 * therefore changes that file: run `npm run notices:generate` in the same
 * change, or `npm run licensing:check` fails.
 */
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/** A canonical DS icon name accepted by {@link Icon}. */
export type IconName =
  | "settings"
  | "eye"
  | "eye-off"
  | "layers"
  | "target"
  | "close"
  | "chevron-down"
  | "chevron-right"
  | "circle-dashed";

export type IconProps = {
  size?: number;
  strokeWidth?: number;
  title?: string;
  class?: string;
  /**
   * Canonical DS icon name.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither resolves no nodes (null).
   */
  name?: IconName;
  /**
   * Arbitrary lucide icon data; wins over `name` when both are set.
   *
   * Exactly one of `name` or `glyph` is expected: `glyph` wins when both
   * are set, and neither resolves no nodes (null).
   */
  glyph?: IconGlyph;
};

type IconNode = Array<[string, Record<string, string>]>;

/**
 * An arbitrary lucide icon accepted by {@link Icon} via `glyph`: the
 * {@link IconNode} shape already used by `ICON_NODES`. This matches what the
 * vanilla `lucide` package exports (e.g. `import { CircleDashed } from "lucide"`),
 * so consumers pass that value — no lucide dependency in this package.
 */
export type IconGlyph = IconNode;

/**
 * Canonical Sentropic icon set (day-one).
 *
 * The DS prescribes ONE icon set, addressed by DS-owned names via {@link Icon}.
 * Angular has no lucide dependency, so the glyphs are rendered as inline SVG
 * from the same lucide (stroke-24) path data the other frameworks wrap — the
 * single visual source of truth, frozen under DS-owned names. Names are ADDITIVE.
 */
const ICON_NODES: Record<IconName, IconNode> = {
  settings: [
    ["path", { d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }],
    ["circle", { cx: "12", cy: "12", r: "3" }],
  ],
  eye: [
    ["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }],
    ["circle", { cx: "12", cy: "12", r: "3" }],
  ],
  "eye-off": [
    ["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }],
    ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
    ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }],
    ["path", { d: "m2 2 20 20" }],
  ],
  layers: [
    ["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" }],
    ["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }],
    ["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" }],
  ],
  target: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["circle", { cx: "12", cy: "12", r: "6" }],
    ["circle", { cx: "12", cy: "12", r: "2" }],
  ],
  close: [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }],
  ],
  "chevron-down": [["path", { d: "m6 9 6 6 6-6" }]],
  "chevron-right": [["path", { d: "m9 18 6-6-6-6" }]],
  "circle-dashed": [
    ["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0" }],
    ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0" }],
    ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7" }],
    ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8" }],
    ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69" }],
    ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8" }],
    ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69" }],
    ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7" }],
  ],
};

/** All canonical icon names, ordered — useful for docs/catalogs. */
export const ICON_NAMES = Object.keys(ICON_NODES) as IconName[];

@Component({
  selector: "st-icon",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    @if (nodes) {
      <svg
        [attr.data-st-component]="componentName"
        [attr.width]="size ?? 18"
        [attr.height]="size ?? 18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="strokeWidth ?? 2.25"
        [attr.data-st-icon-stroke]="strokeWidth == null ? null : 'prop'"
        stroke-linecap="round"
        stroke-linejoin="round"
        [class]="hostClass"
        [attr.role]="titleInput ? 'img' : null"
        [attr.aria-label]="titleInput ?? null"
        [attr.aria-hidden]="titleInput ? null : 'true'"
        focusable="false"
      >
        @for (node of nodes; track $index) {
          @switch (node[0]) {
            @case ('path') {
              <svg:path [attr.d]="node[1].d"></svg:path>
            }
            @case ('circle') {
              <svg:circle [attr.cx]="node[1].cx" [attr.cy]="node[1].cy" [attr.r]="node[1].r"></svg:circle>
            }
            @case ('line') {
              <svg:line [attr.x1]="node[1].x1" [attr.y1]="node[1].y1" [attr.x2]="node[1].x2" [attr.y2]="node[1].y2"></svg:line>
            }
          }
        }
      </svg>
    }
  `,
})
export class Icon {
  static readonly stComponentName = "Icon";
  readonly componentName = "Icon";
  /** Canonical DS icon name. */
  @NgInput() name?: IconName;
  /** Arbitrary lucide icon data; wins over `name` when both are set. */
  @NgInput() glyph?: IconGlyph;
  /** Square size in px. Default 18 — the DS-standard inline glyph size. */
  @NgInput() size?: number;
  /**
   * Stroke width. When omitted, the theme token `--st-component-icon-strokeWidth`
   * applies (default 2.25 — the DS's existing lucide usage). When set, it wins
   * over the token; it is then marked `data-st-icon-stroke="prop"` so the
   * styles.css token rule leaves it alone.
   */
  @NgInput() strokeWidth?: number;
  /** Accessible name; when omitted the icon is decorative (`aria-hidden`). */
  @NgInput("title") titleInput?: string;
  @NgInput("class") classInput?: string;

  get nodes(): IconNode | null {
    // `glyph` wins when both are set; neither resolves nothing (null).
    return this.glyph ?? (this.name != null ? ICON_NODES[this.name] : undefined) ?? null;
  }

  get hostClass(): string {
    return classNames("st-icon", this.classInput);
  }
}
