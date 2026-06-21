import * as i0 from "@angular/core";
export type AlertTone = "info" | "success" | "warning" | "error";
export type AlertProps = {
    tone?: AlertTone;
    title: unknown;
    message?: unknown;
    actions?: unknown;
    class?: string;
};
export declare class Alert {
    static readonly stComponentName = "Alert";
    readonly componentName = "Alert";
    tone?: AlertTone;
    title: unknown;
    message?: unknown;
    actions?: unknown;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Alert, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Alert, "st-alert", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "message": { "alias": "message"; "required": false; }; "actions": { "alias": "actions"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*", "[slot='actions']"], true, never>;
}
//# sourceMappingURL=Alert.d.ts.map