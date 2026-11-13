import "@angular/compiler";
import { ASTWithSource, parseTemplate, TmplAstElement, TmplAstForLoopBlock, TmplAstIfBlock } from "@angular/compiler";
import { ElementRef, Injector, runInInjectionContext } from "@angular/core";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu } from "../dist/Menu.js";
import type { MenuItem } from "../dist/Menu.js";
import { MenuPopover } from "../dist/MenuPopover.js";
import { OverflowMenu } from "../dist/OverflowMenu.js";
import { MENU_HOST, MENU_HOST_CONTEXT } from "../dist/menu-host.js";

const items = [{ label: "Class", children: [{ label: "Reason", children: [{ label: "Detail" }] }] }];
const key = (value: string) => ({ key: value, preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as KeyboardEvent;
const mouse = { pointerType: "mouse", clientX: 0, clientY: 0 } as PointerEvent;

function templateElements() {
  const source = readFileSync(new URL("./Menu.ts", import.meta.url), "utf8");
  const template = source.match(/template: `([\s\S]*?)`/)![1];
  const parsed = parseTemplate(template, "Menu.ts");
  expect(parsed.errors).toBeNull();
  const elements: TmplAstElement[] = [];
  function visit(nodes: readonly unknown[]) {
    for (const node of nodes) {
      if (node instanceof TmplAstElement) { elements.push(node); visit(node.children); }
      else if (node instanceof TmplAstIfBlock) node.branches.forEach(branch => visit(branch.children));
      else if (node instanceof TmplAstForLoopBlock) visit(node.children);
    }
  }
  visit(parsed.nodes);
  return elements;
}

function projected() {
  const host = new MenuPopover();
  host.open = true;
  const injector = Injector.create({ providers: [{ provide: MENU_HOST, useValue: host[MENU_HOST_CONTEXT] }] });
  const menu = runInInjectionContext(injector, () => new Menu());
  menu.items = items;
  // Model Angular's persistent content child without introducing a DOM harness.
  (host as any).projectedMenu = menu;
  return { host, menu };
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("second cascade review regressions", () => {
  it("P1 / AC-02: each chevron contains a literal SVG and path in Angular's parsed template", () => {
    const chevrons = templateElements().filter(node => node.attributes.some(attr => attr.name === "class" && attr.value.includes("st-menu__itemChevron ")));
    expect(chevrons).toHaveLength(4);
    for (const span of chevrons) {
      expect(span.inputs.map(input => input.name)).toEqual([]);
      const svg = span.children.find(node => node instanceof TmplAstElement) as TmplAstElement;
      expect(svg?.name).toBe(":svg:svg");
      expect(svg.attributes).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: "width", value: "16" }),
        expect.objectContaining({ name: "height", value: "16" }),
      ]));
      const path = svg.children.find(node => node instanceof TmplAstElement) as TmplAstElement;
      expect(path.name).toBe(":svg:path");
      const start = span.attributes.some(attr => attr.value.includes("--start"));
      expect(path.attributes).toContainEqual(expect.objectContaining({ name: "d", value: start ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6" }));
    }
  });

  it.each(["outside", "input"])("P1 / AC-15/38: %s close resets the projected path and cancels hover before reopening", async (mode) => {
    vi.useFakeTimers();
    const { host, menu } = projected();
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    host.panel = { nativeElement: { showPopover, hidePopover, contains: () => false, setAttribute: vi.fn(), removeAttribute: vi.fn() } } as never;
    host.showTopLayer();
    menu.openPath = [0, 0];
    menu.onParentPointerEnter(0, 0, items[0], mouse);
    expect(vi.getTimerCount()).toBe(1);
    const focus = vi.spyOn(menu, "focusFirstEnabled");
    if (mode === "outside") (host as any).onPointerDown({ target: {}, composedPath: () => [] });
    else {
      host.open = false;
      host.ngOnChanges({ open: { previousValue: true, currentValue: false, firstChange: false } } as never);
    }
    expect(host.open).toBe(false);
    expect(menu.openPath).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
    expect(hidePopover).toHaveBeenCalledOnce();
    host.open = true;
    host.showTopLayer();
    expect(showPopover).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(500);
    expect(menu.openPath).toEqual([]);
    expect(focus).not.toHaveBeenCalled();
    menu.ngOnDestroy();
  });

  it.each([["right", "left"], ["left", "right"]] as const)("P2 / AC-19/30: child opening follows %s → %s flips while a leaf closes towards its containing panel", (outer, inner) => {
    const menu = new Menu();
    menu.items = items;
    menu.openPath = [0, 0];
    menu.levelSides = [outer, inner];
    const focus = vi.fn();
    const button = { focus, getAttribute: () => "0" } as unknown as HTMLButtonElement;
    vi.spyOn(menu, "levelButtons").mockReturnValue([button]);
    const opening = key(inner === "left" ? "ArrowLeft" : "ArrowRight");
    menu.onItemKeyDown(opening, 1, 0, items[0].children[0]);
    expect(menu.chevronSide(1, 0)).toBe(inner);
    expect(menu.openPath).toEqual([0, 0]);
    expect(focus).toHaveBeenCalledExactlyOnceWith();
    expect(opening.preventDefault).toHaveBeenCalled();
    const focusParent = vi.spyOn(menu, "focusButton").mockImplementation(() => {});
    menu.onItemKeyDown(key(inner === "left" ? "ArrowRight" : "ArrowLeft"), 2, 0, items[0].children[0].children[0]);
    expect(menu.openPath).toEqual([0]);
    expect(focusParent).toHaveBeenCalledWith(1, 0);
  });

  it("P2 / §4: the actual root menu binds its name and submenus retain parent labelling", () => {
    const elements = templateElements();
    const root = elements.find(node => node.attributes.some(attr => attr.name === "class" && attr.value === "st-menu__scroll"))!;
    expect(root.inputs.map(input => [input.name, input.value instanceof ASTWithSource ? input.value.source : undefined])).toEqual(expect.arrayContaining([
      ["aria-label", "rootLabel"], ["aria-labelledby", "rootLabelledby"],
    ]));
    const subs = elements.filter(node => node.attributes.some(attr => attr.name === "data-menu-level" && ["1", "2"].includes(attr.value)));
    expect(subs).toHaveLength(2);
    for (const sub of subs) expect(sub.inputs.some(input => input.name === "aria-labelledby")).toBe(true);
  });

  it.each([["MenuPopover", MenuPopover], ["OverflowMenu", OverflowMenu]] as const)("P2 / §4: %s carries its live label through private composition", (_name, Host) => {
    const host = new Host();
    host.label = "Classification";
    const injector = Injector.create({ providers: [{ provide: MENU_HOST, useValue: host[MENU_HOST_CONTEXT] }] });
    const menu = runInInjectionContext(injector, () => new Menu());
    expect(menu.rootLabel).toBe("Classification");
    host.label = "Reasons";
    expect(menu.rootLabel).toBe("Reasons");
  });

  it("P2 / §4: standalone names forward native ARIA attributes without new internal inputs", () => {
    const attrs = new Map([["aria-label", "Actions"]]);
    const injector = Injector.create({ providers: [{ provide: ElementRef, useValue: { nativeElement: { getAttribute: (name: string) => attrs.get(name) ?? null } } }] });
    const menu = runInInjectionContext(injector, () => new Menu());
    expect(menu.rootLabel).toBe("Actions");
    attrs.set("aria-labelledby", "actions-heading");
    expect(menu.rootLabelledby).toBe("actions-heading");
    expect(menu.rootLabel).toBeNull();
    attrs.clear();
    expect(menu.rootLabel).toBe("Menu");
    expect(Object.keys((Menu as any).ɵcmp.inputs).sort()).toEqual(["class", "dense", "items", "role", "submenuSide"]);
  });

  it.each([0, 1, 2])("AC-13: Up/Down/Home/End wrap within level %i, skipping disabled rows", (depth) => {
    const menu = new Menu();
    const rows = [{ label: "First" }, { label: "Disabled", disabled: true }, { label: "Last" }];
    let list: MenuItem[] = rows;
    for (let i = 0; i < depth; i++) list = [{ label: "Parent", children: list }];
    menu.items = list;
    menu.openPath = Array(depth).fill(0);
    const buttons = rows.map((row, index) => ({
      disabled: Boolean(row.disabled), focus: vi.fn(),
      getAttribute: (name: string) => name === "data-item-index" ? String(index) : null,
    }));
    const querySelectorAll = vi.fn(() => buttons.filter(button => !button.disabled));
    const root = { querySelectorAll };
    const otherLevel = { querySelectorAll: vi.fn() };
    menu.hostRef = { nativeElement: { querySelector: (selector: string) => selector === `[data-menu-level="${depth}"]` ? root : otherLevel } } as never;
    const move = (value: string, current: number, target: number) => {
      buttons.forEach(button => button.focus.mockClear());
      const event = { ...key(value), currentTarget: buttons[current] } as unknown as KeyboardEvent;
      menu.onItemKeyDown(event, depth, current, rows[current]);
      expect(event.preventDefault).toHaveBeenCalledOnce();
      expect(buttons[target].focus).toHaveBeenCalledOnce();
      expect(buttons.filter((_, index) => index !== target).every(button => button.focus.mock.calls.length === 0)).toBe(true);
      expect(menu.roving[depth]).toBe(target);
      expect(menu.openPath).toEqual(Array(depth).fill(0));
    };
    move("ArrowDown", 0, 2);
    move("ArrowDown", 2, 0);
    move("ArrowUp", 0, 2);
    move("ArrowUp", 2, 0);
    move("Home", 2, 0);
    move("End", 0, 2);
    expect(querySelectorAll).toHaveBeenCalledWith('[role="menuitem"]:not(:disabled)');
    expect(otherLevel.querySelectorAll).not.toHaveBeenCalled();
  });

  it.each(["translateY(-100%)", "translateX(-100%)", "translate(-100%, -100%)"])("AC-36: discovers the nearest transformed host (%s) before applying solver coordinates", (transform) => {
    const menu = new Menu();
    menu.items = items;
    menu.openPath = [0];
    const distant = { parentElement: null, getBoundingClientRect: () => ({ top: 25, left: 25 }) };
    const host = { parentElement: distant, getBoundingClientRect: () => ({ top: 310, left: 450 }) };
    const neutral = { parentElement: host };
    const panel = { parentElement: neutral, getBoundingClientRect: () => ({ width: 192, height: 120 }) };
    const root = {
      getBoundingClientRect: () => ({ left: 500, right: 692 }),
      querySelector: () => ({ getBoundingClientRect: () => ({ top: 420 }) }),
    };
    const getComputedStyle = vi.fn(node => ({ transform: node === host || node === distant ? transform : "none" }));
    vi.stubGlobal("window", { innerWidth: 900, innerHeight: 700, getComputedStyle });
    menu.hostRef = { nativeElement: {} } as never;
    vi.spyOn(menu, "levelRootEl").mockImplementation(level => (level === 0 ? root : panel) as never);
    expect(menu.findContainingBlock(panel as never)).toBe(host);
    menu.computeLevelPosition(1);
    expect(menu.levelSides).toEqual(["right"]);
    expect(menu.levelPositions[0]).toEqual({ top: 105, left: 242, maxHeight: undefined, capped: false });
    expect(menu.panelStyle(0)).toBe("top: 105px; left: 242px;");
    expect(getComputedStyle).not.toHaveBeenCalledWith(distant);
  });
});
