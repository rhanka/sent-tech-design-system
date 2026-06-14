import * as i0 from "@angular/core";
export type StructuredListItem = {
    term?: unknown;
    label?: unknown;
    description?: unknown;
    value?: unknown;
};
export type StructuredListProps = {
    items: StructuredListItem[];
    bordered?: boolean;
    class?: string;
};
export declare class StructuredList {
    static readonly stComponentName = "StructuredList";
    readonly componentName = "StructuredList";
    items: StructuredListItem[];
    bordered?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StructuredList, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StructuredList, "st-structured-list", never, { "items": { "alias": "items"; "required": false; }; "bordered": { "alias": "bordered"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=StructuredList.d.ts.map