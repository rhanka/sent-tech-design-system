import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TagTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TagSize = "sm" | "md";

export type TagProps = {
  tone?: TagTone;
  size?: TagSize;
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  /** Svelte/React-canonical callback; fires alongside the `dismiss` emit. */
  onDismiss?: (event: MouseEvent) => void;
  class?: string;
};

@Component({
  selector: "st-tag",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Tag {
  static readonly stComponentName = "Tag";
  readonly componentName = "Tag";
  @NgInput() tone?: TagTone;
  @NgInput() size?: TagSize;
  @NgInput() disabled?: boolean;
  @NgInput() dismissible?: boolean;
  @NgInput() dismissLabel?: string;
  @NgInput() onDismiss?: (event: MouseEvent) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tag", this.classInput].filter(Boolean).join(" ");
  }
}
