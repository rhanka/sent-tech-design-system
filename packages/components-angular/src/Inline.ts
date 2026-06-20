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
  class?: string;
};

@Component({
  selector: "st-inline",
  standalone: true,
  imports: [NgStyle],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
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
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-inline", this.classInput);
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
