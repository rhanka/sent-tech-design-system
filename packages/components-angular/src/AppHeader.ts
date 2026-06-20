import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AppHeaderProps = {
  compact?: boolean;
  menuOpen?: boolean;
  menuLabel?: string;
  /**
   * Id du tiroir, partagé entre `aria-controls` (burger) et `id` (drawer).
   * Auto-généré et stable si non fourni.
   */
  drawerId?: string;
  /**
   * Marque structurée (décision actée : logo SENT + sous-titre). Rend le bloc
   * canonique « logo carré + nom + sous-titre produit ». Si le slot `logo` est
   * fourni, il a priorité (contrôle total).
   */
  brandName?: string;
  /** Sous-titre produit affiché sous le nom (ex. « Design System », « dataviz »). */
  productName?: string;
  /** Source de l'image du logo carré (ex. `/SENT-logo-squared.svg`). */
  logoSrc?: string;
  /** Texte alternatif du logo (décoratif par défaut). */
  logoAlt?: string;
  /** Cible du lien de la marque. Défaut : `/`. */
  brandHref?: string;
  /** aria-label du lien de marque (sinon dérivé de `brandName` + `productName`). */
  brandLabel?: string;
  class?: string;
};

@Component({
  selector: "st-app-header",
  standalone: true,
  template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content select="[slot=logo]"></ng-content>
      <ng-content select="[slot=navigation]"></ng-content>
      <ng-content select="[slot=actions]"></ng-content>
      <ng-content></ng-content>
    </header>
  `,
})
export class AppHeader {
  static readonly stComponentName = "AppHeader";
  readonly componentName = "AppHeader";
  @NgInput() compact?: boolean;
  @NgInput() menuOpen?: boolean;
  @NgInput() menuLabel?: string;
  @NgInput() drawerId?: string;
  @NgInput() brandName?: string;
  @NgInput() productName?: string;
  @NgInput() logoSrc?: string;
  @NgInput() logoAlt?: string;
  @NgInput() brandHref?: string;
  @NgInput() brandLabel?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-appHeader", this.compact && "st-appHeader--compact", this.classInput);
  }
}
