import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type RadioGroupProps = {
  legend?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  name?: string;
  options?: RadioGroupOption[];
  helperText?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-radio-group",
  standalone: true,
  template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass" [disabled]="disabled ?? false">
      @if (legend ?? label) {
        <legend class="st-radioGroup__legend">{{ legend ?? label }}</legend>
      }
      @if (helperText) {
        <p class="st-radioGroup__help">{{ helperText }}</p>
      }
      <div class="st-radioGroup__options">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-choice st-choice--radio">
            <input
              class="st-choice__input"
              type="radio"
              [name]="name"
              [value]="opt.value"
              [checked]="opt.value === value"
              [disabled]="opt.disabled ?? false"
              (change)="onChangeHandler(opt.value)"
            />
            <span class="st-choice__content">
              <span class="st-choice__label">{{ opt.label }}</span>
              @if (opt.helperText) {
                <span class="st-choice__help">{{ opt.helperText }}</span>
              }
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class RadioGroup {
  static readonly stComponentName = "RadioGroup";
  readonly componentName = "RadioGroup";

  @NgInput() label?: string;
  @NgInput() legend?: string;
  @NgInput() value?: string;
  @NgInput() onChange?: (value: string) => void;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() name?: string;
  @NgInput() options?: RadioGroupOption[];
  @NgInput() helperText?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string>();

  get hostClass(): string {
    return classNames(
      "st-radioGroup",
      `st-radioGroup--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }

  onChangeHandler(v: string): void {
    this.valueChange.emit(v);
    this.onChange?.(v);
  }
}
