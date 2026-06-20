import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type RadioProps = {
  label: string;
  helperText?: string;
  invalid?: boolean;
  modelValue?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-radio",
  standalone: true,
  template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="radio"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        (change)="onRadioChange($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-choice__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `,
})
export class Radio {
  static readonly stComponentName = "Radio";
  readonly componentName = "Radio";

  @NgInput() label!: string;
  @NgInput() helperText?: string;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: string;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<string>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<string>();
  @Output() readonly change = new EventEmitter<Event>();

  get currentChecked(): boolean {
    if (this.checked !== undefined) return this.checked;
    if (this.modelValue !== undefined && this.value !== undefined) {
      return this.modelValue === this.value;
    }
    return false;
  }

  get hostClass(): string {
    return classNames("st-choice", "st-choice--radio", this.classInput);
  }

  onRadioChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.modelValueChange.emit(val);
    this.updateModelValue.emit(val);
    this.change.emit(event);
  }
}
