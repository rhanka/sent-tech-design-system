import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type FilterPillTone = "neutral" | "success" | "warning" | "error" | "info";
export type FilterPillProps = {
    /** Nom du champ/dimension affiché à gauche. */
    field: string;
    /** Résumé de la valeur sélectionnée, ex "France, Italie" ou "> 100". */
    value: string;
    /** Opérateur optionnel affiché entre field et value, ex "=", "in", "entre". */
    operator?: string;
    /** Pilule active (aria-pressed). Défaut true. */
    active?: boolean;
    /** Affiche le bouton ✕. Défaut true. */
    removable?: boolean;
    disabled?: boolean;
    tone?: FilterPillTone;
    onClick?: () => void;
    onRemove?: () => void;
    class?: string;
};
export declare class FilterPill {
    static readonly stComponentName = "FilterPill";
    readonly componentName = "FilterPill";
    field: string;
    value: string;
    operator?: string;
    active?: boolean;
    removable?: boolean;
    disabled?: boolean;
    tone?: FilterPillTone;
    onClick?: () => void;
    onRemove?: () => void;
    classInput?: string;
    readonly remove: EventEmitter<void>;
    get hasClick(): boolean;
    get hostClass(): string;
    handleClick(): void;
    handleRemove(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterPill, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FilterPill, "st-filter-pill", never, { "field": { "alias": "field"; "required": false; }; "value": { "alias": "value"; "required": false; }; "operator": { "alias": "operator"; "required": false; }; "active": { "alias": "active"; "required": false; }; "removable": { "alias": "removable"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "onClick": { "alias": "onClick"; "required": false; }; "onRemove": { "alias": "onRemove"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "remove": "remove"; }, never, never, true, never>;
}
//# sourceMappingURL=FilterPill.d.ts.map