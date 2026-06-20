import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

import { classNames } from "./classNames.js";

import { spacingToken, alignValue, justifyValue } from "./Flex.js";

import type { FlexAlign, FlexJustify } from "./Flex.js";

export type StackProps = {
  /** Spacing scale step (0..12) mapped to `--st-spacing-*`. */
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  as?: string;
  class?: string;
};

@Component({
  selector: "st-stack",
  standalone: true,
  imports: [NgStyle],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `,
})
export class Stack {
  static readonly stComponentName = "Stack";
  readonly componentName = "Stack";
  @NgInput() gap?: number;
  @NgInput() align?: FlexAlign;
  @NgInput() justify?: FlexJustify;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-stack", this.classInput);
  }

  get inlineStyles(): Record<string, string | undefined> {
    return {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: alignValue(this.align),
      justifyContent: justifyValue(this.justify),
      gap: spacingToken(this.gap),
    };
  }
}
