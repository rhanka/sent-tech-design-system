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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CodeSnippet {
  static readonly stComponentName = "CodeSnippet";
  readonly componentName = "CodeSnippet";
  @NgInput() code!: string;
  @NgInput() inline?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-codeSnippet", this.classInput].filter(Boolean).join(" ");
  }
}
