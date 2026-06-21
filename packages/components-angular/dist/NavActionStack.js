import { Component, Input as NgInput } from "@angular/core";
import { Button } from "./Button.js";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavActionStack {
    static stComponentName = "NavActionStack";
    componentName = "NavActionStack";
    actions;
    dangerZone;
    dangerLabel;
    orientation;
    label;
    classInput;
    get hostClass() {
        return classNames("st-navActionStack", `st-navActionStack--${this.orientation ?? "vertical"}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavActionStack, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavActionStack, isStandalone: true, selector: "st-nav-action-stack", inputs: { actions: "actions", dangerZone: "dangerZone", dangerLabel: "dangerLabel", orientation: "orientation", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) { <p class="st-navActionStack__label">{{ label }}</p> }
      @if (actions && actions.length) {
        <ul class="st-navActionStack__list">
          @for (action of actions; track action.label) {
            <li class="st-navActionStack__item">
              <a [href]="action.href || '#'" class="st-navActionStack__link"
                [class.st-navActionStack__link--disabled]="action.disabled"
                (click)="action.onClick && action.onClick()">{{ action.label }}</a>
            </li>
          }
        </ul>
      }
      @if (dangerZone) {
        <div class="st-navActionStack__danger">
          @if (dangerLabel) { <p class="st-navActionStack__dangerLabel">{{ dangerLabel }}</p> }
          <a [href]="dangerZone.href || '#'" class="st-navActionStack__dangerLink"
            (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</a>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavActionStack, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-action-stack",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) { <p class="st-navActionStack__label">{{ label }}</p> }
      @if (actions && actions.length) {
        <ul class="st-navActionStack__list">
          @for (action of actions; track action.label) {
            <li class="st-navActionStack__item">
              <a [href]="action.href || '#'" class="st-navActionStack__link"
                [class.st-navActionStack__link--disabled]="action.disabled"
                (click)="action.onClick && action.onClick()">{{ action.label }}</a>
            </li>
          }
        </ul>
      }
      @if (dangerZone) {
        <div class="st-navActionStack__danger">
          @if (dangerLabel) { <p class="st-navActionStack__dangerLabel">{{ dangerLabel }}</p> }
          <a [href]="dangerZone.href || '#'" class="st-navActionStack__dangerLink"
            (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</a>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { actions: [{
                type: NgInput
            }], dangerZone: [{
                type: NgInput
            }], dangerLabel: [{
                type: NgInput
            }], orientation: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavActionStack.js.map