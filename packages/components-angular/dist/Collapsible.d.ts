import * as i0 from "@angular/core";
export type CollapsibleProps = {
    /** État ouvert (contrôlable). */
    open?: boolean;
    title: string;
    disabled?: boolean;
    onToggle?: (open: boolean) => void;
    class?: string;
};
export declare class Collapsible {
    static readonly stComponentName = "Collapsible";
    readonly componentName = "Collapsible";
    open?: boolean;
    title: string;
    disabled?: boolean;
    onToggle?: (open: boolean) => void;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Collapsible, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Collapsible, "st-collapsible", never, { "open": { "alias": "open"; "required": false; }; "title": { "alias": "title"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "onToggle": { "alias": "onToggle"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Collapsible.d.ts.map