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
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StatusDot {
  static readonly stComponentName = "StatusDot";
  readonly componentName = "StatusDot";
  @NgInput() tone?: StatusDotTone;
  @NgInput() color?: string;
  @NgInput() size?: number;
  @NgInput() pulse?: boolean;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-statusDot", this.classInput);
  }
}
