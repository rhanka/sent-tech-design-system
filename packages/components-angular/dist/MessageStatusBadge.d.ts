import type { ChatMessageStatus } from "./ChatMessage.js";
import * as i0 from "@angular/core";
export type MessageStatusBadgeTone = "neutral" | "info" | "success" | "warning" | "error";
export type MessageStatusBadgeProps = {
    status: ChatMessageStatus;
    tone?: MessageStatusBadgeTone;
    labels?: Partial<Record<ChatMessageStatus, unknown>>;
    label?: string;
    class?: string;
};
export declare class MessageStatusBadge {
    static readonly stComponentName = "MessageStatusBadge";
    readonly componentName = "MessageStatusBadge";
    status: ChatMessageStatus;
    tone?: MessageStatusBadgeTone;
    labels?: Partial<Record<ChatMessageStatus, unknown>>;
    label?: string;
    classInput?: string;
    private get normalizedStatus();
    get resolvedTone(): MessageStatusBadgeTone;
    get resolvedLabel(): unknown;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MessageStatusBadge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MessageStatusBadge, "st-message-status-badge", never, { "status": { "alias": "status"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "labels": { "alias": "labels"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=MessageStatusBadge.d.ts.map