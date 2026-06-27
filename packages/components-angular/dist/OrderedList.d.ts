import * as i0 from "@angular/core";
export type OrderedListInput = string | OrderedListItem;
export interface OrderedListItem {
    content: unknown;
    /** Sous-items : chaînes ou objets (normalisés au rendu). */
    children?: OrderedListInput[];
}
export type OrderedListProps = {
    items: OrderedListInput[];
    nested?: boolean;
    class?: string;
};
export declare class OrderedList {
    static readonly stComponentName = "OrderedList";
    readonly componentName = "OrderedList";
    items: OrderedListInput[];
    nested: boolean;
    classInput?: string;
    normalize(item: OrderedListInput): OrderedListItem;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OrderedList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OrderedList, "st-ordered-list", never, { "items": { "alias": "items"; "required": false; }; "nested": { "alias": "nested"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=OrderedList.d.ts.map