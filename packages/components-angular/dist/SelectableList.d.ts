import * as i0 from "@angular/core";
export type SelectableListProps = {
    /** Accessible name for the listbox (required for SR users). */
    label?: string;
    /** References the id of an external visible label (alternative to `label`). */
    labelledby?: string;
    /**
     * Allow more than one selected row. Adds aria-multiselectable and toggles
     * each row independently. Defaults to false (single-select).
     */
    multiple?: boolean;
    /**
     * Selected value(s). Controlled when provided. For single-select pass a
     * string (or null); for multiple pass a string[]. When omitted the list is
     * uncontrolled and keeps its own internal selection.
     */
    value?: string | string[] | null;
    /**
     * Fired with the new selection on every change. Receives a string|null for
     * single-select and a string[] for multiple. Required for the controlled
     * pattern; also fires for uncontrolled lists.
     */
    onChange?: (value: string | string[] | null) => void;
    class?: string;
};
export declare class SelectableList {
    static readonly stComponentName = "SelectableList";
    readonly componentName = "SelectableList";
    label?: string;
    labelledby?: string;
    multiple?: boolean;
    value?: string | string[] | null;
    onChange?: (value: string | string[] | null) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectableList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SelectableList, "st-selectable-list", never, { "label": { "alias": "label"; "required": false; }; "labelledby": { "alias": "labelledby"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SelectableList.d.ts.map