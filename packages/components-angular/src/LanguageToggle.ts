import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type LanguageToggleLocale = "fr" | "en";

let _counter = 0;

export type LanguageToggleProps = {
  locale?: LanguageToggleLocale;
  frLabel?: string;
  enLabel?: string;
  /** Libellé du sélecteur (associé via <label for> + aria-label). */
  label?: string;
  /** Id du <select> ; auto-généré et stable si non fourni. */
  selectId?: string;
  variant?: "select" | "accordion";
  accordionLabel?: string;
  class?: string;
};

@Component({
  selector: "st-language-toggle",
  standalone: true,
  template: `
    @if (variant === "accordion") {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <button
          type="button"
          class="st-languageToggle__accordionTrigger"
          [attr.aria-expanded]="open"
          (click)="open = !open"
        >
          <span>{{ accordionLabel }}</span>
          <span
            class="st-languageToggle__chevron"
            [class.st-languageToggle__chevron--open]="open"
            aria-hidden="true"
          >&#x25BE;</span>
        </button>
        @if (open) {
          <div class="st-languageToggle__accordionPanel">
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'fr'"
              [attr.aria-current]="locale === 'fr' ? 'true' : 'false'"
              (click)="emit('fr')"
            >
              {{ frLabel }}
            </button>
            <button
              type="button"
              class="st-languageToggle__option"
              [class.st-languageToggle__option--active]="locale === 'en'"
              [attr.aria-current]="locale === 'en' ? 'true' : 'false'"
              (click)="emit('en')"
            >
              {{ enLabel }}
            </button>
          </div>
        }
      </div>
    } @else {
      <label class="st-languageToggle__srLabel" [attr.for]="resolvedSelectId">{{ label }}</label>
      <select
        [attr.data-st-component]="componentName"
        [id]="resolvedSelectId"
        [class]="selectClass"
        [value]="locale"
        [attr.aria-label]="label"
        (change)="onSelectChange($event)"
      >
        <option value="fr">{{ frLabel }}</option>
        <option value="en">{{ enLabel }}</option>
      </select>
    }
  `,
})
export class LanguageToggle {
  static readonly stComponentName = "LanguageToggle";
  readonly componentName = "LanguageToggle";

  open = false;
  readonly autoSelectId = `st-languageToggle-${++_counter}`;

  @NgInput() locale: LanguageToggleLocale = "fr";
  @NgInput() frLabel = "FR";
  @NgInput() enLabel = "EN";
  @NgInput() label = "Langue";
  @NgInput() selectId?: string;
  @NgInput() variant: "select" | "accordion" = "select";
  @NgInput() accordionLabel = "Langue";
  @NgInput("class") classInput?: string;

  @Output() readonly localeChange = new EventEmitter<LanguageToggleLocale>();

  get resolvedSelectId(): string {
    return this.selectId ?? this.autoSelectId;
  }

  get hostClass(): string {
    return classNames("st-languageToggle", this.classInput);
  }

  get selectClass(): string {
    return classNames("st-languageToggle__select", this.classInput);
  }

  emit(next: LanguageToggleLocale): void {
    this.localeChange.emit(next);
  }

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LanguageToggleLocale;
    this.emit(value);
  }
}
