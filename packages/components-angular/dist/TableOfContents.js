import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const normalizeItemId = (value) => value.replace(/^#/, "");
export class TableOfContents {
    static stComponentName = "TableOfContents";
    componentName = "TableOfContents";
    title;
    items;
    activeId;
    classInput;
    get normalizedActive() {
        return normalizeItemId(this.activeId ?? "");
    }
    get normalizedItems() {
        return (this.items ?? []).map((item) => ({
            ...item,
            id: normalizeItemId(item.id),
            level: Math.max(item.level ?? 1, 1),
        }));
    }
    get hostClass() {
        return classNames("st-tableOfContents", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TableOfContents, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TableOfContents, isStandalone: true, selector: "st-table-of-contents", inputs: { title: "title", items: "items", activeId: "activeId", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TableOfContents, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], items: [{
                type: NgInput
            }], activeId: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=TableOfContents.js.map