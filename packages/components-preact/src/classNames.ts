/**
 * Joins class names, dropping empty values. A `{ value }` holder is read
 * through: Preact types a DOM attribute as "value or signal", so a
 * signal-valued `className` forwarded by a consumer is accepted and its
 * current value is read during render.
 *
 * That read makes the component follow the signal only when
 * `@preact/signals` is loaded in the page: its import installs the render
 * hook that subscribes a component to the signals it reads. This module does
 * not import it, and neither do the components that have no `MaybeSignal`
 * prop; a consumer holding a signal has necessarily loaded it. Without it the
 * value is read once per render and a later change does not re-render.
 * React never passes that form.
 */
export type ClassValue = string | false | null | undefined | { readonly value: string | undefined };

export function classNames(...values: ClassValue[]): string {
  return values
    .map((value) => (typeof value === "object" && value !== null ? value.value : value))
    .filter(Boolean)
    .join(" ");
}
