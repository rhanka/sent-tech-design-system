import { Component, Input as NgInput } from "@angular/core";
import { NgStyle } from "@angular/common";

import { classNames } from "./classNames.js";

export type ColSpan = number | "auto";

export type ColProps = {
  /** Number of 12-grid columns to span, or "auto" to size to content. */
  span?: ColSpan;
  /** Columns to offset (0..11) via margin-inline-start. */
  offset?: number;
  /** Responsive overrides applied at and above the breakpoint. */
  sm?: ColSpan;
  md?: ColSpan;
  lg?: ColSpan;
  as?: string;
  class?: string;
};

export function spanBasis(span: ColSpan | undefined): string | undefined {
  if (span == null) return undefined;
  if (span === "auto") return "auto";
  const clamped = Math.max(1, Math.min(12, Math.round(span)));
  const ratio = clamped / 12;
  return `calc(${ratio * 100}% - var(--st-row-gutter, 0px) * ${(12 - clamped) / 12})`;
}

export function offsetMargin(offset: number | undefined): string | undefined {
  if (!offset) return undefined;
  const clamped = Math.max(0, Math.min(11, Math.round(offset)));
  if (clamped === 0) return undefined;
  const ratio = clamped / 12;
  return `calc(${ratio * 100}% + var(--st-row-gutter, 0px) * ${ratio})`;
}

@Component({
  selector: "st-col",
  standalone: true,
  imports: [NgStyle],
  // Hôte transparent (parité React/Vue qui rendent le `.st-col` directement) :
  // sans cela `<st-col>` s'intercale comme enfant flex de la Row et la grille
  // (flex-basis porté par le `.st-col` interne) ne s'applique plus.
  styles: [":host { display: contents; }"],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [style.--st-col-sm]="spanBasisFor(sm)"
      [style.--st-col-md]="spanBasisFor(md)"
      [style.--st-col-lg]="spanBasisFor(lg)"
      [ngStyle]="inlineStyles"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class Col {
  static readonly stComponentName = "Col";
  readonly componentName = "Col";
  @NgInput() span?: ColSpan;
  @NgInput() offset?: number;
  @NgInput() sm?: ColSpan;
  @NgInput() md?: ColSpan;
  @NgInput() lg?: ColSpan;
  @NgInput() as?: string;
  @NgInput("class") classInput?: string;

  get isAuto(): boolean {
    return this.span === "auto";
  }

  get hostClass(): string {
    return classNames(
      "st-col",
      this.isAuto && "st-col--auto",
      this.sm != null && "st-col--has-sm",
      this.md != null && "st-col--has-md",
      this.lg != null && "st-col--has-lg",
      this.classInput,
    );
  }

  // Parité stricte React/Vue : la colonne `auto` grandit (flex-grow:1) au lieu de
  // se figer à la largeur du contenu ; les autres colonnes sont plafonnées à leur
  // basis et les surcharges responsives passent par les variables `--st-col-*`.
  spanBasisFor(span: ColSpan | undefined): string | null {
    return spanBasis(span) ?? null;
  }

  get inlineStyles(): Record<string, string | undefined> {
    const basis = spanBasis(this.span);
    return {
      flexBasis: basis,
      maxInlineSize: this.isAuto ? undefined : basis,
      flexGrow: this.isAuto ? '1' : '0',
      marginInlineStart: offsetMargin(this.offset),
    };
  }
}
