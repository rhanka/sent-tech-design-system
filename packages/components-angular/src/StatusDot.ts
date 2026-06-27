import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type StatusDotTone = "neutral" | "info" | "success" | "warning" | "error";

export type StatusDotProps = {
  /** Ton sémantique, mappé sur --st-semantic-feedback-*. Ignoré si `color` est fourni. */
  tone?: StatusDotTone;
  /** Couleur arbitraire (hex, rgb(), var(--token)…), rendue en background inline. Prime sur `tone`. */
  color?: string;
  /** Diamètre du point en px (défaut 8). */
  size?: number;
  /** Halo animé pour un état « live ». Désactivé sous prefers-reduced-motion. */
  pulse?: boolean;
  /** Si fourni, rend le point + ce texte inline (un StatusIndicator). */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-status-dot",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass">
      @if (label) {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          aria-hidden="true"></span>
        <span class="st-statusDot__label">{{ label }}</span>
      } @else {
        <span [class]="dotClass"
          [style.background-color]="color || null"
          [style.width.px]="safeSize"
          [style.height.px]="safeSize"
          role="img"
          [attr.aria-label]="accessibleLabel"></span>
      }
    </span>
  `,
})
export class StatusDot {
  static readonly stComponentName = "StatusDot";
  readonly componentName = "StatusDot";
  @NgInput() tone: StatusDotTone = "neutral";
  @NgInput() color?: string;
  @NgInput() size = 8;
  @NgInput() pulse = false;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get safeSize(): number {
    return Math.max(Number(this.size ?? 8) || 0, 1);
  }

  get accessibleLabel(): string {
    return this.label ?? this.color ?? this.tone;
  }

  get hostClass(): string {
    return classNames("st-statusDot", this.classInput);
  }

  get dotClass(): string {
    return classNames(
      "st-statusDot__dot",
      this.color ? null : `st-statusDot__dot--${this.tone}`,
      this.pulse ? "st-statusDot__dot--pulse" : null,
    );
  }
}
