import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { CopyButton } from "./CopyButton.js";

export type CodeSnippetProps = {
  code: string;
  language?: string;
  inline?: boolean;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  class?: string;
};

@Component({
  selector: "st-code-snippet",
  standalone: true,
  imports: [CopyButton],
  template: `
    @if (inline) {
      <code
        [attr.data-st-component]="componentName"
        [class]="inlineClass"
        [attr.data-language]="language ?? null"
      >{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" class="st-codeSnippet__wrapper">
        <pre [class]="blockClass" [attr.data-language]="language ?? null"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        @if (resolvedCopyable) {
          <span class="st-codeSnippet__copy">
            <st-copy-button [value]="code" size="sm" [label]="copyLabel ?? 'Copy'" [copiedLabel]="copiedLabel ?? 'Copied'"></st-copy-button>
          </span>
        }
        <ng-content></ng-content>
      </div>
    }
  `,
})
export class CodeSnippet {
  static readonly stComponentName = "CodeSnippet";
  readonly componentName = "CodeSnippet";
  @NgInput() code!: string;
  @NgInput() language?: string;
  @NgInput() inline?: boolean;
  @NgInput() copyable?: boolean;
  @NgInput() copyLabel?: string;
  @NgInput() copiedLabel?: string;
  @NgInput("class") classInput?: string;

  get resolvedCopyable(): boolean {
    return this.copyable !== false;
  }

  get inlineClass(): string {
    return classNames("st-codeSnippet--inline", this.classInput);
  }

  get blockClass(): string {
    return classNames("st-codeSnippet", this.classInput);
  }
}
