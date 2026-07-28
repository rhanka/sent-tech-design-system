import { Component, ElementRef, Input as NgInput, ViewChild } from "@angular/core";

import { classNames } from "./classNames.js";
import { Icon } from "./Icon.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";
export type AppShellPanelKey = "navigationPanel" | "contextPanel" | "utilityPanel";

// CSS custom property each resizable panel is sized by (see the
// `.st-appShell` base rule in shared styles.css) — setting it inline on the
// shell root is the intended resize mechanism, it simply out-specificities
// the token-driven default declared there. Mirrors Svelte's `PANEL_VAR`.
const PANEL_VAR: Record<AppShellPanelKey, string> = {
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
const PANEL_NOMINAL_PX: Record<AppShellPanelKey, number> = {
  navigationPanel: 320,
  contextPanel: 352,
  utilityPanel: 384,
};

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
  @NgInput() panelResize = false;
  @NgInput() panelWidths?: Partial<Record<AppShellPanelKey, number>>;
  @NgInput() defaultPanelWidths?: Partial<Record<AppShellPanelKey, number>>;
  @NgInput() onPanelResize?: (key: AppShellPanelKey, width: number) => void;
  @NgInput() panelMinWidth = 180;
  @NgInput() panelMaxWidth = 640;

  @ViewChild("navigationPanelEl") private navigationPanelRef?: ElementRef<HTMLElement>;
  @ViewChild("contextPanelEl") private contextPanelRef?: ElementRef<HTMLElement>;
  @ViewChild("utilityPanelEl") private utilityPanelRef?: ElementRef<HTMLElement>;

  // Uncontrolled fallback for resizable widths, seeded on first read from
  // `defaultPanelWidths` (mirrors `internalValue` on TimeRangePicker — a
  // lazy, one-time seed rather than a constructor-time copy, since
  // `@Input()`s aren't bound yet when the class is constructed).
  private internalWidths?: Partial<Record<AppShellPanelKey, number>>;

  // Pointer-drag bookkeeping — plain fields, never read from the template,
  // only from the pointer handlers below.
  private dragKey: AppShellPanelKey | null = null;
  private dragPositive = true;
  private dragStartX = 0;
  private dragStartWidth = 0;

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

  // ── Resizable panels (panelResize) ──────────────────────────────────────
  // Controlled/uncontrolled mirrors the Svelte reference: `panelWidths`
  // present (even as `{}`) means controlled — the component reads it but
  // never writes it; otherwise widths live in `internalWidths`.

  private get isWidthControlled(): boolean {
    return this.panelWidths !== undefined;
  }

  private ensureInternalWidths(): Partial<Record<AppShellPanelKey, number>> {
    if (this.internalWidths === undefined) {
      this.internalWidths = { ...this.defaultPanelWidths };
    }
    return this.internalWidths;
  }

  widthFor(key: AppShellPanelKey): number | undefined {
    const source = this.isWidthControlled ? this.panelWidths : this.ensureInternalWidths();
    return source?.[key];
  }

  clampWidth(n: number): number {
    return Math.min(Math.max(n, this.panelMinWidth), this.panelMaxWidth);
  }

  // Current width for rendering/ARIA — always a concrete, clamped number so
  // aria-valuenow is never NaN and is always within [aria-valuemin, aria-valuemax].
  displayWidth(key: AppShellPanelKey): number {
    return this.clampWidth(this.widthFor(key) ?? PANEL_NOMINAL_PX[key]);
  }

  private panelElFor(key: AppShellPanelKey): HTMLElement | null {
    if (key === "navigationPanel") return this.navigationPanelRef?.nativeElement ?? null;
    if (key === "contextPanel") return this.contextPanelRef?.nativeElement ?? null;
    return this.utilityPanelRef?.nativeElement ?? null;
  }

  // `utilityPanel` mirrors a left panel (grow-on-drag-right) unless it sits
  // on the right edge; the "bottom" side never renders a handle at all
  // (guarded in the template), so its `positive` value is never read.
  get utilityPositive(): boolean {
    return this.utilitySide !== "right";
  }

  // Only the CSS vars for panels with an explicit (controlled or committed)
  // width are emitted — an untouched panel keeps deferring to its token
  // default (`.st-appShell` base rule), so a theme's own width override is
  // never silently overridden just because `panelResize` is on.
  get panelStyle(): string | null {
    if (!this.panelResize) return null;
    const parts: string[] = [];
    for (const key of Object.keys(PANEL_VAR) as AppShellPanelKey[]) {
      const width = this.widthFor(key);
      if (width !== undefined) parts.push(`${PANEL_VAR[key]}: ${this.clampWidth(width)}px`);
    }
    return parts.length ? parts.join("; ") : null;
  }

  private commitWidth(key: AppShellPanelKey, next: number): void {
    const clamped = this.clampWidth(next);
    if (!this.isWidthControlled) {
      const widths = this.ensureInternalWidths();
      this.internalWidths = { ...widths, [key]: clamped };
    }
    this.onPanelResize?.(key, clamped);
  }

  onHandlePointerDown(event: PointerEvent, key: AppShellPanelKey, positive: boolean): void {
    const handle = event.currentTarget as HTMLElement | null;
    handle?.setPointerCapture?.(event.pointerId);
    this.dragKey = key;
    this.dragPositive = positive;
    this.dragStartX = event.clientX;
    const measured = this.panelElFor(key)?.getBoundingClientRect().width ?? 0;
    this.dragStartWidth = measured > 0 ? measured : this.displayWidth(key);
    event.preventDefault();
  }

  onHandlePointerMove(event: PointerEvent): void {
    if (this.dragKey === null) return;
    const dx = event.clientX - this.dragStartX;
    const delta = this.dragPositive ? dx : -dx;
    this.commitWidth(this.dragKey, this.dragStartWidth + delta);
  }

  onHandlePointerUp(event: PointerEvent): void {
    if (this.dragKey === null) return;
    const handle = event.currentTarget as HTMLElement | null;
    if (handle?.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture?.(event.pointerId);
    this.dragKey = null;
  }

  // Arrow keys move the splitter itself (WAI-ARIA window-splitter pattern):
  // for a "positive" (left-edge) panel, moving the splitter right grows it;
  // for a "negative" (right-edge) panel, moving the splitter right shrinks
  // it. Home/End always jump to the absolute clamp bounds.
  onHandleKeydown(event: KeyboardEvent, key: AppShellPanelKey, positive: boolean): void {
    const current = this.displayWidth(key);
    let next: number;
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
}
