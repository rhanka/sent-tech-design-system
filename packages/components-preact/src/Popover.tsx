import { isValidElement } from "preact";
import type { HTMLAttributes } from "preact";
import { useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, useControlled, useEscape, useOutsideMouseDown } from "./internal.js";
import type { ComponentChildren, TargetedMouseEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type PopoverProps = Omit<HTMLAttributes<HTMLElement>, "content"> & {
  trigger?: ComponentChildren;
  content?: ComponentChildren;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  label?: string;
  placement?: "top" | "right" | "bottom" | "left";
};

export function Popover({
  trigger,
  content,
  open: openInput,
  label: labelProp,
  placement = "bottom",
  children,
  className,
  onClick,
  ...rest
}: PopoverProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useControlled(useValue(openInput), false);
  const triggerNode = trigger ?? children;
  const contentNode = content ?? (trigger ? children : null);
  const label =
    labelProp ??
    (text(
      isValidElement(triggerNode) ? (triggerNode.props as { children?: ComponentChildren }).children : triggerNode,
    ) ||
      "Popover");
  useOutsideMouseDown(open, hostRef, () => setOpen(false));
  useEscape(open, () => setOpen(false));

  // The consumer `onClick` runs after the host opens, so both fire once per
  // click (CopyButton precedent). The hand-written twin drops the consumer
  // handler here; preserving it is a recorded behaviour change
  // (`consumer-handler-preserved` in coverage-manifest.json).
  const handleClick = (event: TargetedMouseEvent<HTMLElement>) => {
    setOpen(true);
    onClick?.(event);
  };

  return (
    <span {...rest} ref={hostRef} className={classNames("st-popover-host", className)} onClick={handleClick}>
      {triggerNode}
      {open ? (
        <section className={classNames("st-popover", `st-popover--${placement}`)} role="dialog" aria-label={label}>
          {contentNode}
        </section>
      ) : null}
    </span>
  );
}
