import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SearchSize = "sm" | "md" | "lg";

export type SearchProps = {
  label?: unknown;
  size?: SearchSize;
  modelValue?: string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: string;
  placeholder?: string;
  clearLabel?: string;
  /** Lift the field max-width cap so it fills a narrow drawer/rail (width 100%). */
  fluid?: boolean;
  disabled?: boolean;
  id?: string;
  class?: string;
};

@Component({
  selector: "st-search",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Search {
  static readonly stComponentName = "Search";
  readonly componentName = "Search";
  @NgInput() label?: unknown;
  @NgInput() size?: SearchSize;
  @NgInput() modelValue?: string;
  @NgInput() value?: string;
  @NgInput() placeholder?: string;
  @NgInput() clearLabel?: string;
  @NgInput() fluid?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() id?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-search", this.classInput].filter(Boolean).join(" ");
  }
}
