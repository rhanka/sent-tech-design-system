import { Component, Input as NgInput } from "@angular/core";
import { Divider } from "./Divider.js";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavActionStack {
    static stComponentName = "NavActionStack";
    componentName = "NavActionStack";
    actions = [];
    dangerZone;
    dangerLabel = "Zone sensible";
    orientation = "vertical";
    label = "Actions";
    classInput;
    get hostClass() {
        return classNames("st-navActionStack", `st-navActionStack--${this.orientation ?? "vertical"}`, this.classInput);
    }
    /** Règle « un seul primary » appliquée au runtime, en miroir du type :
     * on garde le premier `primary`, on dégrade les suivants en `secondary`. */
    get normalizedActions() {
        let primarySeen = false;
        return (this.actions ?? []).map((action) => {
            const kind = action.kind ?? "secondary";
            if (kind === "primary") {
                if (primarySeen) {
                    return { ...action, kind: "secondary" };
                }
                primarySeen = true;
            }
            return { ...action, kind };
        });
    }
    variantFor(kind) {
        return kind;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavActionStack, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavActionStack, isStandalone: true, selector: "st-nav-action-stack", inputs: { actions: "actions", dangerZone: "dangerZone", dangerLabel: "dangerLabel", orientation: "orientation", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group" [attr.aria-label]="label">
      <div class="st-navActionStack__actions">
        @for (action of normalizedActions; track action.label) {
          @if (action.href && !action.disabled) {
            <a
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [href]="action.href"
              (click)="action.onClick && action.onClick()">{{ action.label }}</a>
          } @else {
            <button type="button"
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [disabled]="action.disabled || null"
              (click)="action.onClick && action.onClick()">{{ action.label }}</button>
          }
        }
      </div>
      @if (dangerZone) {
        <div class="st-navActionStack__danger" role="group" [attr.aria-label]="dangerLabel">
          <st-divider></st-divider>
          <span class="st-navActionStack__dangerLabel">{{ dangerLabel }}</span>
          @if (dangerZone.href) {
            <a
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              [href]="dangerZone.href"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</a>
          } @else {
            <button type="button"
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</button>
          }
        </div>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: Divider, selector: "st-divider", inputs: ["orientation", "spacing", "label", "variant", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavActionStack, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-action-stack",
                    standalone: true,
                    imports: [Divider],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group" [attr.aria-label]="label">
      <div class="st-navActionStack__actions">
        @for (action of normalizedActions; track action.label) {
          @if (action.href && !action.disabled) {
            <a
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [href]="action.href"
              (click)="action.onClick && action.onClick()">{{ action.label }}</a>
          } @else {
            <button type="button"
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [disabled]="action.disabled || null"
              (click)="action.onClick && action.onClick()">{{ action.label }}</button>
          }
        }
      </div>
      @if (dangerZone) {
        <div class="st-navActionStack__danger" role="group" [attr.aria-label]="dangerLabel">
          <st-divider></st-divider>
          <span class="st-navActionStack__dangerLabel">{{ dangerLabel }}</span>
          @if (dangerZone.href) {
            <a
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              [href]="dangerZone.href"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</a>
          } @else {
            <button type="button"
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</button>
          }
        </div>
      }
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