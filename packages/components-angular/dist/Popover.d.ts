import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type PopoverPlacement = "top" | "right" | "bottom" | "left";
export type PopoverOpenOn = "manual" | "hover";
export type PopoverProps = {
    content?: string;
    label?: string;
    triggerLabel?: string;
    open?: boolean;
    placement?: PopoverPlacement;
    openOn?: PopoverOpenOn;
    class?: string;
};
export declare class Popover {
    static readonly stComponentName = "Popover";
    readonly componentName = "Popover";
    content?: string;
    label?: string;
    triggerLabel?: string;
    open?: boolean;
    placement?: PopoverPlacement;
    openOn?: PopoverOpenOn;
    classInput?: string;
    readonly close: EventEmitter<void>;
    localOpen: boolean;
    hovered: boolean;
    get isOpen(): boolean;
    get popoverClass(): string;
    onHover(value: boolean): void;
    onHostClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Popover, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Popover, "st-popover", never, { "content": { "alias": "content"; "required": false; }; "label": { "alias": "label"; "required": false; }; "triggerLabel": { "alias": "triggerLabel"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "openOn": { "alias": "openOn"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "close": "close"; }, never, ["[slot='trigger']", "*"], true, never>;
}
//# sourceMappingURL=Popover.d.ts.map