import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export type AutosaveLabels = {
  idle?: string;
  saving?: string;
  saved?: string;
  error?: string;
};

// In addition to the Vue-native `@retry` emit, an `onRetry` callback prop
// (parity with React/Svelte) is accepted and fired on the retry button.
export type AutosaveProps = {
  status?: AutosaveStatus;
  /** Horodatage de la dernière sauvegarde réussie. */
  lastSaved?: string | Date;
  /** Affiche un bouton « Réessayer » sur le statut `error`. */
  onRetry?: () => void;
  /** Surcharge des libellés par statut. */
  labels?: AutosaveLabels;
  /** Étiquette du bouton de relance. */
  retryLabel?: string;
  locale?: string;
  class?: string;
};

@Component({
  selector: "st-autosave",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Autosave {
  static readonly stComponentName = "Autosave";
  readonly componentName = "Autosave";
  @NgInput() status?: AutosaveStatus;
  @NgInput() lastSaved?: string | Date;
  @NgInput() onRetry?: () => void;
  @NgInput() labels?: AutosaveLabels;
  @NgInput() retryLabel?: string;
  @NgInput() locale?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-autosave", this.classInput].filter(Boolean).join(" ");
  }
}
