import * as i0 from "@angular/core";
export type DisplayFontScale = "normal" | "large" | "extra-large";
export type DisplayContrast = "default" | "high";
export type DisplayLineSpacing = "normal" | "comfortable";
export interface DisplaySettingsState {
    fontScale: DisplayFontScale;
    contrast: DisplayContrast;
    lineSpacing: DisplayLineSpacing;
    reducedMotion: boolean;
}
export type DisplaySettingsProps = {
    title?: string;
    values?: Partial<DisplaySettingsState>;
    showFontScale?: boolean;
    showContrast?: boolean;
    showLineSpacing?: boolean;
    showReducedMotion?: boolean;
    class?: string;
};
export declare class DisplaySettings {
    static readonly stComponentName = "DisplaySettings";
    readonly componentName = "DisplaySettings";
    title?: string;
    values?: Partial<DisplaySettingsState>;
    showFontScale?: boolean;
    showContrast?: boolean;
    showLineSpacing?: boolean;
    showReducedMotion?: boolean;
    classInput?: string;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DisplaySettings, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DisplaySettings, "st-display-settings", never, { "title": { "alias": "title"; "required": false; }; "values": { "alias": "values"; "required": false; }; "showFontScale": { "alias": "showFontScale"; "required": false; }; "showContrast": { "alias": "showContrast"; "required": false; }; "showLineSpacing": { "alias": "showLineSpacing"; "required": false; }; "showReducedMotion": { "alias": "showReducedMotion"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=DisplaySettings.d.ts.map