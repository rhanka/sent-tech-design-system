import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type DrawerPlacement = "left" | "right" | "bottom";

export type DrawerProps = {
  open?: boolean;
  title?: string;
  description?: string;
  placement?: DrawerPlacement;
  class?: string;
};

@Component({
  selector: "st-drawer",
  standalone: true,
  template: `
    <div class="st-drawer__backdrop" [attr.hidden]="open ? null : ''" role="presentation">
      <aside
        [attr.data-st-component]="componentName"
        role="dialog"
        [attr.aria-modal]="open ? 'true' : null"
        [attr.aria-label]="title"
        [class]="hostClass"
      >
        <header class="st-drawer__header" [attr.hidden]="title || description ? null : ''">
          <div>
            <h2 class="st-drawer__title">{{ title }}</h2>
            <p class="st-drawer__description" [attr.hidden]="description ? null : ''">{{ description }}</p>
          </div>
        </header>
        <div class="st-drawer__body">
          <ng-content></ng-content>
        </div>
      </aside>
    </div>
  `,
})
export class Drawer {
  static readonly stComponentName = "Drawer";
  readonly componentName = "Drawer";
  @NgInput() open?: boolean;
  @NgInput() title?: string;
  @NgInput() description?: string;
  @NgInput() placement?: DrawerPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-drawer", `st-drawer--${this.placement ?? "right"}`, this.open ? "st-drawer--open" : null, this.classInput);
  }
}
