/**
 * Helpers shared by several components. In `components-react` they are private
 * functions of `catalog.tsx`; here they are one runtime-neutral module (hooks
 * only), emitted to React unchanged apart from its specifiers.
 */
import { useEffect, useState } from "preact/hooks";

export function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function idFrom(item: { id?: string; value?: string }, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}

export function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}

export function useControlled<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [local, setLocal] = useState(defaultValue);
  return [
    value ?? local,
    (next) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
  ];
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

export function useEscape(active: boolean, onClose?: () => void): void {
  useEffect(() => {
    if (!active || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, onClose]);
}

/** Keeps Tab / Shift+Tab inside `root`. Takes a native or a synthetic keyboard event. */
export function trapTabKey(
  event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
  root: HTMLElement | null,
): void {
  if (event.key !== "Tab" || !root || !root.contains(document.activeElement)) return;
  const focusable = focusableIn(root);
  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
