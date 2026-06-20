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
    <form class="st-chatComposer" [class]="hostClass" (submit)="onSubmit($event)">
      <textarea
        class="st-chatComposer__input"
        [value]="currentValue"
        [placeholder]="placeholder ?? ''"
        [disabled]="disabled"
        [attr.maxlength]="maxLength ?? null"
        (input)="onInput($event)"
        (keydown.enter)="onEnter($event)"
      ></textarea>
      <button type="submit" class="st-chatComposer__send" [disabled]="!currentValue.trim() || disabled">↑</button>
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
