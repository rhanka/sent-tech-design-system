import { Component, Input as NgInput } from "@angular/core";

export interface NavRailItem {
  id: string;
  label: unknown;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: unknown;
}

export type NavRailProps = {
  items?: NavRailItem[];
  label?: string;
  activeItemId?: string;
  class?: string;
};

@Component({
  selector: "st-nav-rail",
  standalone: true,
  template: `
    <nav [attr.data-st-component]="componentName" [attr.aria-label]="label" [class]="hostClass">
      @if (items && items.length) {
        <ul class="st-navRail__list">
          @for (item of items; track item.id) {
            <li class="st-navRail__item">
              <a [href]="item.href || '#'"
                class="st-navRail__link"
                [class.st-navRail__link--active]="item.active || item.id === activeItemId"
                [class.st-navRail__link--disabled]="item.disabled"
                [attr.aria-current]="(item.active || item.id === activeItemId) ? 'page' : null"
                [attr.aria-disabled]="item.disabled || null">
                <span class="st-navRail__label">{{ item.label }}</span>
                @if (item.badge) { <span class="st-navRail__badge">{{ item.badge }}</span> }
              </a>
            </li>
          }
        </ul>
      }
      <ng-content></ng-content>
    </nav>
  `,
})
export class NavRail {
  static readonly stComponentName = "NavRail";
  readonly componentName = "NavRail";
  @NgInput() items?: NavRailItem[];
  @NgInput() label = "Primary navigation";
  @NgInput() activeItemId?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-navRail", this.classInput].filter(Boolean).join(" ");
  }
}
