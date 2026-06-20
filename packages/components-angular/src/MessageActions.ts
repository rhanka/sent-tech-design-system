import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type MessageActionVariant = "default" | "danger";

/**
 * `label` (React/Vue) is rendered when present; otherwise `icon` (the
 * Svelte-canonical content) is rendered. `label` is always used for the
 * accessible name when provided. At least one of `label`/`icon` should be set.
 */
export type MessageAction = {
  id?: string;
  label?: unknown;
  icon?: unknown;
  disabled?: boolean;
  variant?: MessageActionVariant;
  onClick?: () => void;
};

export type MessageActionsProps = {
  actions: MessageAction[];
  visibility?: "always" | "hover";
  class?: string;
};

@Component({
  selector: "st-message-actions",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="toolbar">
      <ng-content></ng-content>
    </div>
  `,
})
export class MessageActions {
  static readonly stComponentName = "MessageActions";
  readonly componentName = "MessageActions";

  @NgInput() actions!: MessageAction[];
  @NgInput() visibility?: "always" | "hover";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-messageActions",
      this.visibility === "hover" ? "st-messageActions--hover" : undefined,
      this.classInput,
    );
  }
}
