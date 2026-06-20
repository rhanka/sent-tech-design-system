import { Component, Input as NgInput } from "@angular/core";

export type WizardStep = {
  title: string;
  description?: string;
};

export type WizardProps = {
  steps?: WizardStep[];
  currentStep?: number;
  stepTitle?: string;
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
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Wizard {
  static readonly stComponentName = "Wizard";
  readonly componentName = "Wizard";
  @NgInput() steps: WizardStep[] = [];
  @NgInput() currentStep = 0;
  @NgInput() stepTitle = "";
  @NgInput() cancelLabel?: string;
  @NgInput() backLabel?: string;
  @NgInput() nextLabel?: string;
  @NgInput() finishLabel?: string;
  @NgInput() isLast = false;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-wz", this.classInput].filter(Boolean).join(" ");
  }
}
