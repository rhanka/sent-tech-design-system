import * as i0 from "@angular/core";
export type ToastTone = "info" | "success" | "warning" | "error";
export type ToastItem = {
    id: string;
    tone?: ToastTone;
    title: unknown;
    message?: unknown;
    actions?: unknown;
};
export type ToastProps = {
    tone?: ToastTone;
    title?: unknown;
    message?: unknown;
    items?: ToastItem[];
    autoDismiss?: boolean;
    duration?: number;
    class?: string;
};
export declare class Toast {
    static readonly stComponentName = "Toast";
    readonly componentName = "Toast";
    tone?: ToastTone;
    title?: unknown;
    message?: unknown;
    items?: ToastItem[];
    autoDismiss?: boolean;
    duration?: number;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Toast, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Toast, "st-toast", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "message": { "alias": "message"; "required": false; }; "items": { "alias": "items"; "required": false; }; "autoDismiss": { "alias": "autoDismiss"; "required": false; }; "duration": { "alias": "duration"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Toast.d.ts.map