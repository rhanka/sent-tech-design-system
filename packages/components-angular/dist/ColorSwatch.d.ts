import * as i0 from "@angular/core";
export type ColorSwatchShape = "square" | "circle" | "pill";
export type ColorSwatchProps = {
    color: string;
    size?: number;
    shape?: ColorSwatchShape;
    label?: string;
    class?: string;
};
export declare class ColorSwatch {
    static readonly stComponentName = "ColorSwatch";
    readonly componentName = "ColorSwatch";
    color: string;
    size?: number;
    shape?: ColorSwatchShape;
    label?: string;
    classInput?: string;
    get safeSize(): number;
    get accessibleLabel(): string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ColorSwatch, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ColorSwatch, "st-color-swatch", never, { "color": { "alias": "color"; "required": false; }; "size": { "alias": "size"; "required": false; }; "shape": { "alias": "shape"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=ColorSwatch.d.ts.map