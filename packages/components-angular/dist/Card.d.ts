import * as i0 from "@angular/core";
export type CardProps = {
    interactive?: boolean;
    title?: unknown;
    subtitle?: unknown;
    class?: string;
};
export declare class Card {
    static readonly stComponentName = "Card";
    readonly componentName = "Card";
    interactive?: boolean;
    title?: unknown;
    subtitle?: unknown;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Card, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Card, "st-card", never, { "interactive": { "alias": "interactive"; "required": false; }; "title": { "alias": "title"; "required": false; }; "subtitle": { "alias": "subtitle"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Card.d.ts.map