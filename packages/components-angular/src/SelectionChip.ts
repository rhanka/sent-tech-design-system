import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";

export type SelectionChipProps = {
  /** Libellé de la dimension sélectionnée. */
  label: string;
  /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
  count?: number;
  tone?: SelectionChipTone;
  /** Callback effacement — affiche le bouton ✕ si fourni. */
  onClear?: () => void;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-selection-chip",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SelectionChip {
  static readonly stComponentName = "SelectionChip";
  readonly componentName = "SelectionChip";
  @NgInput() label!: string;
  @NgInput() count?: number;
  @NgInput() tone?: SelectionChipTone;
  @NgInput() onClear?: () => void;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-selectionChip", this.classInput].filter(Boolean).join(" ");
  }
}
