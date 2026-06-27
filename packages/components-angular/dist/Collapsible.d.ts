import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type CollapsibleSize = "sm" | "md" | "lg";
export type CollapsibleProps = {
    /** État ouvert (contrôlable). */
    open?: boolean;
    title: string;
    size?: CollapsibleSize;
    disabled?: boolean;
    onToggle?: (open: boolean) => void;
    class?: string;
};
export declare class Collapsible {
    static readonly stComponentName = "Collapsible";
    readonly componentName = "Collapsible";
    readonly uid: string;
    private localOpen;
    open?: boolean;
    title: string;
    size?: CollapsibleSize;
    disabled?: boolean;
    onToggle?: (open: boolean) => void;
    classInput?: string;
    readonly toggleChange: EventEmitter<boolean>;
    ngOnInit(): void;
    get currentOpen(): boolean;
    get hostClass(): string;
    toggle(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Collapsible, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Collapsible, "st-collapsible", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "size": { "alias": "size"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "onToggle": { "alias": "onToggle"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "toggleChange": "toggleChange"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Collapsible.d.ts.map