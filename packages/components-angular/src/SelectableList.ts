import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  SELECTABLE_LIST_KEY,
  type SelectableListContext,
} from "./SelectableRow.js";

export type SelectableListProps = {
  /** Accessible name for the listbox (required for SR users). */
  label?: string;
  /** References the id of an external visible label (alternative to `label`). */
  labelledby?: string;
  /**
   * Allow more than one selected row. Adds aria-multiselectable and toggles
   * each row independently. Defaults to false (single-select).
   */
  multiple?: boolean;
  /**
   * Selected value(s). Controlled when provided. For single-select pass a
   * string (or null); for multiple pass a string[]. When omitted the list is
   * uncontrolled and keeps its own internal selection.
   */
  value?: string | string[] | null;
  /**
   * Fired with the new selection on every change. Receives a string|null for
   * single-select and a string[] for multiple. Required for the controlled
   * pattern; also fires for uncontrolled lists.
   */
  onChange?: (value: string | string[] | null) => void;
  class?: string;
};

@Component({
  selector: "st-selectable-list",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class SelectableList {
  static readonly stComponentName = "SelectableList";
  readonly componentName = "SelectableList";
  @NgInput() label?: string;
  @NgInput() labelledby?: string;
  @NgInput() multiple?: boolean;
  @NgInput() value?: string | string[] | null;
  @NgInput() onChange?: (value: string | string[] | null) => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-selectableList", this.classInput].filter(Boolean).join(" ");
  }
}
