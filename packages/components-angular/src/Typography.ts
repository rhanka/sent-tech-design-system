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

/** Balise HTML par défaut pour chaque variante. */
const VARIANT_TAG: Record<TypographyVariant, string> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
};

@Component({
  selector: "st-typography",
  standalone: true,
  template: `
    @switch (tag) {
      @case ("h1") {
        <h1 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h1>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h3>
      }
      @case ("h4") {
        <h4 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h4>
      }
      @case ("h5") {
        <h5 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h5>
      }
      @case ("h6") {
        <h6 [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></h6>
      }
      @case ("p") {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></p>
      }
      @case ("span") {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></span>
      }
      @default {
        <p [attr.data-st-component]="componentName" [class]="hostClass"><ng-content></ng-content></p>
      }
    }
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

  get tag(): string {
    return this.as ?? VARIANT_TAG[this.variant ?? "body"];
  }

  get hostClass(): string {
    return classNames(
      "st-typography",
      `st-typography--${this.variant ?? "body"}`,
      this.weight && `st-typography--weight-${this.weight}`,
      this.tone && `st-typography--tone-${this.tone}`,
      this.align && `st-typography--align-${this.align}`,
      this.truncate && "st-typography--truncate",
      this.classInput,
    );
  }
}
