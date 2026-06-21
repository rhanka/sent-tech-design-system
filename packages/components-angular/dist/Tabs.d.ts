import { EventEmitter } from "@angular/core";
import * as i0 from "@angular/core";
export type TabItem = {
    id?: string;
    value?: string;
    label: unknown;
    content?: unknown;
    disabled?: boolean;
};
export type TabsProps = {
    items: TabItem[];
    activeValue?: string;
    activeId?: string;
    label?: string;
    onchange?: (value: string) => void;
    class?: string;
};
export declare class Tabs {
    static readonly stComponentName = "Tabs";
    readonly componentName = "Tabs";
    readonly uid: string;
    private localCurrent;
    items: TabItem[];
    activeValue?: string;
    activeId?: string;
    label?: string;
    onchange?: (value: string) => void;
    classInput?: string;
    readonly change: EventEmitter<string>;
    ngOnInit(): void;
    tabId(item: TabItem, index: number): string;
    get current(): string;
    get activeTabId(): string;
    get activeContent(): unknown;
    isActive(item: TabItem, index: number): boolean;
    tabClass(item: TabItem, index: number): string;
    select(item: TabItem, index: number): void;
    get hostClass(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<Tabs, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Tabs, "st-tabs", never, { "items": { "alias": "items"; "required": false; }; "activeValue": { "alias": "activeValue"; "required": false; }; "activeId": { "alias": "activeId"; "required": false; }; "label": { "alias": "label"; "required": false; }; "onchange": { "alias": "onchange"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; }, { "change": "change"; }, never, ["*"], true, never>;
}
//# sourceMappingURL=Tabs.d.ts.map