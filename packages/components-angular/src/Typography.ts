import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "body-sm"
  | "caption"
  | "overline";

export type TypographyWeight = "regular" | "medium" | "semibold" | "bold";

export type TypographyTone = "primary" | "secondary" | "muted" | "inverse" | "link";

export type TypographyAlign = "start" | "center" | "end" | "justify";

export type TypographyProps = {
  variant?: TypographyVariant;
  /** Surcharge la balise déduite de la variante. */
  as?: string;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  align?: TypographyAlign;
  /** Tronque sur une ligne avec ellipsis. */
  truncate?: boolean;
  class?: string;
};

@Component({
  selector: "st-typography",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Typography {
  static readonly stComponentName = "Typography";
  readonly componentName = "Typography";
  @NgInput() variant?: TypographyVariant;
  @NgInput() as?: string;
  @NgInput() weight?: TypographyWeight;
  @NgInput() tone?: TypographyTone;
  @NgInput() align?: TypographyAlign;
  @NgInput() truncate?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-typography",
      this.variant && `st-typography--${this.variant}`,
      this.weight && `st-typography--weight-${this.weight}`,
      this.tone && `st-typography--tone-${this.tone}`,
      this.align && `st-typography--align-${this.align}`,
      this.truncate && "st-typography--truncate",
      this.classInput,
    );
  }
}
