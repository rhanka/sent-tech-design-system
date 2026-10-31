/**
 * Parity-guard bridge, READ ONLY by the catalogue generator at generation time
 * (ts-json-schema-generator compiles it with the React package's own
 * tsconfig). It is deliberately OUTSIDE `src/`: this package's compiler has no
 * DOM lib, while `HTMLAttributes<HTMLDivElement>` needs it.
 *
 * Purpose: mechanically derive the prop-name set contributed by
 * `React.HTMLAttributes<HTMLDivElement>` so the parity guard can subtract the
 * DOM passthrough base from React's `BarChartProps` and compare the component's
 * own members against the catalogued surface.
 */
import type { HTMLAttributes } from "react";

export type DivHTMLAttributes = HTMLAttributes<HTMLDivElement>;
