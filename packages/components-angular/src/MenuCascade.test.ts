import "@angular/compiler";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Menu } from "../dist/Menu.js";
import type { MenuActionItem, MenuItem, MenuSelectPath } from "../dist/Menu.js";
import { MenuPopover } from "../dist/MenuPopover.js";
import { MenuTriggerButton } from "../dist/MenuTriggerButton.js";
import { OverflowMenu } from "../dist/OverflowMenu.js";

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

function makeMenu(items: MenuItem[]): Menu {
  const menu = new Menu();
  menu.items = items;
  menu.ngOnChanges({ items: {} } as never);
  return menu;
}

function keyEvent(key: string): KeyboardEvent & { __prevented: boolean; __stopped: boolean } {
  const state = { prevented: false, stopped: false };
  const event = {
    key,
    preventDefault: () => {
      state.prevented = true;
    },
    stopPropagation: () => {
      state.stopped = true;
    },
    currentTarget: undefined,
    get __prevented() {
      return state.prevented;
    },
    get __stopped() {
      return state.stopped;
    }
  } as unknown as KeyboardEvent & { __prevented: boolean; __stopped: boolean };
  Object.defineProperty(event, "__prevented", { enumerable: true, get: () => state.prevented });
  Object.defineProperty(event, "__stopped", { enumerable: true, get: () => state.stopped });
  return event;
}

function pointerEvent(pointerType: string, clientX = 0, clientY = 0): PointerEvent {
  return { pointerType, clientX, clientY, target: {} } as unknown as PointerEvent;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Menu cascade — flat compatibility (AC-01)", () => {
  it("keeps identical classes and an unchanged bare select for flat menus", () => {
    const menu = makeMenu([
      { label: "Edit", value: "edit" },
      { label: "Delete", value: "delete", danger: true }
    ] as MenuItem[]);
    expect(menu.hasCascade).toBe(false);
    expect(menu.hostClass).toContain("st-menu");
    expect(menu.hostClass).not.toContain("st-menu--hasCascade");
    const seen: MenuActionItem[] = [];
    const seenPath: MenuSelectPath[] = [];
    menu.select.subscribe((item) => seen.push(item as MenuActionItem));
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    const edit = menu.items[0] as MenuActionItem;
    menu.onItemClick(edit);
    expect(seen.length).toBe(1);
    expect(seen[0]).toBe(edit);
    // D1 : additive selectPath for every leaf (root leaf -> path length 1).
    expect(seenPath.length).toBe(1);
    expect(seenPath[0].item).toBe(edit);
    expect(seenPath[0].path).toEqual(["edit"]);
  });
});

describe("Menu cascade — parents (AC-02, AC-03, AC-10)", () => {
  it("AC-02: parent exposes popup semantics with a chevron on the preferred side", () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    expect(menu.hasSubMenu(parent)).toBe(true);
    expect(menu.isParent(0, 0, parent)).toBe(true);
    expect(menu.isOpen(0, 0)).toBe(false);
    expect(menu.chevronSide(0, 0)).toBe("right");
    const source = readFileSync(join(here, "Menu.ts"), "utf8");
    expect(source).toContain("[attr.aria-haspopup]");
    expect(source).toContain("[attr.aria-expanded]");
    expect(source).toContain("st-menu__itemChevron--end");
    expect(source).toContain("st-menu__itemChevron--start");
    expect(source).toContain("m9 18 6-6-6-6");
    expect(source).toContain("m15 18-6-6 6-6");
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-02: disabled parent keeps chevron and popup but never expands", () => {
    const menu = makeMenu([
      {
        label: "Locked",
        value: "locked",
        disabled: true,
        children: [{ label: "Sub", value: "sub" }]
      }
    ] as MenuItem[]);
    const parent = menu.items[0] as MenuActionItem;
    expect(menu.isParent(0, 0, parent)).toBe(true);
    menu.toggleParent(0, 0);
    expect(menu.openPath.length).toBe(0);
    menu.openParent(0, 0, true);
    expect(menu.openPath.length).toBe(0);
    const source = readFileSync(join(here, "Menu.ts"), "utf8");
    // Disabled parent: aria-expanded never "true" (bound to "false" when disabled).
    expect(source).toContain('asAction(item).disabled ? \'false\'');
  });

  it("AC-03: empty children render a leaf that emits the class key", () => {
    const menu = makeMenu([{ label: "Class", value: "class", children: [] }] as MenuItem[]);
    const leaf = menu.items[0] as MenuActionItem;
    expect(menu.hasSubMenu(leaf)).toBe(false);
    expect(menu.isParent(0, 0, leaf)).toBe(false);
    const seen: MenuActionItem[] = [];
    const seenPath: MenuSelectPath[] = [];
    menu.select.subscribe((item) => seen.push(item as MenuActionItem));
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    menu.onItemClick(leaf, 0, 0);
    expect(seen).toEqual([leaf]);
    expect(seenPath[0].path).toEqual(["class"]);
  });

  it("AC-10: selected alone renders the class without opening anything", () => {
    const menu = makeMenu([
      { label: "Picked", value: "picked", selected: true },
      { label: "Other", value: "other" }
    ] as MenuItem[]);
    const picked = menu.items[0] as MenuActionItem;
    expect(menu.itemClass(picked, 0, 0)).toContain("st-menu__item--selected");
    expect(menu.openPath.length).toBe(0);
    // Leaf selected has no popup semantics (no aria-expanded in template for leaves).
    const source = readFileSync(join(here, "Menu.ts"), "utf8");
    expect(source).toContain("st-menu__item--selected");
  });
});

describe("Menu cascade — opening (AC-04, AC-05, AC-06)", () => {
  it("AC-04: toggleParent opens, selects the line, emits nothing", () => {
    const menu = makeMenu(cascadeItems);
    const seen: MenuActionItem[] = [];
    menu.select.subscribe((item) => seen.push(item as MenuActionItem));
    menu.roving[0] = 0;
    menu.toggleParent(0, 0);
    expect(menu.openPath).toEqual([0]);
    expect(menu.isOpen(0, 0)).toBe(true);
    const parent = menu.items[0] as MenuActionItem;
    expect(menu.itemClass(parent, 0, 0)).toContain("st-menu__item--selected");
    expect(seen.length).toBe(0);
  });

  it("AC-05: Enter opens the parent (focus target is a DOM concern, AC-24)", () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    const event = keyEvent("Enter");
    menu.onItemKeyDown(event, 0, 0, parent);
    expect(event.__prevented).toBe(true);
    expect(menu.openPath).toEqual([0]);
  });

  it("AC-05: Space opens like Enter", () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[2] as MenuActionItem;
    const event = keyEvent(" ");
    menu.onItemKeyDown(event, 0, 2, parent);
    expect(menu.openPath).toEqual([2]);
  });

  it("AC-06: opening arrow opens, opposite arrow closes and refocuses the parent line", () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    const opening = keyEvent("ArrowRight");
    menu.onItemKeyDown(opening, 0, 0, parent);
    expect(menu.openPath).toEqual([0]);
    // Opposite arrow inside the sub-menu closes the deepest level only.
    const level1 = menu.levelItems(1);
    const leaf = level1[0] as MenuActionItem;
    const closing = keyEvent("ArrowLeft");
    menu.onItemKeyDown(closing, 1, 0, leaf);
    expect(menu.openPath.length).toBe(0);
    expect(menu.roving[0]).toBe(0);
  });

  it("AC-12: disabled parent never opens and disabled items are skipped per level", () => {
    const menu = makeMenu(cascadeItems);
    expect(menu.firstEnabledIndex(cascadeItems)).toBe(0);
    menu.toggleParent(0, 0);
    const level1 = menu.levelItems(1);
    // Reason 2 is disabled: the first enabled in level 1 is index 0.
    expect(menu.firstEnabledIndex(level1)).toBe(0);
    // Disabled parent never opens.
    const locked = makeMenu([
      {
        label: "Locked",
        value: "locked",
        disabled: true,
        children: [{ label: "Sub", value: "sub" }]
      }
    ] as MenuItem[]);
    locked.toggleParent(0, 0);
    expect(locked.openPath.length).toBe(0);
  });

  it("AC-13: roving is level-local (one target per level; no target when all disabled)", () => {
    const menu = makeMenu(cascadeItems);
    expect(menu.rovingTarget(0, cascadeItems)).toBe(0);
    menu.toggleParent(0, 0);
    const level1 = menu.levelItems(1);
    expect(menu.rovingTarget(1, level1)).toBe(0);
    const source = readFileSync(join(here, "Menu.ts"), "utf8");
    expect(source).toContain("[attr.tabindex]");
    expect(source).toContain("rovingTarget");
    expect(source).not.toContain("tabindex=\"0\"");
    // AC-31 : all-disabled level -> -1 (no tabindex 0).
    const off = makeMenu([
      {
        label: "Class",
        value: "class",
        children: [{ label: "Off", value: "off", disabled: true }]
      }
    ] as MenuItem[]);
    off.toggleParent(0, 0);
    expect(off.openPath).toEqual([0]);
    // No enabled item: focus target is -1, focus stays on the parent line.
    expect(off.firstEnabledIndex(off.levelItems(1))).toBe(-1);
    expect(off.focusFirstEnabled(1)).toBe(false);
  });
});

describe("Menu cascade — hover intent and timers (AC-07, AC-38)", () => {
  it("AC-07: hover opens at 150 ms, not at 149 ms", async () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    menu.onParentPointerEnter(0, 0, parent, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(149);
    expect(menu.openPath.length).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(menu.openPath).toEqual([0]);
  });

  it("AC-38: non-mouse pointers never arm hover", async () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    menu.onParentPointerEnter(0, 0, parent, pointerEvent("touch"));
    await vi.advanceTimersByTimeAsync(500);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-08: leaving both closes after 250 ms; re-entry cancels", async () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    expect(menu.openPath).toEqual([0]);
    menu.onPanelPointerLeave(0, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(249);
    expect(menu.openPath).toEqual([0]);
    // Re-entry before expiry cancels the close.
    menu.onPanelPointerEnter(pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(400);
    expect(menu.openPath).toEqual([0]);
    // Leaving again closes after the full delay.
    menu.onPanelPointerLeave(0, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(250);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-38: unmount during a pending hover fires nothing", async () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    menu.onParentPointerEnter(0, 0, parent, pointerEvent("mouse"));
    menu.ngOnDestroy();
    await vi.advanceTimersByTimeAsync(500);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-38: leaving the parent before the hover delay cancels the pending open", async () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    menu.onParentPointerEnter(0, 0, parent, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(100);
    menu.onParentPointerLeave(0, 0, parent, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(200);
    expect(menu.openPath.length).toBe(0);
  });
});

describe("Menu cascade — switching, leaves, depth (AC-09, AC-11, AC-18, AC-29)", () => {
  it("AC-09: sibling switch closes the first panel and keeps explicit selection", () => {
    const menu = makeMenu([
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
    ] as MenuItem[]);
    menu.toggleParent(0, 0);
    expect(menu.levelItems(1)[0]).toMatchObject({ value: "reason-1" });
    menu.toggleParent(0, 1);
    expect(menu.levelItems(1)[0]).toMatchObject({ value: "why" });
    const first = menu.items[0] as MenuActionItem;
    expect(menu.isOpen(0, 0)).toBe(false);
    expect(menu.itemClass(first, 0, 0)).not.toContain("st-menu__item--selected");
    const second = menu.items[1] as MenuActionItem;
    expect(menu.itemClass(second, 0, 1)).toContain("st-menu__item--selected");
  });

  it("AC-11: deep leaf emits the bare item once plus selectPath and closes all", () => {
    const menu = makeMenu(cascadeItems);
    const seen: MenuActionItem[] = [];
    const seenPath: MenuSelectPath[] = [];
    menu.select.subscribe((item) => seen.push(item as MenuActionItem));
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    menu.toggleParent(0, 0);
    const leaf = menu.levelItems(1)[0] as MenuActionItem;
    menu.onItemClick(leaf, 1, 0);
    expect(seen.length).toBe(1);
    // Angular `select` still emits the bare leaf item (D1).
    expect(seen[0]).toBe(leaf);
    expect(seenPath.length).toBe(1);
    expect(seenPath[0].item).toBe(leaf);
    expect(seenPath[0].path).toEqual(["class-a", "reason-1"]);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-11: root leaf in a cascade menu emits a length-1 path", () => {
    const menu = makeMenu(cascadeItems);
    const seenPath: MenuSelectPath[] = [];
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    const direct = menu.items[1] as MenuActionItem;
    menu.onItemClick(direct, 0, 1);
    expect(seenPath[0].path).toEqual(["direct"]);
  });

  it("AC-11 key derivation: id wins over value, then label text, then index", () => {
    const menu = makeMenu(cascadeItems);
    expect(menu.keyOf({ label: "L", id: "i", value: "v" } as MenuActionItem, 3)).toBe("i");
    expect(menu.keyOf({ label: "L", value: "v" } as MenuActionItem, 3)).toBe("v");
    expect(menu.keyOf({ label: "Text" } as MenuActionItem, 3)).toBe("Text");
    expect(menu.keyOf({ label: null } as unknown as MenuActionItem, 3)).toBe("3");
  });

  it("AC-29: second click closes the level and emits nothing", () => {
    const menu = makeMenu(cascadeItems);
    const seen: MenuActionItem[] = [];
    menu.select.subscribe((item) => seen.push(item as MenuActionItem));
    menu.toggleParent(0, 0);
    expect(menu.openPath).toEqual([0]);
    menu.toggleParent(0, 0);
    expect(menu.openPath.length).toBe(0);
    expect(seen.length).toBe(0);
  });

  it("AC-30: opening arrow on an already-open parent keeps it open", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    expect(menu.openPath).toEqual([0]);
    const parent = menu.items[0] as MenuActionItem;
    const event = keyEvent("ArrowRight");
    menu.onItemKeyDown(event, 0, 0, parent);
    expect(menu.openPath).toEqual([0]);
  });

  it("AC-28: duplicate sibling keys follow the index path with one warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const menu = makeMenu([
      { label: "Same one", value: "same", children: [{ label: "One", value: "one" }] },
      { label: "Same two", value: "same", children: [{ label: "Two", value: "two" }] }
    ] as MenuItem[]);
    menu.toggleParent(0, 0);
    expect((menu.levelItems(1)[0] as MenuActionItem).value).toBe("one");
    menu.toggleParent(0, 1);
    expect((menu.levelItems(1)[0] as MenuActionItem).value).toBe("two");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("AC-18: second level opens; deeper children render as leaves with a per-key warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const menu = makeMenu([
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
    ] as MenuItem[]);
    menu.toggleParent(0, 0);
    const mid = menu.levelItems(1)[0] as MenuActionItem;
    menu.toggleParent(1, 0);
    expect(menu.openPath).toEqual([0, 0]);
    const level2 = menu.levelItems(2);
    const tooDeep = level2[1] as MenuActionItem;
    expect(menu.isParent(2, 1, tooDeep)).toBe(false);
    // Toggle at depth 2 never opens (children ignored).
    menu.toggleParent(2, 1);
    expect(menu.openPath).toEqual([0, 0]);
    expect(warn).toHaveBeenCalledTimes(1);
    // Re-scan does not warn again for the same key.
    menu.scanTreeWarnings(menu.items, 0);
    expect(warn).toHaveBeenCalledTimes(1);
    const seenPath: MenuSelectPath[] = [];
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    const deep = level2[0] as MenuActionItem;
    menu.onItemClick(deep, 2, 0);
    expect(seenPath[0].path).toEqual(["class", "mid", "deep"]);
    expect(mid).toBeTruthy();
  });
});

describe("Menu cascade — Escape per level and Tab (AC-14, AC-32)", () => {
  it("AC-14: Esc in a sub closes it and stops propagation (one level per press)", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    const event = keyEvent("Escape");
    menu.onLevelKeyDown(event, 1);
    expect(event.__prevented).toBe(true);
    expect(event.__stopped).toBe(true);
    expect(menu.openPath.length).toBe(0);
    expect(menu.roving[0]).toBe(0);
  });

  it("AC-14: Esc on the root line with a sub open closes the deepest level", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    const event = keyEvent("Escape");
    menu.onLevelKeyDown(event, 0);
    expect(event.__prevented).toBe(true);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-14: Esc at the root with no sub bubbles to the host (no prevent)", () => {
    const menu = makeMenu(cascadeItems);
    const event = keyEvent("Escape");
    menu.onLevelKeyDown(event, 0);
    expect(event.__prevented).toBe(false);
    expect(event.__stopped).toBe(false);
  });

  it("AC-32: Tab closes the sub-menus without preventing focus move", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    const event = keyEvent("Tab");
    menu.onLevelKeyDown(event, 1);
    expect(menu.openPath.length).toBe(0);
    expect(event.__prevented).toBe(false);
  });
});

describe("Menu cascade — sides, groups, items change (AC-19, AC-20, AC-21, AC-22)", () => {
  it("AC-19: flipped side drives the chevron (level state follows the solver)", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    expect(menu.chevronSide(0, 0)).toBe("right");
    // Simulate the solver result for a flipped panel (AC-16/AC-19 helper level).
    menu.levelSides[0] = "left";
    expect(menu.chevronSide(0, 0)).toBe("left");
    const source = readFileSync(join(here, "Menu.ts"), "utf8");
    expect(source).toContain("st-menu__itemChevron--start");
  });

  it("AC-20: submenuSide left pins left while auto prefers right", () => {
    const menu = makeMenu(cascadeItems);
    menu.submenuSide = "left";
    expect(menu.chevronSide(0, 0)).toBe("left");
    menu.submenuSide = "auto";
    expect(menu.chevronSide(0, 0)).toBe("right");
  });

  it("AC-21: groups and dividers render in children; grouped leaf path skips the group", () => {
    const menu = makeMenu([
      {
        label: "Class",
        value: "class",
        children: [
          { type: "group", label: "Class — reason" },
          { label: "R1", value: "r1" },
          { type: "divider" },
          { label: "R2", value: "r2" }
        ]
      }
    ] as MenuItem[]);
    menu.toggleParent(0, 0);
    const level1 = menu.levelItems(1);
    expect(level1.length).toBe(4);
    expect(menu.isGroup(level1[0])).toBe(true);
    expect(menu.isDivider(level1[2])).toBe(true);
    const seenPath: MenuSelectPath[] = [];
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    const r2 = level1[3] as MenuActionItem;
    menu.onItemClick(r2, 1, 3);
    expect(seenPath[0].path).toEqual(["class", "r2"]);
  });

  it("AC-21: a leaf inside a group never contributes the group to path", () => {
    const menu = makeMenu([
      {
        type: "group",
        label: "More",
        items: [{ label: "Inner", value: "inner" }]
      }
    ] as MenuItem[]);
    const seenPath: MenuSelectPath[] = [];
    menu.selectPath.subscribe((payload) => seenPath.push(payload));
    const inner = (menu.items[0] as unknown as { items: MenuActionItem[] }).items[0];
    menu.onGroupChildClick(0, 0, 0, inner);
    expect(seenPath[0].path).toEqual(["inner"]);
  });

  it("AC-22: removing the open index path removes orphan panels", () => {
    const menu = makeMenu(cascadeItems);
    menu.toggleParent(0, 0);
    expect(menu.openPath).toEqual([0]);
    menu.items = [{ label: "Direct", value: "direct" }] as MenuItem[];
    menu.ngOnChanges({ items: {} } as never);
    expect(menu.openPath.length).toBe(0);
  });

  it("AC-22/AC-38: items change cancels a pending hover open", async () => {
    const menu = makeMenu(cascadeItems);
    const parent = menu.items[0] as MenuActionItem;
    menu.onParentPointerEnter(0, 0, parent, pointerEvent("mouse"));
    await vi.advanceTimersByTimeAsync(100);
    menu.items = [{ label: "Direct", value: "direct" }] as MenuItem[];
    menu.ngOnChanges({ items: {} } as never);
    await vi.advanceTimersByTimeAsync(200);
    expect(menu.openPath.length).toBe(0);
  });
});

describe("Menu cascade — shadow and panel style (AC-23, AC-27)", () => {
  it("AC-23: cascade marker class and popover shadow chain; flat keeps menu shadow", () => {
    const flat = makeMenu([{ label: "Edit", value: "edit" }] as MenuItem[]);
    expect(flat.hostClass).not.toContain("st-menu--hasCascade");
    flat.ngOnDestroy();
    const cascade = makeMenu(cascadeItems);
    expect(cascade.hostClass).toContain("st-menu--hasCascade");
    const styles = readFileSync(join(here, "styles.css"), "utf8");
    expect(styles).toContain("--st-component-popover-shadow");
    expect(styles).toContain("--st-component-selectableRow-selectedBackground");
    expect(styles).toContain("--st-component-selectableRow-selectedText");
    const submenuRule = styles.match(/\.st-menu--submenu \{[^}]*\}/s)?.[0] ?? "";
    expect(submenuRule).toContain("--st-component-popover-shadow");
    const popoverSubmenu = styles.match(/\.st-menuPopover \.st-menu--submenu \{[^}]*\}/s)?.[0] ?? "";
    expect(popoverSubmenu).toContain("--st-component-popover-shadow");
  });

  it("AC-27: narrow viewport caps the panel width with min-width 0", () => {
    const menu = makeMenu(cascadeItems);
    menu.levelPositions[0] = { top: 8, left: 8, capped: true };
    const style = menu.panelStyle(0) ?? "";
    expect(style).toContain("left: 8px");
    expect(style).toContain("min-width: 0");
    expect(style).toContain("max-width: calc(100vw - 16px)");
  });
});

describe("Menu cascade — hosts (AC-14, AC-15, AC-33, AC-34, AC-35)", () => {
  it("AC-33: OverflowMenu trigger aria-controls binds to the root menu id", () => {
    const source = readFileSync(join(here, "OverflowMenu.ts"), "utf8");
    expect(source).toContain("[attr.aria-controls]");
    expect(source).toContain("rootMenuId");
    expect(source).not.toContain('[id]="rootMenuId"');
    const overflow = new OverflowMenu();
    overflow.items = cascadeItems;
    expect(overflow.rootMenuId).toMatch(/^st-overflowmenu-\d+$/);
    const triggerSource = readFileSync(join(here, "MenuTriggerButton.ts"), "utf8");
    expect(triggerSource).toContain("[attr.aria-controls]");
    const button = new MenuTriggerButton();
    button.ariaControls = "st-menu-1";
    expect(button.ariaControls).toBe("st-menu-1");
  });

  it("AC-33: MenuPopover sets aria-controls on an external trigger while open", () => {
    const popover = new MenuPopover();
    popover.open = true;
    const attrs = new Map<string, string>();
    const trigger = {
      setAttribute: (k: string, v: string) => void attrs.set(k, v),
      removeAttribute: (k: string) => void attrs.delete(k),
      getAttribute: (k: string) => attrs.get(k) ?? null
    } as unknown as HTMLElement;
    popover.trigger = trigger;
    popover.ngOnChanges({ open: {}, trigger: {} } as never);
    expect(attrs.get("aria-controls")).toBe(popover.rootMenuId);
    popover.open = false;
    popover.syncTriggerAriaControls();
    expect(attrs.has("aria-controls")).toBe(false);
  });

  it("AC-34/D4: a prevented Esc never closes the host (level-consumed keys)", () => {
    const popover = new MenuPopover();
    popover.open = true;
    (popover as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
      key: "Escape",
      defaultPrevented: true,
      preventDefault: () => {}
    });
    expect(popover.open).toBe(true);
    const overflow = new OverflowMenu();
    overflow.items = cascadeItems;
    overflow.localOpen = true;
    (overflow as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
      key: "Escape",
      defaultPrevented: true,
      preventDefault: () => {}
    });
    expect(overflow.localOpen).toBe(true);
  });

  it("AC-35: deep leaf via OverflowMenu relays item and path; parent emits nothing", () => {
    const overflow = new OverflowMenu();
    overflow.items = cascadeItems;
    const seen: MenuItem[] = [];
    const seenPath: MenuSelectPath[] = [];
    overflow.select.subscribe((item) => seen.push(item));
    overflow.selectPath.subscribe((payload) => seenPath.push(payload));
    overflow.localOpen = true;
    // Parent activation via the inner Menu never emits (AC-04 toggle path).
    const menu = makeMenu(cascadeItems);
    const before: MenuActionItem[] = [];
    menu.select.subscribe((item) => before.push(item as MenuActionItem));
    menu.toggleParent(0, 0);
    expect(before.length).toBe(0);
    // Host relay for the deep leaf.
    const leaf = menu.levelItems(1)[0];
    overflow.onMenuSelect(leaf);
    expect(overflow.localOpen).toBe(false);
    expect(seen).toEqual([leaf]);
    overflow.localOpen = true;
    overflow.onMenuSelectPath({ item: leaf as MenuActionItem, path: ["class-a", "reason-1"] });
    expect(overflow.localOpen).toBe(false);
    expect(seenPath[0].path).toEqual(["class-a", "reason-1"]);
  });

  it("AC-35: deep leaf via MenuPopover items mode relays item and path", () => {
    const popover = new MenuPopover();
    popover.open = true;
    popover.items = cascadeItems;
    expect(popover.innerRole).toBe("menu");
    const flat = new MenuPopover();
    flat.items = [{ label: "Edit", value: "edit" }] as MenuItem[];
    expect(flat.innerRole).toBe("presentation");
    const seen: MenuItem[] = [];
    const seenPath: MenuSelectPath[] = [];
    popover.select.subscribe((item) => seen.push(item));
    popover.selectPath.subscribe((payload) => seenPath.push(payload));
    popover.onMenuSelectPath({ item: cascadeItems[0] as MenuActionItem, path: ["class-a"] });
    expect(popover.open).toBe(false);
    expect(seenPath[0].path).toEqual(["class-a"]);
    expect(seen.length).toBe(0);
    popover.open = true;
    popover.onMenuSelect(cascadeItems[0]);
    expect(popover.open).toBe(false);
    expect(seen.length).toBe(1);
  });

  it("AC-15: MenuPopover outside closes; inside never; prevented events are ignored", () => {
    const popover = new MenuPopover();
    popover.open = true;
    (popover as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({
      target: {} as Node,
      defaultPrevented: true
    });
    expect(popover.open).toBe(true);
    (popover as unknown as { onPointerDown: (e: unknown) => void }).onPointerDown({
      target: {} as Node
    });
    expect(popover.open).toBe(false);
  });

  it("AC-14 host Esc: cascade returns focus to the trigger; flat does not", () => {
    const focused: string[] = [];
    const cascadePopover = new MenuPopover();
    cascadePopover.open = true;
    cascadePopover.items = cascadeItems;
    cascadePopover.trigger = {
      focus: () => void focused.push("cascade")
    } as unknown as HTMLElement;
    (cascadePopover as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
      key: "Escape",
      preventDefault: () => {}
    });
    expect(cascadePopover.open).toBe(false);
    expect(focused).toEqual(["cascade"]);
    const flatPopover = new MenuPopover();
    flatPopover.open = true;
    flatPopover.items = [{ label: "Edit", value: "edit" }] as MenuItem[];
    flatPopover.trigger = {
      focus: () => void focused.push("flat")
    } as unknown as HTMLElement;
    (flatPopover as unknown as { onKeyDown: (e: unknown) => void }).onKeyDown({
      key: "Escape",
      preventDefault: () => {}
    });
    expect(flatPopover.open).toBe(false);
    expect(focused).toEqual(["cascade"]);
  });
});

describe("Menu cascade — flat host parity (AC-37)", () => {
  it("keeps the flat OverflowMenu host/list classes and select contract", () => {
    const overflow = new OverflowMenu();
    overflow.items = [{ label: "Edit", value: "edit" }] as MenuItem[];
    expect(overflow.hostClass).toContain("st-overflowMenu");
    expect(overflow.hostClass).not.toContain("st-overflowMenu--dense");
    expect(overflow.listClass).toContain("st-overflowMenu__list");
    const source = readFileSync(join(here, "OverflowMenu.ts"), "utf8");
    expect(source).toContain("st-overflowMenu__trigger");
    expect(source).toContain("st-overflowMenu__list");
    const seen: MenuItem[] = [];
    overflow.select.subscribe((item) => seen.push(item));
    overflow.onMenuSelect(overflow.items[0]);
    expect(seen).toEqual([overflow.items[0]]);
  });

  it("keeps flat Menu classes without cascade extras", () => {
    const menu = makeMenu([
      { label: "Edit", value: "edit" },
      { label: "Delete", value: "delete", danger: true }
    ] as MenuItem[]);
    expect(menu.itemClass(menu.items[0] as MenuActionItem, 0, 0)).toBe("st-menu__item");
    expect(menu.itemClass(menu.items[1] as MenuActionItem, 0, 1)).toContain(
      "st-menu__item--danger",
    );
  });
});
