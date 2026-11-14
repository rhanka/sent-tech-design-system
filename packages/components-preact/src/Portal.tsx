import { useEffect, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import { createPortal } from "./compat.js";
import type { ComponentChildren } from "./runtime.js";

export type PortalProps = {
  /**
   * Where to teleport the children. A CSS selector string or an actual
   * `HTMLElement`. Defaults to the document `<body>`.
   */
  target?: string | HTMLElement;
  /** When `true`, render inline in place (no teleportation). */
  disabled?: boolean;
  /** Optional class applied to the portal container element. */
  className?: string;
  children?: ComponentChildren;
};

/**
 * Resolve a target prop to an `HTMLElement`. Returns `null` when it cannot be
 * resolved (SSR, missing selector, etc.).
 */
export function resolvePortalTarget(target: string | HTMLElement | undefined): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (target == null) return document.body;
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target) ?? document.body;
  }
  return target;
}

/**
 * Teleport `children` into another part of the DOM via `createPortal`.
 * SSR-safe: nothing is portalled during the server render or before mount; the
 * portal is created only after the component has mounted on the client. When
 * `disabled` is set the children render inline in place.
 */
export function Portal({ target = "body", disabled = false, className, children }: PortalProps) {
  // Only create the portal after mount so the server render and the first
  // client render agree (no DOM access during SSR).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) {
    return (
      <div className={classNames("st-portal", className)} data-st-portal="inline">
        {children}
      </div>
    );
  }

  if (!mounted) {
    // SSR / first client render: render inline so markup is produced in place
    // and hydration stays consistent. The effect below re-renders into a portal.
    return (
      <div className={classNames("st-portal", className)} data-st-portal="inline">
        {children}
      </div>
    );
  }

  const destination = resolvePortalTarget(target);
  if (!destination) return null;

  return createPortal(
    <div className={classNames("st-portal", className)} data-st-portal="teleported">
      {children}
    </div>,
    destination,
  );
}

Portal.displayName = "Portal";
