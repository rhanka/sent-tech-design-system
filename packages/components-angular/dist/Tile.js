import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Tile {
    static stComponentName = "Tile";
    componentName = "Tile";
    title;
    description;
    variant;
    href;
    selected;
    disabled;
    classInput;
    select = new EventEmitter();
    get resolvedVariant() {
        return this.variant ?? "static";
    }
    get hasTextContent() {
        return Boolean(this.title) || Boolean(this.description);
    }
    get hostClass() {
        return classNames("st-tile", `st-tile--${this.resolvedVariant}`, this.resolvedVariant === "selectable" && this.selected && "st-tile--selected", this.disabled && "st-tile--disabled", this.classInput);
    }
    onToggle(event) {
        if (this.disabled)
            return;
        const checked = event.target.checked;
        this.select.emit(checked);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tile, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Tile, isStandalone: true, selector: "st-tile", inputs: { title: "title", description: "description", variant: "variant", href: "href", selected: "selected", disabled: "disabled", classInput: ["class", "classInput"] }, outputs: { select: "select" }, ngImport: i0, template: `
    @if (resolvedVariant === 'clickable' && href) {
      <a
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [href]="href"
        [attr.aria-disabled]="disabled ? 'true' : null"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </a>
    } @else if (resolvedVariant === 'clickable') {
      <button
        [attr.data-st-component]="componentName"
        type="button"
        [class]="hostClass"
        [disabled]="disabled ?? false"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </button>
    } @else if (resolvedVariant === 'selectable') {
      <label [attr.data-st-component]="componentName" [class]="hostClass">
        <input
          type="checkbox"
          class="st-tile__input"
          [checked]="selected ?? false"
          [disabled]="disabled ?? false"
          (change)="onToggle($event)"
        />
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </label>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tile, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tile",
                    standalone: true,
                    template: `
    @if (resolvedVariant === 'clickable' && href) {
      <a
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [href]="href"
        [attr.aria-disabled]="disabled ? 'true' : null"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </a>
    } @else if (resolvedVariant === 'clickable') {
      <button
        [attr.data-st-component]="componentName"
        type="button"
        [class]="hostClass"
        [disabled]="disabled ?? false"
      >
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </button>
    } @else if (resolvedVariant === 'selectable') {
      <label [attr.data-st-component]="componentName" [class]="hostClass">
        <input
          type="checkbox"
          class="st-tile__input"
          [checked]="selected ?? false"
          [disabled]="disabled ?? false"
          (change)="onToggle($event)"
        />
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </label>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <span class="st-tile__content">
          @if (hasTextContent) {
            @if (title) {
              <span class="st-tile__title">{{ title }}</span>
            }
            @if (description) {
              <span class="st-tile__description">{{ description }}</span>
            }
          } @else {
            <ng-content></ng-content>
          }
        </span>
      </div>
    }
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], description: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], href: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=Tile.js.map