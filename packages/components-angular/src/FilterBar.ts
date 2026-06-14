import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FilterBarProps = {
  /** Aria-label du groupe de filtres, ex "Filtres actifs". */
  label: string;
  /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
  onClearAll?: () => void;
  /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
  clearAllLabel?: string;
  class?: string;
};

@Component({
  selector: "st-filter-bar",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class FilterBar {
  static readonly stComponentName = "FilterBar";
  readonly componentName = "FilterBar";
  @NgInput() label!: string;
  @NgInput() onClearAll?: () => void;
  @NgInput() clearAllLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-filterBar", this.classInput].filter(Boolean).join(" ");
  }
}
