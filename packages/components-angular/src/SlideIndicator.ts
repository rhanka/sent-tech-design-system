import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

import { classNames } from "./classNames.js";

export type SlideIndicatorVariant = "dots" | "bars";

export type SlideIndicatorSize = "sm" | "md" | "lg";

// In addition to the Angular-native `change` emit, an `onChange` callback prop
// (parity with React/Svelte) is accepted and fired on selection.
export type SlideIndicatorProps = {
  /** Nombre total de diapositives. */
  count: number;
  /** Index de la diapositive courante (0-based). */
  current?: number;
  /** Appelé avec l'index ciblé au clic ou au clavier. */
  onChange?: (index: number) => void;
  size?: SlideIndicatorSize;
  variant?: SlideIndicatorVariant;
  /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
  label?: string;
  class?: string;
};

@Component({
  selector: "st-slide-indicator",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="resolvedLabel"
    >
      @for (index of items; track index) {
        <button
          type="button"
          class="st-slideIndicator__dot"
          [class.st-slideIndicator__dot--current]="index === resolvedCurrent"
          [attr.aria-current]="index === resolvedCurrent ? 'true' : null"
          [attr.aria-label]="resolvedLabel + ' ' + (index + 1)"
          [attr.tabindex]="index === resolvedCurrent ? 0 : -1"
          (click)="select(index)"
          (keydown)="onKeyDown($event, index)"
        ></button>
      }
    </div>
  `,
})
export class SlideIndicator {
  static readonly stComponentName = "SlideIndicator";
  readonly componentName = "SlideIndicator";
  @NgInput() count!: number;
  @NgInput() current?: number;
  @NgInput() onChange?: (index: number) => void;
  @NgInput() size?: SlideIndicatorSize;
  @NgInput() variant?: SlideIndicatorVariant;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly change = new EventEmitter<number>();

  get resolvedCurrent(): number {
    return this.current ?? 0;
  }

  get resolvedLabel(): string {
    return this.label ?? "Diapositive";
  }

  get items(): number[] {
    return Array.from({ length: Math.max(0, this.count) }, (_, i) => i);
  }

  get hostClass(): string {
    return classNames(
      "st-slideIndicator",
      `st-slideIndicator--${this.size ?? "md"}`,
      `st-slideIndicator--${this.variant ?? "dots"}`,
      this.classInput,
    );
  }

  select(index: number): void {
    if (index < 0 || index >= this.count || index === this.resolvedCurrent) return;
    this.onChange?.(index);
    this.change.emit(index);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    let target = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = Math.min(this.count - 1, index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = Math.max(0, index - 1);
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = this.count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    // Déplacer le focus DOM vers le bouton cible (roving tabindex correct).
    const current = event.currentTarget as HTMLElement;
    const group = current.parentElement;
    const targetEl = group?.children.item(target) as HTMLElement | null;
    if (targetEl) targetEl.focus();
    this.select(target);
  }
}
