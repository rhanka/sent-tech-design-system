import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type NotificationTone = "info" | "success" | "warning" | "error";
export type NotificationProps = {
    tone?: NotificationTone;
    title: string;
    message?: string;
    dismissible?: boolean;
    dismissLabel?: string;
    locale?: string;
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
    locale?: string;
    classInput?: string;
    get resolvedDismissLabel(): string;
    readonly dismiss: EventEmitter<void>;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Notification, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Notification, "st-notification", never, { "tone": { "alias": "tone"; "required": false; }; "title": { "alias": "title"; "required": false; }; "message": { "alias": "message"; "required": false; }; "dismissible": { "alias": "dismissible"; "required": false; }; "dismissLabel": { "alias": "dismissLabel"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "dismiss": "dismiss"; }, never, ["*", "[slot='actions']"], true, never>;
}
//# sourceMappingURL=Notification.d.ts.map