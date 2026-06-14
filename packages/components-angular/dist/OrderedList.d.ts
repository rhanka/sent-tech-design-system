import * as i0 from "@angular/core";
export type OrderedListItem = {
    content?: unknown;
    label?: unknown;
    children?: OrderedListInput[];
};
export type OrderedListInput = unknown;
export type OrderedListProps = {
    items: OrderedListInput[];
    class?: string;
};
export declare class OrderedList {
    static readonly stComponentName = "OrderedList";
    readonly componentName = "OrderedList";
    items: OrderedListInput[];
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<OrderedList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OrderedList, "st-ordered-list", never, { "items": { "alias": "items"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=OrderedList.d.ts.map