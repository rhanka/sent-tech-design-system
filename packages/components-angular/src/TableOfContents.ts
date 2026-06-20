import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: number;
  href?: string;
  active?: boolean;
  children?: TableOfContentsItem[];
}

/** Alias compatible avec la spec TocItem */
export type TocItem = TableOfContentsItem;

export type TableOfContentsProps = {
  title?: string;
  items: TableOfContentsItem[];
  activeId?: string;
  class?: string;
};

@Component({
  selector: "st-table-of-contents",
  standalone: true,
  template: `
    <nav [attr.data-st-component]="componentName" [class]="hostClass">
      <ul class="st-toc__list">
        @for(item of items; track item.id ?? item.label){
          <li class="st-toc__item">
            <a class="st-toc__link"
               [class.st-toc__link--active]="item.active ?? (activeId && item.id === activeId)"
               [href]="item.href ?? '#' + item.id">{{item.label}}</a>
            @if(item.children?.length){
              <ul class="st-toc__sublist">
                @for(child of item.children!; track child.id ?? child.label){
                  <li><a class="st-toc__link"
                         [class.st-toc__link--active]="child.active ?? (activeId && child.id === activeId)"
                         [href]="child.href ?? '#' + child.id">{{child.label}}</a></li>
                }
              </ul>
            }
          </li>
        }
      </ul>
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

  get hostClass(): string {
    return classNames("st-toc", this.classInput);
  }
}
