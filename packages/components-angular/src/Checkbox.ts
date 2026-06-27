import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type CheckboxProps = {
  label: string;
  helperText?: string;
  /** Secondary muted description line under the label (e.g. a filter hint). */
  description?: string;
  /** Trailing slot pushed to the row end (e.g. a count Badge). */
  trailing?: unknown;
  invalid?: boolean;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-checkbox-${++_counter}`;
}

@Component({
  selector: "st-checkbox",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-choice__input"
        type="checkbox"
        [checked]="currentChecked"
        [disabled]="disabled ?? false"
        [attr.name]="name"
        [attr.value]="value"
        [attr.aria-invalid]="invalid ? 'true' : null"
        [attr.aria-describedby]="description ? descriptionId : null"
        (change)="onCheck($event)"
      />
      <span class="st-choice__content">
        <span class="st-choice__label">{{ label }}</span>
        @if (description) {
          <span class="st-choice__description" [id]="descriptionId">{{ description }}</span>
        }
        @if (helperText) {
          <span class="st-choice__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `,
})
export class Checkbox {
  static readonly stComponentName = "Checkbox";
  readonly componentName = "Checkbox";
  private readonly autoId = nextId();

  @NgInput() label!: string;
  @NgInput() helperText?: string;
  @NgInput() description?: string;
  @NgInput() trailing?: unknown;
  @NgInput() invalid?: boolean;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<boolean>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<boolean>();
  @Output() readonly change = new EventEmitter<Event>();

  get descriptionId(): string {
    return `${this.autoId}-description`;
  }

  get currentChecked(): boolean {
    return this.modelValue ?? this.checked ?? false;
  }

  get hostClass(): string {
    return classNames(
      "st-choice",
      "st-choice--checkbox",
      this.description ? "st-choice--described" : undefined,
      this.classInput,
    );
  }

  onCheck(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.modelValueChange.emit(checked);
    this.updateModelValue.emit(checked);
    this.change.emit(event);
  }
}
