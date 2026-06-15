import { Component, Input as NgInput } from "@angular/core";

import { Button } from "./Button.js";

import { classNames } from "./classNames.js";

/** Hiérarchie ENCODÉE DANS LE TYPE : une seule action `primary` est légitime
 * dans une pile. `secondary` = action secondaire ; `ghost` = action discrète.
 * La couleur sémantique (danger) n'est PAS un `kind` — elle vit dans
 * `dangerZone`, rendue à part. */
export type NavActionKind = "primary" | "secondary" | "ghost";

export interface NavAction {
  label: string;
  onClick?: () => void;
  href?: string;
  kind?: NavActionKind;
  disabled?: boolean;
}

/** Action destructrice, isolée sous un séparateur + un overline « Zone
 * sensible ». Toujours en ton danger, jamais alignée avec les actions
 * normales. Pas de `kind` : c'est une zone, pas une catégorie de couleur. */
export interface NavActionDangerZone {
  label: string;
  onClick?: () => void;
  href?: string;
}

export type NavActionStackOrientation = "vertical" | "horizontal";

export type NavActionStackProps = {
  actions?: NavAction[];
  dangerZone?: NavActionDangerZone;
  /** Libellé de l'overline de la zone sensible. Défaut « Zone sensible ». */
  dangerLabel?: string;
  orientation?: NavActionStackOrientation;
  /** Étiquette a11y du groupe d'actions. */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-nav-action-stack",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class NavActionStack {
  static readonly stComponentName = "NavActionStack";
  readonly componentName = "NavActionStack";
  @NgInput() actions?: NavAction[];
  @NgInput() dangerZone?: NavActionDangerZone;
  @NgInput() dangerLabel?: string;
  @NgInput() orientation?: NavActionStackOrientation;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-navActionStack",
      `st-navActionStack--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }
}
