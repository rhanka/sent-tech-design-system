import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type LanguageToggleLocale = "fr" | "en";
export type LanguageToggleProps = {
    locale?: LanguageToggleLocale;
    frLabel?: string;
    enLabel?: string;
    /** Libellé du sélecteur (associé via <label for> + aria-label). */
    label?: string;
    /** Id du <select> ; auto-généré et stable si non fourni. */
    selectId?: string;
    variant?: "select" | "accordion";
    accordionLabel?: string;
    class?: string;
};
export declare class LanguageToggle {
    static readonly stComponentName = "LanguageToggle";
    readonly componentName = "LanguageToggle";
    open: boolean;
    readonly autoSelectId: string;
    locale: LanguageToggleLocale;
    frLabel: string;
    enLabel: string;
    label: string;
    selectId?: string;
    variant: "select" | "accordion";
    accordionLabel: string;
    classInput?: string;
    readonly localeChange: EventEmitter<LanguageToggleLocale>;
    get resolvedSelectId(): string;
    get hostClass(): string;
    get selectClass(): string;
    emit(next: LanguageToggleLocale): void;
    onSelectChange(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LanguageToggle, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LanguageToggle, "st-language-toggle", never, { "locale": { "alias": "locale"; "required": false; }; "frLabel": { "alias": "frLabel"; "required": false; }; "enLabel": { "alias": "enLabel"; "required": false; }; "label": { "alias": "label"; "required": false; }; "selectId": { "alias": "selectId"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "accordionLabel": { "alias": "accordionLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "localeChange": "localeChange"; }, never, never, true, never>;
}
//# sourceMappingURL=LanguageToggle.d.ts.map