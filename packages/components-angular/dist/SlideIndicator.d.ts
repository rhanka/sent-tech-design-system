import * as i0 from "@angular/core";
export type SlideIndicatorVariant = "dots" | "bars";
export type SlideIndicatorSize = "sm" | "md" | "lg";
export type SlideIndicatorProps = {
    /** Nombre total de diapositives. */
    count: number;
    /** Index de la diapositive courante (0-based). */
    current?: number;
    /** Appelé avec l'index ciblé au clic ou au clavier. */
    onChange?: (index: number) => void;
    size?: SlideIndicatorSize;
    variant?: SlideIndicatorVariant;
    /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
    label?: string;
    class?: string;
};
export declare class SlideIndicator {
    static readonly stComponentName = "SlideIndicator";
    readonly componentName = "SlideIndicator";
    count: number;
    current?: number;
    onChange?: (index: number) => void;
    size?: SlideIndicatorSize;
    variant?: SlideIndicatorVariant;
    label?: string;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<SlideIndicator, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SlideIndicator, "st-slide-indicator", never, { "count": { "alias": "count"; "required": false; }; "current": { "alias": "current"; "required": false; }; "onChange": { "alias": "onChange"; "required": false; }; "size": { "alias": "size"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "label": { "alias": "label"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=SlideIndicator.d.ts.map