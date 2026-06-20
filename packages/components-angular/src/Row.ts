import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

import { classNames } from "./classNames.js";

import { spacingToken, alignValue, justifyValue } from "./Flex.js";

import type { FlexAlign, FlexJustify } from "./Flex.js";

export type RowProps = {
  /** Spacing scale step (0..12) used for the column gutter. */
  gutter?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: string;
  class?: string;
};

@Component({
  selector: "st-row",
  standalone: true,
  imports: [NgStyle],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [ngStyle]="inlineStyles">
      <ng-content></ng-content>
    </div>
  `,
})
export class Row {
  static readonly stComponentName = "Row";
  readonly componentName = "Row";
  @NgInput() gutter?: number;
  @NgInput() align?: FlexAlign;
  @NgInput() justify?: FlexJustify;
  @NgInput() wrap?: boolean;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-row", this.classInput].filter(Boolean).join(" ");
  }

  get inlineStyles(): Record<string, string | undefined> {
    const gutter = this.gutter ? `var(--st-spacing-${this.gutter}, ${this.gutter * 0.25}rem)` : undefined;
    return {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: this.wrap !== false ? 'wrap' : 'nowrap',
      gap: gutter,
      alignItems: this.align ? alignValue(this.align) : undefined,
      justifyContent: this.justify ? justifyValue(this.justify) : undefined,
    };
  }
}
