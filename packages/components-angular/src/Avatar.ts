import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { deriveInitials } from "./Header.js";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export type AvatarShape = "circle" | "square";

export type AvatarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AvatarProps = {
  /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
  name: string;
  /** URL de la photo. Si absente, on rend un cercle d'initiales. */
  src?: string;
  /** Texte alternatif de l'image. Par défaut = `name`. */
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Catégorie de couleur pour le fond des initiales. */
  tone?: AvatarTone;
  class?: string;
};

@Component({
  selector: "st-avatar",
  standalone: true,
  template: `
    <span [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="alt ?? name" role="img">
      @if (src) {
        <img class="st-avatar__image" [src]="src" [alt]="alt || name" aria-hidden="false" />
      } @else {
        <span class="st-avatar__initials" aria-hidden="true">{{ initials }}</span>
      }
    </span>
  `,
})
export class Avatar {
  static readonly stComponentName = "Avatar";
  readonly componentName = "Avatar";
  @NgInput() name!: string;
  @NgInput() src?: string;
  @NgInput() alt?: string;
  @NgInput() size?: AvatarSize;
  @NgInput() shape?: AvatarShape;
  @NgInput() tone?: AvatarTone;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-avatar",
      `st-avatar--${this.size ?? "md"}`,
      `st-avatar--${this.shape ?? "circle"}`,
      this.src ? "st-avatar--image" : `st-avatar--${this.tone ?? "category1"}`,
      this.classInput,
    );
  }

  get initials(): string {
    return deriveInitials(this.name);
  }
}
