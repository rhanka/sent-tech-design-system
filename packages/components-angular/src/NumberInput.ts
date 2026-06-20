import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type NumberInputSize = "sm" | "md" | "lg";

export type NumberInputProps = {
  label?: unknown;
  helperText?: unknown;
  errorText?: unknown;
  size?: NumberInputSize;
  modelValue?: number | string;
  /** Svelte/React-canonical alias for `modelValue`. */
  value?: number | string | null;
  disabled?: boolean;
  readonly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  incrementLabel?: string;
  decrementLabel?: string;
  class?: string;
};

let _counter = 0;
function nextId(): string {
  return `st-numberInput-${++_counter}`;
}

@Component({
  selector: "st-number-input",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <label class="st-field__control" [attr.for]="inputId">
        @if (label) {
          <span class="st-field__label">{{ label }}</span>
        }
        <span [class]="controlWrapClass">
          <input
            [id]="inputId"
            class="st-numberInput__control"
            type="number"
            [value]="currentValue"
            [disabled]="disabled ?? false"
            [attr.readonly]="readonly ? '' : null"
            [attr.min]="min"
            [attr.max]="max"
            [attr.step]="step"
            [attr.aria-invalid]="isInvalid ? 'true' : null"
            (input)="onInput($event)"
            (change)="change.emit($event)"
          />
          <span class="st-numberInput__buttons">
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="decrementLabel ?? 'Decrement value'"
              [disabled]="disabled || isAtMin"
              (click)="decrement()"
            ><span aria-hidden="true">−</span></button>
            <button
              type="button"
              class="st-numberInput__button"
              [attr.aria-label]="incrementLabel ?? 'Increment value'"
              [disabled]="disabled || isAtMax"
              (click)="increment()"
            ><span aria-hidden="true">+</span></button>
          </span>
        </span>
      </label>
      @if (errorText) {
        <span class="st-field__error">{{ errorText }}</span>
      }
      @if (!errorText && helperText) {
        <span class="st-field__help">{{ helperText }}</span>
      }
    </div>
  `,
})
export class NumberInput {
  static readonly stComponentName = "NumberInput";
  readonly componentName = "NumberInput";
  private readonly autoId = nextId();

  @NgInput() label?: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() errorText?: unknown;
  @NgInput() size?: NumberInputSize;
  @NgInput() modelValue?: number | string;
  @NgInput() value?: number | string | null;
  @NgInput() disabled?: boolean;
  @NgInput() readonly?: boolean;
  @NgInput() min?: number | string;
  @NgInput() max?: number | string;
  @NgInput() step?: number | string;
  @NgInput() incrementLabel?: string;
  @NgInput() decrementLabel?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly modelValueChange = new EventEmitter<number | null>();
  @Output("update:modelValue") readonly updateModelValue = new EventEmitter<number | null>();
  @Output() readonly input = new EventEmitter<Event>();
  @Output() readonly change = new EventEmitter<Event>();

  // Internal value for uncontrolled mode
  private _internal: number | null = null;

  get inputId(): string {
    return this.autoId;
  }

  get isInvalid(): boolean {
    return Boolean(this.errorText);
  }

  get controlWrapClass(): string {
    return classNames("st-numberInput", `st-numberInput--${this.size ?? "md"}`);
  }

  get hostClass(): string {
    return classNames("st-field", this.classInput);
  }

  get numMin(): number | undefined {
    const v = this.min;
    return v !== undefined && v !== "" ? Number(v) : undefined;
  }

  get numMax(): number | undefined {
    const v = this.max;
    return v !== undefined && v !== "" ? Number(v) : undefined;
  }

  get numStep(): number {
    const v = this.step;
    return v !== undefined && v !== "" ? Number(v) : 1;
  }

  get numValue(): number | null {
    const controlled = this.modelValue !== undefined;
    if (controlled) {
      const b = this.modelValue;
      return b === null || b === undefined || b === "" ? null : Number(b);
    }
    const seed = this.value;
    if (this._internal === null && seed !== undefined && seed !== null && seed !== "") {
      return Number(seed);
    }
    return this._internal;
  }

  get currentValue(): number | string {
    return this.numValue ?? "";
  }

  get isAtMin(): boolean {
    const n = this.numValue;
    return n !== null && this.numMin !== undefined && n <= this.numMin;
  }

  get isAtMax(): boolean {
    const n = this.numValue;
    return n !== null && this.numMax !== undefined && n >= this.numMax;
  }

  private clamp(n: number): number {
    if (this.numMin !== undefined && n < this.numMin) return this.numMin;
    if (this.numMax !== undefined && n > this.numMax) return this.numMax;
    return n;
  }

  private setValue(next: number | null): void {
    if (this.modelValue === undefined) {
      this._internal = next;
    }
    this.modelValueChange.emit(next);
    this.updateModelValue.emit(next);
  }

  increment(): void {
    this.setValue(this.clamp((this.numValue ?? this.numMin ?? 0) + this.numStep));
  }

  decrement(): void {
    this.setValue(this.clamp((this.numValue ?? this.numMax ?? 0) - this.numStep));
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const next = raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : this.numValue;
    this.setValue(next);
    this.input.emit(event);
  }
}
