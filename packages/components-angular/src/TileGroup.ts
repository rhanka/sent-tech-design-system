import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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
  legendHidden?: boolean;
  items: TileGroupItem[];
  value?: string;
  name?: string;
  disabled?: boolean;
  class?: string;
};

let _tileGroupCounter = 0;

@Component({
  selector: "st-tile-group",
  standalone: true,
  template: `
    <fieldset
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [disabled]="!!disabled"
    >
      @if (legend) {
        <legend [class]="legendClass">{{ legend }}</legend>
      }
      <div class="st-tileGroup__items">
        @for (item of items; track item.value) {
          <label [class]="tileClass(item)">
            <input
              class="st-tileGroup__input"
              type="radio"
              [attr.name]="groupName"
              [value]="item.value"
              [checked]="item.value === value"
              [disabled]="!!(disabled || item.disabled)"
              (change)="onSelect(item)"
            />
            <span class="st-tileGroup__content">
              <span class="st-tileGroup__label">{{ item.label ?? item.title }}</span>
              @if (item.description) {
                <span class="st-tileGroup__description">{{ item.description }}</span>
              }
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class TileGroup {
  static readonly stComponentName = "TileGroup";
  readonly componentName = "TileGroup";
  @NgInput() legend?: unknown;
  @NgInput() legendHidden?: boolean;
  @NgInput() items!: TileGroupItem[];
  @NgInput() value?: string;
  @NgInput() name?: string;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  @Output() readonly valueChange = new EventEmitter<string>();

  private readonly uid = ++_tileGroupCounter;

  get groupName(): string {
    return this.name ?? `st-tileGroup-${this.uid}`;
  }

  get hostClass(): string {
    return classNames(
      "st-tileGroup",
      this.disabled && "st-tileGroup--disabled",
      this.classInput,
    );
  }

  get legendClass(): string {
    return classNames(
      "st-tileGroup__legend",
      this.legendHidden && "st-tileGroup__legend--hidden",
    );
  }

  tileClass(item: TileGroupItem): string {
    return classNames(
      "st-tileGroup__tile",
      item.value === this.value && "st-tileGroup__tile--checked",
      item.disabled && "st-tileGroup__tile--disabled",
    );
  }

  onSelect(item: TileGroupItem): void {
    if (this.disabled || item.disabled) return;
    this.value = item.value;
    this.valueChange.emit(item.value);
  }
}
