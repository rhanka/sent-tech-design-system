import * as i0 from "@angular/core";
export type ColorScaleBarOrientation = "horizontal" | "vertical";
export type ColorScaleBarProps = {
    colors: string[];
    orientation?: ColorScaleBarOrientation;
    length?: number;
    thickness?: number;
    min?: string;
    max?: string;
    label?: string;
    class?: string;
};
export declare class ColorScaleBar {
    static readonly stComponentName = "ColorScaleBar";
    readonly componentName = "ColorScaleBar";
    colors: string[];
    orientation?: ColorScaleBarOrientation;
    length?: number;
    thickness?: number;
    min?: string;
    max?: string;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColorScaleBar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColorScaleBar, "st-color-scale-bar", never, { "colors": { "alias": "colors"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "length": { "alias": "length"; "required": false; }; "thickness": { "alias": "thickness"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ColorScaleBar.d.ts.map