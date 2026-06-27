import * as i0 from "@angular/core";
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";
export type ContainerProps = {
    size?: ContainerSize;
    /** Apply horizontal padding using the spacing scale. */
    padding?: boolean;
    as?: string;
    class?: string;
};
export declare class Container {
    static readonly stComponentName = "Container";
    readonly componentName = "Container";
    size: ContainerSize;
    padding: boolean;
    as?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Container, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Container, "st-container", never, { "size": { "alias": "size"; "required": false; }; "padding": { "alias": "padding"; "required": false; }; "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Container.d.ts.map