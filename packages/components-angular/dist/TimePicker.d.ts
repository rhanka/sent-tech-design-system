import * as i0 from "@angular/core";
export type TimePickerFormat = "24" | "12";
export type TimePickerSize = "sm" | "md" | "lg";
export type TimePickerProps = {
    /** Heure courante au format "HH:mm" (24h, toujours). Vide = non renseigné. */
    value?: string;
    /** Appelé avec "HH:mm" lors d'une sélection. */
    onChange?: (value: string) => void;
    /** Pas (en minutes) entre deux créneaux générés. */
    step?: number;
    /** Borne minimale "HH:mm" (inclusive). */
    min?: string;
    /** Borne maximale "HH:mm" (inclusive). */
    max?: string;
    /** Affichage 24h (par défaut) ou 12h (AM/PM). La valeur émise reste "HH:mm". */
    format?: TimePickerFormat;
    size?: TimePickerSize;
    disabled?: boolean;
    label?: string;
    class?: string;
    id?: string;
};
export declare class TimePicker {
    static readonly stComponentName = "TimePicker";
    readonly componentName = "TimePicker";
    value?: string;
    onChange?: (value: string) => void;
    step?: number;
    min?: string;
    max?: string;
    format?: TimePickerFormat;
    size?: TimePickerSize;
    disabled?: boolean;
    label?: string;
    classInput?: string;
    id?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TimePicker, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TimePicker, "st-time-picker", never, { "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "step": { "alias": "step"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "format": { "alias": "format"; "required": false; }; "size": { "alias": "size"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "id": { "alias": "id"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TimePicker.d.ts.map