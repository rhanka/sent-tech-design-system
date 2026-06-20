import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CodeSnippetProps = {
  code: string;
  inline?: boolean;
  class?: string;
};

@Component({
  selector: "st-code-snippet",
  standalone: true,
  template: `
    @if (inline) {
      <code [attr.data-st-component]="componentName" [class]="hostClass">{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <pre class="st-codeSnippet__pre"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        <ng-content></ng-content>
      </div>
    }
  `,
})
export class CodeSnippet {
  static readonly stComponentName = "CodeSnippet";
  readonly componentName = "CodeSnippet";
  @NgInput() code!: string;
  @NgInput() inline?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-codeSnippet",
      this.inline && "st-codeSnippet--inline",
      this.classInput,
    );
  }
}
