import "@angular/compiler";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChangeDetectorRef, Injector, runInInjectionContext } from "@angular/core";
import { Menu } from "../dist/Menu.js";
import { MenuPopover } from "../dist/MenuPopover.js";
import { OverflowMenu } from "../dist/OverflowMenu.js";
import { MENU_HOST, MENU_HOST_CONTEXT } from "../dist/menu-host.js";

const render = vi.hoisted(() => ({ callbacks: [] as (() => void)[] }));
vi.mock("@angular/core", async (original) => ({
  ...await original<typeof import("@angular/core")>(),
  afterNextRender: (callback: () => void) => { render.callbacks.push(callback); return { destroy() {} }; },
}));
const items = [
  { label: "Parent", id: "parent", children: [{ label: "Leaf", id: "leaf" }] },
  { label: "Sibling", children: [{ label: "Other" }] },
];
const key = (value: string) => ({ key: value, preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as KeyboardEvent;
const pointer = (x: number, y: number) => ({ pointerType: "mouse", clientX: x, clientY: y, target: {} }) as PointerEvent;
function injectedMenu(host?: { rootMenuId: string; select: (keyboard: boolean, cascade: boolean) => void }) {
  const markForCheck = vi.fn();
  const injector = Injector.create({ providers: [
    { provide: ChangeDetectorRef, useValue: { markForCheck } },
    ...(host ? [{ provide: MENU_HOST, useValue: host }] : []),
  ] });
  const menu = runInInjectionContext(injector, () => new Menu());
  menu.items = items;
  return { menu, markForCheck };
}
afterEach(() => { render.callbacks = []; vi.useRealTimers(); vi.restoreAllMocks(); });

describe("cascade control review regressions", () => {
  it("R1: focuses and measures after Angular renders, and notifies zoneless hover/close", async () => {
    vi.useFakeTimers();
    const { menu, markForCheck } = injectedMenu();
    const focus = vi.spyOn(menu, "focusFirstEnabled").mockReturnValue(true);
    const measure = vi.spyOn(menu, "computeAllPositions").mockImplementation(() => {});
    menu.openParent(0, 0, true);
    await vi.advanceTimersByTimeAsync(0);
    expect(focus).not.toHaveBeenCalled();
    expect(measure).not.toHaveBeenCalled();
    expect(markForCheck).toHaveBeenCalled();
    expect(render.callbacks.length).toBeGreaterThan(0);
    render.callbacks.splice(0).forEach(callback => callback());
    expect(focus).toHaveBeenCalledWith(1);
    expect(measure).toHaveBeenCalled();
    markForCheck.mockClear();
    menu.onParentPointerEnter(0, 1, items[1], pointer(0, 0));
    await vi.advanceTimersByTimeAsync(150);
    expect(menu.openPath).toEqual([1]);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();
    menu.onPanelPointerLeave(0, pointer(0, 0));
    await vi.advanceTimersByTimeAsync(250);
    expect(menu.openPath).toEqual([]);
    expect(markForCheck).toHaveBeenCalled();
    menu.ngOnDestroy();
  });

  it.each([["MenuPopover", MenuPopover], ["OverflowMenu", OverflowMenu]] as const)("R2: %s returns keyboard selection to its trigger only for cascades", (_name, Host) => {
    const host = new Host();
    const focus = vi.fn();
    if (host instanceof MenuPopover) host.trigger = { focus } as unknown as HTMLElement;
    else host.triggerRef = { nativeElement: { focus } } as never;
    // The provider is also used by projected children; no decorated public output is added.
    const { menu } = injectedMenu(host[MENU_HOST_CONTEXT]);
    const selected = vi.fn();
    menu.select.subscribe(selected);
    menu.openParent(0, 0, false);
    menu.onItemKeyDown(key("Enter"), 1, 0, items[0].children[0]);
    expect(selected).toHaveBeenCalledExactlyOnceWith(items[0].children[0]);
    expect(focus).toHaveBeenCalledTimes(1);
    menu.onItemClick(items[0].children[0], 1, 0);
    expect(focus).toHaveBeenCalledTimes(1);
    menu.items = [{ label: "Flat" }];
    menu.onItemKeyDown(key(" "), 0, 0, menu.items[0] as any);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("R3: projected menus share the host root id, cascade detection and close requests", () => {
    const host = new MenuPopover();
    host.open = true;
    const focus = vi.fn();
    const attrs = new Map<string, string>();
    host.trigger = { focus, setAttribute: (k: string, v: string) => attrs.set(k, v), removeAttribute: (k: string) => attrs.delete(k) } as unknown as HTMLElement;
    const { menu } = injectedMenu(host[MENU_HOST_CONTEXT]);
    (host as any).projectedMenu = menu;
    host.syncTriggerAriaControls();
    expect(menu.rootMenuId).toBe(attrs.get("aria-controls"));
    expect(host.hostClass).toContain("st-menuPopover--hasCascade");
    const tab = key("Tab");
    (host as any).onKeyDown(tab);
    expect(host.open).toBe(false);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    host.open = true;
    host.closeOnEscape = false;
    (host as any).onKeyDown(key("Tab"));
    expect(host.open).toBe(false);
    host.open = true;
    host.closeOnEscape = true;
    (host as any).onKeyDown(key("Escape"));
    expect(host.open).toBe(false);
    expect(focus).toHaveBeenCalledTimes(1);
    host.open = true;
    menu.onItemClick(items[0].children[0], 1, 0);
    expect(host.open).toBe(false);
    // Projected flat menus keep their existing consumer-owned close behavior.
    host.open = true;
    menu.items = [{ label: "Flat" }];
    menu.onItemClick(menu.items[0] as any, 0, 0);
    expect(host.open).toBe(true);
  });

  it.each([0, 1, 2])("R4: grouped keyboard leaves at depth %i retain their key and roving identity", (depth) => {
    const menu = new Menu();
    const children = [{ label: "First", id: "first" }, { label: "Second", id: "second" }];
    let list: any[] = [{ type: "group", label: "Group", items: children }];
    for (let i = depth; i > 0; i--) list = [{ label: "Ancestor", id: 'a' + i, children: list }];
    menu.items = list;
    menu.openPath = Array(depth).fill(0);
    const path = vi.fn();
    menu.selectPath.subscribe(path);
    menu.onItemFocus(depth, 0, 1);
    expect(menu.groupChildTabIndex(depth, 0, 0, children)).toBe("-1");
    expect(menu.groupChildTabIndex(depth, 0, 1, children)).toBe("0");
    menu.onItemKeyDown(key(" "), depth, 0, children[1], 1);
    expect(path).toHaveBeenCalledExactlyOnceWith({ item: children[1], path: [...Array.from({ length: depth }, (_, i) => 'a' + (i + 1)), "second"] });
  });

  it("R5: second panel chevron follows its independent flip", () => {
    const menu = new Menu();
    menu.items = [{ label: "A", children: [{ label: "B", children: [{ label: "C" }] }] }];
    menu.openPath = [0, 0];
    menu.levelSides = ["right", "left"];
    expect(menu.chevronSide(0, 0)).toBe("right");
    expect(menu.chevronSide(1, 0)).toBe("left");
  });

  it("R6: cascade host escapes clipping and restores the visible root surface", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    const rule = (selector: string) => css.slice(css.indexOf(selector + " {" )).split("}")[0];
    expect(rule(".st-menuPopover--hasCascade")).toContain("overflow: visible");
    expect(rule(".st-menuPopover--hasCascade")).toContain("box-shadow: none");
    expect(rule(".st-menuPopover--hasCascade .st-menu--hasCascade")).toContain("--st-component-popover-shadow");
    expect(rule(".st-menuPopover--hasCascade .st-menu__scroll")).toContain("max-height:");
    const host = new MenuPopover();
    host.items = items;
    expect(host.hostClass).toContain("st-menuPopover--hasCascade");
    host.maxHeight = 240;
    expect(host.panelStyle).toContain("--st-menu-root-maxHeight: 240px");
    expect(host.panelStyle).not.toContain("--st-menu-maxHeight:");
    host.items = [{ label: "Flat" }];
    expect(host.hostClass).not.toContain("st-menuPopover--hasCascade");
  });

  it("R7 / AC-25: tests the old triangle before refreshing its apex; crossings cannot switch", async () => {
    vi.useFakeTimers();
    const menu = new Menu();
    menu.items = items;
    menu.toggleParent(0, 0);
    menu.hostRef = { nativeElement: {} } as never;
    vi.spyOn(menu, "levelRootEl").mockImplementation(level => level === 1 ? {
      getBoundingClientRect: () => ({ left: 200, right: 390, top: 0, bottom: 200, width: 190, height: 200 }),
    } as never : null);
    menu.onParentPointerLeave(0, 0, items[0], pointer(100, 50));
    menu.onHostPointerMove(pointer(150, 80));
    // Crossing sibling and leaf while inside the refreshed triangle arms nothing.
    menu.onParentPointerEnter(0, 1, items[1], pointer(170, 100));
    menu.onLeafPointerEnter(0, pointer(175, 100));
    await vi.advanceTimersByTimeAsync(300);
    expect(menu.openPath).toEqual([0]);
    // Outside the previous triangle: replacing the apex before testing would
    // make this point its own vertex and incorrectly cancel the close.
    menu.onHostPointerMove(pointer(120, 220));
    await vi.advanceTimersByTimeAsync(249);
    expect(menu.openPath).toEqual([0]);
    await vi.advanceTimersByTimeAsync(1);
    expect(menu.openPath).toEqual([]);
    menu.ngOnDestroy();
  });

  it("R7 / AC-30: an opening arrow delegates focus even when already open", () => {
    const menu = new Menu();
    menu.items = items;
    menu.openPath = [0];
    const focus = vi.fn();
    const button = { focus, getAttribute: (name: string) => name === "data-item-index" ? "0" : null } as unknown as HTMLButtonElement;
    vi.spyOn(menu, "levelButtons").mockReturnValue([button]);
    menu.onItemKeyDown(key("ArrowRight"), 0, 0, items[0]);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(menu.roving[1]).toBe(0);
    expect(menu.openPath).toEqual([0]);
  });

  it("R3/R4: compiled composition and grouped template bindings are wired", () => {
    expect((MenuPopover as any).ɵcmp.providersResolver).toBeTypeOf("function");
    expect((MenuPopover as any).ɵcmp.contentQueries).toBeTypeOf("function");
    expect((OverflowMenu as any).ɵcmp.providersResolver).toBeTypeOf("function");
    const source = readFileSync(new URL("./Menu.ts", import.meta.url), "utf8");
    expect(source.match(/onItemKeyDown\(\$event, \d, outerIdx, child, innerIdx\)/g)).toHaveLength(4);
    expect(source.match(/onItemFocus\(\d, outerIdx, innerIdx\)/g)).toHaveLength(4);
  });

  it("version: ships the specified Angular minor", () => {
    for (const path of ["../../dataviz-angular/package.json", "../../../apps/docs/package.json"]) {
      expect(JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")).dependencies["@sentropic/design-system-angular"]).toBe("0.40.0");
    }
    expect(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version).toBe("0.40.0");
  });
});
