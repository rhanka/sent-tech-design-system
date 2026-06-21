import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type TagTone = "neutral" | "info" | "success" | "warning" | "error";
export type TagSize = "sm" | "md";
export type TagProps = {
    tone?: TagTone;
    size?: TagSize;
    disabled?: boolean;
    dismissible?: boolean;
    dismissLabel?: string;
    /** Svelte/React-canonical callback; fires alongside the `dismiss` emit. */
    onDismiss?: (event: MouseEvent) => void;
    class?: string;
};
export declare class Tag {
    static readonly stComponentName = "Tag";
    readonly componentName = "Tag";
    tone?: TagTone;
    size?: TagSize;
    disabled?: boolean;
    dismissible?: boolean;
    dismissLabel?: string;
    onDismiss?: (event: MouseEvent) => void;
    classInput?: string;
    readonly dismiss: EventEmitter<MouseEvent>;
    get hostClass(): string;
    handleDismiss(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Tag, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Tag, "st-tag", never, { "tone": { "alias": "tone"; "required": false; }; "size": { "alias": "size"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "dismissible": { "alias": "dismissible"; "required": false; }; "dismissLabel": { "alias": "dismissLabel"; "required": false; }; "onDismiss": { "alias": "onDismiss"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "dismiss": "dismiss"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Tag.d.ts.map