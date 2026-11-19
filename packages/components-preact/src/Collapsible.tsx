import { ChevronDown } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useId, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type CollapsibleProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "className" | "title" | "onToggle"
> & {
  /** État ouvert (contrôlable). */
  open?: MaybeSignal<boolean>;
  title: string;
  disabled?: MaybeSignal<boolean>;
  /**
   * Trailing content rendered inside the trigger, BETWEEN the title and the
   * chevron (e.g. a count Badge, a status Tag, a glyph). The chevron stays the
   * rightmost affordance. If the trailing content carries information SR users
   * need as part of the trigger name, set `aria-label` on the Collapsible via
   * `...rest`. Additive: with `trailing` unset the trigger renders
   * byte-identically to before.
   */
  trailing?: ComponentChildren;
  onToggle?: (open: boolean) => void;
  className?: MaybeSignal<string>;
};

export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open: openInput, title, disabled = false, trailing, onToggle, className, children, ...rest }, ref) => {
    const reactId = useId();
    const uid = `st-collapsible-${reactId}`;
    const openValue = useValue(openInput);
    const isDisabled = useValue(disabled);
    const isControlled = openInput !== undefined;
    const [internalOpen, setInternalOpen] = useState(openValue ?? false);
    const open = isControlled ? openValue : internalOpen;

    const classes = classNames("st-collapsible", open && "st-collapsible--open", className);

    function toggle() {
      if (isDisabled) return;
      const next = !open;
      if (!isControlled) setInternalOpen(next);
      onToggle?.(next);
    }

    return (
      <div {...rest} ref={ref} className={classes}>
        <button
          type="button"
          className="st-collapsible__trigger"
          aria-expanded={open ? "true" : "false"}
          aria-controls={`${uid}-region`}
          id={`${uid}-trigger`}
          disabled={isDisabled}
          onClick={toggle}
        >
          <span className="st-collapsible__title">{title}</span>
          {trailing != null ? (
            <span className="st-collapsible__trailing">{trailing}</span>
          ) : null}
          <span className="st-collapsible__icon" aria-hidden="true">
            <ChevronDown size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </button>
        {open ? (
          <div
            className="st-collapsible__region"
            role="region"
            id={`${uid}-region`}
            aria-labelledby={`${uid}-trigger`}
          >
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);

Collapsible.displayName = "Collapsible";
