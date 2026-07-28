import { Component, ElementRef, EventEmitter, Input as NgInput, Output, ViewChild, } from "@angular/core";
import { classNames } from "./classNames.js";
import { Menu } from "./Menu.js";
import * as i0 from "@angular/core";
// Anchor spacing between panel and trigger.
const GAP = 4;
// Anti-overflow margin between the panel and the viewport edge.
const VIEWPORT_MARGIN = 8;
// Height floor: below this threshold we keep a usable scrollable window rather
// than a crushed menu (rare case of a trigger glued to the edge).
const MIN_HEIGHT = 160;
/**
 * Pure position solver — mirrors Svelte's `computePosition()` / React's
 * `computePosition` callback so it can be unit-tested without a real
 * `window`/DOM (this package's tests run in a Node environment, no jsdom).
 */
export function computeMenuPopoverPosition(rect, placement, align, viewport) {
    const verticalUp = placement === "top-start" || placement === "top-end";
    const horizontalEnd = placement === "bottom-end" || placement === "top-end";
    const resolvedAlign = align ?? (horizontalEnd ? "end" : "start");
    const alignEnd = resolvedAlign === "end";
    const alignCenter = resolvedAlign === "center";
    let top;
    let maxHeight;
    if (verticalUp) {
        // Panel bottom edge sits above the trigger (transform handles the flip);
        // available space is what's ABOVE the trigger.
        top = rect.top + viewport.scrollY - GAP;
        maxHeight = Math.max(rect.top - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
    }
    else {
        top = rect.bottom + viewport.scrollY + GAP;
        // Space actually available BELOW the trigger — `max-height: 100vh` alone
        // ignores the panel's offset and overflows past the bottom edge.
        maxHeight = Math.max(viewport.height - rect.bottom - GAP - VIEWPORT_MARGIN, MIN_HEIGHT);
    }
    let left;
    if (resolvedAlign === "end") {
        left = rect.right + viewport.scrollX;
    }
    else if (resolvedAlign === "center") {
        left = rect.left + viewport.scrollX + rect.width / 2;
    }
    else {
        left = rect.left + viewport.scrollX;
    }
    return { top, left, maxHeight, alignEnd, alignCenter };
}
export function menuPopoverIsWithin(event, node) {
    if (!node)
        return false;
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.includes(node))
        return true;
    const target = event.target;
    return Boolean(target && node.contains(target));
}
export class MenuPopover {
    static stComponentName = "MenuPopover";
    componentName = "MenuPopover";
    /** Convenience (not in the Svelte contract): renders a <st-menu> from `items` instead of projected content. */
    items;
    open = false;
    /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
    trigger = null;
    placement = "bottom-start";
    align;
    /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
    label;
    classInput;
    closeOnOutside = true;
    closeOnEscape = true;
    openChange = new EventEmitter();
    panel;
    top = 0;
    left = 0;
    maxHeight = 0;
    alignEnd = false;
    alignCenter = false;
    listenersActive = false;
    onScroll = () => this.computePosition();
    onResize = () => this.computePosition();
    onPointerDown = (event) => {
        if (!this.open || !this.closeOnOutside)
            return;
        if (menuPopoverIsWithin(event, this.panel?.nativeElement))
            return;
        if (menuPopoverIsWithin(event, this.trigger))
            return;
        this.close();
    };
    onKeyDown = (event) => {
        if (!this.open || !this.closeOnEscape)
            return;
        if (event.key === "Escape") {
            event.preventDefault();
            this.close();
        }
    };
    get hostClass() {
        return classNames("st-menuPopover", `st-menuPopover--${this.placement}`, this.alignEnd ? "st-menuPopover--alignEnd" : null, this.alignCenter ? "st-menuPopover--alignCenter" : null, this.classInput);
    }
    get panelStyle() {
        return `top: ${this.top}px; left: ${this.left}px;${this.maxHeight ? ` max-height: ${this.maxHeight}px;` : ""}`;
    }
    ngAfterViewInit() {
        this.registerWindowListeners();
        if (this.open)
            this.computePosition();
    }
    ngOnChanges(changes) {
        if (typeof window === "undefined")
            return;
        if (!this.open)
            return;
        if (changes["open"] || changes["trigger"] || changes["placement"] || changes["align"]) {
            // Recompute after Angular renders the panel for the new state.
            queueMicrotask(() => {
                if (this.open)
                    this.computePosition();
            });
        }
    }
    ngOnDestroy() {
        this.unregisterWindowListeners();
    }
    computePosition() {
        if (!this.trigger)
            return;
        if (typeof window === "undefined")
            return;
        const rect = this.trigger.getBoundingClientRect();
        const pos = computeMenuPopoverPosition({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }, this.placement, this.align, { height: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY });
        this.top = pos.top;
        this.left = pos.left;
        this.maxHeight = pos.maxHeight;
        this.alignEnd = pos.alignEnd;
        this.alignCenter = pos.alignCenter;
    }
    close() {
        if (!this.open)
            return;
        this.open = false;
        this.openChange.emit(false);
    }
    registerWindowListeners() {
        if (this.listenersActive)
            return;
        if (typeof window === "undefined")
            return;
        this.listenersActive = true;
        window.addEventListener("scroll", this.onScroll, true);
        window.addEventListener("resize", this.onResize);
        window.addEventListener("pointerdown", this.onPointerDown);
        window.addEventListener("keydown", this.onKeyDown);
    }
    unregisterWindowListeners() {
        if (!this.listenersActive)
            return;
        this.listenersActive = false;
        if (typeof window === "undefined")
            return;
        window.removeEventListener("scroll", this.onScroll, true);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("pointerdown", this.onPointerDown);
        window.removeEventListener("keydown", this.onKeyDown);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuPopover, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MenuPopover, isStandalone: true, selector: "st-menu-popover", inputs: { items: "items", open: "open", trigger: "trigger", placement: "placement", align: "align", label: "label", classInput: ["class", "classInput"], closeOnOutside: "closeOnOutside", closeOnEscape: "closeOnEscape" }, outputs: { openChange: "openChange" }, viewQueries: [{ propertyName: "panel", first: true, predicate: ["panel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    @if (open) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="dialog"
        [attr.aria-label]="label"
        [style]="panelStyle"
      >
        @if (items && items.length) {
          <st-menu [items]="items" role="presentation"></st-menu>
        } @else {
          <ng-content></ng-content>
        }
      </div>
    }
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "component", type: Menu, selector: "st-menu", inputs: ["items", "dense", "role", "class"], outputs: ["select"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MenuPopover, decorators: [{
            type: Component,
            args: [{ selector: "st-menu-popover", standalone: true, imports: [Menu], template: `
    @if (open) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="dialog"
        [attr.aria-label]="label"
        [style]="panelStyle"
      >
        @if (items && items.length) {
          <st-menu [items]="items" role="presentation"></st-menu>
        } @else {
          <ng-content></ng-content>
        }
      </div>
    }
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { items: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], trigger: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], align: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], closeOnOutside: [{
                type: NgInput
            }], closeOnEscape: [{
                type: NgInput
            }], openChange: [{
                type: Output
            }], panel: [{
                type: ViewChild,
                args: ["panel"]
            }] } });
//# sourceMappingURL=MenuPopover.js.map