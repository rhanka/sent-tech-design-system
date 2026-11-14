import { X } from "lucide-preact";
import type { HTMLAttributes } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { classNames } from "./classNames.js";
import { text, trapTabKey, useBodyScrollLock, useEscape } from "./internal.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ModalProps = HTMLAttributes<HTMLElement> & {
  /** Plain value, or a signal in the Preact build (read at the edge). */
  open?: MaybeSignal<boolean>;
  title?: ComponentChildren;
  description?: ComponentChildren;
  footer?: ComponentChildren;
  onClose?: () => void;
  closeLabel?: string;
};

export function Modal({
  open: openInput = false,
  title,
  description,
  footer,
  onClose,
  closeLabel = "Close",
  children,
  className,
  ...rest
}: ModalProps) {
  const open = useValue(openInput);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock(open);
  useEscape(open, onClose);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => trapTabKey(event, dialogRef.current);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  if (!open) return null;
  return (
    <div className="st-modal__backdrop">
      <section
        {...rest}
        ref={dialogRef}
        className={classNames("st-modal", className)}
        role="dialog"
        aria-modal="true"
        aria-label={text(title) || "Modal"}
        tabIndex={-1}
      >
        <div className="st-modal__header">
          {title ? <h2 className="st-modal__title">{title}</h2> : null}
          <button ref={closeRef} type="button" className="st-modal__close" onClick={onClose} aria-label={closeLabel}>
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
        {description ? <p className="st-modal__description">{description}</p> : null}
        <div className="st-modal__body">{children}</div>
        {footer ? <div className="st-modal__footer">{footer}</div> : null}
      </section>
    </div>
  );
}
