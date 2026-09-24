import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

import { classNames } from "./classNames.js";

import { spacingToken, alignValue, justifyValue } from "./Flex.js";

import type { FlexAlign, FlexJustify } from "./Flex.js";

export type InlineProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  /**
   * ARIA passthrough. The React and Vue Inline spread arbitrary HTML attributes
   * onto the rendered element; Angular has no spread, so the attributes callers
   * actually use on a layout primitive are declared explicitly. Without them a
   * caller's `role`/`aria-label` lands on the `<st-inline>` host element instead
   * of the `.st-inline` div the other frameworks decorate.
   */
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  class?: string;
};

@Component({
  selector: "st-inline",
  standalone: true,
  imports: [NgStyle],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [ngStyle]="inlineStyles"
      [attr.role]="role ?? null"
      [attr.aria-label]="ariaLabel ?? null"
      [attr.aria-labelledby]="ariaLabelledBy ?? null"
      [attr.aria-describedby]="ariaDescribedBy ?? null"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class Inline {
  static readonly stComponentName = "Inline";
  readonly componentName = "Inline";
  @NgInput() gap?: number;
  @NgInput() align?: FlexAlign;
  @NgInput() justify?: FlexJustify;
  @NgInput() wrap?: boolean;
  @NgInput() as?: string;
  @NgInput() role?: string;
  @NgInput("aria-label") ariaLabel?: string;
  @NgInput("aria-labelledby") ariaLabelledBy?: string;
  @NgInput("aria-describedby") ariaDescribedBy?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-flex", "st-inline", this.classInput);
  }

  get inlineStyles(): Record<string, string | undefined> {
    return {
      display: "flex",
      flexDirection: "row",
      flexWrap: this.wrap !== false ? "wrap" : "nowrap",
      alignItems: alignValue(this.align),
      justifyContent: justifyValue(this.justify),
      gap: spacingToken(this.gap),
    };
  }
}
