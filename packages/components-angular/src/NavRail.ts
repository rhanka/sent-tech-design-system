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
