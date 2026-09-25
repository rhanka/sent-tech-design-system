/**
 * A COMPILER test. These assertions mean nothing unless a compiler reads them,
 * which is why `tsconfig.check.json` includes `tests` and `npm run check` is a
 * gate: each `@ts-expect-error` below fails as TS2578 ("Unused '@ts-expect-error'
 * directive") the moment the type it guards stops being enforced.
 *
 * What it guards:
 *   1. The nominal reference types of `diagram-core` stay non-interchangeable
 *      ACROSS the package boundary. A scene function that takes an
 *      `OccurrenceRef` must refuse an `EntityRef`, a `PortRef` and a plain
 *      string, or the whole point of the branded types is lost at the first
 *      consumer.
 *   2. The exclusion reason union is exhaustively switchable, so a reason added
 *      without a branch is a compile error at every consumer, not a silent
 *      fall-through.
 *   3. A `PortSide` is one of four names, not any string.
 */
import { describe, expect, it } from "vitest";

import { buildScene, portAnchorPoint, sceneItemOf } from "../src/scene.js";
import { EXCLUSION_REASONS, type ExclusionReason } from "../src/visibility.js";
import { ENTITY_A, OCC_A, PORT_A, VIEW, sampleState } from "./fixtures.js";

const frame = buildScene(sampleState(), VIEW);

describe("the nominal references survive the package boundary", () => {
  it("accepts an occurrence reference", () => {
    expect(sceneItemOf(frame, OCC_A)).toBeDefined();
  });

  it("refuses an entity, a port and a bare string where an occurrence is required", () => {
    // @ts-expect-error an EntityRef is not an OccurrenceRef
    sceneItemOf(frame, ENTITY_A);
    // @ts-expect-error a PortRef is not an OccurrenceRef
    sceneItemOf(frame, PORT_A);
    // @ts-expect-error a bare string is not an OccurrenceRef
    sceneItemOf(frame, "occurrence:oa");
    expect(true).toBe(true);
  });

  it("refuses an occurrence reference where a view reference is required", () => {
    // Wrapped, because this call is illegitimate at RUNTIME too: an occurrence
    // reference is no view of the state, so `buildScene` refuses it loudly.
    // Both halves are asserted at once - the compiler rejects the argument, and
    // the runtime refuses rather than returning an empty frame.
    expect(() => {
      // @ts-expect-error an OccurrenceRef is not a ViewRef
      buildScene(sampleState(), OCC_A);
    }).toThrow(/occurrence:oa/);
  });
});

describe("a PortSide is one of four names", () => {
  it("accepts the four", () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };
    expect(portAnchorPoint(rect, "north", 0)).toEqual({ x: 0, y: 0 });
    expect(portAnchorPoint(rect, "east", 0)).toEqual({ x: 10, y: 0 });
    expect(portAnchorPoint(rect, "south", 0)).toEqual({ x: 0, y: 10 });
    expect(portAnchorPoint(rect, "west", 0)).toEqual({ x: 0, y: 0 });
  });

  it("refuses a fifth", () => {
    // @ts-expect-error "up" is not a PortSide
    portAnchorPoint({ x: 0, y: 0, width: 1, height: 1 }, "up", 0);
    expect(true).toBe(true);
  });
});

describe("the exclusion reason union is exhaustively switchable", () => {
  // A total function over the union: no `default`, and a `never` assignment at
  // the end. Adding a reason without a branch here is a compile error, and this
  // function is what proves a CONSUMER can be exhaustive too - not merely that
  // the array in visibility.ts is complete.
  function label(reason: ExclusionReason): string {
    switch (reason) {
      case "filtered-out":
        return "a filter removed it";
      case "not-included":
        return "no include filter matched it";
      case "endpoint-hidden":
        return "an endpoint of it is hidden";
      case "owner-hidden":
        return "its owner is hidden";
      case "group-collapsed":
        return "its group is collapsed";
      case "unresolved-reference":
        return "it points at nothing";
      case "geometry-not-finite":
        return "its geometry is not finite";
      default: {
        const unreachable: never = reason;
        return unreachable;
      }
    }
  }

  it("labels every declared reason, with no reason falling through", () => {
    const labels = EXCLUSION_REASONS.map(label);
    expect(labels).toHaveLength(EXCLUSION_REASONS.length);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.every((entry) => entry.length > 0)).toBe(true);
  });
});
