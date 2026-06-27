import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type EmbedProps = {
  /** URL of the embedded document (required). */
  src: string;
  /**
   * Accessible name of the frame (required for a11y — every iframe must carry a
   * meaningful `title`).
   */
  title: string;
  /**
   * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass your
   * own token list to relax it deliberately.
   */
  sandbox?: string;
  /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
  aspectRatio?: string;
  /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
  allow?: string;
  /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
  loading?: "eager" | "lazy";
  class?: string;
};

@Component({
  selector: "st-embed",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-aspectRatio" [style.aspect-ratio]="aspectRatio ?? '16/9'">
        <iframe class="st-embed__frame"
          [attr.src]="src"
          [title]="title"
          [attr.sandbox]="sandbox ?? ''"
          [attr.allow]="allow ?? null"
          [attr.loading]="loading ?? 'lazy'"></iframe>
      </div>
    </div>
  `,
})
export class Embed {
  static readonly stComponentName = "Embed";
  readonly componentName = "Embed";
  @NgInput() src!: string;
  @NgInput() title!: string;
  @NgInput() sandbox?: string;
  @NgInput() aspectRatio?: string;
  @NgInput() allow?: string;
  @NgInput() loading?: "eager" | "lazy";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-embed", this.classInput);
  }
}
