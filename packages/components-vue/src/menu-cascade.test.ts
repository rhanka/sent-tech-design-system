import { describe, expect, it } from "vitest";
import {
  computeSubMenuPosition,
  isCappedSubMenuWidth,
  pointInSafeTriangle,
  resolvePreferredSide,
  toContainingBlockPosition
} from "./menu-cascade.js";

const MENU = { left: 100, right: 292 };
const VIEWPORT = { width: 1024, height: 768 };

describe("menu-cascade solver", () => {
  it("AC-16: prefers right with room and aligns top on the parent line", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 300 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.side).toBe("right");
    expect(pos.left).toBe(292);
    expect(pos.top).toBe(195);
    expect(pos.maxHeight).toBeUndefined();
  });

  it("AC-16: space == W fits without flipping", () => {
    // spaceRight = 1024 - 8 - right = 192 exactly.
    const pos = computeSubMenuPosition({
      parentMenuRect: { left: 100, right: 824 },
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.side).toBe("right");
    expect(pos.left).toBe(824);
  });

  it("AC-16: flips left when short on the right", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: { left: 700, right: 892 },
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.side).toBe("left");
    expect(pos.left).toBe(700 - 192);
  });

  it("AC-16: clamps horizontally inside the viewport", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: { left: 900, right: 1000 },
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT,
      preferredSide: "right"
    });
    // Neither side fits (roomier is left): flush left would overflow, clamp.
    expect(pos.side).toBe("left");
    expect(pos.left).toBeLessThanOrEqual(1024 - 8 - 192);
    expect(pos.left).toBeGreaterThanOrEqual(8);
  });

  it("AC-16: shifts vertically to stay in the viewport", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 700 },
      panelSize: { width: 192, height: 200 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.top).toBe(768 - 8 - 200);
  });

  it("AC-17: caps scrolling panels with top=8 and maxHeight=vh-16", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 800 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.top).toBe(8);
    expect(pos.maxHeight).toBe(768 - 16);
  });

  it("AC-17: leaves maxHeight unset for fitting panels", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.maxHeight).toBeUndefined();
  });

  it("AC-19: a second level flips independently of the first", () => {
    const first = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(first.side).toBe("right");
    const second = computeSubMenuPosition({
      parentMenuRect: { left: first.left, right: first.left + 192 },
      parentItemRect: { top: 210 },
      panelSize: { width: 192, height: 100 },
      viewport: { width: 500, height: 768 },
      preferredSide: "auto"
    });
    // 500 - 8 - 484 = 8 < 192: the second level flips left on its own geometry.
    expect(second.side).toBe("left");
  });

  it("AC-20: submenuSide left pins left, auto prefers right on the same geometry", () => {
    const geometry = {
      parentMenuRect: { left: 400, right: 592 },
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: VIEWPORT
    } as const;
    expect(
      computeSubMenuPosition({ ...geometry, preferredSide: "left" }).side
    ).toBe("left");
    expect(
      computeSubMenuPosition({ ...geometry, preferredSide: "auto" }).side
    ).toBe("right");
  });

  it("AC-26: unknown height keeps parent-line alignment with only the top clamp", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 200 },
      panelSize: { width: 0, height: 0 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(pos.top).toBe(195);
    expect(pos.maxHeight).toBeUndefined();
    const nearTop = computeSubMenuPosition({
      parentMenuRect: MENU,
      parentItemRect: { top: 2 },
      panelSize: { width: 0, height: 0 },
      viewport: VIEWPORT,
      preferredSide: "auto"
    });
    expect(nearTop.top).toBe(8);
  });

  it("AC-27: narrow viewport pins left=8 and flags the width cap", () => {
    const pos = computeSubMenuPosition({
      parentMenuRect: { left: 10, right: 100 },
      parentItemRect: { top: 200 },
      panelSize: { width: 192, height: 100 },
      viewport: { width: 160, height: 768 },
      preferredSide: "auto"
    });
    expect(pos.left).toBe(8);
    expect(isCappedSubMenuWidth(192, 160)).toBe(true);
    expect(isCappedSubMenuWidth(192, 1024)).toBe(false);
  });

  it("AC-36: containing-block conversion subtracts the ancestor origin", () => {
    expect(toContainingBlockPosition({ top: 100, left: 200 }, null)).toEqual({
      top: 100,
      left: 200
    });
    // Host placements `top-*` / alignment `end` establish a transformed
    // ancestor: the solver viewport output is converted into its frame.
    expect(
      toContainingBlockPosition({ top: 100, left: 200 }, { top: 40, left: 60 })
    ).toEqual({ top: 60, left: 140 });
  });

  it("safe triangle is inclusive on edges and exclusive outside", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    const c = { x: 0, y: 10 };
    expect(pointInSafeTriangle({ x: 1, y: 1 }, a, b, c)).toBe(true);
    expect(pointInSafeTriangle({ x: 5, y: 0 }, a, b, c)).toBe(true);
    expect(pointInSafeTriangle({ x: 10, y: 10 }, a, b, c)).toBe(false);
  });

  it("auto resolves to right", () => {
    expect(resolvePreferredSide("auto")).toBe("right");
    expect(resolvePreferredSide("left")).toBe("left");
    expect(resolvePreferredSide("right")).toBe("right");
  });
});
