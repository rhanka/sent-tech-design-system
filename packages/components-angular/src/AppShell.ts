import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";
import { Icon } from "./Icon.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";

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
  class?: string;
};

@Component({
  selector: "st-app-shell",
  standalone: true,
  imports: [Icon],
  // The host tag defaults to `display:inline`, which breaks the grid/flex
  // layout below it (see reference_angular_host_display_contents) — `contents`
  // makes `<st-app-shell>` transparent to layout so `.st-appShell` behaves as
  // the real flex/grid participant.
  styles: [":host { display: contents; }"],
  template: `
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
  `,
})
export class AppShell {
  static readonly stComponentName = "AppShell";
  readonly componentName = "AppShell";

  @NgInput() variant: AppShellVariant = "workspace";
  @NgInput() topChrome?: unknown;
  @NgInput() primaryRail?: unknown;
  @NgInput() navigationPanel?: unknown;
  @NgInput() contextPanel?: unknown;
  @NgInput() utilityPanel?: unknown;
  @NgInput() bottomPanel?: unknown;
  @NgInput() mainId = "main";
  @NgInput() navigationLabel = "Workspace navigation";
  @NgInput() contextLabel = "Context panel";
  @NgInput() utilityLabel = "Utility panel";
  @NgInput() utilityMode: AppShellUtilityMode = "reserve";
  @NgInput() utilitySide: AppShellUtilitySide = "right";
  @NgInput() panelCollapse: AppShellPanelCollapse = "stack";
  @NgInput() primaryRailLabel = "Primary rail";
  @NgInput() navigationPanelLabel?: string;
  @NgInput() contextPanelLabel?: string;
  @NgInput() utilityPanelLabel?: string;
  @NgInput("class") classInput?: string;

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
  readonly primaryRailTriggerId = "st-appShell-primaryRail-trigger";
  readonly primaryRailRegionId = "st-appShell-primaryRail-region";
  readonly navigationPanelTriggerId = "st-appShell-navigationPanel-trigger";
  readonly navigationPanelRegionId = "st-appShell-navigationPanel-region";
  readonly contextPanelTriggerId = "st-appShell-contextPanel-trigger";
  readonly contextPanelRegionId = "st-appShell-contextPanel-region";
  readonly utilityPanelTriggerId = "st-appShell-utilityPanel-trigger";
  readonly utilityPanelRegionId = "st-appShell-utilityPanel-region";

  get hostClass(): string {
    return classNames("st-appShell", `st-appShell--${this.variant}`, this.classInput);
  }

  // Resolved disclosure labels: default to the existing aria-label inputs so
  // a consumer who already customized navigationLabel/contextLabel/utilityLabel
  // doesn't need to duplicate the translation for the accordion trigger text.
  get navigationPanelLabelResolved(): string {
    return this.navigationPanelLabel ?? this.navigationLabel;
  }

  get contextPanelLabelResolved(): string {
    return this.contextPanelLabel ?? this.contextLabel;
  }

  get utilityPanelLabelResolved(): string {
    return this.utilityPanelLabel ?? this.utilityLabel;
  }

  get primaryRailRegionCollapsed(): boolean {
    return this.panelCollapse === "accordion" && !this.primaryRailPanelOpen;
  }

  get navigationPanelRegionCollapsed(): boolean {
    return this.panelCollapse === "accordion" && !this.navigationPanelOpen;
  }

  get contextPanelRegionCollapsed(): boolean {
    return this.panelCollapse === "accordion" && !this.contextPanelOpen;
  }

  get utilityPanelRegionCollapsed(): boolean {
    return this.panelCollapse === "accordion" && !this.utilityPanelOpen;
  }

  togglePrimaryRailPanel(): void {
    this.primaryRailPanelOpen = !this.primaryRailPanelOpen;
  }

  toggleNavigationPanel(): void {
    this.navigationPanelOpen = !this.navigationPanelOpen;
  }

  toggleContextPanel(): void {
    this.contextPanelOpen = !this.contextPanelOpen;
  }

  toggleUtilityPanel(): void {
    this.utilityPanelOpen = !this.utilityPanelOpen;
  }
}
