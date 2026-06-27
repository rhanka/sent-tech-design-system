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
    placeholder?: unknown;
    streaming?: boolean;
    content?: string;
    class?: string;
};
export declare class StreamingMessage {
    static readonly stComponentName = "StreamingMessage";
    readonly componentName = "StreamingMessage";
    streaming: boolean;
    content?: string;
    text?: unknown;
    events?: StreamingMessageEvent[];
    mode: StreamingMessageMode;
    placeholder: unknown;
    classInput?: string;
    get hostClass(): string;
    get resolvedText(): unknown;
    get isEmpty(): boolean;
    get textClass(): string;
    get displayText(): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<StreamingMessage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StreamingMessage, "st-streaming-message", never, { "streaming": { "alias": "streaming"; "required": false; }; "content": { "alias": "content"; "required": false; }; "text": { "alias": "text"; "required": false; }; "events": { "alias": "events"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=StreamingMessage.d.ts.map