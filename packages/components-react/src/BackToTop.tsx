import React from "react";
import { classNames } from "./classNames.js";

export type BackToTopProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  className?: string;
};

function ArrowUpIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

export const BackToTop = React.forwardRef<HTMLButtonElement, BackToTopProps>(
  (
    {
      label = "Retour en haut",
      targetId = "top",
      threshold = 240,
      autoHide = true,
      smooth = true,
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const normalizedTarget = targetId ? `#${targetId.replace(/^#/, "")}` : "#top";

    const [visible, setVisible] = React.useState(!autoHide);

    React.useEffect(() => {
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

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        className={classNames("st-backToTop", className)}
        onClick={goTop}
        aria-label={label}
        aria-hidden={hidden || undefined}
        aria-live={hidden ? "polite" : undefined}
        tabIndex={hidden ? -1 : undefined}
        disabled={disabled}
      >
        <span className="st-backToTop__icon" aria-hidden="true">
          <ArrowUpIcon />
        </span>
        <span className="st-backToTop__label">{label}</span>
      </button>
    );
  },
);

BackToTop.displayName = "BackToTop";
