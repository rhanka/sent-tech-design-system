import * as i0 from "@angular/core";
export type UnorderedListItem = {
    content?: unknown;
    label?: unknown;
    children?: UnorderedListInput[];
};
export type UnorderedListInput = unknown;
export type UnorderedListProps = {
    items: UnorderedListInput[];
    class?: string;
};
export declare class UnorderedList {
    static readonly stComponentName = "UnorderedList";
    readonly componentName = "UnorderedList";
    items: UnorderedListInput[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<UnorderedList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UnorderedList, "st-unordered-list", never, { "items": { "alias": "items"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=UnorderedList.d.ts.map