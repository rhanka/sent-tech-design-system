import { Component, ElementRef, Input as NgInput, ViewChild } from "@angular/core";
import { classNames } from "./classNames.js";
import { Icon } from "./Icon.js";
import * as i0 from "@angular/core";
// CSS custom property each resizable panel is sized by (see the
// `.st-appShell` base rule in shared styles.css) — setting it inline on the
// shell root is the intended resize mechanism, it simply out-specificities
// the token-driven default declared there. Mirrors Svelte's `PANEL_VAR`.
const PANEL_VAR = {
    navigationPanel: "--st-appShell-navigation-width",
    contextPanel: "--st-appShell-context-width",
    utilityPanel: "--st-appShell-utility-width",
};
// Nominal px equivalent of each panel's own CSS-token default (navigation
// 20rem, context 22rem, utility 24rem, all at a 16px root) — used ONLY as a
// display/ARIA fallback (aria-valuenow, drag-start anchor) before any width
// has ever been supplied or committed. Never written back as an inline
// style, so a themed override of the underlying token is never fought until
// the consumer/user actually establishes a concrete width.
// NOTE: `primaryRail` is intentionally NOT a resizable panel — it is a
// fixed-width icon rail (à la VS Code's activity bar), not a splittable
// pane; see `AppShellPanelKey` above.
const PANEL_NOMINAL_PX = {
    navigationPanel: 320,
    contextPanel: 352,
    utilityPanel: 384,
};
export class AppShell {
    static stComponentName = "AppShell";
    componentName = "AppShell";
    variant = "workspace";
    topChrome;
    primaryRail;
    navigationPanel;
    contextPanel;
    utilityPanel;
    bottomPanel;
    mainId = "main";
    navigationLabel = "Workspace navigation";
    contextLabel = "Context panel";
    utilityLabel = "Utility panel";
    utilityMode = "reserve";
    utilitySide = "right";
    panelCollapse = "stack";
    primaryRailLabel = "Primary rail";
    navigationPanelLabel;
    contextPanelLabel;
    utilityPanelLabel;
    classInput;
    panelResize = false;
    panelWidths;
    defaultPanelWidths;
    onPanelResize;
    panelMinWidth = 180;
    panelMaxWidth = 640;
    navigationPanelRef;
    contextPanelRef;
    utilityPanelRef;
    // Uncontrolled fallback for resizable widths, seeded on first read from
    // `defaultPanelWidths` (mirrors `internalValue` on TimeRangePicker — a
    // lazy, one-time seed rather than a constructor-time copy, since
    // `@Input()`s aren't bound yet when the class is constructed).
    internalWidths;
    // Pointer-drag bookkeeping — plain fields, never read from the template,
    // only from the pointer handlers below.
    dragKey = null;
    dragPositive = true;
    dragStartX = 0;
    dragStartWidth = 0;
    // Uncontrolled per-panel disclosure state (v1) — each accordion panel
    // starts collapsed. Desktop rendering never reads these (CSS scopes the
    // collapse to `@media (max-width: 48rem)`), so they have zero effect above
    // the breakpoint.
    primaryRailPanelOpen = false;
    navigationPanelOpen = false;
    contextPanelOpen = false;
    utilityPanelOpen = false;
    // Static, framework-wide-matching disclosure ids (parity with the Svelte
    // reference — one AppShell instance per page is the expected usage).
    primaryRailTriggerId = "st-appShell-primaryRail-trigger";
    primaryRailRegionId = "st-appShell-primaryRail-region";
    navigationPanelTriggerId = "st-appShell-navigationPanel-trigger";
    navigationPanelRegionId = "st-appShell-navigationPanel-region";
    contextPanelTriggerId = "st-appShell-contextPanel-trigger";
    contextPanelRegionId = "st-appShell-contextPanel-region";
    utilityPanelTriggerId = "st-appShell-utilityPanel-trigger";
    utilityPanelRegionId = "st-appShell-utilityPanel-region";
    get hostClass() {
        return classNames("st-appShell", `st-appShell--${this.variant}`, this.classInput);
    }
    // Resolved disclosure labels: default to the existing aria-label inputs so
    // a consumer who already customized navigationLabel/contextLabel/utilityLabel
    // doesn't need to duplicate the translation for the accordion trigger text.
    get navigationPanelLabelResolved() {
        return this.navigationPanelLabel ?? this.navigationLabel;
    }
    get contextPanelLabelResolved() {
        return this.contextPanelLabel ?? this.contextLabel;
    }
    get utilityPanelLabelResolved() {
        return this.utilityPanelLabel ?? this.utilityLabel;
    }
    get primaryRailRegionCollapsed() {
        return this.panelCollapse === "accordion" && !this.primaryRailPanelOpen;
    }
    get navigationPanelRegionCollapsed() {
        return this.panelCollapse === "accordion" && !this.navigationPanelOpen;
    }
    get contextPanelRegionCollapsed() {
        return this.panelCollapse === "accordion" && !this.contextPanelOpen;
    }
    get utilityPanelRegionCollapsed() {
        return this.panelCollapse === "accordion" && !this.utilityPanelOpen;
    }
    togglePrimaryRailPanel() {
        this.primaryRailPanelOpen = !this.primaryRailPanelOpen;
    }
    toggleNavigationPanel() {
        this.navigationPanelOpen = !this.navigationPanelOpen;
    }
    toggleContextPanel() {
        this.contextPanelOpen = !this.contextPanelOpen;
    }
    toggleUtilityPanel() {
        this.utilityPanelOpen = !this.utilityPanelOpen;
    }
    // ── Resizable panels (panelResize) ──────────────────────────────────────
    // Controlled/uncontrolled mirrors the Svelte reference: `panelWidths`
    // present (even as `{}`) means controlled — the component reads it but
    // never writes it; otherwise widths live in `internalWidths`.
    get isWidthControlled() {
        return this.panelWidths !== undefined;
    }
    ensureInternalWidths() {
        if (this.internalWidths === undefined) {
            this.internalWidths = { ...this.defaultPanelWidths };
        }
        return this.internalWidths;
    }
    widthFor(key) {
        const source = this.isWidthControlled ? this.panelWidths : this.ensureInternalWidths();
        return source?.[key];
    }
    clampWidth(n) {
        return Math.min(Math.max(n, this.panelMinWidth), this.panelMaxWidth);
    }
    // Current width for rendering/ARIA — always a concrete, clamped number so
    // aria-valuenow is never NaN and is always within [aria-valuemin, aria-valuemax].
    displayWidth(key) {
        return this.clampWidth(this.widthFor(key) ?? PANEL_NOMINAL_PX[key]);
    }
    panelElFor(key) {
        if (key === "navigationPanel")
            return this.navigationPanelRef?.nativeElement ?? null;
        if (key === "contextPanel")
            return this.contextPanelRef?.nativeElement ?? null;
        return this.utilityPanelRef?.nativeElement ?? null;
    }
    // `utilityPanel` mirrors a left panel (grow-on-drag-right) unless it sits
    // on the right edge; the "bottom" side never renders a handle at all
    // (guarded in the template), so its `positive` value is never read.
    get utilityPositive() {
        return this.utilitySide !== "right";
    }
    // Only the CSS vars for panels with an explicit (controlled or committed)
    // width are emitted — an untouched panel keeps deferring to its token
    // default (`.st-appShell` base rule), so a theme's own width override is
    // never silently overridden just because `panelResize` is on.
    get panelStyle() {
        if (!this.panelResize)
            return null;
        const parts = [];
        for (const key of Object.keys(PANEL_VAR)) {
            const width = this.widthFor(key);
            if (width !== undefined)
                parts.push(`${PANEL_VAR[key]}: ${this.clampWidth(width)}px`);
        }
        return parts.length ? parts.join("; ") : null;
    }
    commitWidth(key, next) {
        const clamped = this.clampWidth(next);
        if (!this.isWidthControlled) {
            const widths = this.ensureInternalWidths();
            this.internalWidths = { ...widths, [key]: clamped };
        }
        this.onPanelResize?.(key, clamped);
    }
    onHandlePointerDown(event, key, positive) {
        const handle = event.currentTarget;
        handle?.setPointerCapture?.(event.pointerId);
        this.dragKey = key;
        this.dragPositive = positive;
        this.dragStartX = event.clientX;
        const measured = this.panelElFor(key)?.getBoundingClientRect().width ?? 0;
        this.dragStartWidth = measured > 0 ? measured : this.displayWidth(key);
        event.preventDefault();
    }
    onHandlePointerMove(event) {
        if (this.dragKey === null)
            return;
        const dx = event.clientX - this.dragStartX;
        const delta = this.dragPositive ? dx : -dx;
        this.commitWidth(this.dragKey, this.dragStartWidth + delta);
    }
    onHandlePointerUp(event) {
        if (this.dragKey === null)
            return;
        const handle = event.currentTarget;
        if (handle?.hasPointerCapture?.(event.pointerId))
            handle.releasePointerCapture?.(event.pointerId);
        this.dragKey = null;
    }
    // Arrow keys move the splitter itself (WAI-ARIA window-splitter pattern):
    // for a "positive" (left-edge) panel, moving the splitter right grows it;
    // for a "negative" (right-edge) panel, moving the splitter right shrinks
    // it. Home/End always jump to the absolute clamp bounds.
    onHandleKeydown(event, key, positive) {
        const current = this.displayWidth(key);
        let next;
        switch (event.key) {
            case "ArrowLeft":
                next = current + (positive ? -16 : 16);
                break;
            case "ArrowRight":
                next = current + (positive ? 16 : -16);
                break;
            case "Home":
                next = this.panelMinWidth;
                break;
            case "End":
                next = this.panelMaxWidth;
                break;
            default:
                return;
        }
        event.preventDefault();
        this.commitWidth(key, next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppShell, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: AppShell, isStandalone: true, selector: "st-app-shell", inputs: { variant: "variant", topChrome: "topChrome", primaryRail: "primaryRail", navigationPanel: "navigationPanel", contextPanel: "contextPanel", utilityPanel: "utilityPanel", bottomPanel: "bottomPanel", mainId: "mainId", navigationLabel: "navigationLabel", contextLabel: "contextLabel", utilityLabel: "utilityLabel", utilityMode: "utilityMode", utilitySide: "utilitySide", panelCollapse: "panelCollapse", primaryRailLabel: "primaryRailLabel", navigationPanelLabel: "navigationPanelLabel", contextPanelLabel: "contextPanelLabel", utilityPanelLabel: "utilityPanelLabel", classInput: ["class", "classInput"], panelResize: "panelResize", panelWidths: "panelWidths", defaultPanelWidths: "defaultPanelWidths", onPanelResize: "onPanelResize", panelMinWidth: "panelMinWidth", panelMaxWidth: "panelMaxWidth" }, viewQueries: [{ propertyName: "navigationPanelRef", first: true, predicate: ["navigationPanelEl"], descendants: true }, { propertyName: "contextPanelRef", first: true, predicate: ["contextPanelEl"], descendants: true }, { propertyName: "utilityPanelRef", first: true, predicate: ["utilityPanelEl"], descendants: true }], ngImport: i0, template: `
    @if (variant === "site") {
      <div [attr.data-st-component]="componentName" data-st-app-shell-variant="site" [class]="hostClass">
        <ng-content></ng-content>
      </div>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        data-st-app-shell-variant="workspace"
        [attr.data-utility-mode]="utilityMode"
        [attr.data-utility-side]="utilitySide"
        [attr.data-panel-collapse]="panelCollapse"
        [class]="hostClass"
        [style]="panelStyle"
      >
        @if (topChrome) {
          <div class="st-appShell__topChrome">
            <ng-content select="[slot=topChrome]"></ng-content>
          </div>
        }
        <div class="st-appShell__body">
          @if (primaryRail) {
            <aside class="st-appShell__primaryRail" [attr.aria-label]="primaryRailLabel">
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="primaryRailPanelOpen"
                  [attr.aria-controls]="primaryRailRegionId"
                  [id]="primaryRailTriggerId"
                  (click)="togglePrimaryRailPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ primaryRailLabel }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="primaryRailPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="primaryRailRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? primaryRailRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? primaryRailTriggerId : null"
              >
                <ng-content select="[slot=primaryRail]"></ng-content>
              </div>
            </aside>
          }
          @if (navigationPanel) {
            <aside class="st-appShell__navigationPanel" [attr.aria-label]="navigationLabel" #navigationPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="navigationPanelOpen"
                  [attr.aria-controls]="navigationPanelRegionId"
                  [id]="navigationPanelTriggerId"
                  (click)="toggleNavigationPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ navigationPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="navigationPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="navigationPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? navigationPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? navigationPanelTriggerId : null"
              >
                <ng-content select="[slot=navigationPanel]"></ng-content>
              </div>
              @if (panelResize) {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('navigationPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + navigationLabel"
                  (pointerdown)="onHandlePointerDown($event, 'navigationPanel', true)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'navigationPanel', true)"
                ></div>
              }
            </aside>
          }
          <main class="st-appShell__main" [id]="mainId">
            <ng-content select="[slot=main]"></ng-content>
          </main>
          @if (contextPanel) {
            <aside class="st-appShell__contextPanel" [attr.aria-label]="contextLabel" #contextPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="contextPanelOpen"
                  [attr.aria-controls]="contextPanelRegionId"
                  [id]="contextPanelTriggerId"
                  (click)="toggleContextPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ contextPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="contextPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="contextPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? contextPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? contextPanelTriggerId : null"
              >
                <ng-content select="[slot=contextPanel]"></ng-content>
              </div>
              @if (panelResize) {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('contextPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + contextLabel"
                  (pointerdown)="onHandlePointerDown($event, 'contextPanel', false)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'contextPanel', false)"
                ></div>
              }
            </aside>
          }
          @if (utilityPanel) {
            <aside class="st-appShell__utilityPanel" [attr.aria-label]="utilityLabel" #utilityPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="utilityPanelOpen"
                  [attr.aria-controls]="utilityPanelRegionId"
                  [id]="utilityPanelTriggerId"
                  (click)="toggleUtilityPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ utilityPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="utilityPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="utilityPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? utilityPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? utilityPanelTriggerId : null"
              >
                <ng-content select="[slot=utilityPanel]"></ng-content>
              </div>
              @if (panelResize && utilitySide !== "bottom") {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('utilityPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + utilityLabel"
                  (pointerdown)="onHandlePointerDown($event, 'utilityPanel', utilityPositive)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'utilityPanel', utilityPositive)"
                ></div>
              }
            </aside>
          }
        </div>
        @if (bottomPanel) {
          <section class="st-appShell__bottomPanel" aria-label="Workspace tools">
            <ng-content select="[slot=bottomPanel]"></ng-content>
          </section>
        }
      </div>
    }
  `, isInline: true, styles: [":host { display: contents; }"], dependencies: [{ kind: "component", type: Icon, selector: "st-icon", inputs: ["name", "size", "strokeWidth", "title", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppShell, decorators: [{
            type: Component,
            args: [{ selector: "st-app-shell", standalone: true, imports: [Icon], template: `
    @if (variant === "site") {
      <div [attr.data-st-component]="componentName" data-st-app-shell-variant="site" [class]="hostClass">
        <ng-content></ng-content>
      </div>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        data-st-app-shell-variant="workspace"
        [attr.data-utility-mode]="utilityMode"
        [attr.data-utility-side]="utilitySide"
        [attr.data-panel-collapse]="panelCollapse"
        [class]="hostClass"
        [style]="panelStyle"
      >
        @if (topChrome) {
          <div class="st-appShell__topChrome">
            <ng-content select="[slot=topChrome]"></ng-content>
          </div>
        }
        <div class="st-appShell__body">
          @if (primaryRail) {
            <aside class="st-appShell__primaryRail" [attr.aria-label]="primaryRailLabel">
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="primaryRailPanelOpen"
                  [attr.aria-controls]="primaryRailRegionId"
                  [id]="primaryRailTriggerId"
                  (click)="togglePrimaryRailPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ primaryRailLabel }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="primaryRailPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="primaryRailRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? primaryRailRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? primaryRailTriggerId : null"
              >
                <ng-content select="[slot=primaryRail]"></ng-content>
              </div>
            </aside>
          }
          @if (navigationPanel) {
            <aside class="st-appShell__navigationPanel" [attr.aria-label]="navigationLabel" #navigationPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="navigationPanelOpen"
                  [attr.aria-controls]="navigationPanelRegionId"
                  [id]="navigationPanelTriggerId"
                  (click)="toggleNavigationPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ navigationPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="navigationPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="navigationPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? navigationPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? navigationPanelTriggerId : null"
              >
                <ng-content select="[slot=navigationPanel]"></ng-content>
              </div>
              @if (panelResize) {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('navigationPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + navigationLabel"
                  (pointerdown)="onHandlePointerDown($event, 'navigationPanel', true)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'navigationPanel', true)"
                ></div>
              }
            </aside>
          }
          <main class="st-appShell__main" [id]="mainId">
            <ng-content select="[slot=main]"></ng-content>
          </main>
          @if (contextPanel) {
            <aside class="st-appShell__contextPanel" [attr.aria-label]="contextLabel" #contextPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="contextPanelOpen"
                  [attr.aria-controls]="contextPanelRegionId"
                  [id]="contextPanelTriggerId"
                  (click)="toggleContextPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ contextPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="contextPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="contextPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? contextPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? contextPanelTriggerId : null"
              >
                <ng-content select="[slot=contextPanel]"></ng-content>
              </div>
              @if (panelResize) {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('contextPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + contextLabel"
                  (pointerdown)="onHandlePointerDown($event, 'contextPanel', false)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'contextPanel', false)"
                ></div>
              }
            </aside>
          }
          @if (utilityPanel) {
            <aside class="st-appShell__utilityPanel" [attr.aria-label]="utilityLabel" #utilityPanelEl>
              @if (panelCollapse === "accordion") {
                <button
                  type="button"
                  class="st-appShell__panelDisclosure"
                  [attr.aria-expanded]="utilityPanelOpen"
                  [attr.aria-controls]="utilityPanelRegionId"
                  [id]="utilityPanelTriggerId"
                  (click)="toggleUtilityPanel()"
                >
                  <span class="st-appShell__panelDisclosureLabel">{{ utilityPanelLabelResolved }}</span>
                  <span class="st-appShell__panelDisclosureIcon" [class.st-appShell__panelDisclosureIcon--expanded]="utilityPanelOpen">
                    <st-icon name="chevron-down" [size]="16"></st-icon>
                  </span>
                </button>
              }
              <div
                class="st-appShell__panelRegion"
                [class.st-appShell__panelRegion--collapsed]="utilityPanelRegionCollapsed"
                [attr.id]="panelCollapse === 'accordion' ? utilityPanelRegionId : null"
                [attr.role]="panelCollapse === 'accordion' ? 'region' : null"
                [attr.aria-labelledby]="panelCollapse === 'accordion' ? utilityPanelTriggerId : null"
              >
                <ng-content select="[slot=utilityPanel]"></ng-content>
              </div>
              @if (panelResize && utilitySide !== "bottom") {
                <div
                  class="st-appShell__resizeHandle"
                  role="separator"
                  aria-orientation="vertical"
                  tabindex="0"
                  [attr.aria-valuenow]="displayWidth('utilityPanel')"
                  [attr.aria-valuemin]="panelMinWidth"
                  [attr.aria-valuemax]="panelMaxWidth"
                  [attr.aria-label]="'Resize ' + utilityLabel"
                  (pointerdown)="onHandlePointerDown($event, 'utilityPanel', utilityPositive)"
                  (pointermove)="onHandlePointerMove($event)"
                  (pointerup)="onHandlePointerUp($event)"
                  (pointercancel)="onHandlePointerUp($event)"
                  (keydown)="onHandleKeydown($event, 'utilityPanel', utilityPositive)"
                ></div>
              }
            </aside>
          }
        </div>
        @if (bottomPanel) {
          <section class="st-appShell__bottomPanel" aria-label="Workspace tools">
            <ng-content select="[slot=bottomPanel]"></ng-content>
          </section>
        }
      </div>
    }
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { variant: [{
                type: NgInput
            }], topChrome: [{
                type: NgInput
            }], primaryRail: [{
                type: NgInput
            }], navigationPanel: [{
                type: NgInput
            }], contextPanel: [{
                type: NgInput
            }], utilityPanel: [{
                type: NgInput
            }], bottomPanel: [{
                type: NgInput
            }], mainId: [{
                type: NgInput
            }], navigationLabel: [{
                type: NgInput
            }], contextLabel: [{
                type: NgInput
            }], utilityLabel: [{
                type: NgInput
            }], utilityMode: [{
                type: NgInput
            }], utilitySide: [{
                type: NgInput
            }], panelCollapse: [{
                type: NgInput
            }], primaryRailLabel: [{
                type: NgInput
            }], navigationPanelLabel: [{
                type: NgInput
            }], contextPanelLabel: [{
                type: NgInput
            }], utilityPanelLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], panelResize: [{
                type: NgInput
            }], panelWidths: [{
                type: NgInput
            }], defaultPanelWidths: [{
                type: NgInput
            }], onPanelResize: [{
                type: NgInput
            }], panelMinWidth: [{
                type: NgInput
            }], panelMaxWidth: [{
                type: NgInput
            }], navigationPanelRef: [{
                type: ViewChild,
                args: ["navigationPanelEl"]
            }], contextPanelRef: [{
                type: ViewChild,
                args: ["contextPanelEl"]
            }], utilityPanelRef: [{
                type: ViewChild,
                args: ["utilityPanelEl"]
            }] } });
//# sourceMappingURL=AppShell.js.map