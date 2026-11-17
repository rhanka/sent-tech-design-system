import type { HTMLAttributes } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, trapTabKey, useBodyScrollLock, useEscape } from "./internal.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type DrawerProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  title?: ComponentChildren;
  description?: ComponentChildren;
  footer?: ComponentChildren;
  placement?: "left" | "right" | "bottom";
  onClose?: () => void;
  closeLabel?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function Drawer({
  open: openInput = false,
  title,
  description,
  footer,
  placement = "right",
  onClose,
  closeLabel = "Close",
  children,
  className,
  onKeyDown,
  ...rest
}: DrawerProps) {
  const open = useValue(openInput);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock(open);
  useEscape(open, onClose);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onTrapKeyDown = (event: KeyboardEvent) => trapTabKey(event, panelRef.current);
    document.addEventListener("keydown", onTrapKeyDown);
    return () => document.removeEventListener("keydown", onTrapKeyDown);
  }, [open]);
  // The focus trap runs first; the consumer handler still fires once per
  // keydown (Popover/Tooltip precedent) instead of being dropped behind
  // the internal prop placed after the rest spread.
  const handleKeyDown = (event: TargetedKeyboardEvent<HTMLElement>) => {
    trapTabKey(event, panelRef.current);
    onKeyDown?.(event);
  };
  if (!open) return null;
  return (
    <div
      className="st-drawer__backdrop"
      data-testid="st-drawer-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        {...rest}
        ref={panelRef}
        className={classNames("st-drawer", `st-drawer--${placement}`, className)}
        role="dialog"
        aria-modal="true"
        aria-label={text(title) || "Drawer"}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="st-drawer__header">
          {title ? <h2 className="st-drawer__title">{title}</h2> : null}
          <button ref={closeRef} type="button" className="st-drawer__close" onClick={onClose} aria-label={closeLabel}>
            x
          </button>
        </div>
        {description ? <p className="st-drawer__description">{description}</p> : null}
        <div className="st-drawer__body">{children}</div>
        {footer ? <div className="st-drawer__footer">{footer}</div> : null}
      </aside>
    </div>
  );
}
