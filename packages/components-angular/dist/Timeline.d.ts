import * as i0 from "@angular/core";
export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";
export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineItem = {
    /** Titre de l'événement. */
    title: string;
    /** Métadonnée optionnelle (date, heure, libellé court). */
    meta?: string;
    /** Description optionnelle de l'événement. */
    description?: string;
    /** Ton de la pastille (mappé sur les tokens de statut DS, défaut "neutral"). */
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
    get safeItems(): TimelineItem[];
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Timeline, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Timeline, "st-timeline", never, { "items": { "alias": "items"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Timeline.d.ts.map