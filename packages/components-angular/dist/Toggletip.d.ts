import { EventEmitter } from "@angular/core";
import type { OnChanges, SimpleChanges } from "@angular/core";
import * as i0 from "@angular/core";
export type ToggletipPlacement = "top" | "bottom" | "start" | "end";
export type ToggletipProps = {
    content: unknown;
    label?: string;
    open?: boolean;
    placement?: ToggletipPlacement;
    triggerLabel?: string;
    class?: string;
};
export declare class Toggletip implements OnChanges {
    static readonly stComponentName = "Toggletip";
    readonly componentName = "Toggletip";
    content: unknown;
    label?: string;
    open?: boolean;
    placement?: ToggletipPlacement;
    triggerLabel?: string;
    classInput?: string;
    readonly openChange: EventEmitter<boolean>;
    isOpen: boolean;
    ngOnChanges(changes: SimpleChanges): void;
    get hostClass(): string;
    toggle(): void;
    close(): void;
    onKeydown(event: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toggletip, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toggletip, "st-toggletip", never, { "content": { "alias": "content"; "required": false; }; "label": { "alias": "label"; "required": false; }; "open": { "alias": "open"; "required": false; }; "placement": { "alias": "placement"; "required": false; }; "triggerLabel": { "alias": "triggerLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "openChange": "openChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Toggletip.d.ts.map