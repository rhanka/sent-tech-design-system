import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { Radio } from "./Radio.js";

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = {
  legend: string;
  /** Valeur sélectionnée (contrôlée). */
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /** Nom partagé garantissant l'exclusivité radio. Requis. */
  name: string;
  options?: RadioGroupOption[];
  helperText?: string;
  /** Désactive le groupe entier. */
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-radio-group",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class RadioGroup {
  static readonly stComponentName = "RadioGroup";
  readonly componentName = "RadioGroup";
  @NgInput() legend!: string;
  @NgInput() value?: string;
  @NgInput() onChange?: (value: string) => void;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() name!: string;
  @NgInput() options?: RadioGroupOption[];
  @NgInput() helperText?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-radioGroup", this.classInput].filter(Boolean).join(" ");
  }
}
