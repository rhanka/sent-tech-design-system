import * as i0 from "@angular/core";
/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];
export type CalendarProps = {
    /** Date sélectionnée ("YYYY-MM-DD") ou tuple [start,end] si `range`. */
    value?: CalendarValue;
    /** Appelé avec la nouvelle date (ou le tuple en mode plage). */
    onChange?: (value: CalendarValue) => void;
    /** Borne minimale "YYYY-MM-DD" (inclusive). */
    min?: string;
    /** Borne maximale "YYYY-MM-DD" (inclusive). */
    max?: string;
    /** Sélection d'une plage de deux dates. */
    range?: boolean;
    /** Premier jour de la semaine : 0 = dimanche, 1 = lundi. */
    weekStartsOn?: 0 | 1;
    locale?: string;
    /** Mois affiché ("YYYY-MM"), contrôlable de l'extérieur. */
    month?: string;
    class?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
};
export declare class Calendar {
    static readonly stComponentName = "Calendar";
    readonly componentName = "Calendar";
    value?: CalendarValue;
    onChange?: (value: CalendarValue) => void;
    min?: string;
    max?: string;
    range?: boolean;
    weekStartsOn?: 0 | 1;
    locale?: string;
    month?: string;
    classInput?: string;
    previousMonthLabel?: string;
    nextMonthLabel?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Calendar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Calendar, "st-calendar", never, { "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "range": { "alias": "range"; "required": false; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "month": { "alias": "month"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "previousMonthLabel": { "alias": "previousMonthLabel"; "required": false; }; "nextMonthLabel": { "alias": "nextMonthLabel"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Calendar.d.ts.map