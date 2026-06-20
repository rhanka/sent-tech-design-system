import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export interface CheckboxGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

export type CheckboxGroupProps = {
  legend?: string;
  label?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  orientation?: "vertical" | "horizontal";
  name?: string;
  options?: CheckboxGroupOption[];
  helperText?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-checkbox-group",
  standalone: true,
  template: `
    <fieldset [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label ?? legend) {
        <legend class="st-checkboxGroup__legend">{{ label ?? legend }}</legend>
      }
      <div class="st-checkboxGroup__list">
        @for (opt of options ?? []; track opt.value) {
          <label class="st-checkboxGroup__option">
            <input
              type="checkbox"
              class="st-checkbox__control"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              (change)="toggle(opt.value, $event)"
            />
            <span>{{ opt.label }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class CheckboxGroup {
  static readonly stComponentName = "CheckboxGroup";
  readonly componentName = "CheckboxGroup";

  @NgInput() label?: string;
  @NgInput() legend?: string;
  @NgInput() value: string[] = [];
  @NgInput() onChange?: (value: string[]) => void;
  @NgInput() orientation?: "vertical" | "horizontal";
  @NgInput() name?: string;
  @NgInput() options?: CheckboxGroupOption[];
  @NgInput() helperText?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string[]>();

  get hostClass(): string {
    return classNames(
      "st-checkboxGroup",
      this.orientation ? `st-checkboxGroup--${this.orientation}` : undefined,
      this.classInput,
    );
  }

  isChecked(v: string): boolean {
    return (this.value ?? []).includes(v);
  }

  toggle(v: string, e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    const next = checked
      ? [...(this.value ?? []), v]
      : (this.value ?? []).filter((x) => x !== v);
    this.valueChange.emit(next);
    this.onChange?.(next);
  }
}
