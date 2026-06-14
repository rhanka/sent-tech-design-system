import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export interface TileGroupItem {
  value: string;
  /** Libellé du tile (canonique Svelte). */
  label?: unknown;
  /** @deprecated Alias de `label` (compat). Utilisez `label`. */
  title?: unknown;
  description?: unknown;
  disabled?: boolean;
}

export type TileGroupProps = {
  legend?: unknown;
  items: TileGroupItem[];
  value?: string;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-tile-group",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class TileGroup {
  static readonly stComponentName = "TileGroup";
  readonly componentName = "TileGroup";
  @NgInput() legend?: unknown;
  @NgInput() items!: TileGroupItem[];
  @NgInput() value?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-tileGroup", this.classInput].filter(Boolean).join(" ");
  }
}
