import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";

export type FilterPillProps = {
  /** Nom du champ/dimension affiché à gauche. */
  field: string;
  /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
  value: string;
  /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
  operator?: string;
  /** Pilule active (aria-pressed). Défaut true. */
  active?: boolean;
  /** Affiche le bouton ✕. Défaut true. */
  removable?: boolean;
  disabled?: boolean;
  tone?: FilterPillTone;
  onClick?: () => void;
  onRemove?: () => void;
  class?: string;
};

@Component({
  selector: "st-filter-pill",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FilterPill {
  static readonly stComponentName = "FilterPill";
  readonly componentName = "FilterPill";
  @NgInput() field!: string;
  @NgInput() value!: string;
  @NgInput() operator?: string;
  @NgInput() active?: boolean;
  @NgInput() removable?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() tone?: FilterPillTone;
  @NgInput() onClick?: () => void;
  @NgInput() onRemove?: () => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-filterPill", this.classInput].filter(Boolean).join(" ");
  }
}
