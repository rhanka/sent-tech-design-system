import type { CSSProperties, HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import { mergeStyle, useControlled, useEscape } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ToggletipProps = Omit<HTMLAttributes<HTMLSpanElement>, "content" | "className"> & {
  label: ComponentChildren;
  content?: ComponentChildren;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  placement?: "top" | "bottom" | "start" | "end";
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function Toggletip({
  label,
  content,
  open: openInput,
  placement = "top",
  children,
  className,
  style,
  ...rest
}: ToggletipProps) {
  const [open, setOpen] = useControlled(useValue(openInput), false);
  useEscape(open, () => setOpen(false));
  const mergedStyle = mergeStyle(undefined, style);
  return (
    <span
      {...rest}
      className={classNames("st-toggletip", `st-toggletip--${placement}`, className)}
      style={mergedStyle as CSSProperties | undefined}
    >
      <button
        type="button"
        className="st-toggletip__trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      {open ? (
        <span className="st-toggletip__bubble" role="status">
          <span className="st-toggletip__content">{content ?? children}</span>
        </span>
      ) : null}
    </span>
  );
}
