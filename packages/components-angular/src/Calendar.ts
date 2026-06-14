import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];

// In addition to the Vue-native `@change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type CalendarProps = {
  /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
  value?: CalendarValue;
  /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
  onChange?: (value: CalendarValue) => void;
  /** Borne minimale "YYYY-MM-DD" (inclusive). */
  min?: string;
  /** Borne maximale "YYYY-MM-DD" (inclusive). */
  max?: string;
  /** Sélection d'une plage de deux dates. */
  range?: boolean;
  /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
  month?: string;
  class?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

@Component({
  selector: "st-calendar",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Calendar {
  static readonly stComponentName = "Calendar";
  readonly componentName = "Calendar";
  @NgInput() value?: CalendarValue;
  @NgInput() onChange?: (value: CalendarValue) => void;
  @NgInput() min?: string;
  @NgInput() max?: string;
  @NgInput() range?: boolean;
  @NgInput() weekStartsOn?: 0 | 1;
  @NgInput() locale?: string;
  @NgInput() month?: string;
  @NgInput("class") classInput?: string;
  @NgInput() previousMonthLabel?: string;
  @NgInput() nextMonthLabel?: string;

  get hostClass(): string {
    return ["st-calendar", this.classInput].filter(Boolean).join(" ");
  }
}
