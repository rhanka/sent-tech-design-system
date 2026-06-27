import { Component, ElementRef, Input as NgInput, ViewChild, } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const OPPOSITE = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};
export function splitPlacement(placement) {
    const [side, align] = placement.split("-");
    return { side, align: align ?? "center" };
}
export function joinPlacement(side, align) {
    return (align === "center" ? side : `${side}-${align}`);
}
export function computePosition(anchorRect, panelWidth, panelHeight, options) {
    const { offset, flip, shift, viewportWidth, viewportHeight } = options;
    let { side, align } = splitPlacement(options.placement);
    const place = (s, a) => {
        let top = 0;
        let left = 0;
        if (s === "top" || s === "bottom") {
            top = s === "top" ? anchorRect.top - panelHeight - offset : anchorRect.bottom + offset;
            if (a === "start")
                left = anchorRect.left;
            else if (a === "end")
                left = anchorRect.right - panelWidth;
            else
                left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
        }
        else {
            left = s === "left" ? anchorRect.left - panelWidth - offset : anchorRect.right + offset;
            if (a === "start")
                top = anchorRect.top;
            else if (a === "end")
                top = anchorRect.bottom - panelHeight;
            else
                top = anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
        }
        return { top, left };
    };
    if (flip) {
        const candidate = place(side, align);
        const overflows = (side === "top" && candidate.top < 0) ||
            (side === "bottom" && candidate.top + panelHeight > viewportHeight) ||
            (side === "left" && candidate.left < 0) ||
            (side === "right" && candidate.left + panelWidth > viewportWidth);
        if (overflows) {
            const flipped = OPPOSITE[side];
            const flippedPos = place(flipped, align);
            const flippedOverflows = (flipped === "top" && flippedPos.top < 0) ||
                (flipped === "bottom" && flippedPos.top + panelHeight > viewportHeight) ||
                (flipped === "left" && flippedPos.left < 0) ||
                (flipped === "right" && flippedPos.left + panelWidth > viewportWidth);
            if (!flippedOverflows)
                side = flipped;
        }
    }
    let { top, left } = place(side, align);
    if (shift) {
        if (side === "top" || side === "bottom") {
            const max = Math.max(0, viewportWidth - panelWidth);
            left = Math.min(Math.max(0, left), max);
        }
        else {
            const max = Math.max(0, viewportHeight - panelHeight);
            top = Math.min(Math.max(0, top), max);
        }
    }
    return { placement: joinPlacement(side, align), top, left };
}
export class Popper {
    static stComponentName = "Popper";
    componentName = "Popper";
    anchor;
    open;
    placement;
    offset;
    flip;
    shift;
    arrow;
    strategy;
    portal;
    classInput;
    onPlacementChange;
    trapFocus;
    closeOnEscape;
    onClose;
    panel;
    top = 0;
    left = 0;
    flippedPlacement;
    onScroll = () => this.reposition();
    onResize = () => this.reposition();
    onDocKeydown = (e) => {
        if (e.key === "Escape" && this.open && (this.closeOnEscape ?? true)) {
            e.preventDefault();
            this.onClose?.();
        }
    };
    get resolvedPlacement() {
        return this.flippedPlacement ?? this.placement ?? "bottom";
    }
    get panelSide() {
        return splitPlacement(this.resolvedPlacement).side;
    }
    get panelStyle() {
        const strategy = this.strategy ?? "absolute";
        return `position: ${strategy}; top: ${this.top}px; left: ${this.left}px;`;
    }
    get hostClass() {
        return classNames("st-popper", this.classInput);
    }
    ngAfterViewInit() {
        if (typeof window === "undefined")
            return;
        window.addEventListener("scroll", this.onScroll, true);
        window.addEventListener("resize", this.onResize);
        document.addEventListener("keydown", this.onDocKeydown);
        this.reposition();
    }
    ngOnChanges() {
        if (typeof window === "undefined")
            return;
        // Recompute after Angular renders the panel for the new state.
        queueMicrotask(() => this.reposition());
    }
    ngOnDestroy() {
        if (typeof window === "undefined")
            return;
        window.removeEventListener("scroll", this.onScroll, true);
        window.removeEventListener("resize", this.onResize);
        document.removeEventListener("keydown", this.onDocKeydown);
    }
    reposition() {
        if (typeof window === "undefined")
            return;
        const panelEl = this.panel?.nativeElement;
        if (!this.open || !this.anchor || !panelEl)
            return;
        const anchorRect = this.anchor.getBoundingClientRect();
        const panelRect = panelEl.getBoundingClientRect();
        const strategy = this.strategy ?? "absolute";
        const result = computePosition({
            top: anchorRect.top,
            left: anchorRect.left,
            right: anchorRect.right,
            bottom: anchorRect.bottom,
            width: anchorRect.width,
            height: anchorRect.height,
        }, panelRect.width, panelRect.height, {
            placement: this.placement ?? "bottom",
            offset: this.offset ?? 8,
            flip: this.flip ?? true,
            shift: this.shift ?? true,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
        });
        if (strategy === "absolute") {
            this.top = result.top + window.scrollY;
            this.left = result.left + window.scrollX;
        }
        else {
            this.top = result.top;
            this.left = result.left;
        }
        if (result.placement !== this.resolvedPlacement) {
            this.flippedPlacement = result.placement;
            this.onPlacementChange?.(result.placement);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popper, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Popper, isStandalone: true, selector: "st-popper", inputs: { anchor: "anchor", open: "open", placement: "placement", offset: "offset", flip: "flip", shift: "shift", arrow: "arrow", strategy: "strategy", portal: "portal", classInput: ["class", "classInput"], onPlacementChange: "onPlacementChange", trapFocus: "trapFocus", closeOnEscape: "closeOnEscape", onClose: "onClose" }, viewQueries: [{ propertyName: "panel", first: true, predicate: ["panel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    @if (open && anchor) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.data-popper-placement]="resolvedPlacement"
        [style]="panelStyle"
        [attr.tabindex]="trapFocus ? -1 : null"
      >
        <ng-content></ng-content>
        @if (arrow) {
          <span
            class="st-popper__arrow"
            [attr.data-popper-side]="panelSide"
            aria-hidden="true"
          ></span>
        }
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popper, decorators: [{
            type: Component,
            args: [{
                    selector: "st-popper",
                    standalone: true,
                    template: `
    @if (open && anchor) {
      <div
        #panel
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.data-popper-placement]="resolvedPlacement"
        [style]="panelStyle"
        [attr.tabindex]="trapFocus ? -1 : null"
      >
        <ng-content></ng-content>
        @if (arrow) {
          <span
            class="st-popper__arrow"
            [attr.data-popper-side]="panelSide"
            aria-hidden="true"
          ></span>
        }
      </div>
    }
  `,
                }]
        }], propDecorators: { anchor: [{
                type: NgInput
            }], open: [{
                type: NgInput
            }], placement: [{
                type: NgInput
            }], offset: [{
                type: NgInput
            }], flip: [{
                type: NgInput
            }], shift: [{
                type: NgInput
            }], arrow: [{
                type: NgInput
            }], strategy: [{
                type: NgInput
            }], portal: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], onPlacementChange: [{
                type: NgInput
            }], trapFocus: [{
                type: NgInput
            }], closeOnEscape: [{
                type: NgInput
            }], onClose: [{
                type: NgInput
            }], panel: [{
                type: ViewChild,
                args: ["panel"]
            }] } });
//# sourceMappingURL=Popper.js.map