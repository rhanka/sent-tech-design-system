import * as i0 from "@angular/core";
export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";
export type BadgeShape = "pill" | "circle";
export type BadgeSize = "sm" | "md";
export type BadgeProps = {
    tone?: BadgeTone;
    shape?: BadgeShape;
    size?: BadgeSize;
    /** Texte affiché dans le badge. Si absent, utilise ng-content. */
    label?: unknown;
    class?: string;
};
export declare class Badge {
    static readonly stComponentName = "Badge";
    readonly componentName = "Badge";
    tone?: BadgeTone;
    shape?: BadgeShape;
    size?: BadgeSize;
    label?: unknown;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Badge, "st-badge", never, { "tone": { "alias": "tone"; "required": false; }; "shape": { "alias": "shape"; "required": false; }; "size": { "alias": "size"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Badge.d.ts.map