import type { HTMLAttributes } from "preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { focusOut, focusWithin } from "./runtime.js";
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
  // `focusOut` hears focus leaving the host or any descendant on both
  // runtimes (Preact's `onBlur` does not bubble; React's does), so the bubble
  // closes wherever focus goes — a sibling, another region or `body`, which
  // fires no `focusin` for a document listener to hear.
  const hideFocus = (event: TargetedFocusEvent<HTMLSpanElement>) => {
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
  return (
    <span
      {...hostRest}
      className={classNames("st-tooltip", `st-tooltip--${placement}`, className)}
      {...focusWithin(showFocus)}
      {...focusOut(hideFocus)}
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
