import { Component, Input as NgInput } from "@angular/core";

import { Badge } from "./Badge.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { StatusDot } from "./StatusDot.js";
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
  /** État actif (alias de selected pour compatibilité). */
  active?: boolean;
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
  imports: [Badge, ColorSwatch, StatusDot],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [style]="depthStyle">
      <a
        class="st-selectableRow"
        [class.st-selectableRow--selected]="active || selected"
        [class.st-selectableRow--disabled]="disabled"
        [attr.href]="disabled ? null : href"
        [attr.role]="href ? null : 'option'"
        [attr.aria-disabled]="disabled ? 'true' : null"
        [attr.aria-selected]="(active || selected) ? 'true' : null"
        [attr.aria-current]="(active || selected) ? 'page' : null"
        [attr.data-value]="value ?? null"
      >
        @if (swatch) {
          <span class="st-selectableRow__leading">
            @if (swatch.color) {
              <st-color-swatch [color]="swatch.color" [shape]="swatch.shape ?? 'square'" [size]="14"></st-color-swatch>
            } @else {
              <st-status-dot [tone]="swatch.tone ?? 'neutral'" [size]="8"></st-status-dot>
            }
          </span>
        }
        <span class="st-selectableRow__content" [class.st-selectableRow__content--stacked]="caption">
          <span class="st-navItem__title">{{ title }}<ng-content></ng-content></span>
          @if (caption) {
            <span class="st-navItem__caption">{{ caption }}</span>
          }
        </span>
        @if (count !== undefined && count !== null) {
          <span class="st-selectableRow__trailing">
            <st-badge shape="circle" size="sm" [tone]="status ?? 'neutral'" [attr.aria-label]="count + ' ' + title">{{ count }}</st-badge>
          </span>
        }
      </a>
      @if (divider) {
        <hr class="st-navItem__divider" aria-hidden="true" />
      }
    </div>
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
  @NgInput() active?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() href?: string;
  @NgInput() divider?: boolean;
  @NgInput("class") classInput?: string;

  private get safeDepth(): number {
    return Math.min(Math.max(Math.trunc(Number(this.depth) || 0), 0), 3);
  }

  get hostClass(): string {
    const status = this.status ?? "neutral";
    return classNames(
      "st-navItem",
      `st-navItem--depth${this.safeDepth}`,
      status !== "neutral" ? `st-navItem--status-${status}` : null,
      this.classInput,
    );
  }

  /** Indentation de profondeur : var additive sur le wrapper, héritée par la
   * rangée (.st-selectableRow) via la cascade — miroir du Svelte. */
  get depthStyle(): string {
    const depth = this.safeDepth;
    const fallback = ["0rem", "0.75rem", "1.5rem", "2.25rem"][depth];
    return `--st-navItem-indent: var(--st-component-navItem-depth${depth}-indent, ${fallback});`;
  }
}
