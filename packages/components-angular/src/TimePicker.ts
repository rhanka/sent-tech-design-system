import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TimePickerFormat = "24" | "12";

export type TimePickerSize = "sm" | "md" | "lg";

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type TimePickerProps = {
  /** Heure courante au format "HH:mm" (24h, toujours). Vide = non renseigné. */
  value?: string;
  /** Appelé avec "HH:mm" lors d'une sélection. */
  onChange?: (value: string) => void;
  /** Pas (en minutes) entre deux créneaux générés. */
  step?: number;
  /** Borne minimale "HH:mm" (inclusive). */
  min?: string;
  /** Borne maximale "HH:mm" (inclusive). */
  max?: string;
  /** Affichage 24h (par défaut) ou 12h (AM/PM). La valeur émise reste "HH:mm". */
  format?: TimePickerFormat;
  size?: TimePickerSize;
  disabled?: boolean;
  label?: string;
  class?: string;
  id?: string;
};

@Component({
  selector: "st-time-picker",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TimePicker {
  static readonly stComponentName = "TimePicker";
  readonly componentName = "TimePicker";
  @NgInput() value?: string;
  @NgInput() onChange?: (value: string) => void;
  @NgInput() step?: number;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() format?: TimePickerFormat;
  @NgInput() size?: TimePickerSize;
  @NgInput() disabled?: boolean;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;
  @NgInput() id?: string;

  get hostClass(): string {
    return ["st-timePicker", this.classInput].filter(Boolean).join(" ");
  }
}
