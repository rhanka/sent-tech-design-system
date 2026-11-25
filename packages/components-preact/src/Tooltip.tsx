import type { CSSProperties, HTMLAttributes } from "preact";
import { useEffect, useId, useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { mergeStyle } from "./internal.js";
import { focusWithin } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, "content" | "className"> & {
  content: ComponentChildren;
  placement?: "top" | "bottom";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function Tooltip({ content, placement = "top", children, className, style, ...rest }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const hostRef = useRef<HTMLSpanElement>(null);
  const show = () => setOpen(true);
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
  const mergedStyle = mergeStyle(undefined, style);
  return (
    <span
      {...rest}
      ref={hostRef}
      className={classNames("st-tooltip", `st-tooltip--${placement}`, className)}
      style={mergedStyle as CSSProperties | undefined}
      {...focusWithin(show)}
      onBlur={hide}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span className="st-tooltip__trigger">{children}</span>
      <span id={tooltipId} className="st-tooltip__content" role="tooltip" aria-hidden={open ? "false" : "true"}>
        {content}
      </span>
    </span>
  );
}
