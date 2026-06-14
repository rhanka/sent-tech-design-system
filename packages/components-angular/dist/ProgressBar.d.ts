import * as i0 from "@angular/core";
export type ProgressBarTone = "neutral" | "info" | "success" | "warning" | "error";
export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarProps = {
    label?: unknown;
    helperText?: string;
    value?: number;
    max?: number;
    tone?: ProgressBarTone;
    size?: ProgressBarSize;
    indeterminate?: boolean;
    showValue?: boolean;
    valueText?: string;
    class?: string;
};
export declare class ProgressBar {
    static readonly stComponentName = "ProgressBar";
    readonly componentName = "ProgressBar";
    label?: unknown;
    helperText?: string;
    value?: number;
    max?: number;
    tone?: ProgressBarTone;
    size?: ProgressBarSize;
    indeterminate?: boolean;
    showValue?: boolean;
    valueText?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<ProgressBar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ProgressBar, "st-progress-bar", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "value": { "alias": "value"; "required": false; }; "max": { "alias": "max"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "size": { "alias": "size"; "required": false; }; "indeterminate": { "alias": "indeterminate"; "required": false; }; "showValue": { "alias": "showValue"; "required": false; }; "valueText": { "alias": "valueText"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ProgressBar.d.ts.map