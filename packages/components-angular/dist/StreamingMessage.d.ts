import type { ChatMessageStatus } from "./ChatMessage.js";
import * as i0 from "@angular/core";
export type StreamingMessageEvent = {
    id: string;
    label: unknown;
    text?: unknown;
    status?: ChatMessageStatus;
};
export type StreamingMessageMode = "live" | "passive";
export type StreamingMessageProps = {
    text?: unknown;
    events?: StreamingMessageEvent[];
    mode?: StreamingMessageMode;
    class?: string;
};
export declare class StreamingMessage {
    static readonly stComponentName = "StreamingMessage";
    readonly componentName = "StreamingMessage";
    text?: unknown;
    events?: StreamingMessageEvent[];
    mode?: StreamingMessageMode;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StreamingMessage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StreamingMessage, "st-streaming-message", never, { "text": { "alias": "text"; "required": false; }; "events": { "alias": "events"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StreamingMessage.d.ts.map