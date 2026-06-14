import * as i0 from "@angular/core";
export type PortalProps = {
    /**
     * Where to teleport the children. A CSS selector string or an actual
     * `HTMLElement`. Defaults to the document `<body>`.
     */
    target?: string | HTMLElement;
    /** When `true`, render inline in place (no teleportation). */
    disabled?: boolean;
    /** Optional class applied to the portal container element. */
    class?: string;
};
export declare function resolvePortalTarget(target: string | HTMLElement | undefined): HTMLElement | null;
export declare class Portal {
    static readonly stComponentName = "Portal";
    readonly componentName = "Portal";
    target?: string | HTMLElement;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Portal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Portal, "st-portal", never, { "target": { "alias": "target"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Portal.d.ts.map