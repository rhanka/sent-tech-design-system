import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

import { classNames } from "./classNames.js";

export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";

export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";

export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export type FlexProps = {
  direction?: FlexDirection;
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  inline?: boolean;
  as?: string;
  class?: string;
};

const SPACING_FALLBACK: Record<number, string> = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
};

export function spacingToken(step: number | undefined): string | undefined {
  if (step == null) return undefined;
  const clamped = Math.max(0, Math.min(12, Math.round(step)));
  if (clamped === 0) return "0";
  return `var(--st-spacing-${clamped}, ${SPACING_FALLBACK[clamped]})`;
}

const ALIGN: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export function alignValue(align: FlexAlign | undefined): string | undefined {
  return align ? ALIGN[align] : undefined;
}

export function justifyValue(justify: FlexJustify | undefined): string | undefined {
  return justify ? JUSTIFY[justify] : undefined;
}

@Component({
  selector: "st-flex",
  standalone: true,
  imports: [NgStyle],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `,
})
export class Flex {
  static readonly stComponentName = "Flex";
  readonly componentName = "Flex";
  @NgInput() direction?: FlexDirection;
  @NgInput() gap?: number;
  @NgInput() align?: FlexAlign;
  @NgInput() justify?: FlexJustify;
  @NgInput() wrap?: boolean;
  @NgInput() inline?: boolean;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-flex", this.classInput);
  }

  get inlineStyles(): Record<string, string | undefined> {
    return {
      display: this.inline ? "inline-flex" : "flex",
      flexDirection: this.direction,
      flexWrap: this.wrap ? "wrap" : "nowrap",
      alignItems: alignValue(this.align),
      justifyContent: justifyValue(this.justify),
      gap: spacingToken(this.gap),
    };
  }
}
