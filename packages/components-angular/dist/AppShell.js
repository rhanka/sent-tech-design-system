import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { Icon } from "./Icon.js";
import * as i0 from "@angular/core";
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: AppShell, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: AppShell, isStandalone: true, selector: "st-app-shell", inputs: { variant: "variant", topChrome: "topChrome", primaryRail: "primaryRail", navigationPanel: "navigationPanel", contextPanel: "contextPanel", utilityPanel: "utilityPanel", bottomPanel: "bottomPanel", mainId: "mainId", navigationLabel: "navigationLabel", contextLabel: "contextLabel", utilityLabel: "utilityLabel", utilityMode: "utilityMode", utilitySide: "utilitySide", panelCollapse: "panelCollapse", primaryRailLabel: "primaryRailLabel", navigationPanelLabel: "navigationPanelLabel", contextPanelLabel: "contextPanelLabel", utilityPanelLabel: "utilityPanelLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
            <aside class="st-appShell__navigationPanel" [attr.aria-label]="navigationLabel">
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
            </aside>
          }
          <main class="st-appShell__main" [id]="mainId">
            <ng-content select="[slot=main]"></ng-content>
          </main>
          @if (contextPanel) {
            <aside class="st-appShell__contextPanel" [attr.aria-label]="contextLabel">
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
            </aside>
          }
          @if (utilityPanel) {
            <aside class="st-appShell__utilityPanel" [attr.aria-label]="utilityLabel">
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
            <aside class="st-appShell__navigationPanel" [attr.aria-label]="navigationLabel">
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
            </aside>
          }
          <main class="st-appShell__main" [id]="mainId">
            <ng-content select="[slot=main]"></ng-content>
          </main>
          @if (contextPanel) {
            <aside class="st-appShell__contextPanel" [attr.aria-label]="contextLabel">
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
            </aside>
          }
          @if (utilityPanel) {
            <aside class="st-appShell__utilityPanel" [attr.aria-label]="utilityLabel">
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
            }] } });
//# sourceMappingURL=AppShell.js.map