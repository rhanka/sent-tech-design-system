import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Menu, MenuPopover, MenuTriggerButton, OverflowMenu } from "./index.js";
import type { MenuItem, MenuSubmenuSide } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));

describe("second review regressions", () => {
  it.each((["items", "children"] as const).flatMap((mode) =>
    (["top-start", "top-end", "bottom-end"] as const).map((placement) => ({ mode, placement }))
  ))("keeps transformed $placement cascade hosts unclipped in $mode mode", ({ mode, placement }) => {
    const trigger = document.createElement("button");
    stubRect(trigger, { top: 400, bottom: 430, left: 500, right: 600, width: 100 });
    const style = document.createElement("style");
    style.textContent = readFileSync(join(here, "styles.css"), "utf8");
    document.head.appendChild(style);
    try {
      const view = render(<MenuPopover open trigger={trigger} placement={placement} items={mode === "items" ? cascadeItems : []}>
        {mode === "children" ? <Menu items={cascadeItems} /> : null}
      </MenuPopover>);
      const host = screen.getByRole("dialog");
      expect(getComputedStyle(host).transform).toContain("translate");
      expect(getComputedStyle(host).overflow).toBe("visible");
      expect(getComputedStyle(levelEl(view.container, 0)!).overflowY).toBe("auto");
      expect(getComputedStyle(levelEl(view.container, 0)!).maxHeight).toBe("inherit");
      expect(getComputedStyle(levelEl(view.container, 0)!.parentElement!).maxHeight).toBe("inherit");
      fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
      expect(getComputedStyle(levelEl(view.container, 1)!).overflowY).toBe("auto");
      view.rerender(<MenuPopover open trigger={trigger} placement={placement} items={mode === "items" ? [{ label: "Flat" }] : []}>
        {mode === "children" ? <Menu items={[{ label: "Flat" }]} /> : null}
      </MenuPopover>);
      expect(getComputedStyle(host).overflow).toBe("auto");
    } finally {
      style.remove();
    }
  });

  it("repositions an open branch with the current side on prop changes, resize and scroll", async () => {
    const view = render(<Menu items={cascadeItems} submenuSide="right" />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    fireEvent.click(parent);
    const root = levelEl(view.container, 0)!;
    const panel = levelEl(view.container, 1) as HTMLElement;
    stubRect(root, { left: 400, right: 592 });
    stubRect(parent, { top: 200 });
    stubRect(panel, { width: 192, height: 100 });
    resizeWindow();
    expect(panel.style.left).toBe("592px");
    view.rerender(<Menu items={cascadeItems} submenuSide="left" />);
    expect(levelEl(view.container, 1)).toBe(panel);
    expect(panel.style.left).toBe("208px");
    expect(parent.querySelector(".st-menu__itemChevron--start")).toBeTruthy();
    // Let the replacement frame run; an obsolete right-side frame must not win.
    await advance(20);
    expect(panel.style.left).toBe("208px");
    stubRect(root, { left: 420, right: 612 });
    resizeWindow();
    expect(panel.style.left).toBe("228px");
    stubRect(root, { left: 440, right: 632 });
    fireEvent.scroll(window);
    expect(panel.style.left).toBe("248px");
    // Item replacement can also change panel dimensions without changing the path.
    stubRect(panel, { width: 250, height: 100 });
    view.rerender(<Menu items={[...cascadeItems]} submenuSide="left" />);
    expect(panel.style.left).toBe("190px");
  });

  it("cancels obsolete positioning frames when branches switch, close or unmount", () => {
    const view = render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class B" }));
    expect(vi.getTimerCount()).toBe(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class B" }));
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each((["popover-items", "popover-children", "overflow"] as const).flatMap((host) =>
    (["click", "Enter", " "] as const).flatMap((activation) =>
      (["root", "deep"] as const).map((leafLevel) => ({ host, activation, leafLevel })))
  ))("notifies one close for a $leafLevel leaf in $host with $activation", ({ host, activation, leafLevel }) => {
    const onOpenChange = vi.fn();
    render(<><button>External trigger</button><button>Other control</button></>);
    const externalTrigger = screen.getByRole("button", { name: "External trigger" });
    function Host() {
      const [open, setOpen] = React.useState(true);
      const changeOpen = (next: boolean) => { onOpenChange(next); setOpen(next); };
      return host === "overflow"
        ? <OverflowMenu open={open} onOpenChange={changeOpen} label="Actions" items={cascadeItems} />
        : <MenuPopover open={open} onOpenChange={changeOpen} trigger={externalTrigger}
            items={host === "popover-items" ? cascadeItems : []}>
            {host === "popover-children" ? <Menu items={cascadeItems} /> : null}
          </MenuPopover>;
    }
    render(<Host />);
    const trigger = host === "overflow" ? screen.getByRole("button", { name: "Actions" }) : externalTrigger;
    if (leafLevel === "deep") fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(onOpenChange).not.toHaveBeenCalled();
    const leaf = screen.getByRole("menuitem", { name: leafLevel === "deep" ? "Reason 1" : "Direct" });
    const other = screen.getByRole("button", { name: "Other control" });
    if (activation === "click") {
      other.focus();
      fireEvent.click(leaf);
    } else {
      leaf.focus();
      fireEvent.keyDown(leaf, { key: activation });
    }
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(activation === "click" ? other : trigger);
  });

  it.each(["ArrowDown", "Enter", " "])("focuses the first enabled flat OverflowMenu item when opened with %s", (key) => {
    render(<OverflowMenu label="Actions" items={[{ label: "Disabled", disabled: true }, { label: "Edit" }]} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }));
  });

  it.each([false, true])("names the actual standalone menu through aria-labelledby, cascade=%s", (cascade) => {
    render(<><span id="actions-heading">Named actions</span>
      <Menu aria-label="Fallback" aria-labelledby="actions-heading" items={cascade ? cascadeItems : [{ label: "Flat" }]} />
    </>);
    expect(screen.getByRole("menu", { name: "Named actions" })).toBe(levelEl(document.body, 0));
  });

  it.each(["popover-items", "popover-children", "overflow"] as const)("names the cascade root in %s", (host) => {
    render(<><span id="actions-heading">Named actions</span>
      {host === "overflow" ? <OverflowMenu open label="Named actions" items={cascadeItems} />
        : host === "popover-items" ? <MenuPopover open label="Named actions" items={cascadeItems} />
        : <MenuPopover open label="Host actions"><Menu aria-labelledby="actions-heading" items={cascadeItems} /></MenuPopover>}
    </>);
    const root = screen.getByRole("menu", { name: "Named actions" });
    expect(root).toBe(levelEl(document.body, 0));
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(screen.getByRole("menu", { name: "Class A" })).toBe(levelEl(document.body, 1));
  });

  it("preserves deeper panels and their focus when re-entering an already-open ancestor", async () => {
    render(<Menu items={[{ label: "Root", children: [{ label: "Middle", children: [{ label: "Leaf" }] }] }]} />);
    const root = screen.getByRole("menuitem", { name: "Root" });
    fireEvent.click(root);
    fireEvent.click(screen.getByRole("menuitem", { name: "Middle" }));
    const panel = levelEl(document.body, 2);
    const leaf = screen.getByRole("menuitem", { name: "Leaf" });
    leaf.focus();
    await advance(20);
    const wrapper = root.closest(".st-menu__itemWrap")!;
    fireEvent.pointerOut(wrapper, mouseProps());
    await advance(100);
    fireEvent.pointerOver(wrapper, mouseProps());
    await advance(300);
    expect(levelEl(document.body, 2)).toBe(panel);
    expect(document.activeElement).toBe(leaf);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("control review regressions", () => {
  it("positions a newly opened panel immediately under StrictMode", () => {
    render(<React.StrictMode><Menu items={cascadeItems} /></React.StrictMode>);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel.style.top).toBe("8px");
    expect(panel.style.left).toBe("8px");
  });

  it("AC-19: level 2 flips independently and its parent's arrow follows its chevron", () => {
    render(<Menu items={[{ label: "Root", children: [{ label: "Middle", children: [{ label: "Leaf" }] }] }]} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Root" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Middle" }));
    const root = levelEl(document.body, 0)!;
    const middlePanel = levelEl(document.body, 1)!;
    const leafPanel = levelEl(document.body, 2) as HTMLElement;
    const rootButton = levelItem(root, "Root");
    const middle = levelItem(middlePanel, "Middle");
    stubRect(root, { left: 400, right: 592 });
    stubRect(rootButton, { top: 100 });
    stubRect(middlePanel, { left: 592, right: 784, width: 192, height: 100 });
    stubRect(middle, { top: 110 });
    stubRect(leafPanel, { width: 300, height: 100 });
    resizeWindow();
    expect(rootButton.querySelector(".st-menu__itemChevron--end")).toBeTruthy();
    expect(middle.querySelector(".st-menu__itemChevron--start")).toBeTruthy();
    expect(leafPanel.style.left).toBe("292px");
    middle.focus();
    fireEvent.keyDown(middle, { key: "ArrowLeft" });
    expect(levelEl(document.body, 2)).toBe(leafPanel);
    const leaf = levelItem(leafPanel, "Leaf");
    expect(document.activeElement).toBe(leaf);
    fireEvent.keyDown(leaf, { key: "ArrowRight" });
    expect(levelEl(document.body, 2)).toBeNull();
    expect(document.activeElement).toBe(middle);
  });

  it.each((["standalone", "popover-items", "popover-children", "overflow"] as const).flatMap(
    (host) => (["click", "Enter", " "] as const).map((activation) => ({ host, activation }))
  ))(
    "invokes the leaf callback once before selection in $host with $activation", ({ host, activation }) => {
      const calls: string[] = [];
      const items: MenuItem[] = [{ label: "Parent", onClick: () => calls.push("parent"), children: [
        { label: "Leaf", onClick: () => calls.push("click") }
      ] }];
      const onSelect = () => calls.push("select");
      const view = render(host === "standalone" ? <Menu items={items} onSelect={onSelect} />
        : host === "popover-items" ? <MenuPopover defaultOpen items={items} onSelect={onSelect} />
        : host === "popover-children" ? <MenuPopover defaultOpen><Menu items={items} onSelect={onSelect} /></MenuPopover>
        : <OverflowMenu open items={items} onSelect={onSelect} />);
      fireEvent.click(screen.getByRole("menuitem", { name: "Parent" }));
      expect(calls).toEqual([]);
      const leaf = screen.getByRole("menuitem", { name: "Leaf" });
      if (activation === "click") fireEvent.click(leaf);
      else fireEvent.keyDown(leaf, { key: activation });
      expect(calls).toEqual(["click", "select"]);
      view.unmount();
    }
  );

  it("restores focus from a descendant when a pointer timer closes its ancestor", async () => {
    render(<Menu items={[{ label: "Root", children: [{ label: "Middle", children: [{ label: "Leaf" }] }] }]} />);
    const root = screen.getByRole("menuitem", { name: "Root" });
    fireEvent.click(root);
    fireEvent.click(screen.getByRole("menuitem", { name: "Middle" }));
    screen.getByRole("menuitem", { name: "Leaf" }).focus();
    fireEvent.pointerOut(root.closest(".st-menu__itemWrap")!, mouseProps());
    await advance(250);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(levelEl(document.body, 2)).toBeNull();
    expect(document.activeElement).toBe(root);
  });

  it.each([false, true])("AC-33: host owns the root ID with explicit child ID, cascade=%s", (cascade) => {
    const trigger = document.createElement("button");
    const view = render(<MenuPopover defaultOpen trigger={trigger}>
      <Menu id="custom" items={cascade ? cascadeItems : [{ label: "Flat" }]} />
    </MenuPopover>);
    const root = levelEl(document.body, 0)!;
    expect(trigger.getAttribute("aria-controls")).toBe(root.id);
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toBe(root);
    expect(root.id).not.toBe("custom");
    view.unmount();
    const standalone = render(<Menu id="custom" items={cascadeItems} />);
    expect(levelEl(standalone.container, 0)?.id).toBe("custom");
  });

  it.each(["items", "children"] as const)("AC-23: visible popover surface uses cascade shadow only for cascades (%s)", (mode) => {
    const style = document.createElement("style");
    // Exercise the shipped selectors against the actual host surface in jsdom.
    style.textContent = readFileSync(join(here, "styles.css"), "utf8");
    document.head.appendChild(style);
    try {
      const view = render(<MenuPopover open items={mode === "items" ? cascadeItems : []}>
        {mode === "children" ? <Menu items={cascadeItems} /> : null}
      </MenuPopover>);
      const surface = screen.getByRole("dialog");
      expect(getComputedStyle(surface).boxShadow).toBe("var(--st-component-popover-shadow, var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14)))");
      view.rerender(<MenuPopover open items={mode === "items" ? [{ label: "Flat" }] : []}>
        {mode === "children" ? <Menu items={[{ label: "Flat" }]} /> : null}
      </MenuPopover>);
      expect(getComputedStyle(surface).boxShadow).toBe("var(--st-component-menu-shadow, 0 8px 24px rgb(15 23 42 / 0.14))");
    } finally {
      style.remove();
    }
  });

  it("ships the React cascade minor release with consistent local version metadata", () => {
    const pkg = JSON.parse(readFileSync(join(here, "../package.json"), "utf8"));
    const lock = JSON.parse(readFileSync(join(here, "../../../package-lock.json"), "utf8"));
    const docs = JSON.parse(readFileSync(join(here, "../../../apps/docs/package.json"), "utf8"));
    expect(pkg.version).toBe("0.40.0");
    expect(lock.packages["packages/components-react"].version).toBe(pkg.version);
    expect(docs.dependencies[pkg.name]).toBe(pkg.version);
    expect(lock.packages["apps/docs"].dependencies[pkg.name]).toBe(pkg.version);
  });

  it("AC-38: items replacement cancels pending close while retaining the open branch", async () => {
    const view = render(<Menu items={cascadeItems} />);
    const root = screen.getByRole("menuitem", { name: "Class A" });
    fireEvent.click(root);
    // Drain the post-mount positioning frame before counting hover timers.
    await advance(20);
    fireEvent.pointerOut(root.closest(".st-menu__itemWrap")!, mouseProps());
    expect(vi.getTimerCount()).toBe(1);
    view.rerender(<Menu items={[...cascadeItems]} />);
    // Item geometry changes schedule a fresh positioning frame, not a hover close.
    await advance(20);
    expect(vi.getTimerCount()).toBe(0);
    await advance(300);
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(root.getAttribute("aria-expanded")).toBe("true");
  });

  it.each(["top-start", "top-end", "bottom-end"] as const)("AC-36: converts submenu geometry inside actual %s host", (placement) => {
    const trigger = document.createElement("button");
    stubRect(trigger, { top: 400, bottom: 430, left: 500, right: 600, width: 100 });
    const style = document.createElement("style");
    style.textContent = readFileSync(join(here, "styles.css"), "utf8");
    document.head.appendChild(style);
    try {
      render(<MenuPopover defaultOpen trigger={trigger} placement={placement} items={cascadeItems} />);
      const host = screen.getByRole("dialog");
      expect(host.classList.contains(`st-menuPopover--${placement}`)).toBe(true);
      expect(getComputedStyle(host).transform).not.toBe("none");
      expect(getComputedStyle(host).transform).not.toBe("");
      stubRect(host, { top: 200, left: 300 });
      fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
      const root = levelEl(document.body, 0)!;
      const panel = levelEl(document.body, 1) as HTMLElement;
      stubRect(root, { left: 300, right: 492 });
      stubRect(levelItem(root, "Class A"), { top: 220 });
      stubRect(panel, { width: 192, height: 100 });
      resizeWindow();
      expect(panel.style.top).toBe("15px");
      expect(panel.style.left).toBe("192px");
    } finally {
      style.remove();
    }
  });
});

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

function levelEl(container: HTMLElement | Document, level: number): Element | null {
  return container.querySelector(`[data-menu-level="${level}"]`);
}

function levelItem(level: Element | null, name: string): HTMLElement {
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

function resizeWindow() {
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

/**
 * React equivalent of the Svelte `MenuPopoverCascadeFixture`: an open
 * MenuPopover with an explicit child Menu, sharing the root menu id and
 * close entrypoint via the host context (children mode, §4 D-A1).
 */
function PopoverChildrenMode({
  open = true,
  trigger,
  items,
  submenuSide,
  onSelect
}: {
  open?: boolean;
  trigger: HTMLElement | null;
  items: MenuItem[];
  submenuSide?: MenuSubmenuSide;
  onSelect?: (item: import("./index.js").MenuActionItem, path?: string[]) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(open);
  return (
    <MenuPopover open={isOpen} onOpenChange={setIsOpen} trigger={trigger} label="Options">
      <Menu items={items} onSelect={onSelect} submenuSide={submenuSide} />
    </MenuPopover>
  );
}

let viewportBackup: { width: number; height: number };

beforeEach(() => {
  vi.useFakeTimers();
  viewportBackup = { width: window.innerWidth, height: window.innerHeight };
});

afterEach(() => {
  cleanup();
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
  it("keeps identical classes and a single-argument select for flat menus", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Menu
        items={[
          { label: "Edit", value: "edit" },
          { label: "Delete", value: "delete", danger: true }
        ]}
        onSelect={onSelect}
      />
    );
    const root = screen.getByRole("menu");
    expect(root.classList.contains("st-menu")).toBe(true);
    expect(root.classList.contains("st-menu--hasCascade")).toBe(false);
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]).toHaveLength(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "edit" }));
    expect(container.querySelector(".st-menu__item--danger")).toBeTruthy();
  });
});

describe("Menu cascade — parents (AC-02, AC-03, AC-10)", () => {
  it("AC-02: parent exposes popup semantics with a chevron on the preferred side", () => {
    render(<Menu items={cascadeItems} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    expect(parent.getAttribute("aria-haspopup")).toBe("menu");
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    const chevron = parent.querySelector(".st-menu__itemChevron--end");
    expect(chevron).toBeTruthy();
    expect(chevron?.querySelector("svg")).toBeTruthy();
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-02: disabled parent keeps chevron and popup but never expands", async () => {
    render(
      <Menu
        items={[
          {
            label: "Locked",
            value: "locked",
            disabled: true,
            children: [{ label: "Sub", value: "sub" }]
          }
        ]}
      />
    );
    const parent = screen.getByRole("menuitem", { name: "Locked" });
    expect(parent.getAttribute("aria-haspopup")).toBe("menu");
    expect(parent.getAttribute("aria-expanded")).toBe("false");
    expect(parent.querySelector(".st-menu__itemChevron")).toBeTruthy();
    fireEvent.click(parent);
    fireEvent.keyDown(parent, { key: "Enter" });
    await advance(500);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(parent.getAttribute("aria-expanded")).toBe("false");
  });

  it("AC-03: empty children render a leaf that emits the class key", () => {
    const onSelect = vi.fn();
    render(<Menu items={[{ label: "Class", value: "class", children: [] }]} onSelect={onSelect} />);
    const leaf = screen.getByRole("menuitem", { name: "Class" });
    expect(leaf.querySelector(".st-menu__itemChevron")).toBeNull();
    fireEvent.click(leaf);
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Empty `children` is a leaf; with no cascade anywhere the call keeps
    // the standalone flat single-argument shape (AC-01/AC-03).
    expect(onSelect.mock.calls[0]).toHaveLength(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "class" }));
  });

  it("AC-10: selected alone renders the class without opening anything", () => {
    render(
      <Menu
        items={[
          { label: "Picked", value: "picked", selected: true },
          { label: "Other", value: "other" }
        ]}
      />
    );
    const picked = screen.getByRole("menuitem", { name: "Picked" });
    expect(picked.classList.contains("st-menu__item--selected")).toBe(true);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(picked.getAttribute("aria-expanded")).toBeNull();
  });
});

describe("Menu cascade — opening (AC-04, AC-05, AC-06)", () => {
  it("AC-04: click opens, selects the line, emits nothing, keeps focus", () => {
    const onSelect = vi.fn();
    render(<Menu items={cascadeItems} onSelect={onSelect} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" }) as HTMLButtonElement;
    parent.focus();
    fireEvent.click(parent);
    const reopened = screen.getByRole("menuitem", { name: "Class A" });
    expect(reopened.getAttribute("aria-expanded")).toBe("true");
    expect(reopened.classList.contains("st-menu__item--selected")).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(reopened);
  });

  it("AC-05: Enter opens and focuses the first enabled sub item", () => {
    render(<Menu items={cascadeItems} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    fireEvent.keyDown(parent, { key: "Enter" });
    const panel = levelEl(document.body, 1);
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(panel, "Reason 1"));
  });

  it("AC-05: Space opens like Enter", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class B" }), { key: " " });
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Why"));
  });

  it("AC-06: opening arrow opens, opposite arrow closes and refocuses", () => {
    render(<Menu items={cascadeItems} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    fireEvent.keyDown(parent, { key: "ArrowRight" });
    const panel = levelEl(document.body, 1);
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(panel, "Reason 1"));
    fireEvent.keyDown(levelItem(panel, "Reason 1"), { key: "ArrowLeft" });
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
  });
});

describe("Menu cascade — hover intent and safe triangle (AC-07, AC-08, AC-25, AC-38)", () => {
  it("AC-07: hover opens at 150 ms, not at 149 ms, without moving focus", async () => {
    render(<Menu items={cascadeItems} />);
    // Hover handlers attach to the item wrapper, not the button (§3.1).
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    const before = document.activeElement;
    fireEvent.pointerOver(wrap, mouseProps());
    await advance(149);
    expect(levelEl(document.body, 1)).toBeNull();
    await advance(1);
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(before);
  });

  it("AC-38: non-mouse pointers never arm hover", async () => {
    render(<Menu items={cascadeItems} />);
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    fireEvent.pointerOver(wrap, { pointerType: "touch", clientX: 0, clientY: 0 });
    await advance(500);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-08: diagonal in the triangle survives, panel entry cancels, exit closes", async () => {
    const { container } = render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
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
    fireEvent.pointerOut(wrap, mouseProps(100, 100));
    // Drift inside the triangle: nothing closes past the grace delay.
    fireEvent.pointerMove(container.querySelector(".st-menu") as HTMLElement, mouseProps(150, 100));
    await advance(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Entering the panel cancels everything.
    fireEvent.pointerOver(panel as HTMLElement, mouseProps(250, 100));
    await advance(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Leaving both the wrapper and the panel closes after 250 ms.
    fireEvent.pointerOut(panel as HTMLElement, mouseProps(500, 500));
    await advance(249);
    expect(levelEl(document.body, 1)).toBeTruthy();
    await advance(1);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-08: re-entry before expiry cancels the close", async () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
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
    fireEvent.pointerOut(wrap, mouseProps(10, 10));
    await advance(100);
    fireEvent.pointerOver(panel, mouseProps(250, 100));
    await advance(400);
    expect(levelEl(document.body, 1)).toBeTruthy();
  });

  it("AC-25: crossing a sibling leaf inside the triangle neither opens nor closes", async () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
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
    fireEvent.pointerOut(wrapA, mouseProps(100, 100));
    // Drift inside the triangle first (cancels the armed close, refreshes apex).
    fireEvent.pointerMove(
      document.body.querySelector(".st-menu") as HTMLElement,
      mouseProps(150, 100)
    );
    const direct = levelItem(levelEl(document.body, 0), "Direct");
    // The crossed leaf sits inside the A → panel triangle.
    fireEvent.pointerOver(direct, mouseProps(155, 105));
    await advance(400);
    // No sibling opened and A is still open.
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(
      (screen.getByRole("menuitem", { name: "Class B" }) as HTMLElement).getAttribute(
        "aria-expanded"
      )
    ).toBe("false");
  });

  it("AC-38: unmount cancels the pending hover timer", async () => {
    const { unmount } = render(<Menu items={cascadeItems} />);
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    fireEvent.pointerOver(wrap, mouseProps());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    await advance(500);
    expect(levelEl(document.body, 1)).toBeNull();
  });
});

describe("Menu cascade — switching, leaves, disabled (AC-09, AC-11, AC-12)", () => {
  it("AC-09: sibling switch closes the first panel and keeps explicit selection", () => {
    render(
      <Menu
        items={[
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
        ]}
      />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelItem(levelEl(document.body, 1), "Reason 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Class B" }));
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

  it("AC-11: deep leaf emits once with the full path and closes all", () => {
    const onSelect = vi.fn();
    render(<Menu items={cascadeItems} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "reason-1" }),
      ["class-a", "reason-1"]
    );
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-11: root leaf in a cascade menu emits a length-1 path", () => {
    const onSelect = vi.fn();
    render(<Menu items={cascadeItems} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Direct" }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "direct" }),
      ["direct"]
    );
  });

  it("AC-12: disabled parent never opens and disabled items are skipped", () => {
    render(<Menu items={cascadeItems} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    parent.focus();
    fireEvent.keyDown(parent, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Direct" }));
    // The disabled "Reason 2" is skipped in-panel.
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    const first = levelItem(panel, "Reason 1");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    // Wraps back to Reason 1, skipping disabled Reason 2.
    expect(document.activeElement).toBe(first);
  });
});

describe("Menu cascade — level-local keyboard and roving (AC-13, AC-31, AC-32)", () => {
  it("AC-13: arrows and Home/End wrap inside the current level only", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    const reason = levelItem(panel, "Reason 1");
    reason.focus();
    fireEvent.keyDown(reason, { key: "End" });
    // Single enabled item: stays (disabled Reason 2 is skipped).
    expect(document.activeElement).toBe(reason);
    fireEvent.keyDown(reason, { key: "Home" });
    expect(document.activeElement).toBe(reason);
    // Root level is untouched: exactly one roving target per open level.
    for (const level of [0, 1]) {
      const root = levelEl(document.body, level) as HTMLElement;
      expect(root.querySelectorAll('[role="menuitem"][tabindex="0"]').length).toBe(1);
    }
  });

  it("AC-31: all-disabled level opens with no focus target and no roving zero", () => {
    render(
      <Menu
        items={[
          {
            label: "Class",
            value: "class",
            children: [{ label: "Off", value: "off", disabled: true }]
          }
        ]}
      />
    );
    const parent = screen.getByRole("menuitem", { name: "Class" }) as HTMLButtonElement;
    parent.focus();
    fireEvent.click(parent);
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class" }));
    expect(panel.querySelectorAll('[role="menuitem"][tabindex="0"]').length).toBe(0);
    // Enter opens but focus stays on the parent line (no target).
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class" }), { key: "Enter" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class" }));
  });

  it("AC-32: Tab closes every level without trapping focus", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const sub = levelItem(levelEl(document.body, 1), "Reason 1");
    const notPrevented = fireEvent.keyDown(sub, { key: "Tab" });
    expect(levelEl(document.body, 1)).toBeNull();
    // The standalone menu itself has no root open state in this port, so it
    // stays; focus is not trapped because the event is never prevented.
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(notPrevented).toBe(true);
  });
});

describe("Menu cascade — Escape per level (AC-14)", () => {
  it("closes the sub-menu first and refocuses the parent line", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const sub = levelItem(levelEl(document.body, 1), "Reason 1");
    const notPrevented = fireEvent.keyDown(sub, { key: "Escape" });
    // Per-level Esc calls preventDefault + stopPropagation (D4).
    expect(notPrevented).toBe(false);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
  });

  it("keeps the standalone root open on Esc at the root line (no dismissOnSelect in this port)", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), { key: "Escape" });
    expect(screen.getByRole("menu")).toBeTruthy();
  });
});

describe("Menu cascade — toggle, duplicates, depth (AC-28, AC-29, AC-30, AC-18)", () => {
  it("AC-29: second click closes the level, keeps focus, emits nothing", () => {
    const onSelect = vi.fn();
    render(<Menu items={cascadeItems} onSelect={onSelect} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" }) as HTMLButtonElement;
    parent.focus();
    fireEvent.click(parent);
    expect(levelEl(document.body, 1)).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class A" }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("AC-30: opening arrow on an open parent focuses first without closing", async () => {
    render(<Menu items={cascadeItems} />);
    const parent = screen.getByRole("menuitem", { name: "Class A" });
    const wrap = parent.closest(".st-menu__itemWrap") as HTMLElement;
    fireEvent.pointerOver(wrap, mouseProps());
    await advance(150);
    expect(levelEl(document.body, 1)).toBeTruthy();
    parent.focus();
    fireEvent.keyDown(parent, { key: "ArrowRight" });
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Reason 1"));
  });

  it("AC-28: duplicate sibling keys follow the index path with one warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Menu
        items={[
          { label: "Same one", value: "same", children: [{ label: "One", value: "one" }] },
          { label: "Same two", value: "same", children: [{ label: "Two", value: "two" }] }
        ]}
      />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Same one" }));
    expect(levelItem(levelEl(document.body, 1), "One")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Same two" }));
    // Siblings never open together: the second panel replaced the first.
    expect(levelItem(levelEl(document.body, 1), "Two")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("AC-18: second level opens; deeper children render as leaves with a per-key warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSelect = vi.fn();
    render(
      <Menu
        items={[
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
        ]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    fireEvent.click(levelItem(levelEl(document.body, 1), "Mid"));
    const level2 = levelEl(document.body, 2) as HTMLElement;
    expect(level2).toBeTruthy();
    // A depth-2 item bearing children renders as a leaf: no chevron.
    const tooDeep = within(level2).getByRole("menuitem", { name: "Too deep" });
    expect(tooDeep.querySelector(".st-menu__itemChevron")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    // Closing and reopening does not warn again for the same key.
    fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    expect(levelEl(document.body, 1)).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    fireEvent.click(levelItem(levelEl(document.body, 1), "Mid"));
    expect(warn).toHaveBeenCalledTimes(1);
    // A depth-2 leaf emits a length-3 path.
    fireEvent.click(
      within(levelEl(document.body, 2) as HTMLElement).getByRole("menuitem", { name: "Deep" })
    );
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "deep" }),
      ["class", "mid", "deep"]
    );
  });
});

describe("Menu cascade — sides, groups, items change (AC-19, AC-20, AC-21, AC-22)", () => {
  async function openWithGeometry(
    props: { submenuSide?: MenuSubmenuSide },
    menuRect: Partial<DOMRect>,
    itemTop: number
  ) {
    const rendered = render(<Menu items={cascadeItems} {...props} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const root = levelEl(document.body, 0) as Element;
    const button = within(root as HTMLElement).getByRole("menuitem", {
      name: "Class A"
    });
    const panel = levelEl(document.body, 1) as Element;
    stubRect(root, { ...menuRect });
    stubRect(button, { top: itemTop, left: menuRect.left ?? 0 });
    stubRect(panel, { width: 192, height: 100 });
    resizeWindow();
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
    fireEvent.keyDown(parent, { key: "ArrowLeft" });
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

  it("AC-21: groups and dividers render in children; grouped leaf path skips the group", () => {
    const onSelect = vi.fn();
    render(
      <Menu
        items={[
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
        ]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(within(panel).getByText("Class — reason")).toBeTruthy();
    expect(panel.querySelector('[role="separator"]')).toBeTruthy();
    fireEvent.click(within(panel).getByRole("menuitem", { name: "R2" }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "r2" }),
      ["class", "r2"]
    );
  });

  it("AC-22: removing the open index path removes orphan panels", () => {
    const { rerender } = render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelEl(document.body, 1)).toBeTruthy();
    rerender(<Menu items={[{ label: "Direct", value: "direct" }]} />);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("AC-22/38: items change cancels a pending hover open", async () => {
    const { rerender } = render(<Menu items={cascadeItems} />);
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    fireEvent.pointerOver(wrap, mouseProps());
    await advance(100);
    expect(vi.getTimerCount()).toBe(1);
    // Keep the branch valid: a stale callback would visibly reopen it.
    rerender(<Menu items={[...cascadeItems]} />);
    expect(vi.getTimerCount()).toBe(0);
    await advance(200);
    expect(levelEl(document.body, 1)).toBeNull();
  });
});

describe("Menu cascade — shadow, cap, containing block (AC-23, AC-27, AC-36)", () => {
  it("AC-23: cascade marker class and popover shadow chain; flat keeps menu shadow", () => {
    const flat = render(
      <Menu items={[{ label: "Edit", value: "edit" }]} />
    );
    const flatRoot = flat.container.querySelector(".st-menu") as HTMLElement;
    expect(flatRoot.classList.contains("st-menu--hasCascade")).toBe(false);
    flat.unmount();
    render(<Menu items={cascadeItems} />);
    const root = document.body.querySelector(".st-menu--hasCascade") as HTMLElement;
    expect(root).toBeTruthy();
    const source = readFileSync(join(here, "styles.css"), "utf8");
    expect(source).toContain("--st-component-popover-shadow");
    expect(source).toContain("--st-component-selectableRow-selectedBackground");
    expect(source).toContain("--st-component-selectableRow-selectedText");
    const submenuRule = source.match(/\.st-menu--submenu \{[^}]*\}/s)?.[0] ?? "";
    expect(submenuRule).toContain("--st-component-popover-shadow");
  });

  it("AC-27: narrow viewport caps the panel width with min-width 0", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 160
    });
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const style = (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("left: 8px");
    expect(style).toContain("min-width: 0");
  });

  it("AC-36: converted position under a transformed host ancestor", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
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
    resizeWindow();
    // Solver output (top 8, left 8 after the viewport clamp) converted
    // into the containing-block frame.
    const style = (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -52px");
  });
});

describe("Menu cascade — outside (AC-15)", () => {
  it("host panels and trigger are never outside (composedPath)", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(<MenuPopover defaultOpen trigger={trigger} label="Options" items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel).toBeTruthy();
    // Pointer down ON the trigger and ON a sub-panel keeps everything open.
    fireEvent.pointerDown(trigger);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.pointerDown(panel);
    expect(screen.getByRole("dialog")).toBeTruthy();
    // A target outside the host whose composed path still includes a panel
    // counts as inside (shadow-safe close): a real path always carries the
    // ancestors, so the stub includes the popover panel too.
    const dialog = screen.getByRole("dialog");
    const event = new PointerEvent("pointerdown", { bubbles: true });
    Object.defineProperty(event, "composedPath", { value: () => [document.body, panel, dialog] });
    document.body.dispatchEvent(event);
    expect(screen.getByRole("dialog")).toBeTruthy();
    // A truly outside pointer down closes everything.
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
    trigger.remove();
  });

  it("OverflowMenu closes on outside pointer down", () => {
    render(<OverflowMenu label="Row actions" items={cascadeItems} />);
    fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelEl(document.body, 1)).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("Menu cascade — hosts (AC-14, AC-33, AC-34, AC-35)", () => {
  it("AC-14: OverflowMenu Esc closes the sub-menu, then everything with trigger focus", () => {
    render(<OverflowMenu label="Row actions" items={cascadeItems} />);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelEl(document.body, 1)).toBeTruthy();
    fireEvent.keyDown(levelItem(levelEl(document.body, 1), "Reason 1"), {
      key: "Escape"
    });
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), {
      key: "Escape"
    });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("AC-33: OverflowMenu trigger aria-controls resolves to the root menu", () => {
    render(<OverflowMenu label="Row actions" items={cascadeItems} />);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    expect(trigger.getAttribute("aria-controls")).toBeNull();
    fireEvent.click(trigger);
    const controls = trigger.getAttribute("aria-controls") as string;
    expect(controls).toBeTruthy();
    const root = document.getElementById(controls);
    expect(root?.getAttribute("role")).toBe("menu");
  });

  it("AC-33: MenuPopover sets aria-controls on an external trigger while open", () => {
    const external = document.createElement("button");
    external.textContent = "Open";
    document.body.appendChild(external);
    const rendered = render(
      <MenuPopover defaultOpen trigger={external} label="Options" items={cascadeItems} />
    );
    const controls = external.getAttribute("aria-controls") as string;
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls)?.getAttribute("role")).toBe("menu");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(rendered.container.querySelector('[role="dialog"]')).toBeNull();
    expect(external.getAttribute("aria-controls")).toBeNull();
    expect(document.activeElement).toBe(external);
    external.remove();
  });

  it("AC-34: MenuPopover + Menu — first Esc closes the sub-menu only", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(<PopoverChildrenMode open={true} trigger={trigger} items={cascadeItems} />);
    trigger.focus();
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(levelEl(document.body, 1)).toBeTruthy();
    const stopped = fireEvent.keyDown(levelItem(levelEl(document.body, 1), "Reason 1"), {
      key: "Escape"
    });
    // The level consumed the key: the host never closed.
    expect(stopped).toBe(false);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Class A" }), {
      key: "Escape"
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("AC-35: deep leaf via OverflowMenu relays item and path; parent emits nothing", () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    render(
      <OverflowMenu
        label="Row actions"
        items={[
          {
            label: "Class A",
            value: "class-a",
            onClick: itemClick,
            children: [{ label: "Reason 1", value: "reason-1" }]
          }
        ]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    // Parent activation opens the sub-menu without emitting or closing.
    expect(onSelect).not.toHaveBeenCalled();
    expect(itemClick).not.toHaveBeenCalled();
    expect(levelEl(document.body, 1)).toBeTruthy();
    fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    expect(itemClick).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "reason-1" }),
      ["class-a", "reason-1"]
    );
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("AC-35: deep leaf via MenuPopover items mode relays item and path", () => {
    const onSelect = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(
      <MenuPopover defaultOpen trigger={trigger} label="Options" items={cascadeItems} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(levelItem(levelEl(document.body, 1), "Reason 1"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "reason-1" }),
      ["class-a", "reason-1"]
    );
    // Pointer leaf closes the host without moving focus.
    expect(screen.queryByRole("dialog")).toBeNull();
    trigger.remove();
  });

  it("D-A1: MenuPopover items-mode inner menu is role=menu with children, presentation when flat", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    const { unmount } = render(
      <MenuPopover defaultOpen trigger={trigger} label="Options" items={cascadeItems} />
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("menu")).toBeTruthy();
    unmount();
    render(
      <MenuPopover
        defaultOpen
        trigger={trigger}
        label="Options"
        items={[{ label: "Edit", value: "edit" }]}
      />
    );
    const flatDialog = screen.getByRole("dialog");
    expect(within(flatDialog).getByRole("presentation")).toBeTruthy();
    expect(within(flatDialog).queryByRole("menu")).toBeNull();
    trigger.remove();
  });
});

describe("Menu cascade — OverflowMenu flat regression (AC-37)", () => {
  // The flat OverflowMenu renders the inner `Menu`; this guard pins the
  // flat contract: host/trigger DOM and classes, inner class set, roles,
  // danger/selected behaviour, single-argument select, close and keyboard.
  it("keeps the flat class set, roles and select contract", () => {
    const onSelect = vi.fn();
    const itemClick = vi.fn();
    const { container } = render(
      <OverflowMenu
        label="Row actions"
        items={[
          { value: "edit", label: "Edit", icon: <span data-testid="edit-icon">E</span>, onClick: itemClick },
          { value: "delete", label: "Delete", danger: true },
          { kind: "divider" },
          { kind: "group", label: "More" },
          { value: "archive", label: "Archive", disabled: true }
        ]}
        onSelect={onSelect}
      />
    );
    const host = container.querySelector(".st-overflowMenu") as HTMLElement;
    expect(host).toBeTruthy();
    const trigger = screen.getByRole("button", { name: "Row actions" });
    expect(trigger.classList.contains("st-overflowMenu__trigger")).toBe(true);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.querySelector("svg")).toBeTruthy();
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = screen.getByRole("menu");
    expect(menu.classList.contains("st-menu")).toBe(true);
    const list = container.querySelector(".st-overflowMenu__list");
    expect(list).toBeTruthy();
    expect(list?.classList.contains("st-overflowMenu__list--bottom-start")).toBe(true);

    const editItem = screen.getByRole("menuitem", { name: "Edit" });
    expect(editItem.classList.contains("st-menu__item")).toBe(true);
    expect(
      screen.getByRole("menuitem", { name: "Delete" }).classList.contains("st-menu__item--danger")
    ).toBe(true);
    expect(screen.getByRole("menuitem", { name: "Archive" }).getAttribute("aria-disabled")).toBe("true");
    expect(editItem.querySelector(".st-menu__itemIcon")).toBeTruthy();
    expect(
      Array.from(container.querySelectorAll(".st-menu__itemLabel")).map((el) => el.textContent)
    ).toEqual(["Edit", "Delete", "Archive"]);
    expect(container.querySelector(".st-menu__divider")).toBeTruthy();
    expect(container.querySelector(".st-menu__group")?.textContent).toBe("More");

    fireEvent.click(editItem);
    expect(itemClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]).toHaveLength(1);
    expect(onSelect.mock.calls[0][0]).toEqual(expect.objectContaining({ value: "edit" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps flat keyboard navigation with disabled items skipped", () => {
    render(
      <OverflowMenu
        label="Row actions"
        items={[
          { value: "edit", label: "Edit" },
          { value: "archive", label: "Archive", disabled: true },
          { value: "delete", label: "Delete" }
        ]}
      />
    );
    const trigger = screen.getByRole("button", { name: "Row actions" });
    trigger.focus();
    fireEvent.click(trigger);
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const deleteItem = screen.getByRole("menuitem", { name: "Delete" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(deleteItem);
    fireEvent.keyDown(deleteItem, { key: "ArrowUp" });
    expect(document.activeElement).toBe(edit);
  });
});

describe("Menu cascade — review fixes (B2, M1–M6)", () => {
  async function openFlippedLeft() {
    render(<Menu items={cascadeItems} submenuSide="auto" />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const root = levelEl(document.body, 0) as Element;
    const button = within(root as HTMLElement).getByRole("menuitem", {
      name: "Class A"
    });
    const panel = levelEl(document.body, 1) as Element;
    stubRect(root, { left: 700, right: 892 });
    stubRect(button, { top: 200, left: 700 });
    stubRect(panel, { width: 192, height: 100 });
    resizeWindow();
  }

  it("B2: flipped-panel leaf treats the resolved side as opening", async () => {
    await openFlippedLeft();
    const panel = levelEl(document.body, 1) as HTMLElement;
    expect(panel.style.left).toBe("508px");
    const leaf = levelItem(panel, "Reason 1");
    leaf.focus();
    // Resolved opening arrow (ArrowLeft) is a no-op on a leaf.
    fireEvent.keyDown(leaf, { key: "ArrowLeft" });
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Opposite arrow (ArrowRight) closes and refocuses the parent line.
    fireEvent.keyDown(leaf, { key: "ArrowRight" });
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Class A" })
    );
  });

  it("M1: pointer close moves focus from the closed panel to its parent line", async () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const panel = levelEl(document.body, 1) as HTMLElement;
    levelItem(panel, "Reason 1").focus();
    fireEvent.pointerOut(panel, mouseProps(500, 500));
    await advance(249);
    expect(levelEl(document.body, 1)).toBeTruthy();
    await advance(1);
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Class A" })
    );
  });

  it("M2a: leaving the parent before the hover delay cancels the pending open", async () => {
    render(<Menu items={cascadeItems} />);
    const wrap = screen
      .getByRole("menuitem", { name: "Class A" })
      .closest(".st-menu__itemWrap") as HTMLElement;
    fireEvent.pointerOver(wrap, mouseProps());
    await advance(100);
    fireEvent.pointerOut(wrap, mouseProps());
    await advance(200);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("M2b: leaving the triangle away from the panel re-arms the close", async () => {
    const { container } = render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
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
    fireEvent.pointerOut(wrap, mouseProps(100, 100));
    const host = container.querySelector(".st-menu") as HTMLElement;
    // Drift inside the triangle first: the armed close is cancelled.
    fireEvent.pointerMove(host, mouseProps(150, 100));
    await advance(100);
    expect(levelEl(document.body, 1)).toBeTruthy();
    // Drift outside the triangle over root chrome: the close re-arms once.
    fireEvent.pointerMove(host, mouseProps(500, 500));
    await advance(249);
    expect(levelEl(document.body, 1)).toBeTruthy();
    await advance(1);
    expect(levelEl(document.body, 1)).toBeNull();
  });

  it("M3: narrow-viewport cap survives a second recompute", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 160
    });
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const first =
      (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(first).toContain("left: 8px");
    expect(first).toContain("min-width: 0");
    // The capped panel now measures its capped width: a scroll/resize
    // recompute must keep the cap instead of dropping it.
    stubRect(levelEl(document.body, 1) as Element, { width: 144, height: 100 });
    resizeWindow();
    const second =
      (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(second).toContain("min-width: 0");
  });

  const threeLevel: MenuItem[] = [
    {
      label: "Class",
      value: "class",
      children: [
        {
          label: "Mid",
          value: "mid",
          children: [{ label: "Deep", value: "deep" }]
        },
        { label: "Other", value: "other" }
      ]
    }
  ];

  async function openTwoLevels() {
    render(<Menu items={threeLevel} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class" }));
    fireEvent.click(levelItem(levelEl(document.body, 1), "Mid"));
    expect(levelEl(document.body, 2)).toBeTruthy();
  }

  it("M4: Esc from a middle level closes only the deepest level per press", async () => {
    await openTwoLevels();
    // Focus sits in level 1 while level 2 is open: one Esc closes level 2 only.
    const mid = levelItem(levelEl(document.body, 1), "Mid");
    mid.focus();
    fireEvent.keyDown(mid, { key: "Escape" });
    expect(levelEl(document.body, 2)).toBeNull();
    expect(levelEl(document.body, 1)).toBeTruthy();
    expect(document.activeElement).toBe(levelItem(levelEl(document.body, 1), "Mid"));
    // A second Esc closes level 1 and refocuses the root parent.
    fireEvent.keyDown(levelItem(levelEl(document.body, 1), "Mid"), { key: "Escape" });
    expect(levelEl(document.body, 1)).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Class" }));
  });

  it("M4: opposite arrow from a middle level closes only the deepest level", async () => {
    await openTwoLevels();
    // Zero-rect geometry resolves right, so ArrowLeft is the opposite arrow.
    const mid = levelItem(levelEl(document.body, 1), "Mid");
    mid.focus();
    fireEvent.keyDown(mid, { key: "ArrowLeft" });
    expect(levelEl(document.body, 2)).toBeNull();
    expect(levelEl(document.body, 1)).toBeTruthy();
  });

  it("M5: flat OverflowMenu Esc closes without returning focus to the trigger", () => {
    render(
      <OverflowMenu label="Row actions" items={[{ label: "Edit", value: "edit" }]} />
    );
    const trigger = screen.getByRole("button", { name: "Row actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const item = screen.getByRole("menuitem", { name: "Edit" });
    expect(document.activeElement).toBe(item);
    fireEvent.keyDown(item, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
  });

  it("M5: flat MenuPopover Esc closes without returning focus to the trigger", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    render(
      <MenuPopover defaultOpen trigger={trigger} label="Options" items={[{ label: "Edit", value: "edit" }]} />
    );
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Edit" }), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
    trigger.remove();
  });

  it("M5: MenuPopover forgets cascade once items lose their children", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    const { rerender } = render(
      <MenuPopover defaultOpen trigger={trigger} label="Options" items={cascadeItems} />
    );
    rerender(
      <MenuPopover defaultOpen trigger={trigger} label="Options" items={[{ label: "Edit", value: "edit" }]} />
    );
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Edit" }), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
    trigger.remove();
  });

  it("M6: flat OverflowMenu renders the selected row state", () => {
    render(
      <OverflowMenu
        label="Row actions"
        items={[
          { label: "Edit", value: "edit", selected: true },
          { label: "Delete", value: "delete" }
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    expect(
      screen
        .getByRole("menuitem", { name: "Edit" })
        .classList.contains("st-menu__item--selected")
    ).toBe(true);
    expect(
      screen
        .getByRole("menuitem", { name: "Delete" })
        .classList.contains("st-menu__item--selected")
    ).toBe(false);
  });

  it("M6: flat duplicate values relay the clicked row's onClick", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const onSelect = vi.fn();
    const firstClick = vi.fn();
    const secondClick = vi.fn();
    render(
      <OverflowMenu
        label="Row actions"
        items={[
          { label: "Same A", value: "dup", onClick: firstClick },
          { label: "Same B", value: "dup", onClick: secondClick }
        ]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Same B" }));
    expect(secondClick).toHaveBeenCalledTimes(1);
    expect(firstClick).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]).toHaveLength(1);
    expect(onSelect.mock.calls[0][0]).toEqual(expect.objectContaining({ value: "dup" }));
  });

  it("AC-32: Shift+Tab with cascade open closes everything without trapping focus", async () => {
    render(<OverflowMenu label="Row actions" items={cascadeItems} />);
    fireEvent.click(screen.getByRole("button", { name: "Row actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const sub = levelItem(levelEl(document.body, 1), "Reason 1");
    const notPrevented = fireEvent.keyDown(sub, { key: "Tab", shiftKey: true });
    expect(levelEl(document.body, 1)).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
    // Not prevented, so the browser moves focus out of the menu: no menu
    // remains in the document for focus to be trapped in.
    expect(notPrevented).toBe(true);
  });

  it("post-mount recompute positions panels without a synthetic resize", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const style =
      (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    // §3.4 step 6: one recompute after mount once the real size is known.
    expect(style).toContain("top:");
    expect(style).toContain("left:");
  });

  it("AC-36: nearest transformed ancestor wins the containing-block walk", () => {
    render(<Menu items={cascadeItems} />);
    fireEvent.click(screen.getByRole("menuitem", { name: "Class A" }));
    const host = document.body.querySelector(".st-menu--hasCascade") as Element;
    stubRect(host, {
      top: 40,
      left: 60,
      right: 260,
      bottom: 200,
      width: 200,
      height: 160
    });
    const plain = {
      transform: "none",
      filter: "none",
      perspective: "none",
      contain: "none",
      willChange: "auto"
    };
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (el: Element) =>
        (el === host
          ? { ...plain, transform: "translateX(-10%)" }
          : { ...plain }) as unknown as CSSStyleDeclaration
    );
    resizeWindow();
    // Only the host carries a transform: the walk must stop there, even
    // though every other ancestor reports `none`. Solver output on zero
    // rects is top 8 / left 8 (left 0 clamped to the viewport margin).
    const style =
      (levelEl(document.body, 1) as HTMLElement).getAttribute("style") ?? "";
    expect(style).toContain("top: -32px");
    expect(style).toContain("left: -52px");
  });

  it("AC-33: MenuTriggerButton passes aria-controls through button attributes", () => {
    render(<MenuTriggerButton open aria-label="More" aria-controls="st-menu-1" />);
    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger.getAttribute("aria-controls")).toBe("st-menu-1");
  });
});
