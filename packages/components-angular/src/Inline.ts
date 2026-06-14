import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Flex } from "./Flex.js";

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
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
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
    return ["st-inline", this.classInput].filter(Boolean).join(" ");
  }
}
