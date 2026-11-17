import type { HTMLAttributes } from "preact";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { focusWithin } from "./runtime.js";
import type { ComponentChildren, TargetedFocusEvent, TargetedMouseEvent } from "./runtime.js";

export type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, "content"> & {
  content: ComponentChildren;
  placement?: "top" | "bottom";
};

export function Tooltip({
  content,
  placement = "top",
  children,
  className,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const hostRef = useRef<HTMLSpanElement>(null);
  // Preact-only `onFocusIn` arrives in the rest props (it is not part of the
  // React types, so it stays out of `TooltipProps` to keep parity): pull it
  // out so the `focusWithin` spread below does not drop it.
  const { onFocusIn: onFocusInProp, ...hostRest } = rest as typeof rest & {
    onFocusIn?: (event: TargetedFocusEvent<HTMLSpanElement>) => void;
  };
  // Internal visibility runs first; the consumer handler still fires once per
  // event (CopyButton precedent). `onFocus` (and Preact's `onFocusIn`) are
  // composed here because the `focusWithin` spread below would otherwise
  // overwrite the consumer handler from the rest props.
  const showMouse = (event: TargetedMouseEvent<HTMLSpanElement>) => {
    setOpen(true);
    onMouseEnter?.(event);
  };
  const hideBlur = (event: TargetedFocusEvent<HTMLSpanElement>) => {
    setOpen(false);
    onBlur?.(event);
  };
  const hideMouse = (event: TargetedMouseEvent<HTMLSpanElement>) => {
    setOpen(false);
    onMouseLeave?.(event);
  };
  const showFocus = (event: TargetedFocusEvent<HTMLSpanElement>) => {
    setOpen(true);
    onFocus?.(event);
    onFocusInProp?.(event);
  };
  const hide = () => setOpen(false);
  // `focusWithin` hears a descendant receiving focus on both runtimes (Preact
  // `onFocus` does not bubble); the matching hide runs on a document `focusin`
  // listener while open, so keyboard focus leaving the host closes the bubble
  // exactly like a bubbling `onBlur` would in React.
  useEffect(() => {
    if (!open) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && hostRef.current && !hostRef.current.contains(target)) hide();
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open]);
  return (
    <span
      {...hostRest}
      ref={hostRef}
      className={classNames("st-tooltip", `st-tooltip--${placement}`, className)}
      {...focusWithin(showFocus)}
      onBlur={hideBlur}
      onMouseEnter={showMouse}
      onMouseLeave={hideMouse}
    >
      <span className="st-tooltip__trigger">{children}</span>
      <span id={tooltipId} className="st-tooltip__content" role="tooltip" aria-hidden={open ? "false" : "true"}>
        {content}
      </span>
    </span>
  );
}
