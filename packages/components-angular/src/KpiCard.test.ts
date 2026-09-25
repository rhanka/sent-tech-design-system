import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { KpiCard } from "../dist/KpiCard.js";

/**
 * The non-finite branches of `KpiCard`, which no parity case exercises.
 *
 * A `KpiCardGroup` parity case does exist, but it renders finite values only, so
 * the branch below has no measurement in the render harness — and the harness
 * cannot get one from the adapter either, since a store fixture would have to
 * carry a NaN for the whole comparison to reach here. React's `KpiCard` prints an
 * em dash for a non-finite value and no delta at all for a non-finite delta
 * (`packages/components-react/src/KpiCard.tsx`); Intl would print `NaN`, `NaN %`
 * or `+∞` instead. These assertions are what holds the two frameworks together on
 * that branch.
 */
describe("KpiCard (angular) non-finite values", () => {
  const card = (patch: Partial<KpiCard>): KpiCard => Object.assign(new KpiCard(), { label: "L" }, patch);

  it("prints an em dash instead of Intl's NaN or infinity, in every format", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      for (const format of ["number", "currency", "percent"] as const) {
        expect(card({ value, format }).formattedValue, `${format} / ${value}`).toBe("—");
      }
    }
  });

  it("still formats a finite value, so the guard did not swallow the normal case", () => {
    expect(card({ value: 1234, format: "number", locale: "en-US" }).formattedValue).toBe("1,234");
    expect(card({ value: 0.426, format: "percent", locale: "en-US" }).formattedValue).toBe("42.6%");
  });

  it("renders no delta for a non-finite delta, as React renders none", () => {
    for (const delta of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(card({ value: 1, delta }).formattedDelta, `percent / ${delta}`).toBeUndefined();
      expect(card({ value: 1, delta, deltaFormat: "number" }).formattedDelta, `number / ${delta}`).toBeUndefined();
    }
    expect(card({ value: 1 }).formattedDelta).toBeUndefined();
  });

  it("still formats a finite delta, with its sign", () => {
    expect(card({ value: 1, delta: 0.12, locale: "en-US" }).formattedDelta).toBe("+12%");
    expect(card({ value: 1, delta: -0.12, locale: "en-US" }).formattedDelta).toBe("-12%");
    expect(card({ value: 1, delta: 5, deltaFormat: "number", locale: "en-US" }).formattedDelta).toBe("+5");
  });

  it("reads a non-finite delta as a flat trend, as React does", () => {
    expect(card({ value: 1, delta: Number.NaN }).resolvedTrend).toBe("flat");
  });
});
