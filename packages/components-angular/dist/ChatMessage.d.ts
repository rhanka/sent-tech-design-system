import * as i0 from "@angular/core";
export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
export type ChatMessageStatus = "pending" | "processing" | "completed" | "failed" | "idle" | "streaming" | "error" | "sent";
export type ChatMessageProps = {
    role?: ChatMessageRole;
    status?: ChatMessageStatus;
    content?: unknown;
    timestamp?: unknown;
    footer?: unknown;
    actions?: unknown;
    avatar?: unknown;
    class?: string;
};
export declare class ChatMessage {
    static readonly stComponentName = "ChatMessage";
    readonly componentName = "ChatMessage";
    role?: ChatMessageRole;
    status?: ChatMessageStatus;
    content?: string;
    timestamp?: unknown;
    footer?: unknown;
    actions?: unknown;
    avatar?: unknown;
    classInput?: string;
    get normalizedStatus(): string | undefined;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ChatMessage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChatMessage, "st-chat-message", never, { "role": { "alias": "role"; "required": false; }; "status": { "alias": "status"; "required": false; }; "content": { "alias": "content"; "required": false; }; "timestamp": { "alias": "timestamp"; "required": false; }; "footer": { "alias": "footer"; "required": false; }; "actions": { "alias": "actions"; "required": false; }; "avatar": { "alias": "avatar"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ChatMessage.d.ts.map