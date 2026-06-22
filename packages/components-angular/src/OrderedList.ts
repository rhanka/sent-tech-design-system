import { Component, Input as NgInput } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

import { classNames } from "./classNames.js";

export type OrderedListInput = string | OrderedListItem;

export interface OrderedListItem {
  content: unknown;
  /** Sous-items : chaînes ou objets (normalisés au rendu). */
  children?: OrderedListInput[];
}

export type OrderedListProps = {
  items: OrderedListInput[];
  nested?: boolean;
  class?: string;
};

@Component({
  selector: "st-ordered-list",
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-container
        [ngTemplateOutlet]="listTpl"
        [ngTemplateOutletContext]="{ $implicit: items }"
      ></ng-container>
      <ng-content></ng-content>
    </ol>

    <ng-template #listTpl let-list>
      @for (raw of list; track $index) {
        @let item = normalize(raw);
        <li class="st-orderedList__item">
          {{ item.content }}
          @if (item.children && item.children.length > 0) {
            <ol class="st-orderedList st-orderedList--nested">
              <ng-container
                [ngTemplateOutlet]="listTpl"
                [ngTemplateOutletContext]="{ $implicit: item.children }"
              ></ng-container>
            </ol>
          }
        </li>
      }
    </ng-template>
  `,
})
export class OrderedList {
  static readonly stComponentName = "OrderedList";
  readonly componentName = "OrderedList";
  @NgInput() items: OrderedListInput[] = [];
  @NgInput() nested = false;
  @NgInput("class") classInput?: string;

  normalize(item: OrderedListInput): OrderedListItem {
    if (typeof item === "string") return { content: item };
    return item;
  }

  get hostClass(): string {
    return classNames(
      "st-orderedList",
      this.nested && "st-orderedList--nested",
      this.classInput,
    );
  }
}
