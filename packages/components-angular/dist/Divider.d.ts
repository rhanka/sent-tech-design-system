import * as i0 from "@angular/core";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed";
export type DividerProps = {
    orientation?: DividerOrientation;
    /** Spacing scale step (0..12) applied as margin around the divider. */
    spacing?: number;
    /** Optional label centered on a horizontal divider line. */
    label?: string;
    variant?: DividerVariant;
    class?: string;
};
export declare class Divider {
    static readonly stComponentName = "Divider";
    readonly componentName = "Divider";
    orientation?: DividerOrientation;
    spacing?: number;
    label?: string;
    variant: DividerVariant;
    classInput?: string;
    get isLabeled(): boolean;
    get hostClass(): string;
    get spacingStyle(): Record<string, string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Divider, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Divider, "st-divider", never, { "orientation": { "alias": "orientation"; "required": false; }; "spacing": { "alias": "spacing"; "required": false; }; "label": { "alias": "label"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Divider.d.ts.map