import { ArrowUp } from "lucide-preact";
import type { ButtonHTMLAttributes } from "preact";
import { useEffect, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { forwardRef } from "./runtime.js";
import type { TargetedMouseEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type BackToTopProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  label?: string;
  disabled?: MaybeSignal<boolean>;
  targetId?: string;
  threshold?: number;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  autoHide?: MaybeSignal<boolean>;
  smooth?: MaybeSignal<boolean>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export const BackToTop = forwardRef<HTMLButtonElement, BackToTopProps>(
  (
    {
      label = "Retour en haut",
      targetId = "top",
      threshold = 240,
      autoHide: autoHideInput = true,
      smooth: smoothInput = true,
      disabled: disabledInput = false,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const autoHide = useValue(autoHideInput);
    const smooth = useValue(smoothInput);
    const disabled = useValue(disabledInput) ?? false;
    const normalizedTarget = targetId ? `#${targetId.replace(/^#/, "")}` : "#top";

    const [visible, setVisible] = useState(!autoHide);

    useEffect(() => {
      if (!autoHide || typeof window === "undefined") {
        setVisible(true);
        return;
      }

      const updateVisibility = () => {
        setVisible(window.scrollY > threshold);
      };

      updateVisibility();
      window.addEventListener("scroll", updateVisibility, { passive: true });

      return () => {
        window.removeEventListener("scroll", updateVisibility);
      };
    }, [autoHide, threshold]);

    const goTop = () => {
      const target = normalizedTarget;
      const anchor = target.startsWith("#") ? target.slice(1) : target;
      const element = anchor ? document.getElementById(anchor) : null;

      if (element) {
        element.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "start",
        });
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    };

    const hidden = autoHide && !visible;

    // The consumer `onClick` runs first, then `goTop` scrolls (intentionally
    // reversed vs Popover, which opens first; neither handler reads
    // `defaultPrevented`, so the order is observable only via call sequence),
    // so both fire once per click instead of the consumer handler being
    // dropped behind the internal prop placed after the rest spread.
    const handleClick = (event: TargetedMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      goTop();
    };

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        className={classNames("st-backToTop", className)}
        onClick={handleClick}
        aria-label={label}
        aria-hidden={hidden || undefined}
        aria-live={hidden ? "polite" : undefined}
        tabIndex={hidden ? -1 : undefined}
        disabled={disabled}
      >
        <span className="st-backToTop__icon" aria-hidden="true">
          <ArrowUp size={16} />
        </span>
        <span className="st-backToTop__label">{label}</span>
      </button>
    );
  },
);

BackToTop.displayName = "BackToTop";
