import "@angular/compiler";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MenuPopover,
  computeMenuPopoverPosition,
  menuPopoverIsWithin,
} from "../dist/MenuPopover.js";
import type { MenuPopoverRect, MenuPopoverViewport } from "../dist/MenuPopover.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function fakeTrigger(rect: Partial<MenuPopoverRect>): HTMLElement {
  const full: MenuPopoverRect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, ...rect };
  return { getBoundingClientRect: () => full } as unknown as HTMLElement;
}

const VIEWPORT: MenuPopoverViewport = { height: 600, scrollX: 0, scrollY: 0 };

describe("computeMenuPopoverPosition (angular)", () => {
  it("computes a viewport-aware max-height below the trigger (not a flat max-height:100vh)", () => {
    const pos = computeMenuPopoverPosition(
      { top: 40, bottom: 200, left: 10, right: 10, width: 0 },
      "bottom-start",
      undefined,
      VIEWPORT,
    );
    // available space below trigger = innerHeight(600) - bottom(200) - GAP(4) - VIEWPORT_MARGIN(8) = 388
    expect(pos.maxHeight).toBe(388);
    expect(pos.top).toBe(204);
    expect(pos.left).toBe(10);
    expect(pos.alignEnd).toBe(false);
    expect(pos.alignCenter).toBe(false);
  });

  it("floors the computed max-height at MIN_HEIGHT when the trigger is glued to the viewport edge", () => {
    const pos = computeMenuPopoverPosition(
      { top: 590, bottom: 590, left: 0, right: 0, width: 0 },
      "bottom-start",
      undefined,
      VIEWPORT,
    );
    // available space = 600 - 590 - 4 - 8 = -2 -> floored to MIN_HEIGHT (160)
    expect(pos.maxHeight).toBe(160);
  });

  it("computes the available space ABOVE the trigger for top placements", () => {
    const pos = computeMenuPopoverPosition(
      { top: 300, bottom: 340, left: 10, right: 50, width: 40 },
      "top-start",
      undefined,
      VIEWPORT,
    );
    // available space above trigger = top(300) - GAP(4) - VIEWPORT_MARGIN(8) = 288
    expect(pos.maxHeight).toBe(288);
    expect(pos.top).toBe(296);
  });

  it("defaults the horizontal alignment from the placement's cue (*-end -> end, otherwise start)", () => {
    const end = computeMenuPopoverPosition(
      { top: 0, bottom: 0, left: 10, right: 90, width: 80 },
      "bottom-end",
      undefined,
      VIEWPORT,
    );
    expect(end.alignEnd).toBe(true);
    expect(end.left).toBe(90);

    const start = computeMenuPopoverPosition(
      { top: 0, bottom: 0, left: 10, right: 90, width: 80 },
      "bottom-start",
      undefined,
      VIEWPORT,
    );
    expect(start.alignEnd).toBe(false);
    expect(start.left).toBe(10);
  });

  it("an explicit align overrides the placement's horizontal cue", () => {
    const pos = computeMenuPopoverPosition(
      { top: 0, bottom: 0, left: 10, right: 90, width: 80 },
      "bottom-end",
      "center",
      VIEWPORT,
    );
    expect(pos.alignCenter).toBe(true);
    expect(pos.alignEnd).toBe(false);
    expect(pos.left).toBe(50); // left(10) + width/2(40)
  });

  it("adds window scroll offsets to top/left", () => {
    const pos = computeMenuPopoverPosition(
      { top: 40, bottom: 200, left: 10, right: 10, width: 0 },
      "bottom-start",
      undefined,
      { height: 600, scrollX: 5, scrollY: 100 },
    );
    expect(pos.top).toBe(200 + 100 + 4);
    expect(pos.left).toBe(10 + 5);
  });
});

describe("menuPopoverIsWithin (angular)", () => {
  it("returns false when the node is null or undefined", () => {
    expect(menuPopoverIsWithin({ target: null }, null)).toBe(false);
    expect(menuPopoverIsWithin({ target: null }, undefined)).toBe(false);
  });

  it("matches via composedPath when the event supports it", () => {
    const node = {} as Element;
    expect(menuPopoverIsWithin({ composedPath: () => [node], target: null }, node)).toBe(true);
  });

  it("falls back to node.contains(target) when composedPath is absent", () => {
    const target = {} as Node;
    const node = { contains: (t: Node) => t === target } as unknown as Element;
    expect(menuPopoverIsWithin({ target }, node)).toBe(true);
  });

  it("returns false when neither composedPath nor contains matches", () => {
    const node = { contains: () => false } as unknown as Element;
    expect(menuPopoverIsWithin({ target: {} as Node }, node)).toBe(false);
  });
});

describe("MenuPopover (angular)", () => {
  it("defaults to closed, bottom-start placement, and the canonical outside/escape close flags", () => {
    const c = new MenuPopover();
    expect(c.open).toBe(false);
    expect(c.placement).toBe("bottom-start");
    expect(c.closeOnOutside).toBe(true);
    expect(c.closeOnEscape).toBe(true);
    expect(c.hostClass).toContain("st-menuPopover");
    expect(c.hostClass).toContain("st-menuPopover--bottom-start");
  });

  it("composes the host class with placement, resolved alignment and a consumer class", () => {
    const c = new MenuPopover();
    c.placement = "top-end";
    c.classInput = "app-menu";
    c.alignEnd = true;
    expect(c.hostClass).toContain("st-menuPopover--top-end");
    expect(c.hostClass).toContain("st-menuPopover--alignEnd");
    expect(c.hostClass).toContain("app-menu");
  });

  it("builds the inline position style, omitting max-height when it is unset", () => {
    const c = new MenuPopover();
    expect(c.panelStyle).toBe("top: 0px; left: 0px;");
    c.top = 10;
    c.left = 20;
    c.maxHeight = 300;
    expect(c.panelStyle).toBe("top: 10px; left: 20px; max-height: 300px;");
  });

  it("computePosition derives top/left/maxHeight/alignment from the trigger rect", () => {
    vi.stubGlobal("window", { innerHeight: 600, scrollX: 0, scrollY: 0 });
    const c = new MenuPopover();
    c.placement = "bottom-end";
    c.trigger = fakeTrigger({ top: 40, bottom: 200, left: 10, right: 90, width: 80 });
    c.computePosition();
    expect(c.top).toBe(204);
    expect(c.left).toBe(90);
    expect(c.maxHeight).toBe(388);
    expect(c.alignEnd).toBe(true);
  });

  it("computePosition is a no-op without a trigger", () => {
    vi.stubGlobal("window", { innerHeight: 600, scrollX: 0, scrollY: 0 });
    const c = new MenuPopover();
    c.computePosition();
    expect(c.top).toBe(0);
    expect(c.left).toBe(0);
    expect(c.maxHeight).toBe(0);
  });

  it("close() flips open to false and emits openChange exactly once (idempotent)", () => {
    const c = new MenuPopover();
    c.open = true;
    const seen: boolean[] = [];
    c.openChange.subscribe((v: boolean) => seen.push(v));
    c.close();
    expect(c.open).toBe(false);
    expect(seen).toEqual([false]);

    c.close();
    expect(seen).toEqual([false]);
  });

  it("ngOnChanges recomputes position asynchronously (ViewChild only settles after Angular's render pass)", async () => {
    vi.stubGlobal("window", { innerHeight: 600, scrollX: 0, scrollY: 0 });
    const c = new MenuPopover();
    c.open = true;
    c.trigger = fakeTrigger({ top: 40, bottom: 200, left: 10, right: 10, width: 0 });

    c.ngOnChanges({ open: {} } as never);
    expect(c.top).toBe(0);
    await Promise.resolve();
    expect(c.top).toBe(204);
  });

  it("ngOnChanges does nothing while closed", async () => {
    vi.stubGlobal("window", { innerHeight: 600, scrollX: 0, scrollY: 0 });
    const c = new MenuPopover();
    c.trigger = fakeTrigger({ top: 40, bottom: 200, left: 10, right: 10, width: 0 });
    c.ngOnChanges({ open: {} } as never);
    await Promise.resolve();
    expect(c.top).toBe(0);
  });

  describe("interaction lifecycle (Svelte parity: handlers exercised directly — this package's tests run in a Node env with no real window)", () => {
    it("Escape closes the panel and prevents default when open and closeOnEscape is true", () => {
      const c = new MenuPopover();
      c.open = true;
      const seen: boolean[] = [];
      c.openChange.subscribe((v: boolean) => seen.push(v));
      let prevented = false;
      (c as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
        key: "Escape",
        preventDefault: () => {
          prevented = true;
        },
      });
      expect(c.open).toBe(false);
      expect(prevented).toBe(true);
      expect(seen).toEqual([false]);
    });

    it("closeOnEscape=false keeps the panel open on Escape", () => {
      const c = new MenuPopover();
      c.open = true;
      c.closeOnEscape = false;
      (c as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
        key: "Escape",
        preventDefault: () => {},
      });
      expect(c.open).toBe(true);
    });

    it("a non-Escape key is ignored", () => {
      const c = new MenuPopover();
      c.open = true;
      (c as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
        key: "Enter",
        preventDefault: () => {},
      });
      expect(c.open).toBe(true);
    });

    it("an outside pointerdown closes the panel", () => {
      const c = new MenuPopover();
      c.open = true;
      (c as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({ target: {} as Node });
      expect(c.open).toBe(false);
    });

    it("a pointerdown inside the panel does NOT close it", () => {
      const c = new MenuPopover();
      c.open = true;
      const panelEl = { contains: () => true } as unknown as HTMLDivElement;
      (c as unknown as { panel: { nativeElement: HTMLDivElement } }).panel = { nativeElement: panelEl };
      (c as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({ target: {} as Node });
      expect(c.open).toBe(true);
    });

    it("a pointerdown on the trigger itself does NOT close it via outside-click handling", () => {
      const c = new MenuPopover();
      c.open = true;
      c.trigger = { contains: () => true } as unknown as HTMLElement;
      (c as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({ target: {} as Node });
      expect(c.open).toBe(true);
    });

    it("closeOnOutside=false keeps the panel open on outside pointerdown", () => {
      const c = new MenuPopover();
      c.open = true;
      c.closeOnOutside = false;
      (c as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({ target: {} as Node });
      expect(c.open).toBe(true);
    });

    it("pointerdown/keydown are inert while already closed", () => {
      const c = new MenuPopover();
      (c as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({ target: {} as Node });
      (c as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({ key: "Escape", preventDefault: () => {} });
      expect(c.open).toBe(false);
    });
  });

  describe("lifecycle hooks (listener registration/teardown)", () => {
    it("registers scroll/resize/pointerdown/keydown exactly once on ngAfterViewInit and removes them all on ngOnDestroy", () => {
      const added: string[] = [];
      const removed: string[] = [];
      vi.stubGlobal("window", {
        innerHeight: 600,
        scrollX: 0,
        scrollY: 0,
        addEventListener: (type: string) => added.push(type),
        removeEventListener: (type: string) => removed.push(type),
      });

      const c = new MenuPopover();
      c.ngAfterViewInit();
      expect(added.sort()).toEqual(["keydown", "pointerdown", "resize", "scroll"]);

      c.ngOnDestroy();
      expect(removed.sort()).toEqual(["keydown", "pointerdown", "resize", "scroll"]);
    });

    it("does not register listeners twice if ngAfterViewInit is somehow invoked more than once", () => {
      let addCount = 0;
      vi.stubGlobal("window", {
        innerHeight: 600,
        scrollX: 0,
        scrollY: 0,
        addEventListener: () => {
          addCount += 1;
        },
        removeEventListener: () => {},
      });
      const c = new MenuPopover();
      c.ngAfterViewInit();
      c.ngAfterViewInit();
      expect(addCount).toBe(4);
    });

    it("ngOnDestroy without a prior ngAfterViewInit does not throw or remove anything", () => {
      let removeCount = 0;
      vi.stubGlobal("window", {
        addEventListener: () => {},
        removeEventListener: () => {
          removeCount += 1;
        },
      });
      const c = new MenuPopover();
      expect(() => c.ngOnDestroy()).not.toThrow();
      expect(removeCount).toBe(0);
    });

    it("every hook is inert outside a browser environment (no real `window` in this package's Node test env)", () => {
      const c = new MenuPopover();
      c.open = true;
      expect(() => c.ngAfterViewInit()).not.toThrow();
      expect(() => c.ngOnChanges({ open: {} } as never)).not.toThrow();
      expect(() => c.computePosition()).not.toThrow();
      expect(() => c.ngOnDestroy()).not.toThrow();
    });
  });
});
