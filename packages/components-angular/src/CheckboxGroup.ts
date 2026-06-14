import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Checkbox } from "./Checkbox.js";

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = {
  legend: string;
  /** Valeurs cochées (liste contrôlée). */
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé par les cases (utile pour la soumission de formulaire). */
  name?: string;
  options?: CheckboxGroupOption[];
  /** Description optionnelle affichée sous la légende. */
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-checkbox-group",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CheckboxGroup {
  static readonly stComponentName = "CheckboxGroup";
  readonly componentName = "CheckboxGroup";
  @NgInput() legend!: string;
  @NgInput() value?: string[];
  @NgInput() onChange?: (value: string[]) => void;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() name?: string;
  @NgInput() options?: CheckboxGroupOption[];
  @NgInput() helperText?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-checkboxGroup", this.classInput].filter(Boolean).join(" ");
  }
}
