import type { CSSProperties, HTMLAttributes } from "preact";
import { useRef, useState } from "preact/hooks";
import { ChevronDown } from "lucide-preact";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. The accordion disclosures render a lucide
// `<svg>` (camelCase `strokeWidth`); without this import a bundler applying
// `sideEffects` barrel optimisation (or a direct deep import) would never
// evaluate runtime.js and the attribute would revert to the broken literal.
import "./runtime.js";
import type { ComponentChildren, TargetedKeyboardEvent, TargetedPointerEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";
export type AppShellPanelKey = "navigationPanel" | "contextPanel" | "utilityPanel";

// CSS custom property each resizable panel is sized by (see the
// `.st-appShell` base rule in styles.css) — setting it inline on the shell
// root is the intended resize mechanism, it simply out-specificities the
// token-driven default declared there.
const PANEL_VAR: Record<AppShellPanelKey, string> = {
  navigationPanel: "--st-appShell-navigation-width",
  contextPanel: "--st-appShell-context-width",
  utilityPanel: "--st-appShell-utility-width",
};

// Nominal px equivalent of each panel's own CSS-token default — used ONLY as
// a display/ARIA fallback (aria-valuenow, drag-start anchor) before any
// width has ever been supplied or committed. Never written back as an inline
// style, so a themed override of the underlying token is never fought until
// the consumer/user actually establishes a concrete width.
// NOTE: `primaryRail` is intentionally NOT a resizable panel — it is a
// fixed-width icon rail (à la VS Code's activity bar), not a splittable
// pane; see `AppShellPanelKey`.
const PANEL_NOMINAL_PX: Record<AppShellPanelKey, number> = {
  navigationPanel: 320,
  contextPanel: 352,
  utilityPanel: 384,
};

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AppShellVariant;
  topChrome?: ComponentChildren;
  primaryRail?: ComponentChildren;
  navigationPanel?: ComponentChildren;
  main?: ComponentChildren;
  contextPanel?: ComponentChildren;
  utilityPanel?: ComponentChildren;
  bottomPanel?: ComponentChildren;
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
   * rendering is IDENTICAL in both modes — side panels stay side-by-side
   * columns. Panel content is mounted once regardless of mode/breakpoint;
   * collapsing hides/sizes the region rather than destroying it, so stateful
   * widgets (maps, live panels…) mounted in a panel never remount.
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
  bottomPanelLabel?: string;
  /** Enables drag-to-resize handles on side panels above 48rem. Default false — zero regression. */
  panelResize?: MaybeSignal<boolean>;
  /** Controlled panel widths in px. When provided the component never mutates width itself. */
  panelWidths?: MaybeSignal<Partial<Record<AppShellPanelKey, number>>>;
  /** Seeds uncontrolled widths in px. */
  defaultPanelWidths?: Partial<Record<AppShellPanelKey, number>>;
  /** Fired on every committed resize. Persistence is the CONSUMER's job — the DS stays presentational. */
  onPanelResize?: (key: AppShellPanelKey, width: number) => void;
  /** Lower clamp in px. Default 180. */
  panelMinWidth?: number;
  /** Upper clamp in px. Default 640. */
  panelMaxWidth?: number;
};

function PanelDisclosure({
  panelKey,
  label,
  open,
  onToggle,
  children,
}: {
  panelKey: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ComponentChildren;
}) {
  const triggerId = `st-appShell-${panelKey}-trigger`;
  const regionId = `st-appShell-${panelKey}-region`;
  return (
    <>
      <button
        type="button"
        className="st-appShell__panelDisclosure"
        aria-expanded={open ? "true" : "false"}
        aria-controls={regionId}
        id={triggerId}
        onClick={onToggle}
      >
        <span className="st-appShell__panelDisclosureLabel">{label}</span>
        <span
          className={classNames(
            "st-appShell__panelDisclosureIcon",
            open && "st-appShell__panelDisclosureIcon--expanded",
          )}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </span>
      </button>
      <div
        className={classNames("st-appShell__panelRegion", !open && "st-appShell__panelRegion--collapsed")}
        id={regionId}
        role="region"
        aria-labelledby={triggerId}
      >
        {children}
      </div>
    </>
  );
}

export function AppShell({
  variant = "workspace",
  topChrome,
  primaryRail,
  navigationPanel,
  main,
  contextPanel,
  utilityPanel,
  bottomPanel,
  mainId = "main",
  navigationLabel = "Workspace navigation",
  contextLabel = "Context panel",
  utilityLabel = "Utility panel",
  utilityMode = "reserve",
  utilitySide = "right",
  panelCollapse = "stack",
  primaryRailLabel = "Primary rail",
  navigationPanelLabel,
  contextPanelLabel,
  utilityPanelLabel,
  bottomPanelLabel = "Workspace tools",
  panelResize: panelResizeInput = false,
  panelWidths: panelWidthsInput,
  defaultPanelWidths,
  onPanelResize,
  panelMinWidth = 180,
  panelMaxWidth = 640,
  className,
  children,
  ...rest
}: AppShellProps) {
  const panelResize = useValue(panelResizeInput);
  const panelWidths = useValue(panelWidthsInput);
  // Uncontrolled per-panel disclosure state (v1) — each accordion panel starts
  // collapsed. Desktop rendering never reads these (CSS scopes the collapse to
  // `@media (max-width: 48rem)`), so they have zero effect above the breakpoint.
  const [primaryRailOpen, setPrimaryRailOpen] = useState(false);
  const [navigationPanelOpen, setNavigationPanelOpen] = useState(false);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [utilityPanelOpen, setUtilityPanelOpen] = useState(false);

  // Resolved disclosure labels: default to the existing aria-label props so a
  // consumer who already customized navigationLabel/contextLabel/utilityLabel
  // doesn't need to duplicate the translation for the accordion trigger text.
  const navigationPanelLabelResolved = navigationPanelLabel ?? navigationLabel;
  const contextPanelLabelResolved = contextPanelLabel ?? contextLabel;
  const utilityPanelLabelResolved = utilityPanelLabel ?? utilityLabel;

  // ── Resizable panels (panelResize) ────────────────────────────────────────
  // Controlled/uncontrolled mirrors RangeSlider.tsx: `panelWidths` present
  // (even as `{}`) means controlled — the component reads it but never writes
  // it; otherwise widths live in `internalWidths`, seeded once (lazy
  // initializer, like Svelte's `untrack`) from `defaultPanelWidths`.
  const [internalWidths, setInternalWidths] = useState<Partial<Record<AppShellPanelKey, number>>>(
    () => ({ ...defaultPanelWidths }),
  );

  const navigationPanelRef = useRef<HTMLElement | null>(null);
  const contextPanelRef = useRef<HTMLElement | null>(null);
  const utilityPanelRef = useRef<HTMLElement | null>(null);

  const isWidthControlled = panelWidths !== undefined;

  // `utilityPanel` mirrors a left panel (grow-on-drag-right) unless it sits on
  // the right edge; the "bottom" side never renders a handle at all (checked
  // at the call sites), so its `positive` value is never read.
  const utilityPositive = utilitySide !== "right";

  function widthFor(key: AppShellPanelKey): number | undefined {
    const source = isWidthControlled ? panelWidths : internalWidths;
    return source?.[key];
  }

  function clampWidth(n: number): number {
    return Math.min(Math.max(n, panelMinWidth), panelMaxWidth);
  }

  // Current width for rendering/ARIA — always a concrete, clamped number so
  // aria-valuenow is never NaN and is always within [aria-valuemin, aria-valuemax].
  function displayWidth(key: AppShellPanelKey): number {
    return clampWidth(widthFor(key) ?? PANEL_NOMINAL_PX[key]);
  }

  function panelElFor(key: AppShellPanelKey): HTMLElement | null {
    if (key === "navigationPanel") return navigationPanelRef.current;
    if (key === "contextPanel") return contextPanelRef.current;
    return utilityPanelRef.current;
  }

  function commitWidth(key: AppShellPanelKey, next: number) {
    const clamped = clampWidth(next);
    if (!isWidthControlled) setInternalWidths((prev) => ({ ...prev, [key]: clamped }));
    onPanelResize?.(key, clamped);
  }

  // Pointer-drag bookkeeping — a plain mutable ref (never triggers a
  // re-render on its own), read/written only from the pointer handlers below.
  const dragRef = useRef<{
    key: AppShellPanelKey | null;
    positive: boolean;
    startX: number;
    startWidth: number;
  }>({ key: null, positive: true, startX: 0, startWidth: 0 });

  function onHandlePointerDown(event: TargetedPointerEvent<HTMLDivElement>, key: AppShellPanelKey, positive: boolean) {
    const handle = event.currentTarget;
    handle.setPointerCapture?.(event.pointerId);
    dragRef.current.key = key;
    dragRef.current.positive = positive;
    dragRef.current.startX = event.clientX;
    const measured = panelElFor(key)?.getBoundingClientRect().width ?? 0;
    dragRef.current.startWidth = measured > 0 ? measured : displayWidth(key);
    event.preventDefault();
  }

  function onHandlePointerMove(event: TargetedPointerEvent<HTMLDivElement>) {
    if (dragRef.current.key === null) return;
    const dx = event.clientX - dragRef.current.startX;
    const delta = dragRef.current.positive ? dx : -dx;
    commitWidth(dragRef.current.key, dragRef.current.startWidth + delta);
  }

  function onHandlePointerUp(event: TargetedPointerEvent<HTMLDivElement>) {
    if (dragRef.current.key === null) return;
    const handle = event.currentTarget;
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture?.(event.pointerId);
    dragRef.current.key = null;
  }

  // Arrow keys move the splitter itself (WAI-ARIA window-splitter pattern):
  // for a "positive" (left-edge) panel, moving the splitter right grows it;
  // for a "negative" (right-edge) panel, moving the splitter right shrinks
  // it. Home/End always jump to the absolute clamp bounds.
  function onHandleKeydown(event: TargetedKeyboardEvent<HTMLDivElement>, key: AppShellPanelKey, positive: boolean) {
    const current = displayWidth(key);
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = current + (positive ? -16 : 16);
        break;
      case "ArrowRight":
        next = current + (positive ? 16 : -16);
        break;
      case "Home":
        next = panelMinWidth;
        break;
      case "End":
        next = panelMaxWidth;
        break;
      default:
        return;
    }
    event.preventDefault();
    commitWidth(key, next);
  }

  // Only the CSS vars for panels with an explicit (controlled or committed)
  // width are emitted — an untouched panel keeps deferring to its token
  // default (`.st-appShell` base rule), so a theme's own width override is
  // never silently overridden just because `panelResize` is on.
  let panelStyleVars: Record<string, string> | undefined;
  if (panelResize) {
    const vars: Record<string, string> = {};
    for (const key of Object.keys(PANEL_VAR) as AppShellPanelKey[]) {
      const width = widthFor(key);
      if (width !== undefined) vars[PANEL_VAR[key]] = `${clampWidth(width)}px`;
    }
    panelStyleVars = Object.keys(vars).length ? vars : undefined;
  }

  // Merge onto any consumer-supplied `style` (from `...rest`) rather than
  // clobbering it; when `panelResize` is off this evaluates to exactly
  // `rest.style`, so the rendered attribute is byte-identical to today. When
  // on, the computed panel vars win over the consumer style (same precedence
  // as components-react's `{...rest.style, ...vars}` spread); a string
  // consumer style leads the serialised text for the same reason.
  const styleInput: unknown = rest.style;
  let unwrappedStyle: unknown = styleInput;
  if (typeof unwrappedStyle === "object" && unwrappedStyle !== null && "peek" in unwrappedStyle) {
    try {
      unwrappedStyle = (unwrappedStyle as unknown as { value: unknown }).value;
    } catch {
      unwrappedStyle = undefined;
    }
  }
  let styleProp: CSSProperties | string | undefined;
  if (panelStyleVars) {
    const varsText = (Object.entries(panelStyleVars) as Array<[string, string]>)
      .map(([name, value]) => `${name}:${value};`)
      .join("");
    styleProp =
      typeof unwrappedStyle === "string"
        ? `${unwrappedStyle === "" || unwrappedStyle.endsWith(";") ? unwrappedStyle : `${unwrappedStyle};`}${varsText}`
        : (mergeStyle(unwrappedStyle as CSSProperties | undefined, panelStyleVars as unknown as CSSProperties) as
            | CSSProperties
            | undefined);
  } else {
    // No computed vars: pass the (unwrapped) consumer style through, exactly
    // like components-react renders `rest.style` here.
    styleProp = (unwrappedStyle ?? undefined) as CSSProperties | string | undefined;
  }

  if (variant === "site") {
    return (
      <div {...rest} className={classNames("st-appShell st-appShell--site", className)} data-st-app-shell-variant="site">
        {topChrome ?? children}
      </div>
    );
  }

  const isAccordion = panelCollapse === "accordion";

  return (
    <div
      {...rest}
      className={classNames("st-appShell st-appShell--workspace", className)}
      data-st-app-shell-variant="workspace"
      data-utility-mode={utilityMode}
      data-utility-side={utilitySide}
      data-panel-collapse={panelCollapse}
      // A string consumer style only occurs on the Preact leg (React's own
      // types only admit an object); the cast mirrors DashboardGrid.
      style={styleProp as CSSProperties | undefined}
    >
      {topChrome ? <div className="st-appShell__topChrome">{topChrome}</div> : null}
      <div className="st-appShell__body">
        {primaryRail ? (
          <aside className="st-appShell__primaryRail" aria-label={primaryRailLabel}>
            {isAccordion ? (
              <PanelDisclosure
                panelKey="primaryRail"
                label={primaryRailLabel}
                open={primaryRailOpen}
                onToggle={() => setPrimaryRailOpen((v) => !v)}
              >
                {primaryRail}
              </PanelDisclosure>
            ) : (
              primaryRail
            )}
            {/* No resize handle here: `primaryRail` is a fixed-width icon
                rail (à la VS Code's activity bar), not a resizable panel —
                see `AppShellPanelKey`. */}
          </aside>
        ) : null}
        {navigationPanel ? (
          <aside className="st-appShell__navigationPanel" aria-label={navigationLabel} ref={navigationPanelRef}>
            {isAccordion ? (
              <PanelDisclosure
                panelKey="navigationPanel"
                label={navigationPanelLabelResolved}
                open={navigationPanelOpen}
                onToggle={() => setNavigationPanelOpen((v) => !v)}
              >
                {navigationPanel}
              </PanelDisclosure>
            ) : (
              navigationPanel
            )}
            {panelResize ? (
              <div
                className="st-appShell__resizeHandle"
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                aria-valuenow={displayWidth("navigationPanel")}
                aria-valuemin={panelMinWidth}
                aria-valuemax={panelMaxWidth}
                aria-label={`Resize ${navigationLabel}`}
                onPointerDown={(event) => onHandlePointerDown(event, "navigationPanel", true)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
                onKeyDown={(event) => onHandleKeydown(event, "navigationPanel", true)}
              />
            ) : null}
          </aside>
        ) : null}
        <main className="st-appShell__main" id={mainId}>{main ?? children}</main>
        {contextPanel ? (
          <aside className="st-appShell__contextPanel" aria-label={contextLabel} ref={contextPanelRef}>
            {isAccordion ? (
              <PanelDisclosure
                panelKey="contextPanel"
                label={contextPanelLabelResolved}
                open={contextPanelOpen}
                onToggle={() => setContextPanelOpen((v) => !v)}
              >
                {contextPanel}
              </PanelDisclosure>
            ) : (
              contextPanel
            )}
            {panelResize ? (
              <div
                className="st-appShell__resizeHandle"
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                aria-valuenow={displayWidth("contextPanel")}
                aria-valuemin={panelMinWidth}
                aria-valuemax={panelMaxWidth}
                aria-label={`Resize ${contextLabel}`}
                onPointerDown={(event) => onHandlePointerDown(event, "contextPanel", false)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onKeyDown={(event) => onHandleKeydown(event, "contextPanel", false)}
              />
            ) : null}
          </aside>
        ) : null}
        {utilityPanel ? (
          <aside className="st-appShell__utilityPanel" aria-label={utilityLabel} ref={utilityPanelRef}>
            {isAccordion ? (
              <PanelDisclosure
                panelKey="utilityPanel"
                label={utilityPanelLabelResolved}
                open={utilityPanelOpen}
                onToggle={() => setUtilityPanelOpen((v) => !v)}
              >
                {utilityPanel}
              </PanelDisclosure>
            ) : (
              utilityPanel
            )}
            {panelResize && utilitySide !== "bottom" ? (
              <div
                className="st-appShell__resizeHandle"
                role="separator"
                aria-orientation="vertical"
                tabIndex={0}
                aria-valuenow={displayWidth("utilityPanel")}
                aria-valuemin={panelMinWidth}
                aria-valuemax={panelMaxWidth}
                aria-label={`Resize ${utilityLabel}`}
                onPointerDown={(event) => onHandlePointerDown(event, "utilityPanel", utilityPositive)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
                onKeyDown={(event) => onHandleKeydown(event, "utilityPanel", utilityPositive)}
              />
            ) : null}
          </aside>
        ) : null}
      </div>
      {bottomPanel ? <section className="st-appShell__bottomPanel" aria-label={bottomPanelLabel}>{bottomPanel}</section> : null}
    </div>
  );
}
