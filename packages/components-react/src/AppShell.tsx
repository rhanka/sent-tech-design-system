import React from "react";
import { classNames } from "./classNames.js";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";

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
};

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
  className,
  children,
  ...rest
}: AppShellProps) {
  if (variant === "site") {
    return (
      <div {...rest} className={classNames("st-appShell st-appShell--site", className)} data-st-app-shell-variant="site">
        {topChrome ?? children}
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={classNames("st-appShell st-appShell--workspace", className)}
      data-st-app-shell-variant="workspace"
      data-utility-mode={utilityMode}
      data-utility-side={utilitySide}
    >
      {topChrome ? <div className="st-appShell__topChrome">{topChrome}</div> : null}
      <div className="st-appShell__body">
        {primaryRail ? <aside className="st-appShell__primaryRail" aria-label="Primary rail">{primaryRail}</aside> : null}
        {navigationPanel ? <aside className="st-appShell__navigationPanel" aria-label={navigationLabel}>{navigationPanel}</aside> : null}
        <main className="st-appShell__main" id={mainId}>{main ?? children}</main>
        {contextPanel ? <aside className="st-appShell__contextPanel" aria-label={contextLabel}>{contextPanel}</aside> : null}
        {utilityPanel ? <aside className="st-appShell__utilityPanel" aria-label={utilityLabel}>{utilityPanel}</aside> : null}
      </div>
      {bottomPanel ? <section className="st-appShell__bottomPanel" aria-label="Workspace tools">{bottomPanel}</section> : null}
    </div>
  );
}
