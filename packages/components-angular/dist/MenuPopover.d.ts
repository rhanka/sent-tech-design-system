import { ElementRef, EventEmitter } from "@angular/core";
import type { AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import type { MenuItem } from "./Menu.js";
import * as i0 from "@angular/core";
export type MenuPopoverPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";
export type MenuPopoverAlign = "start" | "end" | "center";
export type MenuPopoverRect = {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
};
export type MenuPopoverViewport = {
    height: number;
    scrollX: number;
    scrollY: number;
};
export type MenuPopoverPosition = {
    top: number;
    left: number;
    maxHeight: number;
    alignEnd: boolean;
    alignCenter: boolean;
};
/**
 * Pure position solver — mirrors Svelte's `computePosition()` / React's
 * `computePosition` callback so it can be unit-tested without a real
 * `window`/DOM (this package's tests run in a Node environment, no jsdom).
 */
export declare function computeMenuPopoverPosition(rect: MenuPopoverRect, placement: MenuPopoverPlacement, align: MenuPopoverAlign | undefined, viewport: MenuPopoverViewport): MenuPopoverPosition;
export declare function menuPopoverIsWithin(event: {
    composedPath?: () => EventTarget[];
    target: EventTarget | null;
}, node: Element | null | undefined): boolean;
export type MenuPopoverProps = {
    items?: MenuItem[];
    open?: boolean;
    trigger?: HTMLElement | null;
    placement?: MenuPopoverPlacement;
    align?: MenuPopoverAlign;
    label?: string;
    class?: string;
    closeOnOutside?: boolean;
    closeOnEscape?: boolean;
};
export declare class MenuPopover implements AfterViewInit, OnChanges, OnDestroy {
    static readonly stComponentName = "MenuPopover";
    readonly componentName = "MenuPopover";
    /** Convenience (not in the Svelte contract): renders a <st-menu> from `items` instead of projected content. */
    items?: MenuItem[];
    open: boolean;
    /** Anchor element used for position computation and outside-click exclusion (Svelte-canonical). */
    trigger: HTMLElement | null;
    placement: MenuPopoverPlacement;
    align?: MenuPopoverAlign;
    /** Accessible name for the panel (Svelte-canonical: applied as aria-label on role="dialog"). */
    label: string;
    classInput?: string;
    closeOnOutside: boolean;
    closeOnEscape: boolean;
    readonly openChange: EventEmitter<boolean>;
    panel?: ElementRef<HTMLDivElement>;
    top: number;
    left: number;
    maxHeight: number;
    alignEnd: boolean;
    alignCenter: boolean;
    private listenersActive;
    private readonly onScroll;
    private readonly onResize;
    private readonly onPointerDown;
    private readonly onKeyDown;
    get hostClass(): string;
    get panelStyle(): string;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    computePosition(): void;
    close(): void;
    private registerWindowListeners;
    private unregisterWindowListeners;
    static ɵfac: i0.ɵɵFactoryDeclaration<MenuPopover, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MenuPopover, "st-menu-popover", never, { "items": { "alias": "items"; "required": false; }; "open": { "alias": "open"; "required": false; }; "trigger": { "alias": "trigger"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "align": { "alias": "align"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "closeOnOutside": { "alias": "closeOnOutside"; "required": false; }; "closeOnEscape": { "alias": "closeOnEscape"; "required": false; }; }, { "openChange": "openChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=MenuPopover.d.ts.map