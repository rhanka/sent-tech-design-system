/**
 * foundationDark — minimal foundation overrides for dark mode.
 * Shadows are recolored with higher opacity (rgb(0 0 0 / x)) for visibility
 * on dark backgrounds. All other foundation values (fonts, spacing, radius,
 * motion, z) are identical to the base foundation and can be spread over it.
 */
import { foundation } from "./foundation.js";

export const foundationDark = {
  ...foundation,
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.5)",
    medium: "0 8px 24px rgb(0 0 0 / 0.55)",
    floating: "0 18px 45px rgb(0 0 0 / 0.6)"
  }
} as const;
