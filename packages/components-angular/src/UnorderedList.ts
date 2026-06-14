import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type UnorderedListItem = { content?: unknown; label?: unknown; children?: UnorderedListInput[] };

export type UnorderedListInput = unknown;

export type UnorderedListProps = {
  items: UnorderedListInput[];
  class?: string;
};

@Component({
  selector: "st-unordered-list",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class UnorderedList {
  static readonly stComponentName = "UnorderedList";
  readonly componentName = "UnorderedList";
  @NgInput() items!: UnorderedListInput[];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-unorderedList", this.classInput].filter(Boolean).join(" ");
  }
}
