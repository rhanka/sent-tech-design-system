import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Timeline {
    static stComponentName = "Timeline";
    componentName = "Timeline";
    items;
    orientation;
    classInput;
    get hostClass() {
        return classNames("st-timeline", `st-timeline--${this.orientation ?? "vertical"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Timeline, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Timeline, isStandalone: true, selector: "st-timeline", inputs: { items: "items", orientation: "orientation", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <ol [attr.data-st-component]="componentName" [class]="hostClass">
      @for(item of items; track item.title ?? item.label){
        <li class="st-timeline__item">
          <div class="st-timeline__connector"></div>
          <div class="st-timeline__content">
            <span class="st-timeline__date">{{item.date ?? item.meta}}</span>
            <span class="st-timeline__label">{{item.label ?? item.title}}</span>
            @if(item.description){
              <p class="st-timeline__desc">{{item.description}}</p>
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
      @for(item of items; track item.title ?? item.label){
        <li class="st-timeline__item">
          <div class="st-timeline__connector"></div>
          <div class="st-timeline__content">
            <span class="st-timeline__date">{{item.date ?? item.meta}}</span>
            <span class="st-timeline__label">{{item.label ?? item.title}}</span>
            @if(item.description){
              <p class="st-timeline__desc">{{item.description}}</p>
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