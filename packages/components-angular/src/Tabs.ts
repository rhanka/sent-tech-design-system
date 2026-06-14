import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};

// In addition to the Vue-native `@change` emit (which already routes to an
// `onChange` listener), an `onchange` callback prop (Svelte-canonical,
// lowercase) is accepted and fired on change.
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};

@Component({
  selector: "st-tabs",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Tabs {
  static readonly stComponentName = "Tabs";
  readonly componentName = "Tabs";
  @NgInput() items!: TabItem[];
  @NgInput() activeValue?: string;
  @NgInput() activeId?: string;
  @NgInput() label?: string;
  @NgInput() onchange?: (value: string) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tabs", this.classInput].filter(Boolean).join(" ");
  }
}
