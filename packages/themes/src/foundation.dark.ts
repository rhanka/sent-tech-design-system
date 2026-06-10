/**
 * foundationDark — minimal foundation overrides for dark mode.
 * Shadows recolored with higher opacity for visibility on dark backgrounds.
 * Importe le foundation de base depuis le package tokens (export existant).
 */
import { foundation } from "@sentropic/design-system-tokens";

export const foundationDark = {
  ...foundation,
  shadow: {
    subtle: "0 1px 2px rgb(0 0 0 / 0.5)",
    medium: "0 8px 24px rgb(0 0 0 / 0.55)",
    floating: "0 18px 45px rgb(0 0 0 / 0.6)"
  }
} as const;
