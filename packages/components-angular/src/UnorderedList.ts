import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type UnorderedListInput = string | UnorderedListItem;

export interface UnorderedListItem {
  content: unknown;
  /** Sous-items : chaînes ou objets (normalisés au rendu). */
  children?: UnorderedListInput[];
}

export type UnorderedListProps = {
  items: UnorderedListInput[];
  nested?: boolean;
  class?: string;
};

@Component({
  selector: "st-unordered-list",
  standalone: true,
  template: `
    <ul [attr.data-st-component]="componentName" [class]="hostClass">
      @for (raw of items; track $index) {
        @let item = normalize(raw);
        <li class="st-unorderedList__item">
          {{ item.content }}
          @if (item.children && item.children.length > 0) {
            <ul class="st-unorderedList st-unorderedList--nested">
              @for (childRaw of item.children; track $index) {
                @let child = normalize(childRaw);
                <li class="st-unorderedList__item">{{ child.content }}</li>
              }
            </ul>
          }
        </li>
      }
      <ng-content></ng-content>
    </ul>
  `,
})
export class UnorderedList {
  static readonly stComponentName = "UnorderedList";
  readonly componentName = "UnorderedList";
  @NgInput() items: UnorderedListInput[] = [];
  @NgInput() nested = false;
  @NgInput("class") classInput?: string;

  normalize(item: UnorderedListInput): UnorderedListItem {
    if (typeof item === "string") return { content: item };
    return item;
  }

  get hostClass(): string {
    return classNames(
      "st-unorderedList",
      this.nested && "st-unorderedList--nested",
      this.classInput,
    );
  }
}
