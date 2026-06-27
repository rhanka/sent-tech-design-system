import * as i0 from "@angular/core";
export type ContentSwitcherSize = "sm" | "md" | "lg";
export type ContentSwitcherItem = {
    id?: string;
    value?: string;
    label: unknown;
    disabled?: boolean;
};
export type ContentSwitcherProps = {
    items: ContentSwitcherItem[];
    value?: string;
    activeId?: string;
    size?: ContentSwitcherSize;
    onchange?: (value: string) => void;
    class?: string;
};
export declare class ContentSwitcher {
    static readonly stComponentName = "ContentSwitcher";
    readonly componentName = "ContentSwitcher";
    items: ContentSwitcherItem[];
    value?: string;
    activeId?: string;
    size: ContentSwitcherSize;
    onchange?: (value: string) => void;
    classInput?: string;
    private localValue?;
    get hostClass(): string;
    itemKey(item: ContentSwitcherItem, index: number): string;
    isActive(item: ContentSwitcherItem, index: number): boolean;
    buttonClass(item: ContentSwitcherItem, index: number): string;
    select(item: ContentSwitcherItem, index: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentSwitcher, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentSwitcher, "st-content-switcher", never, { "items": { "alias": "items"; "required": false; }; "value": { "alias": "value"; "required": false; }; "activeId": { "alias": "activeId"; "required": false; }; "size": { "alias": "size"; "required": false; }; "onchange": { "alias": "onchange"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, {}, never, ["*"], true, never>;
}
//# sourceMappingURL=ContentSwitcher.d.ts.map