import {
  Component,
  EventEmitter,
  Input as NgInput,
  Output,
} from "@angular/core";

import { Button } from "./Button.js";
import { Stepper } from "./Stepper.js";

export interface WizardStep {
  label: string;
  description?: string;
}

export type WizardProps = {
  stepperLabel?: string;
  steps: WizardStep[];
  currentStep?: number;
  stepTitle: string;
  cancelLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  isLast?: boolean;
  class?: string;
};

@Component({
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
})
export class Wizard {
  static readonly stComponentName = "Wizard";
  readonly componentName = "Wizard";
  @NgInput() stepperLabel = "Étapes";
  @NgInput() steps: WizardStep[] = [];
  @NgInput() currentStep = 0;
  @NgInput() stepTitle = "";
  @NgInput() cancelLabel = "Annuler";
  @NgInput() backLabel = "Retour";
  @NgInput() nextLabel = "Suivant";
  @NgInput() finishLabel = "Terminer";
  @NgInput() isLast = false;
  @NgInput("class") classInput?: string;
  @Output() cancel = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();

  get hostClass(): string {
    return ["st-wz", this.classInput].filter(Boolean).join(" ");
  }
}
