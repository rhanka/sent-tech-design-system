import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LanguageOption = {
  value: string;
  label: unknown;
};

export type LanguageSelectorProps = {
  options: LanguageOption[];
  value?: string;
  open?: boolean;
  class?: string;
};

@Component({
  selector: "st-language-selector",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <select class="st-languageSelector__select" [value]="value" (change)="onChange($event)">
        @for (opt of options; track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value">{{ opt.label }}</option>
        }
      </select>
    </div>
  `,
})
export class LanguageSelector {
  static readonly stComponentName = "LanguageSelector";
  readonly componentName = "LanguageSelector";
  @NgInput() options!: LanguageOption[];
  @NgInput() value?: string;
  @NgInput() open?: boolean;
  @NgInput("class") classInput?: string;

  onChange(_event: Event): void {}

  get hostClass(): string {
    return classNames("st-languageSelector", this.classInput);
  }
}
