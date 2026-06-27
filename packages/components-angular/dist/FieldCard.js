import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class FieldCard {
    static stComponentName = "FieldCard";
    componentName = "FieldCard";
    label;
    variant = "bordered";
    tone;
    commentCount;
    onOpenComments;
    classInput;
    get count() {
        return this.commentCount ?? 0;
    }
    get showBadge() {
        return this.count > 0 || !!this.onOpenComments;
    }
    get hostClass() {
        return classNames("st-fieldCard", `st-fieldCard--${this.variant}`, this.variant === "accent" && this.tone && `st-fieldCard--${this.tone}`, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FieldCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FieldCard, isStandalone: true, selector: "st-field-card", inputs: { label: "label", variant: "variant", tone: "tone", commentCount: "commentCount", onOpenComments: "onOpenComments", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <header class="st-fieldCard__header">
        <h3 class="st-fieldCard__label">{{ label }}</h3>
        @if (showBadge) {
          @if (onOpenComments) {
            <button
              type="button"
              class="st-fieldCard__comments"
              [attr.aria-label]="'Commentaires (' + count + ')'"
              (click)="onOpenComments!()"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              @if (count > 0) {
                <span class="st-fieldCard__commentCount">{{ count }}</span>
              }
            </button>
          } @else {
            <span class="st-fieldCard__comments st-fieldCard__comments--static">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="st-fieldCard__commentCount">{{ count }}</span>
            </span>
          }
        }
      </header>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FieldCard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-field-card",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <header class="st-fieldCard__header">
        <h3 class="st-fieldCard__label">{{ label }}</h3>
        @if (showBadge) {
          @if (onOpenComments) {
            <button
              type="button"
              class="st-fieldCard__comments"
              [attr.aria-label]="'Commentaires (' + count + ')'"
              (click)="onOpenComments!()"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              @if (count > 0) {
                <span class="st-fieldCard__commentCount">{{ count }}</span>
              }
            </button>
          } @else {
            <span class="st-fieldCard__comments st-fieldCard__comments--static">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="st-fieldCard__commentCount">{{ count }}</span>
            </span>
          }
        }
      </header>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </section>
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