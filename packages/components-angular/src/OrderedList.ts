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
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track $index) {
        <li class="st-orderedList__item">{{ item }}</li>
      }
      <ng-content></ng-content>
    </ol>
  `,
})
export class OrderedList {
  static readonly stComponentName = "OrderedList";
  readonly componentName = "OrderedList";
  @NgInput() items!: OrderedListInput[];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-orderedList", this.classInput);
  }
}
