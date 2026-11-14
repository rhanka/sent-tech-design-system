/**
 * Joins class names, dropping empty values. A `{ value }` holder is read
 * through: Preact types a DOM attribute as "value or signal", so a
 * signal-valued `className` forwarded by a consumer is accepted and tracked.
 * React never passes that form.
 */
export type ClassValue = string | false | null | undefined | { readonly value: string | undefined };

export function classNames(...values: ClassValue[]): string {
  return values
    .map((value) => (typeof value === "object" && value !== null ? value.value : value))
    .filter(Boolean)
    .join(" ");
}
