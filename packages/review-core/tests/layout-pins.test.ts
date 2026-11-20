import { describe, expect, it } from "vitest";

import { DEFAULT_PIN_GAP, layoutPins, type PinInput } from "../src/index.js";

describe("DS-1 layoutPins (sort Y, 28px gap, clamped)", () => {
  it("should expose default pin gap of 28px and return empty array for empty input", () => {
    expect(DEFAULT_PIN_GAP).toBe(28);
    expect(layoutPins([])).toEqual([]);
  });

  it("should sort by targetY ascending, keep input order on ties, and number 1-based", () => {
    const input: PinInput[] = [
      { id: "p-bottom", targetY: 200 },
      { id: "p-tie-a", targetY: 50 },
      { id: "p-tie-b", targetY: 50 },
    ];
    const snapshot = structuredClone(input);

    const laidOut = layoutPins(input);
    expect(input).toEqual(snapshot); // never mutates input

    expect(laidOut).toEqual([
      { id: "p-tie-a", targetY: 50, y: 50, index: 1 },
      { id: "p-tie-b", targetY: 50, y: 78, index: 2 },
      { id: "p-bottom", targetY: 200, y: 200, index: 3 },
    ]);
  });

  it("should keep well-spaced pins at exact targetY within bounds", () => {
    const laidOut = layoutPins(
      [
        { id: "a", targetY: 40 },
        { id: "b", targetY: 120 },
        { id: "c", targetY: 260 },
      ],
      { minY: 0, maxY: 400 },
    );
    expect(laidOut.map((p) => p.y)).toEqual([40, 120, 260]);
  });

  it("should clamp pins at minY and resolve downward collisions with 28px gap", () => {
    const laidOut = layoutPins(
      [
        { id: "a", targetY: -20 },
        { id: "b", targetY: 5 },
        { id: "c", targetY: 10 },
      ],
      { minY: 0 },
    );
    expect(laidOut.map((p) => p.y)).toEqual([0, 28, 56]);
  });

  it("should clamp pins at maxY and push colliding pins upward while keeping 28px gap", () => {
    const laidOut = layoutPins(
      [
        { id: "a", targetY: 180 },
        { id: "b", targetY: 190 },
        { id: "c", targetY: 195 },
      ],
      { minY: 0, maxY: 200 },
    );
    expect(laidOut.map((p) => p.y)).toEqual([144, 172, 200]);
    for (let i = 1; i < laidOut.length; i++) {
      expect(laidOut[i]!.y - laidOut[i - 1]!.y).toBeGreaterThanOrEqual(28);
    }
    for (const pin of laidOut) {
      expect(pin.y).toBeGreaterThanOrEqual(0);
      expect(pin.y).toBeLessThanOrEqual(200);
    }
  });

  it("should stay monotonically ordered and strictly clamped when container is shorter than total gap", () => {
    const laidOut = layoutPins(
      [
        { id: "a", targetY: 10 },
        { id: "b", targetY: 20 },
        { id: "c", targetY: 30 },
        { id: "d", targetY: 40 },
      ],
      { minY: 10, maxY: 40, gap: 28 },
    );
    expect(laidOut.length).toBe(4);
    expect(laidOut[0]!.y).toBe(10);
    expect(laidOut[3]!.y).toBe(40);
    for (let i = 1; i < laidOut.length; i++) {
      expect(laidOut[i]!.y).toBeGreaterThanOrEqual(laidOut[i - 1]!.y);
    }
  });
});
