/**
 * Parity computation (frozen spec section 3.6): derived from barrel
 * presence plus declared intentional absences, never hand-written.
 *
 * Rule per framework, in FRAMEWORK_ORDER:
 * - Barrel exports the identifier: `svelte` -> `source-of-truth`,
 *   `react`/`vue`/`angular` -> `match` (presence parity; props-type
 *   comparison is K1b work and must not be claimed here).
 * - Barrel does not export the identifier and the absence is declared
 *   intentional in source (Elements contract role `no-counterpart`, or the
 *   overlay-declared single-source sets): `no-counterpart`.
 * - Otherwise: `missing`.
 *
 * Dataviz presence never alters the map; a catalogue row whose four native
 * values would all be `missing` with no dataviz delivery fails generation
 * outright (exported nowhere). `mismatch` is never a published value.
 */
import { FRAMEWORK_ORDER, type Framework, type ParityMap, type ParityStatus } from "./constants.js";

/**
 * @param componentPresence barrel presence in FRAMEWORK_ORDER
 *        (svelte, react, vue, angular).
 * @param datavizPresence any dataviz barrel exports the identifier
 *        (recorded for the caller; never alters the map).
 * @param intentional frameworks with a declared intentional absence for
 *        this component (Elements `no-counterpart` roles, overlay-declared
 *        single-source sets).
 */
export function computeParity(
  componentPresence: readonly boolean[],
  datavizPresence: boolean,
  intentional: ReadonlySet<Framework>,
): ParityMap {
  if (componentPresence.length !== FRAMEWORK_ORDER.length) {
    throw new Error(
      `computeParity: expected ${FRAMEWORK_ORDER.length} framework flags, got ${componentPresence.length}`,
    );
  }
  void datavizPresence;
  const map = {} as ParityMap;
  FRAMEWORK_ORDER.forEach((framework, index) => {
    let status: ParityStatus;
    if (componentPresence[index] === true) {
      status = framework === "svelte" ? "source-of-truth" : "match";
    } else if (intentional.has(framework)) {
      status = "no-counterpart";
    } else {
      status = "missing";
    }
    map[framework] = status;
  });
  return map;
}

/** `frameworks[]` is the derived projection of the map (GEN assertion). */
export function parityProjection(map: ParityMap): Framework[] {
  return FRAMEWORK_ORDER.filter(
    (framework) => map[framework] === "source-of-truth" || map[framework] === "match",
  );
}

/** True when every native value is `missing`. */
export function parityAllMissing(map: ParityMap): boolean {
  return FRAMEWORK_ORDER.every((framework) => map[framework] === "missing");
}
