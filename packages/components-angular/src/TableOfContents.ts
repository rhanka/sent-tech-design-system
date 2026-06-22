import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
}

/** Alias compatible avec la spec TocItem */
export type TocItem = TableOfContentsItem;

export type TableOfContentsProps = {
  title?: string;
  items: TableOfContentsItem[];
  activeId?: string;
  class?: string;
};

const normalizeItemId = (value: string): string => value.replace(/^#/, "");

@Component({
  selector: "st-table-of-contents",
  standalone: true,
  template: `
    <nav
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.aria-label]="title ?? 'Table des matières'"
    >
      @if (title) {
        <p class="st-tableOfContents__title">{{ title }}</p>
      }
      <ol class="st-tableOfContents__list">
        @for (item of normalizedItems; track item.id) {
          <li
            class="st-tableOfContents__item"
            [style]="'--st-tableOfContents-level:' + (item.level - 1)"
          >
            <a
              class="st-tableOfContents__link"
              [href]="'#' + item.id"
              [attr.aria-current]="item.id === normalizedActive ? 'location' : null"
            >{{ item.label }}</a>
          </li>
        }
      </ol>
    </nav>
  `,
})
export class TableOfContents {
  static readonly stComponentName = "TableOfContents";
  readonly componentName = "TableOfContents";
  @NgInput() title?: string;
  @NgInput() items!: TableOfContentsItem[];
  @NgInput() activeId?: string;
  @NgInput("class") classInput?: string;

  get normalizedActive(): string {
    return normalizeItemId(this.activeId ?? "");
  }

  get normalizedItems(): Array<TableOfContentsItem & { level: number }> {
    return (this.items ?? []).map((item) => ({
      ...item,
      id: normalizeItemId(item.id),
      level: Math.max(item.level ?? 1, 1),
    }));
  }

  get hostClass(): string {
    return classNames("st-tableOfContents", this.classInput);
  }
}
