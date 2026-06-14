import * as i0 from "@angular/core";
export type BadgeTone = "neutral" | "success" | "warning" | "error" | "info";
export type BadgeProps = {
    tone?: BadgeTone;
    class?: string;
};
export declare class Badge {
    static readonly stComponentName = "Badge";
    readonly componentName = "Badge";
    tone?: BadgeTone;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Badge, "st-badge", never, { "tone": { "alias": "tone"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Badge.d.ts.map