import * as i0 from "@angular/core";
export type UnorderedListInput = string | UnorderedListItem;
export interface UnorderedListItem {
    content: unknown;
    /** Sous-items : chaînes ou objets (normalisés au rendu). */
    children?: UnorderedListInput[];
}
export type UnorderedListProps = {
    items: UnorderedListInput[];
    nested?: boolean;
    class?: string;
};
export declare class UnorderedList {
    static readonly stComponentName = "UnorderedList";
    readonly componentName = "UnorderedList";
    items: UnorderedListInput[];
    nested: boolean;
    classInput?: string;
    normalize(item: UnorderedListInput): UnorderedListItem;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<UnorderedList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UnorderedList, "st-unordered-list", never, { "items": { "alias": "items"; "required": false; }; "nested": { "alias": "nested"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=UnorderedList.d.ts.map