import * as i0 from "@angular/core";
export type NotificationTone = "info" | "success" | "warning" | "error";
export type NotificationProps = {
    tone?: NotificationTone;
    title: string;
    message?: string;
    dismissible?: boolean;
    dismissLabel?: string;
    class?: string;
};
export declare class Notification {
    static readonly stComponentName = "Notification";
    readonly componentName = "Notification";
    tone?: NotificationTone;
    title: string;
    message?: string;
    dismissible?: boolean;
    dismissLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Notification, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Notification, "st-notification", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "message": { "alias": "message"; "required": false; }; "dismissible": { "alias": "dismissible"; "required": false; }; "dismissLabel": { "alias": "dismissLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Notification.d.ts.map