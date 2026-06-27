import { Component, Input as NgInput } from "@angular/core";

import { Badge } from "./Badge.js";
import { classNames } from "./classNames.js";

let _navSectionCounter = 0;

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
  imports: [Badge],
  template: `
    @if (collapsible) {
      <div [attr.data-st-component]="componentName" [class]="collapsibleClass">
        <button
          type="button"
          class="st-collapsible__trigger"
          [attr.aria-expanded]="currentOpen ? 'true' : 'false'"
          [attr.aria-controls]="uid + '-region'"
          [id]="uid + '-trigger'"
          [attr.aria-label]="triggerAriaLabel"
          (click)="toggle()"
        >
          <span class="st-collapsible__title">{{ label }}</span>
          @if (hasCount) {
            <span class="st-collapsible__trailing">
              <st-badge shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>
            </span>
          }
          <span class="st-collapsible__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        @if (currentOpen) {
          <div
            class="st-collapsible__region"
            role="region"
            [id]="uid + '-region'"
            [attr.aria-labelledby]="uid + '-trigger'"
          >
            <ng-content></ng-content>
          </div>
        }
      </div>
    } @else {
      <section
        [attr.data-st-component]="componentName"
        [class]="staticClass"
        role="group"
        [attr.aria-labelledby]="uid + '-label'"
      >
        <div class="st-navSection__header">
          <h3 class="st-overline st-navSection__label" [id]="uid + '-label'">{{ label }}@if (hasCount) {<st-badge class="st-navSection__count" shape="circle" size="sm" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>}</h3>
        </div>
        <div class="st-navSection__body">
          <ng-content></ng-content>
        </div>
      </section>
    }
  `,
})
export class NavSection {
  static readonly stComponentName = "NavSection";
  readonly componentName = "NavSection";
  readonly uid = `st-navSection-${++_navSectionCounter}`;
  private localOpen?: boolean;

  @NgInput() label!: string;
  @NgInput() count?: number;
  @NgInput() collapsible?: boolean;
  @NgInput() open?: boolean;
  @NgInput() as?: NavSectionHeadingLevel;
  @NgInput("class") classInput?: string;

  get hasCount(): boolean {
    return this.count !== undefined && this.count !== null;
  }

  /** Count bubble accessible name (« N éléments »). */
  get countAriaLabel(): string {
    return `${this.count} éléments`;
  }

  /** Trigger accessible name : announces the count alongside the label. */
  get triggerAriaLabel(): string {
    return this.hasCount ? `${this.label}, ${this.count}` : this.label;
  }

  /** `open` is the INITIAL value (mirror of the Vue/Svelte `bind:open`): the
   * section owns its disclosure state once mounted. Defaults to open. */
  get currentOpen(): boolean {
    return this.localOpen ?? this.open ?? true;
  }

  toggle(): void {
    this.localOpen = !this.currentOpen;
  }

  private get rootClasses(): string {
    return classNames(
      "st-navSection",
      this.collapsible ? "st-navSection--collapsible" : "st-navSection--static",
      this.classInput,
    );
  }

  /** Collapsible variant reuses the Collapsible anatomy (no size modifier, like
   * the Vue/React reference) merged with the NavSection root classes. */
  get collapsibleClass(): string {
    return classNames(
      "st-collapsible",
      this.currentOpen && "st-collapsible--open",
      this.rootClasses,
    );
  }

  get staticClass(): string {
    return this.rootClasses;
  }
}
