import { ElementRef, EventEmitter, type OnChanges, type OnInit } from "@angular/core";
import * as i0 from "@angular/core";
/**
 * En mode simple : `string | null` ("YYYY-MM-DD").
 * En mode plage (`range`) : tuple `[start, end]` où chaque borne est
 * "YYYY-MM-DD" ou null.
 */
export type CalendarValue = string | null | [string | null, string | null];
interface CalendarCell {
    date: Date;
    inMonth: boolean;
}
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
export declare class Calendar implements OnInit, OnChanges {
    static readonly stComponentName = "Calendar";
    readonly componentName = "Calendar";
    value: CalendarValue;
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
    readonly valueChange: EventEmitter<CalendarValue>;
    gridEl?: ElementRef<HTMLElement>;
    private viewYear;
    private viewMonth;
    private focusDate;
    private readonly today;
    ngOnInit(): void;
    ngOnChanges(): void;
    private startOfDay;
    toISO(date: Date): string;
    private parseISO;
    private isSameDay;
    private get resolvedLocale();
    private get resolvedWeekStartsOn();
    private get isFr();
    get resolvedPrevLabel(): string;
    get resolvedNextLabel(): string;
    private get monthFormatter();
    private get weekdayFormatter();
    private get cellFormatter();
    private get singleDate();
    private get rangeStartDate();
    private get rangeEndDate();
    private get minDate();
    private get maxDate();
    private pickInitialMonth;
    private initialFocusDate;
    private clampToMonth;
    get weekdayLabels(): string[];
    private get cells();
    get weeks(): CalendarCell[][];
    get monthLabel(): string;
    get hostClass(): string;
    isOutOfBounds(date: Date): boolean;
    isSelected(date: Date): boolean;
    isInRange(date: Date): boolean;
    isToday(date: Date): boolean;
    private isActive;
    dayClass(cell: CalendarCell): string;
    dayLabel(cell: CalendarCell): string;
    dayTabIndex(cell: CalendarCell): number;
    previousMonth(): void;
    nextMonth(): void;
    private pickDate;
    onDayClick(cell: CalendarCell): void;
    private focusActiveCell;
    private moveFocus;
    onKeyDown(event: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Calendar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Calendar, "st-calendar", never, { "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "range": { "alias": "range"; "required": false; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "month": { "alias": "month"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "previousMonthLabel": { "alias": "previousMonthLabel"; "required": false; }; "nextMonthLabel": { "alias": "nextMonthLabel"; "required": false; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=Calendar.d.ts.map