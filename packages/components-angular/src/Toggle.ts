import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type ToggleSize = "sm" | "md";

export type ToggleProps = {
  label: unknown;
  labelOn?: string;
  labelOff?: string;
  helperText?: unknown;
  size?: ToggleSize;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-toggle",
  standalone: true,
  template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <span class="st-toggle__label">{{ label }}</span>
      <span class="st-toggle__row">
        <input
          class="st-toggle__input"
          type="checkbox"
          role="switch"
          [name]="name ?? null"
          [value]="value ?? null"
          [checked]="isChecked"
          [disabled]="disabled ?? false"
          [attr.aria-checked]="isChecked ? 'true' : 'false'"
          (change)="onChange($event)"
        />
        <span class="st-toggle__track" aria-hidden="true">
          <span class="st-toggle__thumb"></span>
        </span>
        <span class="st-toggle__state" aria-hidden="true">{{ isChecked ? labelOn : labelOff }}</span>
      </span>
      @if (helperText) {
        <span class="st-toggle__help">{{ helperText }}</span>
      }
    </label>
  `,
})
export class Toggle {
  static readonly stComponentName = "Toggle";
  readonly componentName = "Toggle";
  @NgInput() label!: unknown;
  @NgInput() labelOn = "On";
  @NgInput() labelOff = "Off";
  @NgInput() helperText?: unknown;
  @NgInput() size?: ToggleSize;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly checkedChange = new EventEmitter<boolean>();
  @Output() readonly modelValueChange = new EventEmitter<boolean>();

  get isChecked(): boolean {
    return this.modelValue ?? this.checked ?? false;
  }

  get hostClass(): string {
    return classNames(
      "st-toggle",
      `st-toggle--${this.size ?? "md"}`,
      this.classInput,
    );
  }

  onChange(e: Event): void {
    const next = (e.target as HTMLInputElement).checked;
    this.checked = next;
    this.modelValue = next;
    this.checkedChange.emit(next);
    this.modelValueChange.emit(next);
  }
}
