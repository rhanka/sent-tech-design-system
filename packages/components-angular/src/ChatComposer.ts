import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ChatComposerProps = {
  value?: string;
  placeholder?: string;
  submitLabel?: unknown;
  class?: string;
};

@Component({
  selector: "st-chat-composer",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ChatComposer {
  static readonly stComponentName = "ChatComposer";
  readonly componentName = "ChatComposer";
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() submitLabel?: unknown;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-chatComposer", this.classInput].filter(Boolean).join(" ");
  }
}
