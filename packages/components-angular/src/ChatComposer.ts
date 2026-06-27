import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type ChatComposerProps = {
  value?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  submitLabel?: unknown;
  class?: string;
};

@Component({
  selector: "st-chat-composer",
  standalone: true,
  template: `
    <form [class]="hostClass" (submit)="onSubmit($event)">
      <div class="st-chatComposer__body">
        <div class="st-chatComposer__inputShell">
          <textarea
            class="st-chatComposer__textarea st-chatComposer__input"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled"
            [attr.maxlength]="maxLength ?? null"
            (input)="onInput($event)"
            (keydown.enter)="onEnter($event)"
          ></textarea>
        </div>
      </div>
      <div class="st-chatComposer__toolbar">
        <div class="st-chatComposer__actions st-chatComposer__actions--left">
          <ng-content></ng-content>
        </div>
        <div class="st-chatComposer__actions st-chatComposer__actions--right">
          <button
            type="submit"
            class="st-button st-button--primary st-button--md"
            [disabled]="!currentValue.trim() || disabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
              <path d="m21.854 2.147-10.94 10.939"></path>
            </svg>{{ submitLabel ?? 'Send' }}</button>
        </div>
      </div>
    </form>
  `,
})
export class ChatComposer {
  static readonly stComponentName = "ChatComposer";
  readonly componentName = "ChatComposer";

  @NgInput() value?: string;
  @NgInput() modelValue?: string;
  @NgInput() placeholder?: string;
  @NgInput() disabled = false;
  @NgInput() maxLength?: number;
  @NgInput() label?: string;
  @NgInput() submitLabel?: unknown;
  @NgInput("class") classInput?: string;

  @Output() readonly submit = new EventEmitter<string>();
  @Output() readonly modelValueChange = new EventEmitter<string>();

  get currentValue(): string {
    return this.modelValue ?? this.value ?? "";
  }

  get hostClass(): string {
    return classNames("st-chatComposer", this.classInput);
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLTextAreaElement).value;
    this.modelValueChange.emit(v);
  }

  onEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) {
      e.preventDefault();
      this.onSubmit(e);
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    const v = this.currentValue.trim();
    if (v) this.submit.emit(v);
  }
}
