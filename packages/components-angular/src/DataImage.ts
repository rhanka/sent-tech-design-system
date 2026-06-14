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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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

  get hostClass(): string {
    return ["st-dataImage", this.classInput].filter(Boolean).join(" ");
  }
}
