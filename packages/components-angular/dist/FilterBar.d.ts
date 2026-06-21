import * as i0 from "@angular/core";
export type FilterBarProps = {
    /** Aria-label du groupe de filtres, ex "Filtres actifs". */
    label: string;
    /** Callback "tout effacer" — le bouton n'est rendu que si ce callback est fourni. */
    onClearAll?: () => void;
    /** Libellé du bouton "tout effacer". Défaut "Tout effacer". */
    clearAllLabel?: string;
    class?: string;
};
export declare class FilterBar {
    static readonly stComponentName = "FilterBar";
    readonly componentName = "FilterBar";
    label: string;
    onClearAll?: () => void;
    clearAllLabel?: string;
    classInput?: string;
    get hasClearAll(): boolean;
    get hostClass(): string;
    triggerClearAll(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterBar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FilterBar, "st-filter-bar", never, { "label": { "alias": "label"; "required": false; }; "onClearAll": { "alias": "onClearAll"; "required": false; }; "clearAllLabel": { "alias": "clearAllLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=FilterBar.d.ts.map