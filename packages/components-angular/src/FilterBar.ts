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
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="label"
    >
      <div class="st-filterBar__pills">
        <ng-content></ng-content>
      </div>
      @if (hasClearAll) {
        <button
          type="button"
          class="st-filterBar__clearAll"
          (click)="triggerClearAll()"
        >{{ clearAllLabel || 'Tout effacer' }}</button>
      }
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

  get hasClearAll(): boolean {
    return typeof this.onClearAll === "function";
  }

  get hostClass(): string {
    return classNames("st-filterBar", this.classInput);
  }

  triggerClearAll(): void {
    this.onClearAll?.();
  }
}
