import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ProgressIndicatorStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "disabled"
  | "invalid"
  | "incomplete";

export interface ProgressIndicatorItem {
  id?: string;
  /** Svelte-canonical alias for the React/Vue `id`. */
  value?: string;
  label: unknown;
  description?: unknown;
  status?: ProgressIndicatorStatus;
}

export type ProgressIndicatorOrientation = "horizontal" | "vertical";

export type ProgressIndicatorProps = {
  items: ProgressIndicatorItem[];
  orientation?: ProgressIndicatorOrientation;
  /** Svelte-canonical alias: `vertical` sets `orientation="vertical"`. */
  vertical?: boolean;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-progress-indicator",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ProgressIndicator {
  static readonly stComponentName = "ProgressIndicator";
  readonly componentName = "ProgressIndicator";
  @NgInput() items!: ProgressIndicatorItem[];
  @NgInput() orientation?: ProgressIndicatorOrientation;
  @NgInput() vertical?: boolean;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-progressIndicator", this.classInput].filter(Boolean).join(" ");
  }
}
