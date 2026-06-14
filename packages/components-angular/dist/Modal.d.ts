import * as i0 from "@angular/core";
export type ModalProps = {
    open?: boolean;
    title?: string;
    description?: string;
    class?: string;
};
export declare class Modal {
    static readonly stComponentName = "Modal";
    readonly componentName = "Modal";
    open?: boolean;
    title?: string;
    description?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Modal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Modal, "st-modal", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Modal.d.ts.map