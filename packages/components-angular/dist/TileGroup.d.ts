import * as i0 from "@angular/core";
export interface TileGroupItem {
    value: string;
    /** Libellé du tile (canonique Svelte). */
    label?: unknown;
    /** @deprecated Alias de `label` (compat). Utilisez `label`. */
    title?: unknown;
    description?: unknown;
    disabled?: boolean;
}
export type TileGroupProps = {
    legend?: unknown;
    items: TileGroupItem[];
    value?: string;
    disabled?: boolean;
    class?: string;
};
export declare class TileGroup {
    static readonly stComponentName = "TileGroup";
    readonly componentName = "TileGroup";
    legend?: unknown;
    items: TileGroupItem[];
    value?: string;
    disabled?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileGroup, "st-tile-group", never, { "legend": { "alias": "legend"; "required": false; }; "items": { "alias": "items"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=TileGroup.d.ts.map