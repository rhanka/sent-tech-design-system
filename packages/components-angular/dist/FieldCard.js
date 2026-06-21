import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FieldCard {
    static stComponentName = "FieldCard";
    componentName = "FieldCard";
    label;
    variant;
    tone;
    commentCount;
    onOpenComments;
    classInput;
    get hostClass() {
        return classNames("st-fieldCard", this.variant && `st-fieldCard--${this.variant}`, this.tone && `st-fieldCard--${this.tone}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FieldCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FieldCard, isStandalone: true, selector: "st-field-card", inputs: { label: "label", variant: "variant", tone: "tone", commentCount: "commentCount", onOpenComments: "onOpenComments", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-fieldCard__header">
        <span class="st-fieldCard__label">{{ label }}</span>
        @if (commentCount !== undefined && commentCount > 0) {
          <button type="button" class="st-fieldCard__comments" (click)="onOpenComments && onOpenComments()">
            {{ commentCount }}
          </button>
        }
      </div>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FieldCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-field-card",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-fieldCard__header">
        <span class="st-fieldCard__label">{{ label }}</span>
        @if (commentCount !== undefined && commentCount > 0) {
          <button type="button" class="st-fieldCard__comments" (click)="onOpenComments && onOpenComments()">
            {{ commentCount }}
          </button>
        }
      </div>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { label: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], tone: [{
                type: NgInput
            }], commentCount: [{
                type: NgInput
            }], onOpenComments: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=FieldCard.js.map