import { ElementRef } from "@angular/core";
import type { AfterViewInit, OnChanges, OnDestroy } from "@angular/core";
import * as i0 from "@angular/core";
export type PopperStrategy = "absolute" | "fixed";
export type PopperPlacement = "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end" | "right-start" | "right-end";
export type PopperSide = "top" | "bottom" | "left" | "right";
export type PopperAlign = "start" | "center" | "end";
export type PopperProps = {
    /** Reference element the panel is positioned against. */
    anchor: HTMLElement | null;
    /** Controlled open state. When false (or no anchor) nothing renders. */
    open?: boolean;
    /** Wanted placement of the panel relative to the anchor. */
    placement?: PopperPlacement;
    /** Main-axis distance (px) between the anchor and the panel. */
    offset?: number;
    /** Flip to the opposite side when the panel would overflow the viewport. */
    flip?: boolean;
    /** Shift along the cross axis to keep the panel within the viewport. */
    shift?: boolean;
    /** Expose a positioned arrow element. */
    arrow?: boolean;
    /** CSS positioning strategy. */
    strategy?: PopperStrategy;
    /** Render the panel into `document.body` via a Teleport. */
    portal?: boolean;
    /** Optional class applied to the floating panel. */
    class?: string;
    /** Notified whenever the resolved placement changes (after flip). */
    onPlacementChange?: (placement: PopperPlacement) => void;
    /**
     * (a11y, opt-in) When true, traps keyboard focus inside the panel while it
     * is open (Tab cycles through focusable children; Shift+Tab cycles backward).
     * Intended for modal overlays built on top of Popper. Non-modal usage (menus,
     * tooltips) should leave this false (default) to keep the natural tab order.
     */
    trapFocus?: boolean;
    /**
     * (a11y) When true (default when open), pressing Escape calls `onClose` so
     * the consumer can set `open = false`. Set to false to suppress this behavior.
     */
    closeOnEscape?: boolean;
    /**
     * Called when the panel requests closing (Escape key, or future outside-click).
     * The consumer is responsible for updating `open` in response.
     */
    onClose?: () => void;
};
export type Rect = {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
};
export declare function splitPlacement(placement: PopperPlacement): {
    side: PopperSide;
    align: PopperAlign;
};
export declare function joinPlacement(side: PopperSide, align: PopperAlign): PopperPlacement;
export declare function computePosition(anchorRect: Rect, panelWidth: number, panelHeight: number, options: {
    placement: PopperPlacement;
    offset: number;
    flip: boolean;
    shift: boolean;
    viewportWidth: number;
    viewportHeight: number;
}): {
    placement: PopperPlacement;
    top: number;
    left: number;
};
export declare class Popper implements AfterViewInit, OnChanges, OnDestroy {
    static readonly stComponentName = "Popper";
    readonly componentName = "Popper";
    anchor: HTMLElement | null;
    open?: boolean;
    placement?: PopperPlacement;
    offset?: number;
    flip?: boolean;
    shift?: boolean;
    arrow?: boolean;
    strategy?: PopperStrategy;
    portal?: boolean;
    classInput?: string;
    onPlacementChange?: (placement: PopperPlacement) => void;
    trapFocus?: boolean;
    closeOnEscape?: boolean;
    onClose?: () => void;
    panel?: ElementRef<HTMLDivElement>;
    top: number;
    left: number;
    private flippedPlacement?;
    private onScroll;
    private onResize;
    private onDocKeydown;
    get resolvedPlacement(): PopperPlacement;
    get panelSide(): PopperSide;
    get panelStyle(): string;
    get hostClass(): string;
    ngAfterViewInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    private reposition;
    static ɵfac: i0.ɵɵFactoryDeclaration<Popper, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Popper, "st-popper", never, { "anchor": { "alias": "anchor"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "offset": { "alias": "offset"; "required": false; }; "flip": { "alias": "flip"; "required": false; }; "shift": { "alias": "shift"; "required": false; }; "arrow": { "alias": "arrow"; "required": false; }; "strategy": { "alias": "strategy"; "required": false; }; "portal": { "alias": "portal"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "onPlacementChange": { "alias": "onPlacementChange"; "required": false; }; "trapFocus": { "alias": "trapFocus"; "required": false; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; }; "onClose": { "alias": "onClose"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Popper.d.ts.map