import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Menu from "./lib/Menu.svelte";
import type { MenuItem, MenuSubmenuSide } from "./lib/Menu.svelte";
import OverflowMenu from "./lib/OverflowMenu.svelte";
import MenuPopoverCascadeFixture from "./MenuPopoverCascadeFixture.svelte";

const here = dirname(fileURLToPath(import.meta.url));

const cascadeItems: MenuItem[] = [
  {
    label: "Class A",
    value: "class-a",
    children: [
      { label: "Reason 1", value: "reason-1" },
      { label: "Reason 2", value: "reason-2", disabled: true }
    ]
  },
  { label: "Direct", value: "direct" },
  {
    label: "Class B",
    value: "class-b",
    children: [{ label: "Why", value: "why" }]
  }
];

function mouseProps(x = 0, y = 0) {
  return { pointerType: "mouse", clientX: x, clientY: y };
}

function levelEl(container: HTMLElement, level: number): HTMLElement | null {
  return container.querySelector(`[data-menu-level="${level}"]`);
}

function levelItem(level: HTMLElement | null, name: string): HTMLElement {
  if (!level) throw new Error("missing menu level");
  return within(level as HTMLElement).getByRole("menuitem", { name });
}

function stubRect(el: Element, rect: Partial<DOMRect>) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect
  } as DOMRect);
}

let viewportBackup: { width: number; height: number };

beforeEach(() => {
  vi.useFakeTimers();
  viewportBackup = { width: window.innerWidth, height: window.innerHeight };
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: viewportBackup.width
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: viewportBackup.height
  });
});

describe("Menu cascade — flat compatibility (AC-01)", () => {
  it("keeps identical classes and a single-argument select for flat menus", async () => {
    const onselect = vi.fn();
    const { container } = render(Menu, {
      props: {
        label: "Actions",
        items: [
          { label: "Edit", value: "edit" },
          { label: "Delete", value: "delete", danger: true }
        ],
        onselect
      }
    });
    const root = screen.getByRole("menu");
    expect(root.classList.contains("st-menu")).toBe(true);
    expect(root.classList.contains("st-menu--hasCascade")).toBe(false);
    await fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenCalledWith("edit");
    expect(container.querySelector(".st-menu__item--danger")).toBeTruthy();
  });
});

describe("Menu cascade — parents (AC-02, AC-03, AC-10)", () => {
  it("AC-02: parent exposes popup semantics with a chevron on the preferred side", () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    expect(parent.getAttribute("aria-haspopup")).toBe("menu");
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    const chevron = parent.querySelector(".st-menu__itemChevron--end");
    expect(chevron).toBeTruthy();
    expect(chevron?.querySelector("svg")).toBeTruthy();
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-02: disabled parent keeps chevron and popup but never expands", async () => {
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          {
            label: "Locked",
            value: "locked",
            disabled: true,
            children: [{ label: "Sub", value: "sub" }]
          }
        ]
      }
    });
    const parent = screen.getByRole("menuitem", { name: "Locked" });
    expect(parent.getAttribute("aria-haspopup")).toBe("menu");
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    expect(parent.querySelector(".st-menu__itemChevron")).toBeTruthy();
    await fireEvent.click(parent);
    await fireEvent.keyDown(parent, { key: "Enter" });
    await vi.advanceTimersByTimeAsync(500);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(parent.getAttribute("aria-expanded")).toBe("false");
  });

  it("AC-03: empty children render a leaf that emits the class key", async () => {
    const onselect = vi.fn();
    render(Menu, {
      props: {
        label: "Actions",
        items: [{ label: "Class", value: "class", children: [] }],
        onselect
      }
    });
    const leaf = screen.getByRole("menuitem", { name: "Class" });
    expect(leaf.querySelector(".st-menu__itemChevron")).toBeNull();
    await fireEvent.click(leaf);
    expect(onselect).toHaveBeenCalledWith("class");
  });

  it("AC-10: selected alone renders the class without opening anything", () => {
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          { label: "Picked", value: "picked", selected: true },
          { label: "Other", value: "other" }
        ]
      }
    });
    const picked = screen.getByRole("menuitem", { name: "Picked" });
    expect(picked.classList.contains("st-menu__item--selected")).toBe(true);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(picked.getAttribute("aria-expanded")).toBeNull();
  });
});

describe("Menu cascade — opening (AC-04, AC-05, AC-06)", () => {
  it("AC-04: click opens, selects the line, emits nothing, keeps focus", async () => {
    const onselect = vi.fn();
    render(Menu, { props: { label: "Actions", items: cascadeItems, onselect } });
    const parent = screen.getByRole("menuitem", {
      name: "Class A"
    }) as HTMLButtonElement;
    parent.focus();
    await fireEvent.click(parent);
    await tick();
    const reopened = screen.getByRole("menuitem", { name: "Class A" });
    expect(reopened.getAttribute("aria-expanded")).toBe("true");
    expect(reopened.classList.contains("st-menu__item--selected")).toBe(true);
    expect(onselect).not.toHaveBeenCalled();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(reopened);
  });

  it("AC-05: Enter opens and focuses the first enabled sub item", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    await fireEvent.keyDown(parent, { key: "Enter" });
    await tick();
    const panel = levelEl(document.body, 1);
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(panel, "Reason 1"));
  });

  it("AC-05: Space opens like Enter", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class B" }), {
      key: " "
    });
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Why"));
  });

  it("AC-06: opening arrow opens, opposite arrow closes and refocuses", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    await fireEvent.keyDown(parent, { key: "ArrowRight" });
    await tick();
    const panel = levelEl(document.body, 1);
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(panel, "Reason 1"));
    await fireEvent.keyDown(levelItem(panel, "Reason 1"), { key: "ArrowLeft" });
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
  });
});

describe("Menu cascade — hover intent and safe triangle (AC-07, AC-08, AC-25, AC-38)", () => {
  it("AC-07: hover opens at 150 ms, not at 149 ms, without moving focus", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    // Hover handlers attach to the item wrapper, not the button (§3.1).
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    const before = document.activeElement;
    await fireEvent.pointerEnter(wrap, mouseProps());
    await vi.advanceTimersByTimeAsync(149);
    expect(levelEl(document.body, 1)).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(before);
  });

  it("AC-38: non-mouse pointers never arm hover", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    await fireEvent.pointerEnter(wrap, {
      pointerType: "touch",
      clientX: 0,
      clientY: 0
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-08: diagonal in the triangle survives, panel entry cancels, exit closes", async () => {
    const { container } = render(Menu, {
      props: { label: "Actions", items: cascadeItems }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1);
    expect(panel).toBeTruthy();
    stubRect(panel as Element, {
      left: 200,
      right: 392,
      top: 90,
      bottom: 210,
      width: 192,
      height: 120
    });
    const wrap = levelItem(levelEl(document.body, 0), "Class A").closest(
      ".st-menu__itemWrap"
    ) as HTMLElement;
    // Leave the parent line heading diagonally toward the panel.
    await fireEvent.pointerLeave(wrap, mouseProps(100, 100));
    // Drift inside the triangle: nothing closes past the grace delay.
    await fireEvent.pointerMove(container.querySelector(".st-menu") as HTMLElement, mouseProps(150, 100));
    await vi.advanceTimersByTimeAsync(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Entering the panel cancels everything.
    await fireEvent.pointerEnter(panel as HTMLElement, mouseProps(250, 100));
    await vi.advanceTimersByTimeAsync(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Leaving both the wrapper and the panel closes after 250 ms.
    await fireEvent.pointerLeave(panel as HTMLElement, mouseProps(500, 500));
    await vi.advanceTimersByTimeAsync(249);
    expect(levelEl(document.body, 1)).toBeTruthy();
    await vi.advanceTimersByTimeAsync(1);
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-08: re-entry before expiry cancels the close", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    stubRect(panel, {
      left: 200,
      right: 392,
      top: 90,
      bottom: 210,
      width: 192,
      height: 120
    });
    const wrap = levelItem(levelEl(document.body, 0), "Class A").closest(
      ".st-menu__itemWrap"
    ) as HTMLElement;
    await fireEvent.pointerLeave(wrap, mouseProps(10, 10));
    await vi.advanceTimersByTimeAsync(100);
    await fireEvent.pointerEnter(panel, mouseProps(250, 100));
    await vi.advanceTimersByTimeAsync(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
  });

  it("AC-25: crossing a sibling leaf inside the triangle neither opens nor closes", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    stubRect(panel, {
      left: 200,
      right: 392,
      top: 50,
      bottom: 250,
      width: 192,
      height: 200
    });
    const wrapA = levelItem(levelEl(document.body, 0), "Class A").closest(
      ".st-menu__itemWrap"
    ) as HTMLElement;
    await fireEvent.pointerLeave(wrapA, mouseProps(100, 100));
    // Drift inside the triangle first (cancels the armed close, refreshes apex).
    await fireEvent.pointerMove(
      document.body.querySelector(".st-menu") as HTMLElement,
      mouseProps(150, 100)
    );
    const direct = levelItem(levelEl(document.body, 0), "Direct");
    // The crossed leaf sits inside the A → panel triangle.
    await fireEvent.pointerEnter(direct, mouseProps(155, 105));
    await vi.advanceTimersByTimeAsync(400);
    await tick();
    // No sibling opened and A is still open.
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(
      (screen.getByRole("menuitem", { name: "Class B" }) as HTMLElement).getAttribute(
        "aria-expanded"
      )
    ).toBe("false");
  });

  it("AC-38: unmount during a pending hover fires nothing", async () => {
    const onselect = vi.fn();
    const { unmount } = render(Menu, {
      props: { label: "Actions", items: cascadeItems, onselect }
    });
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    await fireEvent.pointerEnter(wrap, mouseProps());
    unmount();
    await vi.advanceTimersByTimeAsync(500);
    expect(onselect).not.toHaveBeenCalled();
  });
});

describe("Menu cascade — switching, leaves, disabled (AC-09, AC-11, AC-12)", () => {
  it("AC-09: sibling switch closes the first panel and keeps explicit selection", async () => {
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          {
            label: "Class A",
            value: "class-a",
            children: [{ label: "Reason 1", value: "reason-1" }]
          },
          {
            label: "Class B",
            value: "class-b",
            selected: true,
            children: [{ label: "Why", value: "why" }]
          }
        ]
      }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelItem(levelEl(document.body, 1), "Reason 1")).toBeTruthy();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class B" }));
    await tick();
    expect(levelItem(levelEl(document.body, 1), "Why")).toBeTruthy();
    const reopenedA = screen.getByRole("menuitem", { name: "Class A" });
    expect(reopenedA.getAttribute("aria-expanded")).toBe("false");
    expect(reopenedA.classList.contains("st-menu__item--selected")).toBe(false);
    // Explicit selection is kept on B even while open.
    expect(
      screen
        .getByRole("menuitem", { name: "Class B" })
        .classList.contains("st-menu__item--selected")
    ).toBe(true);
  });

  it("AC-11: deep leaf emits once with the full path and closes all", async () => {
    const onselect = vi.fn();
    render(Menu, { props: { label: "Actions", items: cascadeItems, onselect } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    await fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect).toHaveBeenCalledWith(
      "reason-1",
      expect.objectContaining({ path: ["class-a", "reason-1"] })
    );
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-11: root leaf in a cascade menu emits a length-1 path", async () => {
    const onselect = vi.fn();
    render(Menu, { props: { label: "Actions", items: cascadeItems, onselect } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Direct" }));
    expect(onselect).toHaveBeenCalledWith(
      "direct",
      expect.objectContaining({ path: ["direct"] })
    );
  });

  it("AC-12: disabled parent never opens and disabled items are skipped", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    parent.focus();
    await fireEvent.keyDown(parent, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Direct" }));
    // The disabled "Reason 2" is skipped in-panel.
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    const first = levelItem(panel, "Reason 1");
    await fireEvent.keyDown(first, { key: "ArrowDown" });
    // Wraps back to Reason 1, skipping disabled Reason 2.
    expect(document.activeElement).toBe(first);
  });
});

describe("Menu cascade — level-local keyboard and roving (AC-13, AC-31, AC-32)", () => {
  it("AC-13: arrows and Home/End wrap inside the current level only", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    const reason = levelItem(panel, "Reason 1");
    reason.focus();
    await fireEvent.keyDown(reason, { key: "End" });
    // Single enabled item: stays (disabled Reason 2 is skipped).
    expect(document.activeElement).toBe(reason);
    await fireEvent.keyDown(reason, { key: "Home" });
    expect(document.activeElement).toBe(reason);
    // Root level is untouched: exactly one roving target per open level.
    for (const level of [0, 1]) {
      const root = levelEl(document.body, level) as HTMLElement;
      expect(
        root.querySelectorAll('[role="menuitem"][tabindex="0"]').length
      ).toBe(1);
    }
  });

  it("AC-31: all-disabled level opens with no focus target and no roving zero", async () => {
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          {
            label: "Class",
            value: "class",
            children: [{ label: "Off", value: "off", disabled: true }]
          }
        ]
      }
    });
    const parent = screen.getByRole("menuitem", { name: "Class" }) as HTMLButtonElement;
    parent.focus();
    await fireEvent.click(parent);
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Class" })
    );
    expect(panel.querySelectorAll('[role="menuitem"][tabindex="0"]').length).toBe(0);
    // Enter opens but focus stays on the parent line (no target).
    await fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class" }), {
      key: "Enter"
    });
    await tick();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Class" })
    );
  });

  it("AC-32: Tab closes everything without trapping focus", async () => {
    render(Menu, {
      props: { label: "Actions", items: cascadeItems, dismissOnSelect: true }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const sub = levelItem(levelEl(document.body, 1), "Reason 1");
    const notPrevented = await fireEvent.keyDown(sub, { key: "Tab" });
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(notPrevented).toBe(true);
  });
});

describe("Menu cascade — Escape per level (AC-14)", () => {
  it("closes the sub-menu first and refocuses the parent line", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const sub = levelItem(levelEl(document.body, 1), "Reason 1");
    const notPrevented = await fireEvent.keyDown(sub, { key: "Escape" });
    await tick();
    // Per-level Esc calls preventDefault + stopPropagation (D4).
    expect(notPrevented).toBe(false);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
  });

  it("closes a sub-menu even when dismissOnSelect is false", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    await fireEvent.keyDown(levelItem(levelEl(document.body, 1), "Reason 1"), {
      key: "Escape"
    });
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("closes the standalone root only when dismissOnSelect is true", async () => {
    render(Menu, {
      props: { label: "Actions", items: cascadeItems, dismissOnSelect: true }
    });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    await fireEvent.keyDown(parent, { key: "Escape" });
    await tick();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("keeps the standalone root open on Esc when dismissOnSelect is false", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), {
      key: "Escape"
    });
    await tick();
    expect(screen.getByRole("menu")).toBeTruthy();
  });
});

describe("Menu cascade — toggle, duplicates, depth (AC-28, AC-29, AC-30, AC-18)", () => {
  it("AC-29: second click closes the level, keeps focus, emits nothing", async () => {
    const onselect = vi.fn();
    render(Menu, { props: { label: "Actions", items: cascadeItems, onselect } });
    const parent = screen.getByRole("menuitem", {
      name: "Class A"
    }) as HTMLButtonElement;
    parent.focus();
    await fireEvent.click(parent);
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
    expect(onselect).not.toHaveBeenCalled();
  });

  it("AC-30: opening arrow on an open parent focuses first without closing", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    const wrap = parent.closest(".st-menu__itemWrap") as HTMLElement;
    await fireEvent.pointerEnter(wrap, mouseProps());
    await vi.advanceTimersByTimeAsync(150);
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    parent.focus();
    await fireEvent.keyDown(parent, { key: "ArrowRight" });
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Reason 1"));
  });

  it("AC-28: duplicate sibling keys follow the index path with one warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          { label: "Same one", value: "same", children: [{ label: "One", value: "one" }] },
          { label: "Same two", value: "same", children: [{ label: "Two", value: "two" }] }
        ]
      }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Same one" }));
    await tick();
    expect(levelItem(levelEl(document.body, 1), "One")).toBeTruthy();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Same two" }));
    await tick();
    // Siblings never open together: the second panel replaced the first.
    expect(levelItem(levelEl(document.body, 1), "Two")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("AC-18: second level opens; deeper children render as leaves with a per-key warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onselect = vi.fn();
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          {
            label: "Class",
            value: "class",
            children: [
              {
                label: "Mid",
                value: "mid",
                children: [
                  { label: "Deep", value: "deep" },
                  {
                    label: "Too deep",
                    value: "too-deep",
                    children: [{ label: "Never", value: "never" }]
                  }
                ]
              }
            ]
          }
        ],
        onselect
      }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    await tick();
    await fireEvent.click(levelItem(levelEl(document.body, 1), "Mid"));
    await tick();
    const level2 = levelEl(document.body, 2) as HTMLElement;
    expect(level2).toBeTruthy();
    // A depth-2 item bearing children renders as a leaf: no chevron.
    const tooDeep = within(level2).getByRole("menuitem", { name: "Too deep" });
    expect(tooDeep.querySelector(".st-menu__itemChevron")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    // Closing and reopening does not warn again for the same key.
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    await tick();
    await fireEvent.click(levelItem(levelEl(document.body, 1), "Mid"));
    await tick();
    expect(warn).toHaveBeenCalledTimes(1);
    // A depth-2 leaf emits a length-3 path.
    await fireEvent.click(within(levelEl(document.body, 2) as HTMLElement).getByRole("menuitem", { name: "Deep" }));
    expect(onselect).toHaveBeenCalledWith(
      "deep",
      expect.objectContaining({ path: ["class", "mid", "deep"] })
    );
  });
});

describe("Menu cascade — sides, groups, items change (AC-19, AC-20, AC-21, AC-22)", () => {
  async function openWithGeometry(
    props: { submenuSide?: MenuSubmenuSide },
    menuRect: Partial<DOMRect>,
    itemTop: number
  ) {
    const rendered = render(Menu, {
      props: { label: "Actions", items: cascadeItems, ...props }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const root = levelEl(document.body, 0) as Element;
    const button = within(root as HTMLElement).getByRole("menuitem", {
      name: "Class A"
    });
    const panel = levelEl(document.body, 1) as Element;
    stubRect(root, { ...menuRect });
    stubRect(button, { top: itemTop, left: menuRect.left ?? 0 });
    stubRect(panel, { width: 192, height: 100 });
    window.dispatchEvent(new Event("resize"));
    await tick();
    return rendered;
  }

  it("AC-19: flipped side drives chevron and opening arrow", async () => {
    await openWithGeometry({ submenuSide: "auto" }, { left: 700, right: 892 }, 200);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    expect(parent.querySelector(".st-menu__itemChevron--start")).toBeTruthy();
    expect(parent.querySelector(".st-menu__itemChevron--end")).toBeNull();
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel.style.left).toBe("508px");
    // While flipped open, the opening arrow is ArrowLeft: it focuses the
    // first enabled item without closing (AC-30 on the resolved side).
    parent.focus();
    await fireEvent.keyDown(parent, { key: "ArrowLeft" });
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Reason 1"));
  });

  it("AC-20: submenuSide left pins left while auto prefers right", async () => {
    await openWithGeometry({ submenuSide: "left" }, { left: 400, right: 592 }, 200);
    expect(
      screen
        .getByRole("menuitem", { name: "Class A" })
        .querySelector(".st-menu__itemChevron--start")
    ).toBeTruthy();
    expect((levelEl(document.body, 1) as HTMLElement).style.left).toBe("208px");
  });

  it("AC-20: auto prefers right on the same geometry", async () => {
    await openWithGeometry({ submenuSide: "auto" }, { left: 400, right: 592 }, 200);
    expect(
      screen
        .getByRole("menuitem", { name: "Class A" })
        .querySelector(".st-menu__itemChevron--end")
    ).toBeTruthy();
    expect((levelEl(document.body, 1) as HTMLElement).style.left).toBe("592px");
  });

  it("AC-21: groups and dividers render in children; grouped leaf path skips the group", async () => {
    const onselect = vi.fn();
    render(Menu, {
      props: {
        label: "Actions",
        items: [
          {
            label: "Class",
            value: "class",
            children: [
              { kind: "group", label: "Class — reason" },
              { label: "R1", value: "r1" },
              { kind: "divider" },
              { label: "R2", value: "r2" }
            ]
          }
        ],
        onselect
      }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(within(panel).getByText("Class — reason")).toBeTruthy();
    expect(panel.querySelector('[role="separator"]')).toBeTruthy();
    await fireEvent.click(within(panel).getByRole("menuitem", { name: "R2" }));
    expect(onselect).toHaveBeenCalledWith(
      "r2",
      expect.objectContaining({ path: ["class", "r2"] })
    );
  });

  it("AC-22: removing the open index path removes orphan panels", async () => {
    const { rerender } = render(Menu, {
      props: { label: "Actions", items: cascadeItems }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    await rerender({ label: "Actions", items: [{ label: "Direct", value: "direct" }] });
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-22/38: items change cancels a pending hover open", async () => {
    const { rerender } = render(Menu, {
      props: { label: "Actions", items: cascadeItems }
    });
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    await fireEvent.pointerEnter(wrap, mouseProps());
    await vi.advanceTimersByTimeAsync(100);
    await rerender({ label: "Actions", items: [{ label: "Direct", value: "direct" }] });
    await vi.advanceTimersByTimeAsync(200);
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
  });
});

describe("Menu cascade — shadow, cap, containing block (AC-23, AC-27, AC-36)", () => {
  it("AC-23: cascade marker class and popover shadow chain; flat keeps menu shadow", () => {
    const flat = render(Menu, {
      props: {
        label: "Actions",
        items: [{ label: "Edit", value: "edit" }]
      }
    });
    const flatRoot = flat.container.querySelector(".st-menu") as HTMLElement;
    expect(flatRoot.classList.contains("st-menu--hasCascade")).toBe(false);
    flat.unmount();
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    const root = document.body.querySelector(".st-menu--hasCascade") as HTMLElement;
    expect(root).toBeTruthy();
    const source = readFileSync(join(here, "lib", "Menu.svelte"), "utf8");
    expect(source).toContain("--st-component-popover-shadow");
    expect(source).toContain("--st-component-selectableRow-selectedBackground");
    expect(source).toContain("--st-component-selectableRow-selectedText");
    const submenuRule = source.match(/\.st-menu--submenu \{[^}]*\}/s)?.[0] ?? "";
    expect(submenuRule).toContain("--st-component-popover-shadow");
  });

  it("AC-27: narrow viewport caps the panel width with min-width 0", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 160
    });
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const style = (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("left: 8px");
    expect(style).toContain("min-width: 0");
  });

  it("AC-36: converted position under a transformed host ancestor", async () => {
    render(Menu, { props: { label: "Actions", items: cascadeItems } });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const root = levelEl(document.body, 0) as Element;
    const panel = levelEl(document.body, 1) as Element;
    stubRect(root, { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 });
    stubRect(panel, { width: 0, height: 0 });
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          transform: "translateX(-100%)",
          filter: "none",
          perspective: "none",
          contain: "none",
          willChange: "auto"
        }) as unknown as CSSStyleDeclaration
    );
    const host = document.body.querySelector(".st-menu") as Element;
    stubRect(host, { top: 40, left: 60, right: 260, bottom: 200, width: 200, height: 160 });
    window.dispatchEvent(new Event("resize"));
    await tick();
    // Solver output (top 8, left 8 after the viewport clamp) converted
    // into the containing-block frame.
    const style = (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -52px");
  });
});

describe("Menu cascade — outside (AC-15)", () => {
  it("closes on outside pointer down with dismissOnSelect", async () => {
    render(Menu, {
      props: { label: "Actions", items: cascadeItems, dismissOnSelect: true }
    });
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    await fireEvent.pointerDown(document.body);
    await tick();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("host panels and trigger are never outside (composedPath)", async () => {
    const trigger = document.createElement("div");
    document.body.appendChild(trigger);
    render(MenuPopoverCascadeFixture, {
      props: { open: true, trigger, items: cascadeItems }
    });
    await tick();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel).toBeTruthy();
    // Pointer down ON the trigger and ON a sub-panel keeps everything open.
    await fireEvent.pointerDown(trigger);
    await tick();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await fireEvent.pointerDown(panel);
    await tick();
    expect(screen.getByRole("dialog")).toBeTruthy();
    // A target outside the host whose composed path still includes a panel
    // counts as inside (shadow-safe close): a real path always carries the
    // ancestors, so the stub includes the popover panel too.
    const dialog = screen.getByRole("dialog");
    const event = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(event, "composedPath", { value: () => [document.body, panel, dialog] });
    document.body.dispatchEvent(event);
    await tick();
    expect(screen.getByRole("dialog")).toBeTruthy();
    trigger.remove();
  });
});

describe("Menu cascade — hosts (AC-14, AC-33, AC-34, AC-35)", () => {
  it("AC-14: OverflowMenu Esc closes the sub-menu, then everything with trigger focus", async () => {
    render(OverflowMenu, {
      props: { triggerLabel: "Row actions", items: cascadeItems }
    });
    const trigger = screen.getByRole("button", { name: "Row actions" });
    await fireEvent.click(trigger);
    await tick();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    await fireEvent.keyDown(levelItem(levelEl(document.body, 1), "Reason 1"), {
      key: "Escape"
    });
    await tick();
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.getByRole("menu")).toBeTruthy();
    await fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), {
      key: "Escape"
    });
    await tick();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("AC-33: OverflowMenu trigger aria-controls resolves to the root menu", async () => {
    render(OverflowMenu, {
      props: { triggerLabel: "Row actions", items: cascadeItems }
    });
    const trigger = screen.getByRole("button", { name: "Row actions" });
    expect(trigger.getAttribute("aria-controls")).toBeNull();
    await fireEvent.click(trigger);
    await tick();
    const controls = trigger.getAttribute("aria-controls") as string;
    expect(controls).toBeTruthy();
    const root = document.getElementById(controls);
    expect(root?.getAttribute("role")).toBe("menu");
  });

  it("AC-33: MenuPopover sets aria-controls on an external trigger while open", async () => {
    const external = document.createElement("button");
    external.textContent = "Open";
    document.body.appendChild(external);
    const rendered = render(MenuPopoverCascadeFixture, {
      props: { open: true, trigger: external, items: cascadeItems }
    });
    await tick();
    const controls = external.getAttribute("aria-controls") as string;
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls)?.getAttribute("role")).toBe("menu");
    await fireEvent.keyDown(window, { key: "Escape" });
    await tick();
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
    expect(external.getAttribute("aria-controls")).toBeNull();
    expect(document.activeElement).toBe(external);
    external.remove();
  });

  it("AC-34: MenuPopover + Menu — first Esc closes the sub-menu only", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(MenuPopoverCascadeFixture, {
      props: { open: true, trigger, items: cascadeItems }
    });
    await tick();
    trigger.focus();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(levelEl(document.body, 1)).toBeTruthy();
    const stopped = await fireEvent.keyDown(
      levelItem(levelEl(document.body, 1), "Reason 1"),
      { key: "Escape" }
    );
    await tick();
    // The level consumed the key: the host never closed.
    expect(stopped).toBe(false);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), {
      key: "Escape"
    });
    await tick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("AC-35: deep leaf via OverflowMenu relays value and path; parent emits nothing", async () => {
    const onselect = vi.fn();
    const itemClick = vi.fn();
    render(OverflowMenu, {
      props: {
        triggerLabel: "Row actions",
        items: [
          {
            label: "Class A",
            value: "class-a",
            onclick: itemClick,
            children: [{ label: "Reason 1", value: "reason-1" }]
          }
        ],
        onselect
      }
    });
    await fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    await tick();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    // Parent activation opens the sub-menu without emitting or closing.
    expect(onselect).not.toHaveBeenCalled();
    expect(itemClick).not.toHaveBeenCalled();
    expect(levelEl(document.body, 1)).toBeTruthy();
    await fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    await tick();
    expect(itemClick).not.toHaveBeenCalled();
    expect(onselect).toHaveBeenCalledWith(
      "reason-1",
      expect.objectContaining({ path: ["class-a", "reason-1"] })
    );
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("AC-35: deep leaf via MenuPopover + Menu relays value and path", async () => {
    const onselect = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(MenuPopoverCascadeFixture, {
      props: { open: true, trigger, items: cascadeItems, onselect }
    });
    await tick();
    await fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    await tick();
    expect(onselect).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    await tick();
    expect(onselect).toHaveBeenCalledWith(
      "reason-1",
      expect.objectContaining({ path: ["class-a", "reason-1"] })
    );
    // Pointer leaf closes the host without moving focus.
    expect(screen.queryByRole("dialog")).toBeNull();
    trigger.remove();
  });
});

describe("Menu cascade — OverflowMenu flat regression (AC-37)", () => {
  // D5 refactors OverflowMenu to render Menu (no duplicated cascade), but the
  // flat DOM keeps the origin/main `st-overflowMenu__*` class set on the same
  // elements via the internal Menu class hook. This guard pins that contract:
  // host/trigger DOM and classes, the full inner class set, roles, labels,
  // disabled/danger behaviour, single-argument select, close and keyboard.
  it("keeps the flat origin/main class set, roles and select contract", async () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const { container } = render(OverflowMenu, {
      props: {
        triggerLabel: "Row actions",
        items: [
          { value: "edit", label: "Edit", icon: "E", onclick: itemClick },
          { value: "delete", label: "Delete", danger: true },
          { kind: "divider" },
          { kind: "group", label: "More" },
          { value: "archive", label: "Archive", disabled: true }
        ],
        onselect: onSelect
      }
    });
    const host = container.querySelector(".st-overflowMenu") as HTMLElement;
    expect(host).toBeTruthy();
    expect(host.classList.contains("st-overflowMenu--bottom-end")).toBe(true);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    expect(trigger.classList.contains("st-overflowMenu__trigger")).toBe(true);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.querySelector("svg")).toBeTruthy();
    expect(screen.queryByRole("menu")).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("menu", { name: "Menu" });
    expect(menu.tagName).toBe("UL");
    expect(menu.classList.contains("st-overflowMenu__list")).toBe(true);
    // No `st-menu*` row classes leak into the flat OverflowMenu DOM: they
    // would perturb the restored visual (D6).
    expect(container.querySelector(".st-menu")).toBeNull();
    expect(container.querySelector(".st-menu__item")).toBeNull();

    const listItems = container.querySelectorAll("li.st-overflowMenu__listItem");
    expect(listItems.length).toBe(3);
    const itemButtons = container.querySelectorAll("button.st-overflowMenu__item");
    expect(itemButtons.length).toBe(3);
    const editItem = screen.getByRole("menuitem", { name: "Edit" });
    expect(editItem.classList.contains("st-overflowMenu__item")).toBe(true);
    expect(
      screen.getByRole("menuitem", { name: "Delete" }).classList.contains("st-overflowMenu__item--danger")
    ).toBe(true);
    expect(screen.getByRole("menuitem", { name: "Archive" }).getAttribute("aria-disabled")).toBe("true");
    expect(container.querySelector(".st-overflowMenu__itemIcon")?.textContent).toBe("E");
    expect(
      Array.from(container.querySelectorAll(".st-overflowMenu__itemLabel")).map((el) => el.textContent)
    ).toEqual(["Edit", "Delete", "Archive"]);
    const divider = container.querySelector("li.st-overflowMenu__divider");
    expect(divider?.getAttribute("role")).toBe("separator");
    const group = container.querySelector("li.st-overflowMenu__group");
    expect(group?.getAttribute("role")).toBe("presentation");
    expect(group?.textContent).toBe("More");

    await fireEvent.click(editItem);
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]).toEqual(["edit"]);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("restores the origin/main list/item CSS rules", () => {
    const source = readFileSync(join(here, "lib/OverflowMenu.svelte"), "utf8");
    const style = source.slice(source.indexOf("<style>"));
    for (const selector of [
      ".st-overflowMenu__list",
      ".st-overflowMenu__listItem",
      ".st-overflowMenu__item",
      ".st-overflowMenu__item--danger",
      ".st-overflowMenu__itemIcon",
      ".st-overflowMenu__itemLabel",
      ".st-overflowMenu__group",
      ".st-overflowMenu__divider"
    ]) {
      expect(style).toContain(selector);
    }
  });

  it("keeps flat keyboard navigation with disabled items skipped", async () => {
    render(OverflowMenu, {
      props: {
        triggerLabel: "Row actions",
        items: [
          { value: "edit", label: "Edit" },
          { value: "archive", label: "Archive", disabled: true },
          { value: "delete", label: "Delete" }
        ]
      }
    });
    const trigger = screen.getByRole("button", { name: "Row actions" });
    await fireEvent.click(trigger);
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const deleteItem = screen.getByRole("menuitem", { name: "Delete" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(edit);
    await fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(deleteItem);
    await fireEvent.keyDown(deleteItem, { key: "ArrowUp" });
    expect(document.activeElement).toBe(edit);
  });
});
