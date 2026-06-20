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
      <div class="st-quote__body">
        <ng-content></ng-content>
      </div>
      @if (author) {
        <footer class="st-quote__footer">
          <cite class="st-quote__author">{{ author }}</cite>
          @if (source) { <span class="st-quote__source"> — {{ source }}</span> }
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
