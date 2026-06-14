import * as i0 from "@angular/core";
export type SearchSize = "sm" | "md" | "lg";
export type SearchProps = {
    label?: unknown;
    size?: SearchSize;
    modelValue?: string;
    /** Svelte/React-canonical alias for `modelValue`. */
    value?: string;
    placeholder?: string;
    clearLabel?: string;
    disabled?: boolean;
    id?: string;
    class?: string;
};
export declare class Search {
    static readonly stComponentName = "Search";
    readonly componentName = "Search";
    label?: unknown;
    size?: SearchSize;
    modelValue?: string;
    value?: string;
    placeholder?: string;
    clearLabel?: string;
    disabled?: boolean;
    id?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Search, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Search, "st-search", never, { "label": { "alias": "label"; "required": false; }; "size": { "alias": "size"; "required": false; }; "modelValue": { "alias": "modelValue"; "required": false; }; "value": { "alias": "value"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "clearLabel": { "alias": "clearLabel"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "id": { "alias": "id"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Search.d.ts.map