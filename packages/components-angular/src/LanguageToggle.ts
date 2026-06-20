import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type LanguageToggleLocale = "fr" | "en";

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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'fr'"
        [attr.aria-pressed]="locale === 'fr'">{{ frLabel || 'FR' }}</button>
      <button type="button" class="st-languageToggle__btn"
        [class.st-languageToggle__btn--active]="locale === 'en'"
        [attr.aria-pressed]="locale === 'en'">{{ enLabel || 'EN' }}</button>
    </div>
  `,
})
export class LanguageToggle {
  static readonly stComponentName = "LanguageToggle";
  readonly componentName = "LanguageToggle";
  @NgInput() locale?: LanguageToggleLocale;
  @NgInput() frLabel?: string;
  @NgInput() enLabel?: string;
  @NgInput() label?: string;
  @NgInput() selectId?: string;
  @NgInput() variant?: "select" | "accordion";
  @NgInput() accordionLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-languageToggle", this.classInput);
  }
}
