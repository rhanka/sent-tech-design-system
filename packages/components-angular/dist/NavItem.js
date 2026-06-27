import { Component, Input as NgInput } from "@angular/core";
import { Badge } from "./Badge.js";
import { ColorSwatch } from "./ColorSwatch.js";
import { SelectableRow } from "./SelectableRow.js";
import { StatusDot } from "./StatusDot.js";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class NavItem {
    static stComponentName = "NavItem";
    componentName = "NavItem";
    value;
    title;
    caption;
    depth;
    swatch;
    count;
    status;
    selected;
    active;
    disabled;
    href;
    divider;
    classInput;
    get hasCount() {
        return this.count !== undefined && this.count !== null;
    }
    /** Explicit accessible name for the trailing count bubble (« N title »): a bare
     * number is ambiguous for a screen reader (cf. Badge). */
    get countAriaLabel() {
        return `${this.count} ${this.title}`;
    }
    get safeDepth() {
        return Math.min(Math.max(Math.trunc(Number(this.depth) || 0), 0), 3);
    }
    get hostClass() {
        const status = this.status ?? "neutral";
        return classNames("st-navItem", `st-navItem--depth${this.safeDepth}`, status !== "neutral" ? `st-navItem--status-${status}` : null, this.classInput);
    }
    /** Indentation de profondeur : var additive sur le wrapper, héritée par la
     * rangée (.st-selectableRow) via la cascade — miroir du Svelte. */
    get depthStyle() {
        const depth = this.safeDepth;
        const fallback = ["0rem", "0.75rem", "1.5rem", "2.25rem"][depth];
        return `--st-navItem-indent: var(--st-component-navItem-depth${depth}-indent, ${fallback});`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: NavItem, isStandalone: true, selector: "st-nav-item", inputs: { value: "value", title: "title", caption: "caption", depth: "depth", swatch: "swatch", count: "count", status: "status", selected: "selected", active: "active", disabled: "disabled", href: "href", divider: "divider", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [style]="depthStyle">
      <st-selectable-row
        [selected]="active || selected"
        [value]="value"
        [href]="href"
        [disabled]="disabled"
        [leading]="!!swatch"
        [trailing]="hasCount"
        [caption]="!!caption"
      >
        @if (swatch) {
          @if (swatch.color) {
            <st-color-swatch slot="leading" [color]="swatch.color" [shape]="swatch.shape ?? 'square'" [size]="14"></st-color-swatch>
          } @else {
            <st-status-dot slot="leading" [tone]="swatch.tone ?? 'neutral'" [size]="8"></st-status-dot>
          }
        }
        <span class="st-navItem__title">{{ title }}</span>
        @if (caption) {
          <span slot="caption" class="st-navItem__caption">{{ caption }}</span>
        }
        @if (hasCount) {
          <st-badge slot="trailing" shape="circle" size="sm" [tone]="status ?? 'neutral'" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>
        }
      </st-selectable-row>
      @if (divider) {
        <hr class="st-navItem__divider" aria-hidden="true" />
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "component", type: Badge, selector: "st-badge", inputs: ["tone", "shape", "size", "label", "class"] }, { kind: "component", type: ColorSwatch, selector: "st-color-swatch", inputs: ["color", "size", "shape", "label", "class"] }, { kind: "component", type: StatusDot, selector: "st-status-dot", inputs: ["tone", "color", "size", "pulse", "label", "class"] }, { kind: "component", type: SelectableRow, selector: "st-selectable-row", inputs: ["selected", "onSelect", "disabled", "value", "href", "role", "accentBar", "caption", "leading", "trailing", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: NavItem, decorators: [{
            type: Component,
            args: [{
                    selector: "st-nav-item",
                    standalone: true,
                    imports: [Badge, ColorSwatch, StatusDot, SelectableRow],
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [style]="depthStyle">
      <st-selectable-row
        [selected]="active || selected"
        [value]="value"
        [href]="href"
        [disabled]="disabled"
        [leading]="!!swatch"
        [trailing]="hasCount"
        [caption]="!!caption"
      >
        @if (swatch) {
          @if (swatch.color) {
            <st-color-swatch slot="leading" [color]="swatch.color" [shape]="swatch.shape ?? 'square'" [size]="14"></st-color-swatch>
          } @else {
            <st-status-dot slot="leading" [tone]="swatch.tone ?? 'neutral'" [size]="8"></st-status-dot>
          }
        }
        <span class="st-navItem__title">{{ title }}</span>
        @if (caption) {
          <span slot="caption" class="st-navItem__caption">{{ caption }}</span>
        }
        @if (hasCount) {
          <st-badge slot="trailing" shape="circle" size="sm" [tone]="status ?? 'neutral'" [attr.aria-label]="countAriaLabel">{{ count }}</st-badge>
        }
      </st-selectable-row>
      @if (divider) {
        <hr class="st-navItem__divider" aria-hidden="true" />
      }
    </div>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], depth: [{
                type: NgInput
            }], swatch: [{
                type: NgInput
            }], count: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], selected: [{
                type: NgInput
            }], active: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], href: [{
                type: NgInput
            }], divider: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=NavItem.js.map