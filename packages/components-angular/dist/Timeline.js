import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Timeline {
    static stComponentName = "Timeline";
    componentName = "Timeline";
    items;
    orientation;
    classInput;
    get safeItems() {
        return Array.isArray(this.items) ? this.items : [];
    }
    get hostClass() {
        return classNames("st-timeline", `st-timeline--${this.orientation ?? "vertical"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Timeline, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Timeline, isStandalone: true, selector: "st-timeline", inputs: { items: "items", orientation: "orientation", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of safeItems; track $index) {
        <li [class]="'st-timeline__item st-timeline__item--' + (item.tone ?? 'neutral')">
          <span class="st-timeline__rail" aria-hidden="true">
            <span class="st-timeline__dot"></span>
            <span class="st-timeline__line"></span>
          </span>
          <div class="st-timeline__content">
            @if (item.meta) {
              <span class="st-timeline__meta">{{ item.meta }}</span>
            }
            <span class="st-timeline__title">{{ item.title }}</span>
            @if (item.description) {
              <span class="st-timeline__description">{{ item.description }}</span>
            }
          </div>
        </li>
      }
    </ol>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Timeline, decorators: [{
            type: Component,
            args: [{
                    selector: "st-timeline",
                    standalone: true,
                    template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of safeItems; track $index) {
        <li [class]="'st-timeline__item st-timeline__item--' + (item.tone ?? 'neutral')">
          <span class="st-timeline__rail" aria-hidden="true">
            <span class="st-timeline__dot"></span>
            <span class="st-timeline__line"></span>
          </span>
          <div class="st-timeline__content">
            @if (item.meta) {
              <span class="st-timeline__meta">{{ item.meta }}</span>
            }
            <span class="st-timeline__title">{{ item.title }}</span>
            @if (item.description) {
              <span class="st-timeline__description">{{ item.description }}</span>
            }
          </div>
        </li>
      }
    </ol>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Timeline.js.map