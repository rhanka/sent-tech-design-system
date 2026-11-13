import "@angular/compiler";
import { parseTemplate, TmplAstElement, TmplAstIfBlock } from "@angular/compiler";
import { Injector, runInInjectionContext } from "@angular/core";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Menu } from "../dist/Menu.js";
import { MenuPopover } from "../dist/MenuPopover.js";
import { OverflowMenu } from "../dist/OverflowMenu.js";
import { MENU_HOST, MENU_HOST_CONTEXT } from "../dist/menu-host.js";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("third cascade review regressions", () => {
  it.each([
    [0, 1], [0, 2], [1, 2],
  ])("P2 / §3.3(5): closing from level %i restores focus from removed sibling panel %i", (level, activeLevel) => {
    vi.useFakeTimers();
    const menu = new Menu();
    menu.items = [
      { label: "Parent", children: [{ label: "Child", children: [{ label: "Detail" }] }] },
      { label: "Root leaf" },
    ];
    menu.openPath = [0, 0];
    const active = {};
    vi.stubGlobal("document", { activeElement: active });
    // These panels are siblings: level 1 does not contain the level-2 action.
    const panels = [1, 2].map(depth => ({ contains: vi.fn((node) => node === active && depth === activeLevel) }));
    const focusParent = vi.fn();
    const survivingRoot = { querySelector: (selector: string) => selector === '[data-item-index="0"]' ? { focus: focusParent } : null };
    menu.hostRef = { nativeElement: {
      querySelectorAll: (selector: string) => panels.filter((_, index) => selector.includes(`[data-menu-level="${index + 1}"]`)),
      querySelector: (selector: string) => selector === `[data-menu-level="${level}"]` ? survivingRoot : null,
    } } as never;
    menu.onLeafPointerEnter(level, { pointerType: "mouse", clientX: 0, clientY: 0 } as PointerEvent);
    vi.advanceTimersByTime(249);
    expect(menu.openPath).toEqual([0, 0]);
    expect(focusParent).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(menu.openPath).toEqual(Array(level).fill(0));
    expect(focusParent).toHaveBeenCalledExactlyOnceWith();
    expect(menu.roving[level]).toBe(0);
    expect(panels[activeLevel - 1].contains).toHaveBeenCalledWith(active);
    menu.ngOnDestroy();
  });

  it("P2 / §3.3(5): pointer closure leaves focus on a surviving level untouched", () => {
    vi.useFakeTimers();
    const menu = new Menu();
    menu.openPath = [0, 0];
    vi.stubGlobal("document", { activeElement: {} });
    menu.hostRef = { nativeElement: { querySelectorAll: () => [{ contains: () => false }, { contains: () => false }] } } as never;
    const focusParent = vi.spyOn(menu, "focusButton");
    menu.armClose(0);
    vi.advanceTimersByTime(250);
    expect(menu.openPath).toEqual([]);
    expect(focusParent).not.toHaveBeenCalled();
    menu.ngOnDestroy();
  });

  it("P2 / §2.2: Menu exposes only the approved inputs and props", () => {
    expect(Object.keys((Menu as any).ɵcmp.inputs).sort()).toEqual(["class", "dense", "items", "role", "submenuSide"]);
  });

  it("P2 / §2.2: the published MenuProps declaration has no id prop", () => {
    const declaration = readFileSync(new URL("../dist/Menu.d.ts", import.meta.url), "utf8");
    const props = declaration.match(/export type MenuProps = \{([\s\S]*?)\};/)![1];
    expect(props).not.toMatch(/\bid\??\s*:/);
  });

  it.each([["MenuPopover", MenuPopover], ["OverflowMenu", OverflowMenu]] as const)("P2 / §2.2: %s shares its root ID privately without an id binding", (name, Host) => {
    const source = readFileSync(new URL(`./${name}.ts`, import.meta.url), "utf8");
    const parsed = parseTemplate(source.match(/template: `([\s\S]*?)`/)![1], `${name}.ts`);
    expect(parsed.errors).toBeNull();
    const menus: TmplAstElement[] = [];
    function visit(nodes: readonly unknown[]) {
      for (const node of nodes) {
        if (node instanceof TmplAstElement) {
          if (node.name === "st-menu") menus.push(node);
          visit(node.children);
        } else if (node instanceof TmplAstIfBlock) node.branches.forEach(branch => visit(branch.children));
      }
    }
    visit(parsed.nodes);
    expect(menus).toHaveLength(1);
    expect(menus[0].inputs.map(input => input.name)).not.toContain("id");
    const host = new Host();
    const injector = Injector.create({ providers: [{ provide: MENU_HOST, useValue: host[MENU_HOST_CONTEXT] }] });
    const menu = runInInjectionContext(injector, () => new Menu());
    expect(menu.rootMenuId).toBe(host.rootMenuId);
    const standalone = new Menu();
    const another = new Menu();
    expect(standalone.rootMenuId).toMatch(/^st-menu-\d+$/);
    expect(standalone.rootMenuId).not.toBe(another.rootMenuId);
    expect(standalone.rootMenuId).not.toBe(host.rootMenuId);
    menu.ngOnDestroy();
    standalone.ngOnDestroy();
    another.ngOnDestroy();
  });
});
