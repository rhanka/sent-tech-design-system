import * as i0 from "@angular/core";
/**
 * Shared context contract between {@link SelectableList} and its slotted
 * {@link SelectableRow} children. The list owns selection + the roving tabindex
 * and exposes the getters/callbacks the rows read to derive their own `role` /
 * `tabindex` / `aria-selected`. When a row is used STANDALONE (no provider)
 * `inject` returns undefined and the row falls back to its own state.
 */
export type SelectableListContext = {
    /** Reactive bump incremented on every selection / focus / registry change. */
    version: {
        value: number;
    };
    /** True when the list manages selection/roving for its rows. */
    readonly managed: true;
    /** listbox role for the wrapper → rows are "option". */
    readonly itemRole: "option";
    /** Register a row element; returns an unregister callback. disabled is forwarded so the list can skip it during keyboard navigation. */
    register: (el: HTMLElement, value: string | undefined, disabled?: boolean) => () => void;
    /** Is the row with this element currently selected? */
    isSelected: (el: HTMLElement) => boolean;
    /** Should the row with this element be the roving-tabindex stop (tabindex 0)? */
    isTabStop: (el: HTMLElement) => boolean;
    /** Row was activated (click / Space / Enter). The list toggles selection. */
    activate: (el: HTMLElement) => void;
    /** Row received focus → becomes the roving tab stop. */
    focusRow: (el: HTMLElement) => void;
    /** Arrow / Home / End navigation from a row. */
    navigate: (el: HTMLElement, key: string) => void;
};
/** Context key for list→row communication (Angular DI / lookup). Mirrors the
 *  Vue InjectionKey symbol so SelectableList can share its managed context. */
export declare const SELECTABLE_LIST_KEY: unique symbol;
export type SelectableRowProps = {
    /**
     * Selected state. Honoured when the row is used STANDALONE; inside a
     * {@link SelectableList} the list is the source of truth, so this prop is
     * ignored for managed rows.
     */
    selected?: boolean;
    /** Notified on every toggle with the new selected state (standalone rows). */
    onSelect?: (selected: boolean) => void;
    /** Non-interactive when true. */
    disabled?: boolean;
    /** Stable value, surfaced as `data-value` and used by the list for `value`. */
    value?: string;
    /**
     * ARIA role for the standalone row. Defaults to "option" so a lone row still
     * reads as a selectable item. Inside a list the role is forced to "option".
     */
    role?: string;
    /**
     * Opt-in left accent bar on the selected state. Off by default so the
     * selected item is a calm tinted surface + accented text (two signals only).
     */
    accentBar?: boolean;
    class?: string;
};
export declare class SelectableRow {
    static readonly stComponentName = "SelectableRow";
    readonly componentName = "SelectableRow";
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    disabled?: boolean;
    value?: string;
    role?: string;
    accentBar?: boolean;
    classInput?: string;
    handleClick(): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SelectableRow, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SelectableRow, "st-selectable-row", never, { "selected": { "alias": "selected"; "required": false; }; "onSelect": { "alias": "onSelect"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "value": { "alias": "value"; "required": false; }; "role": { "alias": "role"; "required": false; }; "accentBar": { "alias": "accentBar"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SelectableRow.d.ts.map