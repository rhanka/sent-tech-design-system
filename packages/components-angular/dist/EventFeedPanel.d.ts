import * as i0 from "@angular/core";
export type EventFeedPanelSeverity = "info" | "success" | "warning" | "error" | (string & {});
export type EventFeedPanelEvent = {
    at: number;
    type: string;
    severity: EventFeedPanelSeverity;
    message: string;
};
export type EventFeedPanelProps = {
    data: EventFeedPanelEvent[];
    label?: string;
    maxHeight?: number;
    height?: number;
    class?: string;
};
export declare class EventFeedPanel {
    static readonly stComponentName = "EventFeedPanel";
    readonly componentName = "EventFeedPanel";
    data: EventFeedPanelEvent[];
    label?: string;
    maxHeight?: number;
    height?: number;
    classInput?: string;
    private readonly knownSeverities;
    get hostClass(): string;
    get resolvedMaxHeight(): number | undefined;
    get items(): Array<{
        index: number;
        datum: EventFeedPanelEvent;
        tone: string;
        time: string;
    }>;
    private severityTone;
    private formatTime;
    static ɵfac: i0.ɵɵFactoryDeclaration<EventFeedPanel, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EventFeedPanel, "st-event-feed-panel", never, { "data": { "alias": "data"; "required": false; }; "label": { "alias": "label"; "required": false; }; "maxHeight": { "alias": "maxHeight"; "required": false; }; "height": { "alias": "height"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=EventFeedPanel.d.ts.map