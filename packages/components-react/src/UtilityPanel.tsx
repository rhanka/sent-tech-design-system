import React from "react";
import { classNames } from "./classNames.js";

export type UtilityPanelMode = "reserve" | "overlay" | "floating";
export type UtilityPanelSide = "left" | "right" | "bottom";

export type UtilityPanelProps = React.HTMLAttributes<HTMLElement> & {
  mode?: UtilityPanelMode;
  side?: UtilityPanelSide;
  title?: React.ReactNode;
  label?: string;
  collapsed?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

export function UtilityPanel({ mode = "reserve", side = "right", title, label, collapsed = false, header, footer, className, children, ...rest }: UtilityPanelProps) {
  return (
    <aside {...rest} className={classNames("st-utilityPanel", `st-utilityPanel--${mode}`, `st-utilityPanel--${side}`, collapsed && "st-utilityPanel--collapsed", className)} aria-label={label ?? (typeof title === "string" ? title : "Utility panel")} data-mode={mode} data-side={side}>
      {(header || title) ? <header className="st-utilityPanel__header">{header ?? <h2 className="st-utilityPanel__title">{title}</h2>}</header> : null}
      {!collapsed ? <div className="st-utilityPanel__body">{children}</div> : null}
      {!collapsed && footer ? <footer className="st-utilityPanel__footer">{footer}</footer> : null}
    </aside>
  );
}
