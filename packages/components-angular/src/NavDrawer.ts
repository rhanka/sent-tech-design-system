import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import type { NavShellSide } from "./NavShell.js";
import { NavItem } from "./NavItem.js";
import { classNames } from "./classNames.js";

export type NavDrawerProps = {
  title?: string;
  label?: string;
  open?: boolean;
  side?: NavShellSide;
  class?: string;
  navItems?: Array<{ label: string; href?: string; active?: boolean }>;
};

@Component({
  selector: "st-nav-drawer",
  standalone: true,
  imports: [NavItem],
  template: `
    @if (open) {
      <div
        class="st-drawer__backdrop"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <aside
          [attr.data-st-component]="componentName"
          [class]="hostClass"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title || label || 'Navigation'"
        >
          <header class="st-drawer__header">
            <div>
              @if (title || label) {
                <h2 class="st-drawer__title">{{ title || label }}</h2>
              }
            </div>
            <button
              type="button"
              class="st-drawer__close"
              aria-label="Close"
              (click)="closeEvent.emit()"
            ><span aria-hidden="true">&#x2715;</span></button>
          </header>
          <div class="st-drawer__body">
            <div class="st-navShell__body">
              @if (navItems && navItems.length > 0) {
                <nav [attr.aria-label]="label || title || 'Navigation'">
                  @for (item of navItems; track item.label) {
                    <st-nav-item
                      [title]="item.label"
                      [href]="item.href"
                      [active]="item.active"
                    ></st-nav-item>
                  }
                </nav>
              }
              <ng-content></ng-content>
            </div>
          </div>
        </aside>
      </div>
    }
  `,
})
export class NavDrawer {
  static readonly stComponentName = "NavDrawer";
  readonly componentName = "NavDrawer";

  @NgInput() title?: string;
  @NgInput() label?: string;
  @NgInput() open = false;
  @NgInput() side: NavShellSide = "left";
  @NgInput() navItems?: Array<{ label: string; href?: string; active?: boolean }>;
  @NgInput("class") classInput?: string;

  @Output() readonly closeEvent = new EventEmitter<void>();

  get hostClass(): string {
    return classNames(
      // Base `st-drawer` est LOAD-BEARING : positionnement absolu, surface,
      // largeur, grille du panneau. Sans elle le tiroir rend cassé (bloc nu).
      "st-drawer",
      `st-drawer--${this.side ?? "left"}`,
      // Le drawer de nav compose NavShell (cf. source Svelte) + le marqueur
      // `st-navDrawer` (sans CSS propre, intentionnel).
      "st-navShell",
      "st-navShell--drawer",
      "st-navDrawer",
      this.classInput,
    );
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEvent.emit();
    }
  }
}
