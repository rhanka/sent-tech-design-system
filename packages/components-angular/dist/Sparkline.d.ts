import * as i0 from "@angular/core";
export type SparklineTone = "neutral" | "success" | "warning" | "error";
export type SparklineProps = {
    data: number[];
    width?: number;
    height?: number;
    tone?: SparklineTone;
    strokeWidth?: number;
    area?: boolean;
    label?: string;
    class?: string;
};
export declare class Sparkline {
    static readonly stComponentName = "Sparkline";
    readonly componentName = "Sparkline";
    data: number[];
    width?: number;
    height?: number;
    tone?: SparklineTone;
    strokeWidth?: number;
    area?: boolean;
    label?: string;
    classInput?: string;
    get toneValue(): SparklineTone;
    get widthValue(): number;
    get heightValue(): number;
    get strokeWidthValue(): number;
    get areaValue(): boolean;
    get viewBox(): string;
    get hostClass(): string;
    get geometry(): {
        line: string;
        area: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<Sparkline, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Sparkline, "st-sparkline", never, { "data": { "alias": "data"; "required": false; }; "width": { "alias": "width"; "required": false; }; "height": { "alias": "height"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; }; "area": { "alias": "area"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=Sparkline.d.ts.map