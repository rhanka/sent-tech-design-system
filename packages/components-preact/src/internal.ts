/**
 * Helpers shared by several components. In `components-react` they are private
 * functions of `catalog.tsx`; here they are one runtime-neutral module (hooks
 * only), emitted to React unchanged apart from its specifiers.
 */
import type { CSSProperties } from "preact";
import { useEffect, useState } from "preact/hooks";

function toKebab(prop: string): string {
  if (prop.startsWith("--")) return prop;
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function serializeStyle(base: CSSProperties | undefined): string {
  if (!base) return "";
  let text = "";
  for (const [key, value] of Object.entries(base)) {
    if (value == null || value === "") continue;
    text += `${toKebab(key)}:${String(value)};`;
  }
  return text;
}

/**
 * Merges a computed base style with a consumer `style` that may be an object,
 * a CSS string, or a signal holding either. A signal-like holder (`"peek"`
 * in the value, the `@preact/signals` read shape) is unwrapped without
 * importing signals, so this module stays runtime-neutral; the `.value` read
 * in render subscribes the component when signals are loaded. A string
 * consumer style is appended to the serialised base declarations; an object
 * wins over the base on conflict; nullish passes the base through.
 */
export function mergeStyle(
  base: CSSProperties | undefined,
  incoming: unknown,
): CSSProperties | string | undefined {
  let value: unknown = incoming;
  if (typeof value === "object" && value !== null && "peek" in value) {
    try {
      value = (value as unknown as { value: unknown }).value;
    } catch {
      value = undefined;
    }
  }
  if (value == null) return base;
  if (typeof value === "string") {
    if (value === "") return base;
    const baseText = serializeStyle(base);
    if (!baseText) return value;
    return `${baseText}${value.endsWith(";") ? value : `${value};`}`;
  }
  if (typeof value === "object") {
    return { ...(base as Record<string, unknown>), ...(value as Record<string, unknown>) } as CSSProperties;
  }
  return base;
}

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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

/**
 * Runs `onOutside` on a `mousedown` outside `ref` while `active`. Used by the
 * floating form controls (DatePicker, TimePicker) and the menu host.
 */
export function useOutsideMouseDown(
  active: boolean,
  ref: { current: HTMLElement | null },
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!active) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && ref.current && !ref.current.contains(target)) onOutside();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [active, onOutside, ref]);
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
