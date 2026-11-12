import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Menu } from "./Menu.js";
import type { MenuItem } from "./Menu.js";
import { MenuPopover } from "./MenuPopover.js";
import { OverflowMenu } from "./OverflowMenu.js";

const here = dirname(fileURLToPath(import.meta.url));

const cascadeItems: MenuItem[] = [
  {
    label: "Class A",
    value: "class-a",
    children: [
      { label: "Reason 1", value: "reason-1" },
      { label: "Reason 2", value: "reason-2", disabled: true },
    ],
  },
  { label: "Direct", value: "direct" },
  {
    label: "Class B",
    value: "class-b",
    children: [{ label: "Why", value: "why" }],
  },
];

function mouseProps(x = 0, y = 0) {
  return { pointerType: "mouse", clientX: x, clientY: y };
}

function levelEl(wrapper: ReturnType<typeof mount> | HTMLElement, level: number): Element | null {
  const root = (wrapper as { element?: Element })?.element ?? (wrapper as HTMLElement);
  const doc = (root as Element)?.ownerDocument ?? document;
  // Query from the document body when attached: levels live under the mount.
  const scope = doc.body ?? (root as Element);
  void root;
  return scope.querySelector(`[data-menu-level="${level}"]`);
}

function findItem(scope: Element | null, name: string): ReturnType<typeof mount> {
  throw new Error("unused");
}

function buttonByText(wrapper: ReturnType<typeof mount>, name: string) {
  const btns = wrapper.findAll("[role='menuitem']");
  const found = btns.find(
    (b) => b.find(".st-menu__itemLabel").text().trim() === name,
  );
  if (!found) throw new Error(`menuitem "${name}" not found`);
  return found;
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
    ...rect,
  } as DOMRect);
}

let viewportBackup: { width: number; height: number };
const mounted: ReturnType<typeof mount>[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  viewportBackup = { width: window.innerWidth, height: window.innerHeight };
});

afterEach(() => {
  while (mounted.length) {
    const w = mounted.pop();
    try {
      w?.unmount();
    } catch {
      // already unmounted
    }
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: viewportBackup.width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: viewportBackup.height,
  });
});

/** Statefully controlled MenuPopover (bind:open parity): `open` starts true
 * and follows `update:open`, so close paths actually hide the dialog. */
function mountPopoverHarness(options: {
  trigger: HTMLElement;
  items?: MenuItem[];
  label?: string;
  submenuSide?: string;
  onSelect?: (...args: unknown[]) => void;
  useItemsMode?: boolean;
}) {
  const open = ref(true);
  const Harness = defineComponent({
    setup() {
      return () =>
        options.useItemsMode === false
          ? h(
              MenuPopover,
              {
                open: open.value,
                "onUpdate:open": (value: boolean) => {
                  open.value = value;
                },
                trigger: options.trigger,
                label: options.label ?? "Options",
                submenuSide: options.submenuSide ?? "auto",
                items: [] as MenuItem[],
              },
              {
                default: () =>
                  h(Menu, { items: options.items ?? [], onSelect: options.onSelect }),
              },
            )
          : h(MenuPopover, {
              open: open.value,
              "onUpdate:open": (value: boolean) => {
                open.value = value;
              },
              trigger: options.trigger,
              items: options.items ?? [],
              label: options.label ?? "Options",
              submenuSide: options.submenuSide ?? "auto",
              onSelect: options.onSelect,
            });
    },
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  mounted.push(wrapper);
  return { wrapper, open };
}

function mountMenu(
  props: Record<string, unknown>,
  slots?: Record<string, unknown>,
): ReturnType<typeof mount> {
  const wrapper = mount(Menu, {
    props: props as never,
    slots: slots as never,
    attachTo: document.body,
  });
  mounted.push(wrapper);
  return wrapper;
}

describe("Menu cascade — flat compatibility (AC-01)", () => {
  it("keeps identical classes and a single-argument select for flat menus", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({
      items: [
        { label: "Edit", value: "edit" },
        { label: "Delete", value: "delete", danger: true },
      ],
      onSelect,
    });
    const root = wrapper.find(".st-menu");
    expect(root.exists()).toBe(true);
    expect(root.classes()).not.toContain("st-menu--hasCascade");
    expect(root.attributes("role")).toBe("menu");
    await buttonByText(wrapper, "Edit").trigger("click");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0].length).toBe(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ label: "Edit", value: "edit" });
    expect(wrapper.find(".st-menu__item--danger").exists()).toBe(true);
    // AC-01(a): initial roving tabindex (0/-1, no visual change).
    const tabs = wrapper.findAll("[role='menuitem']").map((b) => b.attributes("tabindex"));
    expect(tabs).toContain("0");
    expect(tabs).toContain("-1");
  });
});

describe("Menu cascade — parents (AC-02, AC-03, AC-10)", () => {
  it("AC-02: parent exposes popup semantics with a chevron on the preferred side", () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const parent = buttonByText(wrapper, "Class A");
    expect(parent.attributes("aria-haspopup")).toBe("menu");
    expect(parent.attributes("aria-expanded")).toBe("false");
    expect(parent.find(".st-menu__itemChevron--end").exists()).toBe(true);
    expect(parent.find("svg").exists()).toBe(true);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("AC-02: disabled parent keeps chevron and popup but never expands", async () => {
    const wrapper = mountMenu({
      items: [
        {
          label: "Locked",
          value: "locked",
          disabled: true,
          children: [{ label: "Sub", value: "sub" }],
        },
      ],
    });
    const parent = buttonByText(wrapper, "Locked");
    expect(parent.attributes("aria-haspopup")).toBe("menu");
    expect(parent.attributes("aria-expanded")).toBe("false");
    expect(parent.find(".st-menu__itemChevron").exists()).toBe(true);
    await parent.trigger("click");
    await parent.trigger("keydown", { key: "Enter" });
    await vi.advanceTimersByTimeAsync(500);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(buttonByText(wrapper, "Locked").attributes("aria-expanded")).toBe("false");
  });

  it("AC-03: empty children render a leaf that emits the class key", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({
      items: [{ label: "Class", value: "class", children: [] }],
      onSelect,
    });
    const leaf = buttonByText(wrapper, "Class");
    expect(leaf.find(".st-menu__itemChevron").exists()).toBe(false);
    await leaf.trigger("click");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ label: "Class", value: "class" });
  });

  it("AC-10: selected alone renders the class without opening anything", () => {
    const wrapper = mountMenu({
      items: [
        { label: "Picked", value: "picked", selected: true },
        { label: "Other", value: "other" },
      ],
    });
    const picked = buttonByText(wrapper, "Picked");
    expect(picked.classes()).toContain("st-menu__item--selected");
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(picked.attributes("aria-expanded")).toBeUndefined();
  });
});

describe("Menu cascade — opening (AC-04, AC-05, AC-06)", () => {
  it("AC-04: click opens, selects the line, emits nothing, keeps focus", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({ items: cascadeItems, onSelect });
    const parentEl = buttonByText(wrapper, "Class A").element as HTMLButtonElement;
    parentEl.focus();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const reopened = buttonByText(wrapper, "Class A");
    expect(reopened.attributes("aria-expanded")).toBe("true");
    expect(reopened.classes()).toContain("st-menu__item--selected");
    expect(onSelect).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    expect(document.activeElement).toBe(reopened.element);
  });

  it("AC-05: Enter opens and focuses the first enabled sub item", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "Enter" });
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]');
    expect(panel).toBeTruthy();
    const first = Array.from(panel?.querySelectorAll("[role='menuitem']") ?? []).find(
      (el) => el.textContent?.trim() === "Reason 1",
    );
    expect(document.activeElement).toBe(first);
  });

  it("AC-05: Space opens like Enter", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class B").trigger("keydown", { key: " " });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const why = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Why",
    );
    expect(document.activeElement).toBe(why);
  });

  it("AC-06: opening arrow opens, opposite arrow closes and refocuses", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel).toBeTruthy();
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    expect(document.activeElement).toBe(reason);
    // Dispatch through the element so the level handler runs.
    reason.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class A").element);
  });
});

describe("Menu cascade — hover intent and safe triangle (AC-07, AC-08, AC-25, AC-38)", () => {
  it("AC-07: hover opens at 150 ms, not at 149 ms, without moving focus", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const wrap = buttonByText(wrapper, "Class A").element.closest(
      ".st-menu__itemWrap",
    ) as HTMLElement;
    const before = document.activeElement;
    await wrap.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, ...mouseProps() } as PointerEventInit & { pointerType: string }));
    await vi.advanceTimersByTimeAsync(149);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    expect(document.activeElement).toBe(before);
  });

  it("AC-38: non-mouse pointers never arm hover", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const wrap = buttonByText(wrapper, "Class A").element.closest(
      ".st-menu__itemWrap",
    ) as HTMLElement;
    const evt = new PointerEvent("pointerenter", {
      bubbles: false,
    } as PointerEventInit);
    Object.defineProperties(evt, {
      pointerType: { value: "touch" },
      clientX: { value: 0 },
      clientY: { value: 0 },
    });
    wrap.dispatchEvent(evt);
    await vi.advanceTimersByTimeAsync(500);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  function pointer(type: string, el: Element, x: number, y: number) {
    const evt = new PointerEvent(type, { bubbles: true }) as PointerEvent & { clientX: number; clientY: number };
    Object.defineProperties(evt, {
      pointerType: { value: "mouse" },
      clientX: { value: x },
      clientY: { value: y },
    } as PropertyDescriptorMap);
    el.dispatchEvent(evt);
  }

  it("AC-08: diagonal in the triangle survives, panel entry cancels, exit closes", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel).toBeTruthy();
    stubRect(panel, { left: 200, right: 392, top: 90, bottom: 210, width: 192, height: 120 });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    pointer("pointerleave", wrap, 100, 100);
    const host = wrapper.find(".st-menu--hasCascade").element as HTMLElement;
    pointer("pointermove", host, 150, 100);
    await vi.advanceTimersByTimeAsync(400);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    pointer("pointerenter", panel, 250, 100);
    await vi.advanceTimersByTimeAsync(400);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    pointer("pointerleave", panel, 500, 500);
    await vi.advanceTimersByTimeAsync(249);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("AC-08: re-entry before expiry cancels the close", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    stubRect(panel, { left: 200, right: 392, top: 90, bottom: 210, width: 192, height: 120 });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    pointer("pointerleave", wrap, 10, 10);
    await vi.advanceTimersByTimeAsync(100);
    pointer("pointerenter", panel, 250, 100);
    await vi.advanceTimersByTimeAsync(400);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
  });

  it("AC-25: crossing a sibling leaf inside the triangle neither opens nor closes", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    stubRect(panel, { left: 200, right: 392, top: 50, bottom: 250, width: 192, height: 200 });
    const wrapA = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    pointer("pointerleave", wrapA, 100, 100);
    pointer("pointermove", wrapper.find(".st-menu--hasCascade").element, 150, 100);
    const direct = buttonByText(wrapper, "Direct").element;
    pointer("pointerenter", direct, 155, 105);
    await vi.advanceTimersByTimeAsync(400);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    expect(buttonByText(wrapper, "Class B").attributes("aria-expanded")).toBe("false");
  });

  it("AC-38: unmount during a pending hover fires nothing", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({ items: cascadeItems, onSelect });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    pointer("pointerenter", wrap, 0, 0);
    wrapper.unmount();
    const idx = mounted.indexOf(wrapper);
    if (idx >= 0) mounted.splice(idx, 1);
    await vi.advanceTimersByTimeAsync(500);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Menu cascade — switching, leaves, disabled (AC-09, AC-11, AC-12)", () => {
  it("AC-09: sibling switch closes the first panel and keeps explicit selection", async () => {
    const wrapper = mountMenu({
      items: [
        { label: "Class A", value: "class-a", children: [{ label: "Reason 1", value: "reason-1" }] },
        { label: "Class B", value: "class-b", selected: true, children: [{ label: "Why", value: "why" }] },
      ],
    });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(wrapper.text()).toContain("Reason 1");
    await buttonByText(wrapper, "Class B").trigger("click");
    await nextTick();
    expect(wrapper.text()).toContain("Why");
    const reopenedA = buttonByText(wrapper, "Class A");
    expect(reopenedA.attributes("aria-expanded")).toBe("false");
    expect(reopenedA.classes()).not.toContain("st-menu__item--selected");
    expect(buttonByText(wrapper, "Class B").classes()).toContain("st-menu__item--selected");
  });

  it("AC-11: deep leaf emits once with the full path and closes all", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({ items: cascadeItems, onSelect });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    reason.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "Reason 1", value: "reason-1" });
    expect(args[1]).toEqual(["class-a", "reason-1"]);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("AC-11: root leaf in a cascade menu emits a length-1 path", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({ items: cascadeItems, onSelect });
    await buttonByText(wrapper, "Direct").trigger("click");
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "Direct", value: "direct" });
    expect(args[1]).toEqual(["direct"]);
  });

  it("AC-12: disabled parent never opens and disabled items are skipped", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const parent = buttonByText(wrapper, "Class A");
    (parent.element as HTMLButtonElement).focus();
    await parent.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttonByText(wrapper, "Direct").element);
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const first = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await nextTick();
    // Wraps back to Reason 1, skipping disabled Reason 2.
    expect(document.activeElement).toBe(first);
  });
});

describe("Menu cascade — level-local keyboard and roving (AC-13, AC-31, AC-32)", () => {
  it("AC-13: arrows and Home/End wrap inside the current level only", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    reason.focus();
    reason.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
    await nextTick();
    // Single enabled item: stays (disabled Reason 2 is skipped).
    expect(document.activeElement).toBe(reason);
    reason.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(reason);
    // Root level is untouched: exactly one roving target per open level.
    for (const level of [0, 1]) {
      const root = document.body.querySelector(`[data-menu-level="${level}"]`) as HTMLElement;
      expect(root.querySelectorAll('[role="menuitem"][tabindex="0"]').length).toBe(1);
    }
  });

  it("AC-31: all-disabled level opens with no focus target and no roving zero", async () => {
    const wrapper = mountMenu({
      items: [
        { label: "Class", value: "class", children: [{ label: "Off", value: "off", disabled: true }] },
      ],
    });
    const parent = buttonByText(wrapper, "Class");
    (parent.element as HTMLButtonElement).focus();
    await parent.trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class").element);
    expect(panel.querySelectorAll('[role="menuitem"][tabindex="0"]').length).toBe(0);
    await buttonByText(wrapper, "Class").trigger("keydown", { key: "Enter" });
    await nextTick();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class").element);
  });

  it("AC-32: Tab closes everything without trapping focus", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Tab" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    // Standalone Menu has no dismiss root: the root list stays (host closes it).
    expect(document.body.querySelector('[data-menu-level="0"]')).toBeTruthy();
  });
});

describe("Menu cascade — Escape per level (AC-14)", () => {
  it("closes the sub-menu first and refocuses the parent line", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class A").element);
  });

  it("closes a sub-menu even when the root has no dismiss", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.body.querySelector('[data-menu-level="0"]')).toBeTruthy();
  });

  it("keeps the standalone root open on Esc when no sub-menu is open", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "Escape" });
    await nextTick();
    // Vue standalone Menu has no dismissOnSelect: Esc at the root is a no-op.
    expect(document.body.querySelector('[data-menu-level="0"]')).toBeTruthy();
  });
});

describe("Menu cascade — toggle, duplicates, depth (AC-28, AC-29, AC-30, AC-18)", () => {
  it("AC-29: second click closes the level, keeps focus, emits nothing", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({ items: cascadeItems, onSelect });
    const parent = buttonByText(wrapper, "Class A");
    (parent.element as HTMLButtonElement).focus();
    await parent.trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class A").element);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("AC-30: opening arrow on an open parent focuses first without closing", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const parent = buttonByText(wrapper, "Class A");
    const wrap = parent.element.closest(".st-menu__itemWrap") as HTMLElement;
    const evt = new PointerEvent("pointerenter", { bubbles: false }) as PointerEvent;
    Object.defineProperties(evt, {
      pointerType: { value: "mouse" },
      clientX: { value: 0 },
      clientY: { value: 0 },
    } as PropertyDescriptorMap);
    wrap.dispatchEvent(evt);
    await vi.advanceTimersByTimeAsync(150);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    (buttonByText(wrapper, "Class A").element as HTMLButtonElement).focus();
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "ArrowRight" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const first = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    );
    expect(document.activeElement).toBe(first);
  });

  it("AC-28: duplicate sibling keys follow the index path with one warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mountMenu({
      items: [
        { label: "Same one", value: "same", children: [{ label: "One", value: "one" }] },
        { label: "Same two", value: "same", children: [{ label: "Two", value: "two" }] },
      ],
    });
    await buttonByText(wrapper, "Same one").trigger("click");
    await nextTick();
    expect(wrapper.text()).toContain("One");
    await buttonByText(wrapper, "Same two").trigger("click");
    await nextTick();
    // Siblings never open together: the second panel replaced the first.
    expect(wrapper.text()).toContain("Two");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("AC-18: second level opens; deeper children render as leaves with a per-key warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSelect = vi.fn();
    const wrapper = mountMenu({
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
                { label: "Too deep", value: "too-deep", children: [{ label: "Never", value: "never" }] },
              ],
            },
          ],
        },
      ],
      onSelect,
    });
    await buttonByText(wrapper, "Class").trigger("click");
    await nextTick();
    const panel1 = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const mid = Array.from(panel1.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Mid",
    ) as HTMLElement;
    mid.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    const level2 = document.body.querySelector('[data-menu-level="2"]') as HTMLElement;
    expect(level2).toBeTruthy();
    // A depth-2 item bearing children renders as a leaf: no chevron.
    const tooDeep = Array.from(level2.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Too deep",
    ) as HTMLElement;
    expect(tooDeep.querySelector(".st-menu__itemChevron")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    // Closing and reopening does not warn again for the same key.
    await buttonByText(wrapper, "Class").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    await buttonByText(wrapper, "Class").trigger("click");
    await nextTick();
    const panel1b = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const midb = Array.from(panel1b.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Mid",
    ) as HTMLElement;
    midb.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(warn).toHaveBeenCalledTimes(1);
    // A depth-2 leaf emits a length-3 path.
    const panel2 = document.body.querySelector('[data-menu-level="2"]') as HTMLElement;
    const deep = Array.from(panel2.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Deep",
    ) as HTMLElement;
    deep.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "Deep", value: "deep" });
    expect(args[1]).toEqual(["class", "mid", "deep"]);
  });
});

describe("Menu cascade — sides, groups, items change (AC-19, AC-20, AC-21, AC-22)", () => {
  async function openWithGeometry(
    props: { submenuSide?: string },
    menuRect: Partial<DOMRect>,
    itemTop: number,
  ) {
    const wrapper = mountMenu({ items: cascadeItems, ...props });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const root = document.body.querySelector('[data-menu-level="0"]') as Element;
    const button = Array.from(root.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Class A",
    ) as Element;
    const panel = document.body.querySelector('[data-menu-level="1"]') as Element;
    stubRect(root, { ...menuRect });
    stubRect(button, { top: itemTop, left: menuRect.left ?? 0 });
    stubRect(panel, { width: 192, height: 100 });
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    return wrapper;
  }

  it("AC-19: flipped side drives chevron and opening arrow", async () => {
    const wrapper = await openWithGeometry({ submenuSide: "auto" }, { left: 700, right: 892 }, 200);
    const parent = buttonByText(wrapper, "Class A");
    expect(parent.find(".st-menu__itemChevron--start").exists()).toBe(true);
    expect(parent.find(".st-menu__itemChevron--end").exists()).toBe(false);
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel.style.left).toBe("508px");
    (parent.element as HTMLButtonElement).focus();
    await parent.trigger("keydown", { key: "ArrowLeft" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    const first = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    );
    expect(document.activeElement).toBe(first);
  });

  it("AC-20: submenuSide left pins left while auto prefers right", async () => {
    const wrapper = await openWithGeometry({ submenuSide: "left" }, { left: 400, right: 592 }, 200);
    expect(buttonByText(wrapper, "Class A").find(".st-menu__itemChevron--start").exists()).toBe(true);
    expect((document.body.querySelector('[data-menu-level="1"]') as HTMLElement).style.left).toBe("208px");
  });

  it("AC-20: auto prefers right on the same geometry", async () => {
    const wrapper = await openWithGeometry({ submenuSide: "auto" }, { left: 400, right: 592 }, 200);
    expect(buttonByText(wrapper, "Class A").find(".st-menu__itemChevron--end").exists()).toBe(true);
    expect((document.body.querySelector('[data-menu-level="1"]') as HTMLElement).style.left).toBe("592px");
  });

  it("AC-21: groups and dividers render in children; grouped leaf path skips the group", async () => {
    const onSelect = vi.fn();
    const wrapper = mountMenu({
      items: [
        {
          label: "Class",
          value: "class",
          children: [
            { kind: "group", label: "Class — reason" },
            { label: "R1", value: "r1" },
            { kind: "divider" },
            { label: "R2", value: "r2" },
          ],
        },
      ],
      onSelect,
    });
    await buttonByText(wrapper, "Class").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel.textContent).toContain("Class — reason");
    expect(panel.querySelector('[role="separator"]')).toBeTruthy();
    const r2 = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "R2",
    ) as HTMLElement;
    r2.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "R2", value: "r2" });
    expect(args[1]).toEqual(["class", "r2"]);
  });

  it("AC-22: removing the open index path removes orphan panels", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await wrapper.setProps({ items: [{ label: "Direct", value: "direct" }] });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("AC-22/38: items change cancels a pending hover open", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    const evt = new PointerEvent("pointerenter", { bubbles: false }) as PointerEvent;
    Object.defineProperties(evt, {
      pointerType: { value: "mouse" },
      clientX: { value: 0 },
      clientY: { value: 0 },
    } as PropertyDescriptorMap);
    wrap.dispatchEvent(evt);
    await vi.advanceTimersByTimeAsync(100);
    await wrapper.setProps({ items: [{ label: "Direct", value: "direct" }] });
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });
});

describe("Menu cascade — shadow, cap, containing block (AC-23, AC-27, AC-36)", () => {
  it("AC-23: cascade marker class and popover shadow chain; flat keeps menu shadow", () => {
    const flat = mountMenu({ items: [{ label: "Edit", value: "edit" }] });
    const flatRoot = flat.find(".st-menu");
    expect(flatRoot.classes()).not.toContain("st-menu--hasCascade");
    flat.unmount();
    const idx = mounted.indexOf(flat);
    if (idx >= 0) mounted.splice(idx, 1);
    document.body.innerHTML = "";
    mountMenu({ items: cascadeItems });
    const root = document.body.querySelector(".st-menu--hasCascade");
    expect(root).toBeTruthy();
    const source = readFileSync(join(here, "styles.css"), "utf8");
    expect(source).toContain("--st-component-popover-shadow");
    expect(source).toContain("--st-component-selectableRow-selectedBackground");
    expect(source).toContain("--st-component-selectableRow-selectedText");
    const submenuRule = source.match(/\.st-menu--submenu \{[^}]*\}/s)?.[0] ?? "";
    expect(submenuRule).toContain("--st-component-popover-shadow");
  });

  it("AC-27: narrow viewport caps the panel width with min-width 0", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 160 });
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const style = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("left: 8px");
    expect(style).toContain("min-width: 0");
  });

  it("AC-36: converted position under a transformed host ancestor", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const root = document.body.querySelector('[data-menu-level="0"]') as Element;
    const panel = document.body.querySelector('[data-menu-level="1"]') as Element;
    stubRect(root, { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 });
    stubRect(panel, { width: 0, height: 0 });
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          transform: "translateX(-100%)",
          filter: "none",
          perspective: "none",
          contain: "none",
          willChange: "auto",
        }) as unknown as CSSStyleDeclaration,
    );
    const host = document.body.querySelector(".st-menu--hasCascade") as Element;
    stubRect(host, { top: 40, left: 60, right: 260, bottom: 200, width: 200, height: 160 });
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    const style = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -52px");
  });
});

describe("Menu cascade — outside (AC-15)", () => {
  it("OverflowMenu closes on outside pointer down", async () => {
    const wrapper = mount(OverflowMenu, {
      props: { items: cascadeItems, label: "Row actions" },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const trigger = wrapper.find('.st-overflowMenu__trigger');
    await trigger.trigger("click");
    await nextTick();
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(true);
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await nextTick();
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
  });

  it("host panels and trigger are never outside (composedPath)", async () => {
    const trigger = document.createElement("div");
    document.body.appendChild(trigger);
    const wrapper = mount(MenuPopover, {
      props: { open: true, trigger, items: cascadeItems, label: "Options" },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    await nextTick();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    // Pointer down on the sub-panel keeps everything open.
    panel.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    trigger.remove();
  });
});

describe("Menu cascade — hosts (AC-14, AC-33, AC-34, AC-35)", () => {
  it("AC-14: OverflowMenu Esc closes the sub-menu, then everything with trigger focus", async () => {
    const wrapper = mount(OverflowMenu, {
      props: { items: cascadeItems, label: "Row actions" },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const trigger = wrapper.find('.st-overflowMenu__trigger');
    await trigger.trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(true);
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
  });

  it("AC-33: OverflowMenu trigger aria-controls resolves to the root menu", async () => {
    const wrapper = mount(OverflowMenu, {
      props: { items: cascadeItems, label: "Row actions" },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const trigger = wrapper.find('.st-overflowMenu__trigger');
    expect(trigger.attributes("aria-controls")).toBeUndefined();
    await trigger.trigger("click");
    await nextTick();
    const controls = trigger.attributes("aria-controls") as string;
    expect(controls).toBeTruthy();
    const root = document.getElementById(controls);
    expect(root?.getAttribute("role")).toBe("menu");
  });

  it("AC-33: MenuPopover sets aria-controls on an external trigger while open", async () => {
    const external = document.createElement("button");
    external.textContent = "Open";
    document.body.appendChild(external);
    const { wrapper } = mountPopoverHarness({ trigger: external, items: cascadeItems, label: "Options" });
    await nextTick();
    const controls = external.getAttribute("aria-controls") as string;
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls)?.getAttribute("role")).toBe("menu");
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(external.getAttribute("aria-controls")).toBeNull();
    expect(document.activeElement).toBe(external);
    external.remove();
  });

  it("AC-34: MenuPopover + Menu — first Esc closes the sub-menu only", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    const onSelect = vi.fn();
    // Slot composition: consumer provides the inner Menu (Svelte fixture parity).
    const { wrapper } = mountPopoverHarness({
      trigger,
      items: cascadeItems,
      label: "Options",
      onSelect,
      useItemsMode: false,
    });
    await nextTick();
    trigger.focus();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Escape" });
    await nextTick();
    // The level consumed the key: the host never closed.
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    await buttonByText(wrapper, "Class A").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("AC-35: deep leaf via OverflowMenu relays item and path; parent emits nothing", async () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const wrapper = mount(OverflowMenu, {
      props: {
        label: "Row actions",
        items: [
          {
            label: "Class A",
            value: "class-a",
            onClick: itemClick,
            children: [{ label: "Reason 1", value: "reason-1" }],
          },
        ],
        onSelect,
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    await wrapper.find('.st-overflowMenu__trigger').trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    // Parent activation opens the sub-menu without emitting or closing.
    expect(onSelect).not.toHaveBeenCalled();
    expect(itemClick).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    reason.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(itemClick).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "Reason 1", value: "reason-1" });
    expect(args[1]).toEqual(["class-a", "reason-1"]);
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
  });

  it("AC-35: deep leaf via MenuPopover items mode relays item and path", async () => {
    const onSelect = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    const { wrapper } = mountPopoverHarness({ trigger, items: cascadeItems, label: "Options", onSelect });
    await nextTick();
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    expect(onSelect).not.toHaveBeenCalled();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    reason.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    const args = onSelect.mock.calls[0];
    expect(args[0]).toMatchObject({ label: "Reason 1", value: "reason-1" });
    expect(args[1]).toEqual(["class-a", "reason-1"]);
    // Pointer leaf closes the host without moving focus.
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    trigger.remove();
  });
});

describe("Menu cascade — OverflowMenu flat regression (AC-37 Vue parity)", () => {
  // Vue flat Overflow DOM keeps its origin/main classes: host/trigger/list
  // wrappers plus the inner Menu rows (Svelte refactors to `ul` + `li`
  // wrappers; Vue keeps `div.st-overflowMenu__list > div.st-menu`).
  it("keeps the flat Vue class set, roles and select contract", async () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const wrapper = mount(OverflowMenu, {
      props: {
        label: "Row actions",
        items: [
          { label: "Edit", value: "edit", icon: "E", onClick: itemClick },
          { label: "Delete", value: "delete", danger: true },
          { kind: "divider" },
          { kind: "group", label: "More" },
          { label: "Archive", value: "archive", disabled: true },
        ],
        onSelect,
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const host = wrapper.find(".st-overflowMenu");
    expect(host.exists()).toBe(true);
    const trigger = wrapper.find(".st-overflowMenu__trigger");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.find("svg").exists()).toBe(true);
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    const list = wrapper.find(".st-overflowMenu__list");
    expect(list.exists()).toBe(true);
    const menu = wrapper.find(".st-menu");
    expect(menu.exists()).toBe(true);
    expect(menu.attributes("role")).toBe("menu");
    const editItem = buttonByText(wrapper, "Edit");
    expect(editItem.classes()).toContain("st-menu__item");
    expect(buttonByText(wrapper, "Delete").classes()).toContain("st-menu__item--danger");
    expect(buttonByText(wrapper, "Archive").attributes("aria-disabled")).toBe("true");
    expect(wrapper.find(".st-menu__itemIcon").text()).toBe("E");
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
    expect(wrapper.find(".st-menu__group").text()).toBe("More");
    await editItem.trigger("click");
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0].length).toBe(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ label: "Edit", value: "edit" });
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("keeps flat keyboard navigation with disabled items skipped", async () => {
    const wrapper = mount(OverflowMenu, {
      props: {
        label: "Row actions",
        items: [
          { label: "Edit", value: "edit" },
          { label: "Archive", value: "archive", disabled: true },
          { label: "Delete", value: "delete" },
        ],
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const trigger = wrapper.find('.st-overflowMenu__trigger');
    await trigger.trigger("click");
    await nextTick();
    const edit = buttonByText(wrapper, "Edit");
    const deleteItem = buttonByText(wrapper, "Delete");
    (edit.element as HTMLButtonElement).focus();
    edit.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(deleteItem.element);
    deleteItem.element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.activeElement).toBe(edit.element);
  });

  it("restores the flat selected style from the selectableRow tokens", () => {
    const source = readFileSync(join(here, "styles.css"), "utf8");
    for (const selector of [".st-menu__item--selected", ".st-overflowMenu__item--selected"]) {
      expect(source).toContain(selector);
    }
    expect(source).toContain("--st-component-selectableRow-selectedBackground");
  });
});

describe("Menu cascade — review fixes (B2, M1–M6)", () => {
  async function openFlippedLeft() {
    const wrapper = mountMenu({ items: cascadeItems, submenuSide: "auto" });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const root = document.body.querySelector('[data-menu-level="0"]') as Element;
    const button = Array.from(root.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Class A",
    ) as Element;
    const panel = document.body.querySelector('[data-menu-level="1"]') as Element;
    stubRect(root, { left: 700, right: 892 });
    stubRect(button, { top: 200, left: 700 });
    stubRect(panel, { width: 192, height: 100 });
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    return wrapper;
  }

  it("B2: flipped-panel leaf treats the resolved side as opening", async () => {
    const wrapper = await openFlippedLeft();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    expect(panel.style.left).toBe("508px");
    const leaf = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    leaf.focus();
    leaf.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    leaf.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class A").element);
  });

  it("M1: pointer close moves focus from the closed panel to its parent line", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const reason = Array.from(panel.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Reason 1",
    ) as HTMLElement;
    reason.focus();
    const evt = new PointerEvent("pointerleave", { bubbles: true }) as PointerEvent;
    Object.defineProperties(evt, {
      pointerType: { value: "mouse" },
      clientX: { value: 500 },
      clientY: { value: 500 },
    } as PropertyDescriptorMap);
    panel.dispatchEvent(evt);
    await vi.advanceTimersByTimeAsync(249);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class A").element);
  });

  it("M2a: leaving the parent before the hover delay cancels the pending open", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    const enter = new PointerEvent("pointerenter", { bubbles: false }) as PointerEvent;
    Object.defineProperties(enter, {
      pointerType: { value: "mouse" },
      clientX: { value: 0 },
      clientY: { value: 0 },
    } as PropertyDescriptorMap);
    wrap.dispatchEvent(enter);
    await vi.advanceTimersByTimeAsync(100);
    const leave = new PointerEvent("pointerleave", { bubbles: false }) as PointerEvent;
    Object.defineProperties(leave, {
      pointerType: { value: "mouse" },
      clientX: { value: 0 },
      clientY: { value: 0 },
    } as PropertyDescriptorMap);
    wrap.dispatchEvent(leave);
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("M2b: leaving the triangle away from the panel re-arms the close", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const panel = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    stubRect(panel, { left: 200, right: 392, top: 90, bottom: 210, width: 192, height: 120 });
    const wrap = buttonByText(wrapper, "Class A").element.closest(".st-menu__itemWrap") as HTMLElement;
    const leave = new PointerEvent("pointerleave", { bubbles: true }) as PointerEvent;
    Object.defineProperties(leave, {
      pointerType: { value: "mouse" },
      clientX: { value: 100 },
      clientY: { value: 100 },
    } as PropertyDescriptorMap);
    wrap.dispatchEvent(leave);
    const host = wrapper.find(".st-menu--hasCascade").element as HTMLElement;
    const driftIn = new PointerEvent("pointermove", { bubbles: true }) as PointerEvent;
    Object.defineProperties(driftIn, {
      pointerType: { value: "mouse" },
      clientX: { value: 150 },
      clientY: { value: 100 },
    } as PropertyDescriptorMap);
    host.dispatchEvent(driftIn);
    await vi.advanceTimersByTimeAsync(100);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    const driftOut = new PointerEvent("pointermove", { bubbles: true }) as PointerEvent;
    Object.defineProperties(driftOut, {
      pointerType: { value: "mouse" },
      clientX: { value: 500 },
      clientY: { value: 500 },
    } as PropertyDescriptorMap);
    host.dispatchEvent(driftOut);
    await vi.advanceTimersByTimeAsync(249);
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
  });

  it("M3: narrow-viewport cap survives a second recompute", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: 160 });
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const first = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(first).toContain("left: 8px");
    expect(first).toContain("min-width: 0");
    stubRect(document.body.querySelector('[data-menu-level="1"]') as Element, { width: 144, height: 100 });
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    const second = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(second).toContain("min-width: 0");
  });

  const threeLevel: MenuItem[] = [
    {
      label: "Class",
      value: "class",
      children: [
        { label: "Mid", value: "mid", children: [{ label: "Deep", value: "deep" }] },
        { label: "Other", value: "other" },
      ],
    },
  ];

  async function openTwoLevels() {
    const wrapper = mountMenu({ items: threeLevel });
    await buttonByText(wrapper, "Class").trigger("click");
    await nextTick();
    const panel1 = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const mid = Array.from(panel1.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Mid",
    ) as HTMLElement;
    mid.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="2"]')).toBeTruthy();
    return wrapper;
  }

  it("M4: Esc from a middle level closes only the deepest level per press", async () => {
    const wrapper = await openTwoLevels();
    await buttonByText(wrapper, "Mid").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="2"]')).toBeNull();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Mid").element);
    await buttonByText(wrapper, "Mid").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText(wrapper, "Class").element);
  });

  it("M4: opposite arrow from a middle level closes only the deepest level", async () => {
    await openTwoLevels();
    const panel1 = document.body.querySelector('[data-menu-level="1"]') as HTMLElement;
    const mid = Array.from(panel1.querySelectorAll("[role='menuitem']")).find(
      (el) => el.textContent?.trim() === "Mid",
    ) as HTMLElement;
    mid.focus();
    mid.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="2"]')).toBeNull();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeTruthy();
  });

  it("M5: flat OverflowMenu Esc closes without returning focus to the trigger", async () => {
    const wrapper = mount(OverflowMenu, {
      props: { label: "Row actions", items: [{ label: "Edit", value: "edit" }] },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    const trigger = wrapper.find('.st-overflowMenu__trigger');
    await trigger.trigger("click");
    await nextTick();
    const item = buttonByText(wrapper, "Edit");
    expect(document.activeElement).not.toBe(trigger.element);
    await item.trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find(".st-overflowMenu__list").exists()).toBe(false);
    expect(document.activeElement).not.toBe(trigger.element);
  });

  it("M5: flat MenuPopover Esc closes without returning focus to the trigger", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    const { wrapper } = mountPopoverHarness({
      trigger,
      items: [{ label: "Edit", value: "edit" }],
      label: "Options",
    });
    await nextTick();
    await buttonByText(wrapper, "Edit").trigger("keydown", { key: "Escape" });
    await nextTick();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(document.activeElement).not.toBe(trigger);
    trigger.remove();
  });

  it("M5: MenuPopover forgets cascade once items lose their children", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    // Direct mount so `setProps` can swap cascade → flat (harness items are fixed).
    const wrapper = mount(MenuPopover, {
      props: { open: true, trigger, items: cascadeItems, label: "Options", "onUpdate:open": vi.fn() },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    await nextTick();
    await wrapper.setProps({ items: [{ label: "Edit", value: "edit" }] });
    await nextTick();
    await buttonByText(wrapper, "Edit").trigger("keydown", { key: "Escape" });
    await nextTick();
    // Controlled `open` stays true: the close is observed via `update:open`.
    const emitted = wrapper.emitted("update:open") as unknown[][] | undefined;
    expect(emitted?.[emitted.length - 1]).toEqual([false]);
    expect(document.activeElement).not.toBe(trigger);
    trigger.remove();
  });

  it("M6: flat OverflowMenu renders the selected row state", async () => {
    const wrapper = mount(OverflowMenu, {
      props: {
        label: "Row actions",
        items: [
          { label: "Edit", value: "edit", selected: true },
          { label: "Delete", value: "delete" },
        ],
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    await wrapper.find('.st-overflowMenu__trigger').trigger("click");
    await nextTick();
    expect(buttonByText(wrapper, "Edit").classes()).toContain("st-menu__item--selected");
    expect(buttonByText(wrapper, "Delete").classes()).not.toContain("st-menu__item--selected");
  });

  it("M6: flat duplicate values relay the clicked row's onClick", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSelect = vi.fn();
    const firstClick = vi.fn();
    const secondClick = vi.fn();
    const wrapper = mount(OverflowMenu, {
      props: {
        label: "Row actions",
        items: [
          { label: "Same A", value: "dup", onClick: firstClick },
          { label: "Same B", value: "dup", onClick: secondClick },
        ],
        onSelect,
      },
      attachTo: document.body,
    });
    mounted.push(wrapper);
    await wrapper.find('.st-overflowMenu__trigger').trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Same B").trigger("click");
    expect(secondClick).toHaveBeenCalledTimes(1);
    expect(firstClick).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ label: "Same B", value: "dup" });
  });

  it("AC-32: Shift+Tab closes everything without trapping focus", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    await buttonByText(wrapper, "Reason 1").trigger("keydown", { key: "Tab", shiftKey: true });
    await nextTick();
    expect(document.body.querySelector('[data-menu-level="1"]')).toBeNull();
    expect(document.body.querySelector('[data-menu-level="0"]')).toBeTruthy();
  });

  it("post-mount recompute positions panels without a synthetic resize", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    await nextTick();
    const style = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top:");
    expect(style).toContain("left:");
  });

  it("AC-36: nearest transformed ancestor wins the containing-block walk", async () => {
    const wrapper = mountMenu({ items: cascadeItems });
    await buttonByText(wrapper, "Class A").trigger("click");
    await nextTick();
    const host = document.body.querySelector(".st-menu--hasCascade") as Element;
    stubRect(host, { top: 40, left: 60, right: 260, bottom: 200, width: 200, height: 160 });
    const plain = { transform: "none", filter: "none", perspective: "none", contain: "none", willChange: "auto" };
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (el: Element) =>
        (el === host ? { ...plain, transform: "translateX(-10%)" } : { ...plain }) as unknown as CSSStyleDeclaration,
    );
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    const style = (document.body.querySelector('[data-menu-level="1"]') as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -52px");
  });
});
