import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type TileVariant = "static" | "clickable" | "selectable";
export type TileProps = {
    title?: unknown;
    description?: unknown;
    variant?: TileVariant;
    /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
    href?: string;
    /** Pour `selectable` : état coché. */
    selected?: boolean;
    disabled?: boolean;
    class?: string;
};
export declare class Tile {
    static readonly stComponentName = "Tile";
    readonly componentName = "Tile";
    title?: unknown;
    description?: unknown;
    variant?: TileVariant;
    href?: string;
    selected?: boolean;
    disabled?: boolean;
    classInput?: string;
    readonly select: EventEmitter<boolean>;
    get resolvedVariant(): TileVariant;
    get hasTextContent(): boolean;
    get hostClass(): string;
    onToggle(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Tile, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Tile, "st-tile", never, { "title": { "alias": "title"; "required": false; }; "description": { "alias": "description"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "href": { "alias": "href"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "select": "select"; }, never, ["*", "*", "*", "*"], true, never>;
}
//# sourceMappingURL=Tile.d.ts.map