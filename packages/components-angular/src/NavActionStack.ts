import { Component, Input as NgInput } from "@angular/core";

import { Divider } from "./Divider.js";

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
  imports: [Divider],
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="group" [attr.aria-label]="label">
      <div class="st-navActionStack__actions">
        @for (action of normalizedActions; track action.label) {
          @if (action.href && !action.disabled) {
            <a
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [href]="action.href"
              (click)="action.onClick && action.onClick()">{{ action.label }}</a>
          } @else {
            <button type="button"
              [class]="'st-button st-button--' + variantFor(action.kind) + ' st-button--md st-navActionStack__item'"
              [disabled]="action.disabled || null"
              (click)="action.onClick && action.onClick()">{{ action.label }}</button>
          }
        }
      </div>
      @if (dangerZone) {
        <div class="st-navActionStack__danger" role="group" [attr.aria-label]="dangerLabel">
          <st-divider></st-divider>
          <span class="st-navActionStack__dangerLabel">{{ dangerLabel }}</span>
          @if (dangerZone.href) {
            <a
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              [href]="dangerZone.href"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</a>
          } @else {
            <button type="button"
              class="st-button st-button--danger st-button--md st-navActionStack__item st-navActionStack__dangerAction"
              (click)="dangerZone.onClick && dangerZone.onClick()">{{ dangerZone.label }}</button>
          }
        </div>
      }
    </div>
  `,
})
export class NavActionStack {
  static readonly stComponentName = "NavActionStack";
  readonly componentName = "NavActionStack";
  @NgInput() actions: NavAction[] = [];
  @NgInput() dangerZone?: NavActionDangerZone;
  @NgInput() dangerLabel = "Zone sensible";
  @NgInput() orientation: NavActionStackOrientation = "vertical";
  @NgInput() label = "Actions";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-navActionStack",
      `st-navActionStack--${this.orientation ?? "vertical"}`,
      this.classInput,
    );
  }

  /** Règle « un seul primary » appliquée au runtime, en miroir du type :
   * on garde le premier `primary`, on dégrade les suivants en `secondary`. */
  get normalizedActions(): Array<NavAction & { kind: NavActionKind }> {
    let primarySeen = false;
    return (this.actions ?? []).map((action) => {
      const kind: NavActionKind = action.kind ?? "secondary";
      if (kind === "primary") {
        if (primarySeen) {
          return { ...action, kind: "secondary" as NavActionKind };
        }
        primarySeen = true;
      }
      return { ...action, kind };
    });
  }

  variantFor(kind: NavActionKind): "primary" | "secondary" | "ghost" {
    return kind;
  }
}
