import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/** Profondeur dans l'arbre de nav → échelle typographique DÉCROISSANTE.
 * L0 = racine (base/600), chaque palier descend en taille ET en graisse pour
 * que la hiérarchie se LISE sans indentation seule. */
export type NavItemDepth = 0 | 1 | 2 | 3;

/** Ton sémantique de la rangée. `error` est un VRAI état (un « HTTP 403 »
 * devient rouge sémantique), pas une teinte décorative. */
export type NavItemStatus = "neutral" | "info" | "success" | "warning" | "error";

export type NavItemSwatch = {
  /** Couleur arbitraire (hex/rgb/var) → rendue par ColorSwatch. */
  color?: string;
  /** Ton sémantique → rendu par StatusDot (un point). Ignoré si `color`. */
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  /** Forme de la pastille couleur (ColorSwatch). Défaut « square ». */
  shape?: "square" | "circle" | "pill";
};

export type NavItemProps = {
  /** Clé de sélection, passée telle quelle à SelectableRow (data-value). */
  value?: string;
  /** Libellé principal (1ʳᵉ ligne). */
  title: string;
  /** 2ᵉ ligne MUETTE, ellipsée indépendamment du titre. */
  caption?: string;
  /** Profondeur (défaut 0) → échelle typo + indentation de la tête. */
  depth?: NavItemDepth;
  /** Pastille de tête : couleur arbitraire (ColorSwatch) ou ton (StatusDot). */
  swatch?: NavItemSwatch;
  /** Bulle de compte en queue (Badge circle/sm, tabular-nums). */
  count?: number;
  /** Ton sémantique de la rangée. */
  status?: NavItemStatus;
  /** Sélection (honorée en standalone ; la liste prime si encadrée). */
  selected?: boolean;
  /** Non-interactif. */
  disabled?: boolean;
  /** Rend la rangée comme un lien (ancre) — anatomie identique. */
  href?: string;
  /** Séparateur token-only rendu APRÈS la rangée. */
  divider?: boolean;
  class?: string;
};

@Component({
  selector: "st-nav-item",
  standalone: true,
  template: `
    <a
      [attr.data-st-component]="componentName"
      [attr.href]="disabled ? null : href"
      [attr.aria-disabled]="disabled ? 'true' : null"
      [class]="hostClass"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class NavItem {
  static readonly stComponentName = "NavItem";
  readonly componentName = "NavItem";
  @NgInput() value?: string;
  @NgInput() title!: string;
  @NgInput() caption?: string;
  @NgInput() depth?: NavItemDepth;
  @NgInput() swatch?: NavItemSwatch;
  @NgInput() count?: number;
  @NgInput() status?: NavItemStatus;
  @NgInput() selected?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() href?: string;
  @NgInput() divider?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    const depth = Math.min(Math.max(Math.trunc(Number(this.depth) || 0), 0), 3);
    const status = this.status ?? "neutral";
    return classNames(
      "st-navItem",
      `st-navItem--depth${depth}`,
      status !== "neutral" ? `st-navItem--status-${status}` : null,
      this.classInput,
    );
  }
}
