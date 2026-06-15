import * as i0 from "@angular/core";
/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = "span" | "div" | "h2" | "h3";
export type OverlineProps = {
    /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
    as?: OverlineAs;
    class?: string;
};
export declare class Overline {
    static readonly stComponentName = "Overline";
    readonly componentName = "Overline";
    as?: OverlineAs;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Overline, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Overline, "st-overline", never, { "as": { "alias": "as"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=Overline.d.ts.map