import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type OrderedListItem = { content?: unknown; label?: unknown; children?: OrderedListInput[] };

export type OrderedListInput = unknown;

export type OrderedListProps = {
  items: OrderedListInput[];
  class?: string;
};

@Component({
  selector: "st-ordered-list",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class OrderedList {
  static readonly stComponentName = "OrderedList";
  readonly componentName = "OrderedList";
  @NgInput() items!: OrderedListInput[];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-orderedList", this.classInput].filter(Boolean).join(" ");
  }
}
