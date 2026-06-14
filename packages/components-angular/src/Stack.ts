import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Flex } from "./Flex.js";

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
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
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
    return ["st-stack", this.classInput].filter(Boolean).join(" ");
  }
}
