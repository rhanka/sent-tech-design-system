import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";
import * as i0 from "@angular/core";
export type ChatThreadProps = {
    messages?: Array<{
        id: string;
        role?: ChatMessageRole;
        content: unknown;
        status?: ChatMessageStatus;
    }>;
    emptyLabel?: unknown;
    class?: string;
};
export declare class ChatThread {
    static readonly stComponentName = "ChatThread";
    readonly componentName = "ChatThread";
    messages?: Array<{
        id: string;
        role?: ChatMessageRole;
        content: unknown;
        status?: ChatMessageStatus;
    }>;
    emptyLabel?: unknown;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ChatThread, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChatThread, "st-chat-thread", never, { "messages": { "alias": "messages"; "required": false; }; "emptyLabel": { "alias": "emptyLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ChatThread.d.ts.map