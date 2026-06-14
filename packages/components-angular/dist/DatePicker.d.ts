import * as i0 from "@angular/core";
export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerRange = {
    start: Date | null;
    end: Date | null;
};
export type DatePickerValue = Date | DatePickerRange | null;
export type DatePickerProps = {
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    disabled?: boolean;
    mode?: "single" | "range";
    /** `v-model` value (`Date | {start,end} | null`). */
    modelValue?: DatePickerValue;
    min?: Date;
    max?: Date;
    locale?: string;
    placeholder?: string;
    size?: DatePickerSize;
    id?: string;
    openLabel?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
    todayLabel?: string;
    class?: string;
};
export declare class DatePicker {
    static readonly stComponentName = "DatePicker";
    readonly componentName = "DatePicker";
    label?: unknown;
    helperText?: unknown;
    errorText?: unknown;
    invalid?: boolean;
    disabled?: boolean;
    mode?: "single" | "range";
    modelValue?: DatePickerValue;
    min?: Date;
    max?: Date;
    locale?: string;
    placeholder?: string;
    size?: DatePickerSize;
    id?: string;
    openLabel?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
    todayLabel?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatePicker, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DatePicker, "st-date-picker", never, { "label": { "alias": "label"; "required": false; }; "helperText": { "alias": "helperText"; "required": false; }; "errorText": { "alias": "errorText"; "required": false; }; "invalid": { "alias": "invalid"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "mode": { "alias": "mode"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "size": { "alias": "size"; "required": false; }; "id": { "alias": "id"; "required": false; }; "openLabel": { "alias": "openLabel"; "required": false; }; "previousMonthLabel": { "alias": "previousMonthLabel"; "required": false; }; "nextMonthLabel": { "alias": "nextMonthLabel"; "required": false; }; "todayLabel": { "alias": "todayLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DatePicker.d.ts.map