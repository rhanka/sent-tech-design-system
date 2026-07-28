import React from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "./classNames.js";
import { PanelStackContext, PanelStackVersionContext } from "./PanelStack.js";

export type PanelSectionProps = {
  id: string;
  label: string;
  children?: React.ReactNode;
  /** Optional header-trailing controls (buttons, counts…). */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * PanelSection — one collapsible region inside a {@link PanelStack}. A
 * section outside a PanelStack (no context) falls back to a fully expanded,
 * scroll-owning, non-primary section so it still renders sanely in
 * isolation — but the component is designed to always live inside a stack.
 *
 * Content is mounted ONCE and only ever hidden via CSS on collapse (see
 * `.st-panelSection__body--collapsed` in styles.css) — a chat session, a map
 * or any other stateful widget rendered here survives collapse/expand
 * without remounting.
 */
export function PanelSection({ id, label, children, actions, className }: PanelSectionProps) {
  const stack = React.useContext(PanelStackContext);
  // Subscribe to the stack's version so this section re-renders (and
  // recomputes isPrimary/isExpanded/isScrollOwner) on every registration /
  // expansion / auto-collapse change. The value itself is unused — reading
  // the context is the subscription.
  React.useContext(PanelStackVersionContext);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);

  // Register with the parent stack (mount order) so it can fall back to
  // "the first section" whenever nothing else designates a scroll owner
  // (unset or stale `expanded`/`primary`) — see PanelStack.tsx's `register`.
  // Same register-in-an-effect / return-the-unregister-callback idiom as
  // SelectableRow.
  React.useEffect(() => {
    if (!stack || !rootRef.current || !headerRef.current) return;
    return stack.register(id, rootRef.current, headerRef.current);
  }, [stack, id]);

  const triggerId = `st-panelSection-trigger-${id}`;
  const regionId = `st-panelSection-region-${id}`;

  const isPrimary = stack?.isPrimary(id) ?? false;
  const expanded = stack?.isExpanded(id) ?? true;
  const scrollOwner = stack?.isScrollOwner(id) ?? true;

  function onTriggerClick() {
    stack?.toggle(id);
  }

  const rootClasses = classNames("st-panelSection", scrollOwner && "st-panelSection--scrollOwner", className);

  const bodyClasses = classNames(
    "st-panelSection__body",
    scrollOwner
      ? "st-panelSection__body--scrollOwner"
      : !expanded
        ? "st-panelSection__body--collapsed"
        : null,
  );

  return (
    <div className={rootClasses} data-panel-section-id={id} ref={rootRef}>
      <div className="st-panelSection__header" ref={headerRef}>
        <h3 className="st-panelSection__heading">
          {isPrimary ? (
            <span className="st-panelSection__title st-panelSection__title--primary" id={triggerId}>
              {label}
            </span>
          ) : (
            <button
              type="button"
              className="st-panelSection__trigger"
              aria-expanded={expanded ? "true" : "false"}
              aria-controls={regionId}
              id={triggerId}
              onClick={onTriggerClick}
            >
              <span className="st-panelSection__title">{label}</span>
              <span
                className={classNames("st-panelSection__icon", expanded && "st-panelSection__icon--expanded")}
                aria-hidden="true"
              >
                <ChevronDown size={18} strokeWidth={2.25} aria-hidden="true" />
              </span>
            </button>
          )}
        </h3>
        {actions != null ? <div className="st-panelSection__actions">{actions}</div> : null}
      </div>
      {/* Mounted once, always — collapsing is purely a class/CSS concern
          (sizing + hiding this region), never a conditional block. */}
      <div className={bodyClasses} role="region" id={regionId} aria-labelledby={triggerId}>
        {children}
      </div>
    </div>
  );
}

PanelSection.displayName = "PanelSection";
