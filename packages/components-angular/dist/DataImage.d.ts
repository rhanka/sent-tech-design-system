import * as i0 from "@angular/core";
export type DataImageFit = "cover" | "contain";
export type DataImageProps = {
    /** Image URL (required). */
    src: string;
    /** Alternative text (required for a11y; pass "" only for purely decorative images). */
    alt: string;
    /** Intrinsic / box width (number → px, or any CSS length). */
    width?: number | string;
    /** Intrinsic / box height (number → px, or any CSS length). */
    height?: number | string;
    /** `object-fit` behaviour inside its box. Default `cover`. */
    fit?: DataImageFit;
    /** Border radius (CSS length). */
    radius?: number | string;
    /** Image loading strategy. Default `lazy`; use `eager` for LCP images. */
    loading?: "eager" | "lazy";
    /** Image decoding hint. Default `async`. */
    decoding?: "async" | "sync" | "auto";
    class?: string;
};
export declare class DataImage {
    static readonly stComponentName = "DataImage";
    readonly componentName = "DataImage";
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    fit?: DataImageFit;
    radius?: number | string;
    loading?: "eager" | "lazy";
    decoding?: "async" | "sync" | "auto";
    classInput?: string;
    private len;
    get widthStyle(): string | null;
    get heightStyle(): string | null;
    get radiusStyle(): string | null;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataImage, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataImage, "st-data-image", never, { "src": { "alias": "src"; "required": false; }; "alt": { "alias": "alt"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "fit": { "alias": "fit"; "required": false; }; "radius": { "alias": "radius"; "required": false; }; "loading": { "alias": "loading"; "required": false; }; "decoding": { "alias": "decoding"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=DataImage.d.ts.map