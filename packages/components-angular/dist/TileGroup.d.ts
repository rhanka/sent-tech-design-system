import { EventEmitter } from "@angular/core";
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
    legendHidden?: boolean;
    items: TileGroupItem[];
    value?: string;
    name?: string;
    disabled?: boolean;
    class?: string;
};
export declare class TileGroup {
    static readonly stComponentName = "TileGroup";
    readonly componentName = "TileGroup";
    legend?: unknown;
    legendHidden?: boolean;
    items: TileGroupItem[];
    value?: string;
    name?: string;
    disabled?: boolean;
    classInput?: string;
    readonly valueChange: EventEmitter<string>;
    private readonly uid;
    get groupName(): string;
    get hostClass(): string;
    get legendClass(): string;
    tileClass(item: TileGroupItem): string;
    onSelect(item: TileGroupItem): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileGroup, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileGroup, "st-tile-group", never, { "legend": { "alias": "legend"; "required": false; }; "legendHidden": { "alias": "legendHidden"; "required": false; }; "items": { "alias": "items"; "required": false; }; "value": { "alias": "value"; "required": false; }; "name": { "alias": "name"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}
//# sourceMappingURL=TileGroup.d.ts.map