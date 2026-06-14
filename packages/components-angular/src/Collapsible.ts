import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type CollapsibleProps = {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  class?: string;
};

@Component({
  selector: "st-collapsible",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Collapsible {
  static readonly stComponentName = "Collapsible";
  readonly componentName = "Collapsible";
  @NgInput() open?: boolean;
  @NgInput() title!: string;
  @NgInput() disabled?: boolean;
  @NgInput() onToggle?: (open: boolean) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-collapsible", this.classInput].filter(Boolean).join(" ");
  }
}
