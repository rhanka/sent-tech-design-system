import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type ModalSize = "sm" | "md" | "lg" | "xl";
export type ModalProps = {
    open?: boolean;
    title?: string;
    description?: string;
    size?: ModalSize;
    class?: string;
    closeLabel?: string;
    dismissible?: boolean;
    zIndex?: number;
};
export declare class Modal {
    static readonly stComponentName = "Modal";
    readonly componentName = "Modal";
    open?: boolean;
    title?: string;
    description?: string;
    size?: ModalSize;
    closeLabel?: string;
    dismissible?: boolean;
    zIndex?: number;
    classInput?: string;
    readonly close: EventEmitter<void>;
    get hostClass(): string;
    onBackdropClick(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Modal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Modal, "st-modal", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "size": { "alias": "size"; "required": false; }; "closeLabel": { "alias": "closeLabel"; "required": false; }; "dismissible": { "alias": "dismissible"; "required": false; }; "zIndex": { "alias": "zIndex"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "close": "close"; }, never, ["*", "[slot='footer']"], true, never>;
}
//# sourceMappingURL=Modal.d.ts.map