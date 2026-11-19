import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type UtilityPanelMode = "reserve" | "overlay" | "floating";
export type UtilityPanelSide = "left" | "right" | "bottom";

export type UtilityPanelProps = HTMLAttributes<HTMLElement> & {
  mode?: UtilityPanelMode;
  side?: UtilityPanelSide;
  title?: ComponentChildren;
  label?: string;
  collapsed?: MaybeSignal<boolean>;
  header?: ComponentChildren;
  footer?: ComponentChildren;
};

export function UtilityPanel({ mode = "reserve", side = "right", title, label, collapsed: collapsedInput = false, header, footer, className, children, ...rest }: UtilityPanelProps) {
  const collapsed = useValue(collapsedInput);
  return (
    <aside {...rest} className={classNames("st-utilityPanel", `st-utilityPanel--${mode}`, `st-utilityPanel--${side}`, collapsed && "st-utilityPanel--collapsed", className)} aria-label={label ?? (typeof title === "string" ? title : "Utility panel")} data-mode={mode} data-side={side}>
      {(header || title) ? <header className="st-utilityPanel__header">{header ?? <h2 className="st-utilityPanel__title">{title}</h2>}</header> : null}
      {!collapsed ? <div className="st-utilityPanel__body">{children}</div> : null}
      {!collapsed && footer ? <footer className="st-utilityPanel__footer">{footer}</footer> : null}
    </aside>
  );
}
