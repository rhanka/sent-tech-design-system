import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { spacingToken } from "./Flex.js";

export type GridProps = {
  /** Number of equal columns: `repeat(columns, minmax(0, 1fr))`. */
  columns?: number;
  /**
   * Responsive auto mode: `repeat(auto-fill, minmax(minItemWidth, 1fr))`.
   * Takes priority over `columns` when provided.
   */
  minItemWidth?: string;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  as?: string;
  class?: string;
};

export function gridTemplateColumns(
  columns: number | undefined,
  minItemWidth: string | undefined,
): string | undefined {
  if (minItemWidth != null && minItemWidth !== "") {
    return `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`;
  }
  if (columns != null) {
    const clamped = Math.max(1, Math.round(columns));
    return `repeat(${clamped}, minmax(0, 1fr))`;
  }
  return undefined;
}

@Component({
  selector: "st-grid",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Grid {
  static readonly stComponentName = "Grid";
  readonly componentName = "Grid";
  @NgInput() columns?: number;
  @NgInput() minItemWidth?: string;
  @NgInput() gap?: number;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-grid", this.classInput].filter(Boolean).join(" ");
  }
}
