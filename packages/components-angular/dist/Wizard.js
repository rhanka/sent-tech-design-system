import { Component, EventEmitter, Input as NgInput, Output, } from "@angular/core";
import { Button } from "./Button.js";
import { Stepper } from "./Stepper.js";
import * as i0 from "@angular/core";
export class Wizard {
    static stComponentName = "Wizard";
    componentName = "Wizard";
    stepperLabel = "Étapes";
    steps = [];
    currentStep = 0;
    stepTitle = "";
    cancelLabel = "Annuler";
    backLabel = "Retour";
    nextLabel = "Suivant";
    finishLabel = "Terminer";
    isLast = false;
    classInput;
    cancel = new EventEmitter();
    back = new EventEmitter();
    next = new EventEmitter();
    finish = new EventEmitter();
    get hostClass() {
        return ["st-wz", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Wizard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Wizard, isStandalone: true, selector: "st-wizard", inputs: { stepperLabel: "stepperLabel", steps: "steps", currentStep: "currentStep", stepTitle: "stepTitle", cancelLabel: "cancelLabel", backLabel: "backLabel", nextLabel: "nextLabel", finishLabel: "finishLabel", isLast: "isLast", classInput: ["class", "classInput"] }, outputs: { cancel: "cancel", back: "back", next: "next", finish: "finish" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-wz__stepper">
        <st-stepper [steps]="steps" [current]="currentStep" [label]="stepperLabel"></st-stepper>
      </div>
      <div class="st-wz__body">
        <h3 class="st-wz__stepTitle">{{ stepTitle }}</h3>
        <div class="st-wz__content">
          <ng-content></ng-content>
        </div>
      </div>
      <div class="st-wz__footer">
        <div class="st-wz__footerLeft">
          <st-button variant="ghost" (click)="cancel.emit()">{{ cancelLabel }}</st-button>
        </div>
        <div class="st-wz__footerRight">
          @if (currentStep > 0) {
            <st-button variant="secondary" (click)="back.emit()">{{ backLabel }}</st-button>
          }
          @if (isLast) {
            <st-button variant="primary" (click)="finish.emit()">{{ finishLabel }}</st-button>
          } @else {
            <st-button variant="primary" (click)="next.emit()">{{ nextLabel }}</st-button>
          }
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: Stepper, selector: "st-stepper", inputs: ["steps", "current", "orientation", "clickable", "onStepClick", "label", "class"], outputs: ["stepClick"] }, { kind: "component", type: Button, selector: "st-button", inputs: ["variant", "size", "type", "disabled", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Wizard, decorators: [{
            type: Component,
            args: [{
                    selector: "st-wizard",
                    standalone: true,
                    imports: [Stepper, Button],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-wz__stepper">
        <st-stepper [steps]="steps" [current]="currentStep" [label]="stepperLabel"></st-stepper>
      </div>
      <div class="st-wz__body">
        <h3 class="st-wz__stepTitle">{{ stepTitle }}</h3>
        <div class="st-wz__content">
          <ng-content></ng-content>
        </div>
      </div>
      <div class="st-wz__footer">
        <div class="st-wz__footerLeft">
          <st-button variant="ghost" (click)="cancel.emit()">{{ cancelLabel }}</st-button>
        </div>
        <div class="st-wz__footerRight">
          @if (currentStep > 0) {
            <st-button variant="secondary" (click)="back.emit()">{{ backLabel }}</st-button>
          }
          @if (isLast) {
            <st-button variant="primary" (click)="finish.emit()">{{ finishLabel }}</st-button>
          } @else {
            <st-button variant="primary" (click)="next.emit()">{{ nextLabel }}</st-button>
          }
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { stepperLabel: [{
                type: NgInput
            }], steps: [{
                type: NgInput
            }], currentStep: [{
                type: NgInput
            }], stepTitle: [{
                type: NgInput
            }], cancelLabel: [{
                type: NgInput
            }], backLabel: [{
                type: NgInput
            }], nextLabel: [{
                type: NgInput
            }], finishLabel: [{
                type: NgInput
            }], isLast: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], cancel: [{
                type: Output
            }], back: [{
                type: Output
            }], next: [{
                type: Output
            }], finish: [{
                type: Output
            }] } });
//# sourceMappingURL=Wizard.js.map