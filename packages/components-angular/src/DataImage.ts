import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type DataImageFit = "cover" | "contain";

export type DataImageProps = {
  /** Image URL (required). */
  src: string;
  /** Alternative text (required for a11y; pass "" only for purely decorative images). */
  alt: string;
  /** Intrinsic / box width (number → px, or any CSS length). */
  width?: number | string;
  /** Intrinsic / box height (number → px, or any CSS length). */
  height?: number | string;
  /** `object-fit` behaviour inside its box. Default `cover`. */
  fit?: DataImageFit;
  /** Border radius (CSS length). */
  radius?: number | string;
  /** Image loading strategy. Default `lazy`; use `eager` for LCP images. */
  loading?: "eager" | "lazy";
  /** Image decoding hint. Default `async`. */
  decoding?: "async" | "sync" | "auto";
  class?: string;
};

@Component({
  selector: "st-data-image",
  standalone: true,
  template: `
    <img
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [src]="src"
      [alt]="alt"
      [style.width]="widthStyle"
      [style.height]="heightStyle"
      [style.border-radius]="radiusStyle"
      [attr.loading]="loading ?? 'lazy'"
      [attr.decoding]="decoding ?? 'async'"
    />
  `,
})
export class DataImage {
  static readonly stComponentName = "DataImage";
  readonly componentName = "DataImage";
  @NgInput() src!: string;
  @NgInput() alt!: string;
  @NgInput() width?: number | string;
  @NgInput() height?: number | string;
  @NgInput() fit?: DataImageFit;
  @NgInput() radius?: number | string;
  @NgInput() loading?: "eager" | "lazy";
  @NgInput() decoding?: "async" | "sync" | "auto";
  @NgInput("class") classInput?: string;

  private len(v: number | string | undefined): string | null {
    if (v === undefined) return null;
    return typeof v === "number" ? `${v}px` : v;
  }

  get widthStyle(): string | null {
    return this.len(this.width);
  }

  get heightStyle(): string | null {
    return this.len(this.height);
  }

  get radiusStyle(): string | null {
    return this.len(this.radius);
  }

  get hostClass(): string {
    return classNames(
      "st-dataImage",
      `st-dataImage--${this.fit ?? "cover"}`,
      this.classInput,
    );
  }
}
