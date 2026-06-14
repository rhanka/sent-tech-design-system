import * as i0 from "@angular/core";
export type LanguageOption = {
    value: string;
    label: unknown;
};
export type LanguageSelectorProps = {
    options: LanguageOption[];
    value?: string;
    open?: boolean;
    class?: string;
};
export declare class LanguageSelector {
    static readonly stComponentName = "LanguageSelector";
    readonly componentName = "LanguageSelector";
    options: LanguageOption[];
    value?: string;
    open?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<LanguageSelector, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LanguageSelector, "st-language-selector", never, { "options": { "alias": "options"; "required": false; }; "value": { "alias": "value"; "required": false; }; "open": { "alias": "open"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=LanguageSelector.d.ts.map