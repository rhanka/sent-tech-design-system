import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type QuoteProps = {
  author?: unknown;
  source?: unknown;
  class?: string;
};

@Component({
  selector: "st-quote",
  standalone: true,
  template: `
    <blockquote [attr.data-st-component]="componentName" [class]="hostClass">
      <p class="st-quote__text"><ng-content></ng-content></p>
      @if (author || source) {
        <footer class="st-quote__attribution">
          @if (author) { <span class="st-quote__author">{{ author }}</span> }
          @if (source) { <span class="st-quote__source">{{ source }}</span> }
        </footer>
      }
    </blockquote>
  `,
})
export class Quote {
  static readonly stComponentName = "Quote";
  readonly componentName = "Quote";
  @NgInput() author?: unknown;
  @NgInput() source?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-quote", this.classInput);
  }
}
