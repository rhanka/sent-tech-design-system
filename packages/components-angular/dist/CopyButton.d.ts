import * as i0 from "@angular/core";
export type CopyButtonSize = "sm" | "md" | "lg";
export type CopyButtonProps = {
    text?: string;
    value?: string;
    label?: string;
    copiedLabel?: string;
    size?: CopyButtonSize;
    class?: string;
};
export declare class CopyButton {
    static readonly stComponentName = "CopyButton";
    readonly componentName = "CopyButton";
    text?: string;
    value?: string;
    label?: string;
    copiedLabel?: string;
    size?: CopyButtonSize;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CopyButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CopyButton, "st-copy-button", never, { "text": { "alias": "text"; "required": false; }; "value": { "alias": "value"; "required": false; }; "label": { "alias": "label"; "required": false; }; "copiedLabel": { "alias": "copiedLabel"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=CopyButton.d.ts.map