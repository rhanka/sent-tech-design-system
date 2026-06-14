import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ContentSwitcherSize = "sm" | "md" | "lg";

export type ContentSwitcherItem = {
  id?: string;
  value?: string;
  label: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type ContentSwitcherProps = {
  items: ContentSwitcherItem[];
  value?: string;
  activeId?: string;
  size?: ContentSwitcherSize;
  onchange?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-content-switcher",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ContentSwitcher {
  static readonly stComponentName = "ContentSwitcher";
  readonly componentName = "ContentSwitcher";
  @NgInput() items!: ContentSwitcherItem[];
  @NgInput() value?: string;
  @NgInput() activeId?: string;
  @NgInput() size?: ContentSwitcherSize;
  @NgInput() onchange?: (value: string) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-contentSwitcher", this.classInput].filter(Boolean).join(" ");
  }
}
