import React from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "./classNames.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";
export type AppShellPanelCollapse = "stack" | "accordion";

export type AppShellProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AppShellVariant;
  topChrome?: React.ReactNode;
  primaryRail?: React.ReactNode;
  navigationPanel?: React.ReactNode;
  main?: React.ReactNode;
  contextPanel?: React.ReactNode;
  utilityPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
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
  children: React.ReactNode;
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
  className,
  children,
  ...rest
}: AppShellProps) {
  // Uncontrolled per-panel disclosure state (v1) — each accordion panel starts
  // collapsed. Desktop rendering never reads these (CSS scopes the collapse to
  // `@media (max-width: 48rem)`), so they have zero effect above the breakpoint.
  const [primaryRailOpen, setPrimaryRailOpen] = React.useState(false);
  const [navigationPanelOpen, setNavigationPanelOpen] = React.useState(false);
  const [contextPanelOpen, setContextPanelOpen] = React.useState(false);
  const [utilityPanelOpen, setUtilityPanelOpen] = React.useState(false);

  // Resolved disclosure labels: default to the existing aria-label props so a
  // consumer who already customized navigationLabel/contextLabel/utilityLabel
  // doesn't need to duplicate the translation for the accordion trigger text.
  const navigationPanelLabelResolved = navigationPanelLabel ?? navigationLabel;
  const contextPanelLabelResolved = contextPanelLabel ?? contextLabel;
  const utilityPanelLabelResolved = utilityPanelLabel ?? utilityLabel;

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
          </aside>
        ) : null}
        {navigationPanel ? (
          <aside className="st-appShell__navigationPanel" aria-label={navigationLabel}>
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
          </aside>
        ) : null}
        <main className="st-appShell__main" id={mainId}>{main ?? children}</main>
        {contextPanel ? (
          <aside className="st-appShell__contextPanel" aria-label={contextLabel}>
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
          </aside>
        ) : null}
        {utilityPanel ? (
          <aside className="st-appShell__utilityPanel" aria-label={utilityLabel}>
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
          </aside>
        ) : null}
      </div>
      {bottomPanel ? <section className="st-appShell__bottomPanel" aria-label={bottomPanelLabel}>{bottomPanel}</section> : null}
    </div>
  );
}
