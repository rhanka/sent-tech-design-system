import { type CellDecoration } from "./cellDecoration.js";
import * as i0 from "@angular/core";
export type KpiCardSize = "sm" | "md" | "lg";
export type KpiCardTrend = "up" | "down" | "flat";
export type KpiCardFormat = "number" | "currency" | "percent";
export type KpiCardDeltaFormat = "percent" | "absolute";
export type KpiCardTone = "category1" | "category2" | "category3" | "category4" | "category5" | "category6" | "category7" | "category8";
export type KpiCardProps = {
    /**
     * Valeur principale. Si `format="percent"`, `value` est une FRACTION (0–1) :
     * passer `0.42` affiche « 42 % » (Intl multiplie par 100). Le formatage ne
     * s'applique qu'aux `number` ; une `string` est rendue telle quelle.
     */
    value: number | string;
    label: string;
    /**
     * Variation. En `deltaFormat="percent"` (défaut), `delta` est une FRACTION :
     * `0.12` → « +12 % ». NaN/Infinity sont rendus inertes.
     */
    delta?: number;
    deltaFormat?: KpiCardDeltaFormat;
    trend?: KpiCardTrend;
    format?: KpiCardFormat;
    unit?: string;
    currency?: string;
    locale?: string;
    sparkline?: number[];
    size?: KpiCardSize;
    tone?: KpiCardTone;
    /**
     * Conditional formatting : décoration sémantique de la carte (intent → token
     * feedback en fond teinté accessible + icône lucide optionnelle).
     */
    decoration?: CellDecoration;
    class?: string;
};
export declare class KpiCard {
    static readonly stComponentName = "KpiCard";
    readonly componentName = "KpiCard";
    value: number | string;
    label: string;
    delta?: number;
    deltaFormat?: KpiCardDeltaFormat;
    trend?: KpiCardTrend;
    format?: KpiCardFormat;
    unit?: string;
    currency?: string;
    locale?: string;
    sparkline?: number[];
    size?: KpiCardSize;
    tone?: KpiCardTone;
    decoration?: CellDecoration;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<KpiCard, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KpiCard, "st-kpi-card", never, { "value": { "alias": "value"; "required": false; }; "label": { "alias": "label"; "required": false; }; "delta": { "alias": "delta"; "required": false; }; "deltaFormat": { "alias": "deltaFormat"; "required": false; }; "trend": { "alias": "trend"; "required": false; }; "format": { "alias": "format"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "currency": { "alias": "currency"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; "sparkline": { "alias": "sparkline"; "required": false; }; "size": { "alias": "size"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "decoration": { "alias": "decoration"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=KpiCard.d.ts.map