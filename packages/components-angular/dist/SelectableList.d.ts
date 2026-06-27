import { type AfterViewInit, ElementRef, type OnChanges } from "@angular/core";
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
export declare class SelectableList implements AfterViewInit, OnChanges {
    private readonly host;
    static readonly stComponentName = "SelectableList";
    readonly componentName = "SelectableList";
    label?: string;
    labelledby?: string;
    multiple?: boolean;
    value?: string | string[] | null;
    onChange?: (value: string | string[] | null) => void;
    classInput?: string;
    constructor(host: ElementRef<HTMLElement>);
    ngAfterViewInit(): void;
    ngOnChanges(): void;
    /**
     * The list OWNS selection: it drives the `--selected` styling of its
     * {@link SelectableRow} children from its own `value`, mirroring the
     * provide/inject contract of the React/Svelte/Vue references. Angular projects
     * pre-instantiated rows as plain DOM (no shared injector), so the list reads
     * each row's `data-value` and toggles the modifier directly. The rows' own
     * `[class]` binding only manages the tokens it emits (never `--selected` for a
     * managed row), so the patch is not clobbered on re-render.
     */
    private syncSelection;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectableList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SelectableList, "st-selectable-list", never, { "label": { "alias": "label"; "required": false; }; "labelledby": { "alias": "labelledby"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "value": { "alias": "value"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SelectableList.d.ts.map