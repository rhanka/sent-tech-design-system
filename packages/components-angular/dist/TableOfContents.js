import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class TableOfContents {
    static stComponentName = "TableOfContents";
    componentName = "TableOfContents";
    title;
    items;
    activeId;
    classInput;
    get hostClass() {
        return classNames("st-toc", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TableOfContents, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TableOfContents, isStandalone: true, selector: "st-table-of-contents", inputs: { title: "title", items: "items", activeId: "activeId", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TableOfContents, decorators: [{
            type: Component,
            args: [{
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