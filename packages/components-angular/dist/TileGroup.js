import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _tileGroupCounter = 0;
export class TileGroup {
    static stComponentName = "TileGroup";
    componentName = "TileGroup";
    legend;
    legendHidden;
    items;
    value;
    name;
    disabled;
    classInput;
    valueChange = new EventEmitter();
    uid = ++_tileGroupCounter;
    get groupName() {
        return this.name ?? `st-tileGroup-${this.uid}`;
    }
    get hostClass() {
        return classNames("st-tileGroup", this.disabled && "st-tileGroup--disabled", this.classInput);
    }
    get legendClass() {
        return classNames("st-tileGroup__legend", this.legendHidden && "st-tileGroup__legend--hidden");
    }
    tileClass(item) {
        return classNames("st-tileGroup__tile", item.value === this.value && "st-tileGroup__tile--checked", item.disabled && "st-tileGroup__tile--disabled");
    }
    onSelect(item) {
        if (this.disabled || item.disabled)
            return;
        this.value = item.value;
        this.valueChange.emit(item.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TileGroup, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TileGroup, isStandalone: true, selector: "st-tile-group", inputs: { legend: "legend", legendHidden: "legendHidden", items: "items", value: "value", name: "name", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TileGroup, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { legend: [{
                type: NgInput
            }], legendHidden: [{
                type: NgInput
            }], items: [{
                type: NgInput
            }], value: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], valueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=TileGroup.js.map