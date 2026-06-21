import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type SelectionChipTone = "neutral" | "success" | "warning" | "error" | "info";
export type SelectionChipProps = {
    /** Libellé de la dimension sélectionnée. */
    label: string;
    /** Nombre d'éléments sélectionnés — affiché "(N)" si fourni et Number.isFinite. */
    count?: number;
    tone?: SelectionChipTone;
    /** Callback effacement — affiche le bouton ✕ si fourni. */
    onClear?: () => void;
    disabled?: boolean;
    class?: string;
};
export declare class SelectionChip {
    static readonly stComponentName = "SelectionChip";
    readonly componentName = "SelectionChip";
    label: string;
    count?: number;
    tone?: SelectionChipTone;
    onClear?: () => void;
    disabled?: boolean;
    classInput?: string;
    readonly clear: EventEmitter<void>;
    get showCount(): boolean;
    get hasClear(): boolean;
    get hostClass(): string;
    handleClear(event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectionChip, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SelectionChip, "st-selection-chip", never, { "label": { "alias": "label"; "required": false; }; "count": { "alias": "count"; "required": false; }; "tone": { "alias": "tone"; "required": false; }; "onClear": { "alias": "onClear"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "clear": "clear"; }, never, never, true, never>;
}
//# sourceMappingURL=SelectionChip.d.ts.map