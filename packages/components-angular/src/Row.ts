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
  // Hôte transparent (parité React/Vue qui rendent le `.st-row` directement) :
  // sans cela `<st-row>` (élément inconnu = inline) écrase le flex container et
  // la rangée se réduit à la largeur de son contenu.
  styles: [":host { display: contents; }"],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-row-gutter]="gutterToken"
      [ngStyle]="inlineStyles"
    >
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

  // Gouttière exposée en variable CSS pour que les `Col` enfants soustraient le
  // gutter de leur flex-basis (parité Vue : `calc(% - var(--st-row-gutter))`).
  get gutterToken(): string {
    return spacingToken(this.gutter) ?? "0";
  }

  get inlineStyles(): Record<string, string | undefined> {
    return {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: this.wrap !== false ? 'wrap' : 'nowrap',
      gap: this.gutterToken,
      alignItems: this.align ? alignValue(this.align) : undefined,
      justifyContent: this.justify ? justifyValue(this.justify) : undefined,
    };
  }
}
