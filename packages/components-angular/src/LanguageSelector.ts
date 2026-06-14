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
      <ng-content></ng-content>
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

  get hostClass(): string {
    return ["st-languageSelector", this.classInput].filter(Boolean).join(" ");
  }
}
