import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    @if (readonly) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="img"
        [attr.aria-label]="label ? label + ' : ' + valueText : valueText"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else if (allowHalf) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="slider"
        [attr.aria-label]="label"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="resolvedMax"
        [attr.aria-valuenow]="resolvedValue"
        [attr.aria-valuetext]="valueText"
        tabindex="0"
        (keydown)="onKeyDown($event)"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
            (click)="onStarClick($event, star)"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="radiogroup"
        [attr.aria-label]="label"
      >
        @for (star of stars; track star) {
          <button
            type="button"
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            role="radio"
            [attr.name]="name"
            [attr.aria-checked]="resolvedValue === star ? 'true' : 'false'"
            [attr.aria-label]="star + ' / ' + resolvedMax"
            [attr.tabindex]="star === focusedStar ? 0 : -1"
            (click)="onStarClick($event, star)"
            (keydown)="onKeyDown($event)"
          >
            <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        }
      </div>
    }
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

  @Output() readonly change = new EventEmitter<number>();

  get resolvedValue(): number {
    return this.value ?? 0;
  }

  get resolvedMax(): number {
    return this.max ?? 5;
  }

  get resolvedSize(): RatingSize {
    return this.size ?? "md";
  }

  get iconSize(): number {
    return this.resolvedSize === "sm" ? 16 : this.resolvedSize === "lg" ? 28 : 22;
  }

  get stars(): number[] {
    return Array.from({ length: this.resolvedMax }, (_, i) => i + 1);
  }

  get focusedStar(): number {
    return this.resolvedValue > 0 ? Math.ceil(this.resolvedValue) : 1;
  }

  get valueText(): string {
    return `${this.resolvedValue} / ${this.resolvedMax}`;
  }

  get hostClass(): string {
    return classNames(
      "st-rating",
      `st-rating--${this.resolvedSize}`,
      this.readonly && "st-rating--readonly",
      this.classInput,
    );
  }

  fill(star: number): "full" | "half" | "empty" {
    if (this.resolvedValue >= star) return "full";
    if (this.allowHalf && this.resolvedValue >= star - 0.5) return "half";
    return "empty";
  }

  private commit(next: number): void {
    if (this.readonly) return;
    const clamped = Math.max(0, Math.min(this.resolvedMax, next));
    this.value = clamped;
    this.change.emit(clamped);
    this.onChange?.(clamped);
  }

  onStarClick(event: MouseEvent, star: number): void {
    if (this.readonly) return;
    let next = star;
    if (this.allowHalf) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const isLeftHalf = event.clientX - rect.left < rect.width / 2;
      next = isLeftHalf ? star - 0.5 : star;
    }
    if (next === this.resolvedValue) {
      this.commit(0);
      return;
    }
    this.commit(next);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.readonly) return;
    const step = this.allowHalf ? 0.5 : 1;
    const max = this.resolvedMax;
    const value = this.resolvedValue;
    let handled = true;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(max, value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = this.allowHalf ? Math.max(0, value - step) : Math.max(1, value - step);
        break;
      case "Home":
        next = this.allowHalf ? 0 : 1;
        break;
      case "End":
        next = max;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      if (next !== null) this.commit(next);
    }
  }
}
