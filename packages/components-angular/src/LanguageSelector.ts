import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type LanguageOption = {
  value: string;
  label: unknown;
};

export type LanguageSelectorProps = {
  options: LanguageOption[];
  value?: string;
  label?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-language-selector",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button
        type="button"
        class="st-languageSelector__trigger"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open"
        [attr.aria-label]="label"
        [disabled]="disabled ?? false"
        (click)="open = !open"
      >
        <span class="st-languageSelector__current">{{ current?.label ?? value }}</span>
        <span
          class="st-languageSelector__caret"
          [class.st-languageSelector__caret--open]="open"
          aria-hidden="true"
        ></span>
      </button>

      @if (open) {
        <ul class="st-languageSelector__menu" role="listbox" [attr.aria-label]="label">
          @for (option of options; track option.value) {
            <li>
              <button
                type="button"
                class="st-languageSelector__option"
                [class.st-languageSelector__option--active]="option.value === value"
                role="option"
                [attr.aria-selected]="option.value === value"
                (click)="choose(option.value)"
              >
                <span class="st-languageSelector__check" aria-hidden="true">{{ option.value === value ? "✓" : "" }}</span>
                {{ option.label }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class LanguageSelector {
  static readonly stComponentName = "LanguageSelector";
  readonly componentName = "LanguageSelector";

  open = false;

  @NgInput() options!: LanguageOption[];
  @NgInput() value = "";
  @NgInput() label = "Choisir la langue";
  @NgInput() disabled = false;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output("change") readonly change = new EventEmitter<string>();

  get current(): LanguageOption | undefined {
    return (this.options ?? []).find((o) => o.value === this.value) ?? (this.options ?? [])[0];
  }

  get hostClass(): string {
    return classNames("st-languageSelector", this.classInput);
  }

  choose(next: string): void {
    this.value = next;
    this.open = false;
    this.valueChange.emit(next);
    this.change.emit(next);
  }
}
