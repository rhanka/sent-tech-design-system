import * as i0 from "@angular/core";
export type ToastTone = "info" | "success" | "warning" | "error";
export type ToastProps = {
    tone?: ToastTone;
    title: unknown;
    message?: unknown;
    actions?: unknown;
    class?: string;
};
export declare class Toast {
    static readonly stComponentName = "Toast";
    readonly componentName = "Toast";
    tone?: ToastTone;
    title: unknown;
    message?: unknown;
    actions?: unknown;
    classInput?: string;
    get role(): "alert" | "status";
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toast, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toast, "st-toast", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "message": { "alias": "message"; "required": false; }; "actions": { "alias": "actions"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["[slot='actions']"], true, never>;
}
//# sourceMappingURL=Toast.d.ts.map