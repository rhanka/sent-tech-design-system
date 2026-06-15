import * as i0 from "@angular/core";
export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";
export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineItem = {
    title: string;
    meta?: string;
    description?: string;
    tone?: TimelineTone;
};
export type TimelineProps = {
    items: TimelineItem[];
    orientation?: TimelineOrientation;
    class?: string;
};
export declare class Timeline {
    static readonly stComponentName = "Timeline";
    readonly componentName = "Timeline";
    items: TimelineItem[];
    orientation?: TimelineOrientation;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Timeline, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Timeline, "st-timeline", never, { "items": { "alias": "items"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Timeline.d.ts.map