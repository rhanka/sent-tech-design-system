import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type LanguageOption = {
    value: string;
    label: unknown;
};
export type LanguageSelectorProps = {
    options: LanguageOption[];
    value?: string;
    label?: string;
    disabled?: boolean;
    class?: string;
};
export declare class LanguageSelector {
    static readonly stComponentName = "LanguageSelector";
    readonly componentName = "LanguageSelector";
    open: boolean;
    options: LanguageOption[];
    value: string;
    label: string;
    disabled: boolean;
    classInput?: string;
    readonly valueChange: EventEmitter<string>;
    readonly change: EventEmitter<string>;
    get current(): LanguageOption | undefined;
    get hostClass(): string;
    choose(next: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LanguageSelector, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LanguageSelector, "st-language-selector", never, { "options": { "alias": "options"; "required": false; }; "value": { "alias": "value"; "required": false; }; "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "valueChange": "valueChange"; "change": "change"; }, never, never, true, never>;
}
//# sourceMappingURL=LanguageSelector.d.ts.map