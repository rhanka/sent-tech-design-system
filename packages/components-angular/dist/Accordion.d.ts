import * as i0 from "@angular/core";
export type AccordionItem = {
    id?: string;
    title: string;
    content: string | (() => unknown);
    disabled?: boolean;
};
export type AccordionAlign = "start" | "end";
export type AccordionSize = "sm" | "md" | "lg";
export type AccordionProps = {
    items: AccordionItem[];
    openIds?: string[];
    defaultOpenIds?: string[];
    allowMultiple?: boolean;
    /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
    open?: string[];
    /** Svelte-canonical alias for `allowMultiple`. */
    multiple?: boolean;
    align?: AccordionAlign;
    size?: AccordionSize;
    class?: string;
};
export declare class Accordion {
    static readonly stComponentName = "Accordion";
    readonly componentName = "Accordion";
    items: AccordionItem[];
    openIds?: string[];
    defaultOpenIds?: string[];
    allowMultiple?: boolean;
    open?: string[];
    multiple?: boolean;
    align?: AccordionAlign;
    size?: AccordionSize;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Accordion, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Accordion, "st-accordion", never, { "items": { "alias": "items"; "required": false; }; "openIds": { "alias": "openIds"; "required": false; }; "defaultOpenIds": { "alias": "defaultOpenIds"; "required": false; }; "allowMultiple": { "alias": "allowMultiple"; "required": false; }; "open": { "alias": "open"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "align": { "alias": "align"; "required": false; }; "size": { "alias": "size"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Accordion.d.ts.map