import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/** Niveau de titre porté par l'Overline d'en-tête de section. `h2`/`h3` quand la
 * section est une vraie région titrée d'un rail/drawer ; choisis selon la
 * profondeur du sommaire. */
export type NavSectionHeadingLevel = "h2" | "h3";

export type NavSectionProps = {
  /** Libellé de la section, rendu via Overline (small-caps muet). */
  label: string;
  /** Compteur optionnel → Badge circle en queue de l'en-tête. */
  count?: number;
  /** Si true, l'en-tête devient le trigger d'un Collapsible (aria-expanded)
   * qui montre/cache le contenu. Sinon : groupe titré statique. */
  collapsible?: boolean;
  /** État d'ouverture quand `collapsible`. */
  open?: boolean;
  /** Niveau de titre de l'Overline quand la section n'est pas repliable. */
  as?: NavSectionHeadingLevel;
  class?: string;
};

@Component({
  selector: "st-nav-section",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-navSection__header">
        <span class="st-navSection__label">{{ label }}</span>
        @if (count !== undefined) {
          <span class="st-navSection__count">{{ count }}</span>
        }
      </div>
      <div class="st-navSection__content">
        <ng-content></ng-content>
      </div>
    </section>
  `,
})
export class NavSection {
  static readonly stComponentName = "NavSection";
  readonly componentName = "NavSection";
  @NgInput() label!: string;
  @NgInput() count?: number;
  @NgInput() collapsible?: boolean;
  @NgInput() open?: boolean;
  @NgInput() as?: NavSectionHeadingLevel;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-navSection",
      this.collapsible ? "st-navSection--collapsible" : "st-navSection--static",
      this.classInput,
    );
  }
}
