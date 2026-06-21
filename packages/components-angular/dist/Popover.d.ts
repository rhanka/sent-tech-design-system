import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type PopoverPlacement = "top" | "right" | "bottom" | "left";
export type PopoverProps = {
    content?: string;
    label?: string;
    open?: boolean;
    placement?: PopoverPlacement;
    class?: string;
};
export declare class Popover {
    static readonly stComponentName = "Popover";
    readonly componentName = "Popover";
    content?: string;
    label?: string;
    open?: boolean;
    placement?: PopoverPlacement;
    classInput?: string;
    readonly close: EventEmitter<void>;
    localOpen: boolean;
    get isOpen(): boolean;
    get hostClass(): string;
    get popoverClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Popover, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Popover, "st-popover", never, { "content": { "alias": "content"; "required": false; }; "label": { "alias": "label"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "close": "close"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Popover.d.ts.map