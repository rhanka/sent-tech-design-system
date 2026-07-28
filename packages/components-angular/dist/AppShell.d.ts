import * as i0 from "@angular/core";
export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";
export type AppShellPanelKey = "navigationPanel" | "contextPanel" | "utilityPanel";
export type AppShellProps = {
    variant?: AppShellVariant;
    /** Presence flags for named panels — pair with a projected `[slot=x]` element. */
    topChrome?: unknown;
    primaryRail?: unknown;
    navigationPanel?: unknown;
    contextPanel?: unknown;
    utilityPanel?: unknown;
    bottomPanel?: unknown;
    mainId?: string;
    navigationLabel?: string;
    contextLabel?: string;
    utilityLabel?: string;
    utilityMode?: AppShellUtilityMode;
    utilitySide?: AppShellUtilitySide;
    /**
     * Below the 48rem breakpoint, `"stack"` (default) keeps today's behaviour —
     * panels stack full-width in document order, always expanded. `"accordion"`
     * degrades each present panel to a keyboard-accessible disclosure (collapsed
     * by default) instead of squeezing the main content. Desktop (>48rem)
     * rendering is IDENTICAL in both modes. Panel content is mounted once
     * regardless of mode/breakpoint; collapsing hides/sizes the region via CSS
     * rather than destroying it, so a stateful widget projected into a panel
     * never remounts.
     */
    panelCollapse?: AppShellPanelCollapse;
    /** Disclosure label for `primaryRail` when `panelCollapse="accordion"`. */
    primaryRailLabel?: string;
    /** Disclosure label for `navigationPanel` when `panelCollapse="accordion"`. Defaults to `navigationLabel`. */
    navigationPanelLabel?: string;
    /** Disclosure label for `contextPanel` when `panelCollapse="accordion"`. Defaults to `contextLabel`. */
    contextPanelLabel?: string;
    /** Disclosure label for `utilityPanel` when `panelCollapse="accordion"`. Defaults to `utilityLabel`. */
    utilityPanelLabel?: string;
    /** Enables drag-to-resize handles on side panels above 48rem. Default false — zero regression. */
    panelResize?: boolean;
    /** Controlled panel widths in px. When provided the component never mutates width itself. */
    panelWidths?: Partial<Record<AppShellPanelKey, number>>;
    /** Seeds uncontrolled widths in px. */
    defaultPanelWidths?: Partial<Record<AppShellPanelKey, number>>;
    /** Fired on every committed resize. Persistence is the CONSUMER's job — the DS stays presentational. */
    onPanelResize?: (key: AppShellPanelKey, width: number) => void;
    /** Lower clamp in px. Default 180. */
    panelMinWidth?: number;
    /** Upper clamp in px. Default 640. */
    panelMaxWidth?: number;
    class?: string;
};
export declare class AppShell {
    static readonly stComponentName = "AppShell";
    readonly componentName = "AppShell";
    variant: AppShellVariant;
    topChrome?: unknown;
    primaryRail?: unknown;
    navigationPanel?: unknown;
    contextPanel?: unknown;
    utilityPanel?: unknown;
    bottomPanel?: unknown;
    mainId: string;
    navigationLabel: string;
    contextLabel: string;
    utilityLabel: string;
    utilityMode: AppShellUtilityMode;
    utilitySide: AppShellUtilitySide;
    panelCollapse: AppShellPanelCollapse;
    primaryRailLabel: string;
    navigationPanelLabel?: string;
    contextPanelLabel?: string;
    utilityPanelLabel?: string;
    classInput?: string;
    panelResize: boolean;
    panelWidths?: Partial<Record<AppShellPanelKey, number>>;
    defaultPanelWidths?: Partial<Record<AppShellPanelKey, number>>;
    onPanelResize?: (key: AppShellPanelKey, width: number) => void;
    panelMinWidth: number;
    panelMaxWidth: number;
    private navigationPanelRef?;
    private contextPanelRef?;
    private utilityPanelRef?;
    private internalWidths?;
    private dragKey;
    private dragPositive;
    private dragStartX;
    private dragStartWidth;
    primaryRailPanelOpen: boolean;
    navigationPanelOpen: boolean;
    contextPanelOpen: boolean;
    utilityPanelOpen: boolean;
    readonly primaryRailTriggerId = "st-appShell-primaryRail-trigger";
    readonly primaryRailRegionId = "st-appShell-primaryRail-region";
    readonly navigationPanelTriggerId = "st-appShell-navigationPanel-trigger";
    readonly navigationPanelRegionId = "st-appShell-navigationPanel-region";
    readonly contextPanelTriggerId = "st-appShell-contextPanel-trigger";
    readonly contextPanelRegionId = "st-appShell-contextPanel-region";
    readonly utilityPanelTriggerId = "st-appShell-utilityPanel-trigger";
    readonly utilityPanelRegionId = "st-appShell-utilityPanel-region";
    get hostClass(): string;
    get navigationPanelLabelResolved(): string;
    get contextPanelLabelResolved(): string;
    get utilityPanelLabelResolved(): string;
    get primaryRailRegionCollapsed(): boolean;
    get navigationPanelRegionCollapsed(): boolean;
    get contextPanelRegionCollapsed(): boolean;
    get utilityPanelRegionCollapsed(): boolean;
    togglePrimaryRailPanel(): void;
    toggleNavigationPanel(): void;
    toggleContextPanel(): void;
    toggleUtilityPanel(): void;
    private get isWidthControlled();
    private ensureInternalWidths;
    widthFor(key: AppShellPanelKey): number | undefined;
    clampWidth(n: number): number;
    displayWidth(key: AppShellPanelKey): number;
    private panelElFor;
    get utilityPositive(): boolean;
    get panelStyle(): string | null;
    private commitWidth;
    onHandlePointerDown(event: PointerEvent, key: AppShellPanelKey, positive: boolean): void;
    onHandlePointerMove(event: PointerEvent): void;
    onHandlePointerUp(event: PointerEvent): void;
    onHandleKeydown(event: KeyboardEvent, key: AppShellPanelKey, positive: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppShell, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppShell, "st-app-shell", never, { "variant": { "alias": "variant"; "required": false; }; "topChrome": { "alias": "topChrome"; "required": false; }; "primaryRail": { "alias": "primaryRail"; "required": false; }; "navigationPanel": { "alias": "navigationPanel"; "required": false; }; "contextPanel": { "alias": "contextPanel"; "required": false; }; "utilityPanel": { "alias": "utilityPanel"; "required": false; }; "bottomPanel": { "alias": "bottomPanel"; "required": false; }; "mainId": { "alias": "mainId"; "required": false; }; "navigationLabel": { "alias": "navigationLabel"; "required": false; }; "contextLabel": { "alias": "contextLabel"; "required": false; }; "utilityLabel": { "alias": "utilityLabel"; "required": false; }; "utilityMode": { "alias": "utilityMode"; "required": false; }; "utilitySide": { "alias": "utilitySide"; "required": false; }; "panelCollapse": { "alias": "panelCollapse"; "required": false; }; "primaryRailLabel": { "alias": "primaryRailLabel"; "required": false; }; "navigationPanelLabel": { "alias": "navigationPanelLabel"; "required": false; }; "contextPanelLabel": { "alias": "contextPanelLabel"; "required": false; }; "utilityPanelLabel": { "alias": "utilityPanelLabel"; "required": false; }; "classInput": { "alias": "class"; "required": false; }; "panelResize": { "alias": "panelResize"; "required": false; }; "panelWidths": { "alias": "panelWidths"; "required": false; }; "defaultPanelWidths": { "alias": "defaultPanelWidths"; "required": false; }; "onPanelResize": { "alias": "onPanelResize"; "required": false; }; "panelMinWidth": { "alias": "panelMinWidth"; "required": false; }; "panelMaxWidth": { "alias": "panelMaxWidth"; "required": false; }; }, {}, never, ["*", "[slot=topChrome]", "[slot=primaryRail]", "[slot=navigationPanel]", "[slot=main]", "[slot=contextPanel]", "[slot=utilityPanel]", "[slot=bottomPanel]"], true, never>;
}
//# sourceMappingURL=AppShell.d.ts.map