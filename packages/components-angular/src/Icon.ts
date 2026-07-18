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
  | "chevron-right";

export type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  title?: string;
  class?: string;
};

type IconNode = Array<[string, Record<string, string>]>;

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
  @NgInput() name!: IconName;
  /** Square size in px. Default 18 — the DS-standard inline glyph size. */
  @NgInput() size?: number;
  /** Stroke width. Default 2.25 — matches the DS's existing lucide usage. */
  @NgInput() strokeWidth?: number;
  /** Accessible name; when omitted the icon is decorative (`aria-hidden`). */
  @NgInput("title") titleInput?: string;
  @NgInput("class") classInput?: string;

  get nodes(): IconNode | null {
    return ICON_NODES[this.name] ?? null;
  }

  get hostClass(): string {
    return classNames("st-icon", this.classInput);
  }
}
