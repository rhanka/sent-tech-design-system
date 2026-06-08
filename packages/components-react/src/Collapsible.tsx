import React from "react";
import { ChevronDown } from "lucide-react";
import { classNames } from "./classNames.js";

export type CollapsibleProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "title"> & {
  /** État ouvert (contrôlable). */
  open?: boolean;
  title: string;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
};

export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open: openProp, title, disabled = false, onToggle, className, children, ...rest }, ref) => {
    const reactId = React.useId();
    const uid = `st-collapsible-${reactId}`;
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(openProp ?? false);
    const open = isControlled ? openProp : internalOpen;

    const classes = classNames("st-collapsible", open && "st-collapsible--open", className);

    function toggle() {
      if (disabled) return;
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
          disabled={disabled}
          onClick={toggle}
        >
          <span className="st-collapsible__title">{title}</span>
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
