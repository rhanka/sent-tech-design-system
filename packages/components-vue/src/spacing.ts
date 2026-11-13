/** rem fallbacks for the Sent Tech spacing scale (steps 5/7/9/10/11 are
    interpolated since no token exists, but the var() is still preferred). */
const SPACING_FALLBACK: Record<number, string> = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
};

/** Resolve a spacing step to a `var(--st-spacing-N, fallback)` expression. */
export function spacingToken(step: number | undefined): string | undefined {
  if (step == null) return undefined;
  const clamped = Math.max(0, Math.min(12, Math.round(step)));
  if (clamped === 0) return "0";
  return `var(--st-spacing-${clamped}, ${SPACING_FALLBACK[clamped]})`;
}

