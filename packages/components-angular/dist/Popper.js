import { Component, Input as NgInput } from "@angular/core";
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
    get hostClass() {
        return ["st-popper", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popper, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Popper, isStandalone: true, selector: "st-popper", inputs: { anchor: "anchor", open: "open", placement: "placement", offset: "offset", flip: "flip", shift: "shift", arrow: "arrow", strategy: "strategy", portal: "portal", classInput: ["class", "classInput"], onPlacementChange: "onPlacementChange", trapFocus: "trapFocus", closeOnEscape: "closeOnEscape", onClose: "onClose" }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Popper, decorators: [{
            type: Component,
            args: [{
                    selector: "st-popper",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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
            }] } });
//# sourceMappingURL=Popper.js.map