import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
      <div class="st-navRail__items">
        @for (item of items; track item.id) {
          @if (item.href && !item.disabled) {
            <a [href]="item.href"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </a>
          } @else {
            <button type="button"
              class="st-navRail__item"
              [class.st-navRail__item--active]="isActive(item)"
              [disabled]="item.disabled || null"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.title]="item.label"
              (click)="selectItem(item)">
              <span class="st-navRail__label">{{ item.label }}</span>
              @if (item.badge != null) { <span class="st-navRail__badge">{{ item.badge }}</span> }
            </button>
          }
        }
        <ng-content></ng-content>
      </div>
    </nav>
  `,
})
export class NavRail {
  static readonly stComponentName = "NavRail";
  readonly componentName = "NavRail";
  @NgInput() items: NavRailItem[] = [];
  @NgInput() label = "Primary navigation";
  @NgInput() activeItemId?: string;
  @NgInput("class") classInput?: string;

  @Output() readonly itemSelect = new EventEmitter<string>();

  get hostClass(): string {
    return ["st-navRail", this.classInput].filter(Boolean).join(" ");
  }

  isActive(item: NavRailItem): boolean {
    return item.active === true || item.id === this.activeItemId;
  }

  selectItem(item: NavRailItem): void {
    if (!item.disabled) this.itemSelect.emit(item.id);
  }
}
