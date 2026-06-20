import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TileVariant = "static" | "clickable" | "selectable";

export type TileProps = {
  title?: unknown;
  description?: unknown;
  variant?: TileVariant;
  /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
  href?: string;
  /** Pour `selectable` : état coché. */
  selected?: boolean;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-tile",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Tile {
  static readonly stComponentName = "Tile";
  readonly componentName = "Tile";
  @NgInput() title?: unknown;
  @NgInput() description?: unknown;
  @NgInput() variant?: TileVariant;
  @NgInput() href?: string;
  @NgInput() selected?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-tile",
      `st-tile--${this.variant ?? "static"}`,
      this.variant === "selectable" && this.selected && "st-tile--selected",
      this.disabled && "st-tile--disabled",
      this.classInput,
    );
  }
}
