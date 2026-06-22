import { NgTemplateOutlet } from "@angular/common";
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
  template: `
    <ng-template #icon let-state="state">
      @if (state === 'half') {
        <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01l.824-5.118a2.1 2.1 0 0 0-.605-1.86l-3.71-3.625 5.121-.745a2.1 2.1 0 0 0 1.58-1.148l2.29-4.642"/>
          <path d="M12 2v16.5"/>
        </svg>
      } @else {
        <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="state === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.69 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.453 9.795a.53.53 0 0 1 .294-.904l5.166-.756a2.122 2.122 0 0 0 1.597-1.16z"/>
        </svg>
      }
    </ng-template>

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
            <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ state: fill(star) }"></ng-container>
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
            <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ state: fill(star) }"></ng-container>
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
            <ng-container [ngTemplateOutlet]="icon" [ngTemplateOutletContext]="{ state: fill(star) }"></ng-container>
          </button>
        }
      </div>
    }
  `,
  imports: [NgTemplateOutlet],
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
