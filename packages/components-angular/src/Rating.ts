import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type RatingSize = "sm" | "md" | "lg";

// In addition to the Vue-native `@change` emit (routed to an `onChange`
// listener by Vue), an `onChange` callback prop (parity with React/Svelte) is
// accepted and fired on change.
export type RatingProps = {
  /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
  value?: number;
  /** Nombre d'étoiles. */
  max?: number;
  /** Appelé avec la nouvelle note au clic ou au clavier. */
  onChange?: (value: number) => void;
  /** Affichage seul : ni clic ni clavier n'émettent. */
  readonly?: boolean;
  /** Autorise les demi-étoiles (sélection au demi-point). */
  allowHalf?: boolean;
  size?: RatingSize;
  /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
  name?: string;
  /** Étiquette accessible du groupe. */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-rating",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Rating {
  static readonly stComponentName = "Rating";
  readonly componentName = "Rating";
  @NgInput() value?: number;
  @NgInput() max?: number;
  @NgInput() onChange?: (value: number) => void;
  @NgInput() readonly?: boolean;
  @NgInput() allowHalf?: boolean;
  @NgInput() size?: RatingSize;
  @NgInput() name?: string;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-rating", this.classInput].filter(Boolean).join(" ");
  }
}
