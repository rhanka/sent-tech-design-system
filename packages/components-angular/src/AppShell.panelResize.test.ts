import "@angular/compiler";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "../dist/AppShell.js";

describe("AppShell — panelResize default (false)", () => {
  it("defaults panelResize to false", () => {
    const c = new AppShell();
    expect(c.panelResize).toBe(false);
  });

  it("panelStyle is null when panelResize is false (byte-identical to today: no inline style)", () => {
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 400 };
    expect(c.panelStyle).toBeNull();
  });

  it("defaults panelMinWidth/panelMaxWidth to 180/640", () => {
    const c = new AppShell();
    expect(c.panelMinWidth).toBe(180);
    expect(c.panelMaxWidth).toBe(640);
  });
});

describe("AppShell — displayWidth / clampWidth / widthFor", () => {
  it("displayWidth falls back to the nominal px default for each resizable panel when no width is set", () => {
    const c = new AppShell();
    expect(c.displayWidth("navigationPanel")).toBe(320);
    expect(c.displayWidth("contextPanel")).toBe(352);
    expect(c.displayWidth("utilityPanel")).toBe(384);
  });

  it("clampWidth clamps to [panelMinWidth, panelMaxWidth]", () => {
    const c = new AppShell();
    c.panelMinWidth = 200;
    c.panelMaxWidth = 300;
    expect(c.clampWidth(100)).toBe(200);
    expect(c.clampWidth(1000)).toBe(300);
    expect(c.clampWidth(250)).toBe(250);
  });

  it("widthFor reads defaultPanelWidths when uncontrolled (seeded once on first read)", () => {
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    expect(c.widthFor("navigationPanel")).toBe(300);
    expect(c.widthFor("contextPanel")).toBeUndefined();
  });

  it("widthFor reads panelWidths when controlled, ignoring defaultPanelWidths", () => {
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    c.panelWidths = { navigationPanel: 250 };
    expect(c.widthFor("navigationPanel")).toBe(250);
  });

  it("an empty object panelWidths ({}) still counts as controlled", () => {
    const c = new AppShell();
    c.panelWidths = {};
    expect(c.widthFor("navigationPanel")).toBeUndefined();
    expect(c.displayWidth("navigationPanel")).toBe(320); // falls back to nominal, not defaultPanelWidths
  });
});

describe("AppShell — panelStyle (inline width vars)", () => {
  it("emits a var only for panels with an explicit (default) width", () => {
    const c = new AppShell();
    c.panelResize = true;
    c.defaultPanelWidths = { navigationPanel: 300 };
    expect(c.panelStyle).toBe("--st-appShell-navigation-width: 300px");
  });

  it("emits one var per explicitly-widthed panel, joined with '; '", () => {
    const c = new AppShell();
    c.panelResize = true;
    c.defaultPanelWidths = { navigationPanel: 300, contextPanel: 260, utilityPanel: 420 };
    expect(c.panelStyle).toBe(
      "--st-appShell-navigation-width: 300px; --st-appShell-context-width: 260px; --st-appShell-utility-width: 420px",
    );
  });

  it("returns null when no panel has an explicit width, even with panelResize true", () => {
    const c = new AppShell();
    c.panelResize = true;
    expect(c.panelStyle).toBeNull();
  });

  it("clamps the width it emits", () => {
    const c = new AppShell();
    c.panelResize = true;
    c.panelMinWidth = 180;
    c.panelMaxWidth = 640;
    c.defaultPanelWidths = { navigationPanel: 9000 };
    expect(c.panelStyle).toBe("--st-appShell-navigation-width: 640px");
  });
});

describe("AppShell — utilityPositive", () => {
  it("is true unless utilitySide is 'right' (default 'right' -> false)", () => {
    const c = new AppShell();
    expect(c.utilitySide).toBe("right");
    expect(c.utilityPositive).toBe(false);
    c.utilitySide = "left";
    expect(c.utilityPositive).toBe(true);
    c.utilitySide = "bottom";
    expect(c.utilityPositive).toBe(true);
  });
});

describe("AppShell — panelResize keyboard interaction (uncontrolled)", () => {
  it("ArrowRight grows a left-edge panel (navigationPanel) by 16px and fires onPanelResize", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    c.onPanelResize = onPanelResize;
    let prevented = false;
    c.onHandleKeydown({ key: "ArrowRight", preventDefault: () => (prevented = true) } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 316);
    expect(c.displayWidth("navigationPanel")).toBe(316);
    expect(prevented).toBe(true);
  });

  it("ArrowLeft shrinks a left-edge panel (navigationPanel) by 16px", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown({ key: "ArrowLeft", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 284);
  });

  it("ArrowRight SHRINKS a right-edge panel (contextPanel) — moving the splitter right moves toward main", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { contextPanel: 300 };
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown({ key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent, "contextPanel", false);
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 284);
    c.onHandleKeydown({ key: "ArrowLeft", preventDefault: () => {} } as unknown as KeyboardEvent, "contextPanel", false);
    expect(onPanelResize).toHaveBeenLastCalledWith("contextPanel", 300);
  });

  it("utilityPanel (default utilitySide='right') resizes like a right-edge panel", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { utilityPanel: 300 };
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown(
      { key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent,
      "utilityPanel",
      c.utilityPositive,
    );
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 284);
  });

  it("utilityPanel with utilitySide='left' resizes like a left-edge panel", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.utilitySide = "left";
    c.defaultPanelWidths = { utilityPanel: 300 };
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown(
      { key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent,
      "utilityPanel",
      c.utilityPositive,
    );
    expect(onPanelResize).toHaveBeenCalledWith("utilityPanel", 316);
  });

  it("Home jumps to panelMinWidth and End jumps to panelMaxWidth, both firing onPanelResize", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    c.panelMinWidth = 150;
    c.panelMaxWidth = 500;
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown({ key: "Home", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 150);
    expect(c.displayWidth("navigationPanel")).toBe(150);
    c.onHandleKeydown({ key: "End", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    expect(c.displayWidth("navigationPanel")).toBe(500);
  });

  it("clamps at the upper bound: repeated ArrowRight never exceeds panelMaxWidth", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 495 };
    c.panelMinWidth = 180;
    c.panelMaxWidth = 500;
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown({ key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 500);
    c.onHandleKeydown({ key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 500);
    expect(c.displayWidth("navigationPanel")).toBe(500);
  });

  it("clamps at the lower bound: repeated ArrowLeft never goes below panelMinWidth", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 190 };
    c.panelMinWidth = 180;
    c.onPanelResize = onPanelResize;
    c.onHandleKeydown({ key: "ArrowLeft", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 180);
  });

  it("ignores keys other than ArrowLeft/ArrowRight/Home/End", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.onPanelResize = onPanelResize;
    let prevented = false;
    c.onHandleKeydown({ key: "Tab", preventDefault: () => (prevented = true) } as unknown as KeyboardEvent, "navigationPanel", true);
    c.onHandleKeydown({ key: "Enter", preventDefault: () => (prevented = true) } as unknown as KeyboardEvent, "navigationPanel", true);
    expect(onPanelResize).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
  });
});

describe("AppShell — panelResize pointer drag (uncontrolled)", () => {
  function fakeHandle(): HTMLElement {
    const captured = new Set<number>();
    return {
      setPointerCapture: (id: number) => captured.add(id),
      hasPointerCapture: (id: number) => captured.has(id),
      releasePointerCapture: (id: number) => captured.delete(id),
    } as unknown as HTMLElement;
  }

  it("dragging a left-edge handle rightward grows the panel and fires onPanelResize on move", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300 };
    c.onPanelResize = onPanelResize;
    const handle = fakeHandle();

    c.onHandlePointerDown(
      { clientX: 100, pointerId: 1, currentTarget: handle, preventDefault: () => {} } as unknown as PointerEvent,
      "navigationPanel",
      true,
    );
    c.onHandlePointerMove({ clientX: 140, pointerId: 1 } as unknown as PointerEvent);
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 340);

    c.onHandlePointerUp({ clientX: 140, pointerId: 1, currentTarget: handle } as unknown as PointerEvent);
    onPanelResize.mockClear();
    // Further movement after pointerup is a no-op (drag ended).
    c.onHandlePointerMove({ clientX: 200, pointerId: 1 } as unknown as PointerEvent);
    expect(onPanelResize).not.toHaveBeenCalled();
  });

  it("dragging a right-edge handle rightward shrinks the panel", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.defaultPanelWidths = { contextPanel: 300 };
    c.onPanelResize = onPanelResize;
    const handle = fakeHandle();

    c.onHandlePointerDown(
      { clientX: 100, pointerId: 1, currentTarget: handle, preventDefault: () => {} } as unknown as PointerEvent,
      "contextPanel",
      false,
    );
    c.onHandlePointerMove({ clientX: 140, pointerId: 1 } as unknown as PointerEvent);
    expect(onPanelResize).toHaveBeenCalledWith("contextPanel", 260);
  });

  it("pointermove before any pointerdown is a no-op", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.onPanelResize = onPanelResize;
    c.onHandlePointerMove({ clientX: 140, pointerId: 1 } as unknown as PointerEvent);
    expect(onPanelResize).not.toHaveBeenCalled();
  });

  it("pointerup before any pointerdown is a no-op (does not throw)", () => {
    const c = new AppShell();
    expect(() => c.onHandlePointerUp({ clientX: 0, pointerId: 1 } as unknown as PointerEvent)).not.toThrow();
  });
});

describe("AppShell — panelResize controlled mode (panelWidths)", () => {
  it("never mutates its own state: displayWidth stays exactly what panelWidths says, even after a commit-triggering interaction", () => {
    const onPanelResize = vi.fn();
    const c = new AppShell();
    c.panelResize = true;
    c.panelWidths = { navigationPanel: 250, contextPanel: 300, utilityPanel: 400 };
    c.onPanelResize = onPanelResize;

    expect(c.displayWidth("navigationPanel")).toBe(250);
    expect(c.panelStyle).toBe(
      "--st-appShell-navigation-width: 250px; --st-appShell-context-width: 300px; --st-appShell-utility-width: 400px",
    );

    c.onHandleKeydown({ key: "ArrowRight", preventDefault: () => {} } as unknown as KeyboardEvent, "navigationPanel", true);
    // onPanelResize told the consumer what the next width *should* be...
    expect(onPanelResize).toHaveBeenCalledWith("navigationPanel", 266);
    // ...but since the consumer never fed that back through `panelWidths`,
    // the component itself must not have changed anything.
    expect(c.displayWidth("navigationPanel")).toBe(250);
    expect(c.panelStyle).toContain("--st-appShell-navigation-width: 250px");

    const handle = { setPointerCapture: () => {}, hasPointerCapture: () => false, releasePointerCapture: () => {} } as unknown as HTMLElement;
    c.onHandlePointerDown(
      { clientX: 0, pointerId: 2, currentTarget: handle, preventDefault: () => {} } as unknown as PointerEvent,
      "navigationPanel",
      true,
    );
    c.onHandlePointerMove({ clientX: 50, pointerId: 2 } as unknown as PointerEvent);
    expect(onPanelResize).toHaveBeenLastCalledWith("navigationPanel", 300);
    expect(c.displayWidth("navigationPanel")).toBe(250);
  });

  it("re-reads from a new panelWidths assignment (the consumer driving the loop back)", () => {
    const c = new AppShell();
    c.panelResize = true;
    c.panelWidths = { navigationPanel: 250 };
    expect(c.panelStyle).toBe("--st-appShell-navigation-width: 250px");
    c.panelWidths = { navigationPanel: 400 };
    expect(c.panelStyle).toBe("--st-appShell-navigation-width: 400px");
  });
});

describe("AppShell — resize handle template gating (component state, not DOM)", () => {
  it("panelResize=false leaves panelStyle null regardless of defaultPanelWidths (no width var is ever rendered)", () => {
    const c = new AppShell();
    c.defaultPanelWidths = { navigationPanel: 300, contextPanel: 300, utilityPanel: 300 };
    expect(c.panelResize).toBe(false);
    expect(c.panelStyle).toBeNull();
  });

  it("utilitySide='bottom' still resolves a display width/clamp for utilityPanel (the template alone withholds the handle)", () => {
    const c = new AppShell();
    c.utilitySide = "bottom";
    c.defaultPanelWidths = { utilityPanel: 300 };
    expect(c.displayWidth("utilityPanel")).toBe(300);
  });
});
