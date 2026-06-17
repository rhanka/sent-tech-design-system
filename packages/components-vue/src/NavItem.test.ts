import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { NavItem } from "./NavItem.js";

// In @vue/test-utils `wrapper.element` IS the rendered root node, so the
// `.st-navItem` wrapper is the element itself (not a descendant).
const root = (el: HTMLElement) =>
  el.classList.contains("st-navItem") ? el : el.querySelector<HTMLElement>(".st-navItem");
const row = (el: HTMLElement) => el.querySelector<HTMLElement>(".st-selectableRow");

describe("NavItem", () => {
  it("renders the title inside the row (composed over SelectableRow)", () => {
    const wrapper = mount(NavItem, { props: { title: "Entities" } });
    const el = wrapper.element as HTMLElement;
    expect(root(el)).toBeTruthy();
    // It reuses SelectableRow as its row anatomy.
    expect(row(el)).toBeTruthy();
    expect(el.querySelector(".st-navItem__title")?.textContent).toBe("Entities");
  });

  it("byte-identity: WITHOUT a caption the row stays single-line (no caption node)", () => {
    const wrapper = mount(NavItem, { props: { title: "Entities" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-navItem__caption")).toBeNull();
    expect(row(el)?.className).not.toContain("st-selectableRow--hasCaption");
  });

  it("renders the caption as a muted second line and stacks the row", () => {
    const wrapper = mount(NavItem, {
      props: { title: "Entities", caption: "243 records" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-navItem__caption")?.textContent).toBe("243 records");
    expect(row(el)?.className).toContain("st-selectableRow--hasCaption");
    expect(el.querySelector(".st-selectableRow__content--stacked")).toBeTruthy();
  });

  it("renders an arbitrary-color swatch via ColorSwatch (backgroundColor on chip)", () => {
    const wrapper = mount(NavItem, {
      props: { title: "Brand", swatch: { color: "#16a34a" } },
    });
    const chip = (wrapper.element as HTMLElement).querySelector<HTMLElement>(
      ".st-colorSwatch__chip",
    );
    expect(chip).toBeTruthy();
    expect(chip?.style.backgroundColor).toContain("rgb(22, 163, 74)");
  });

  it("renders a toned swatch via StatusDot when no color is given", () => {
    const wrapper = mount(NavItem, {
      props: { title: "Online", swatch: { tone: "success" } },
    });
    const el = wrapper.element as HTMLElement;
    const dot = el.querySelector<HTMLElement>(".st-statusDot__dot");
    expect(dot).toBeTruthy();
    expect(dot?.classList.contains("st-statusDot__dot--success")).toBe(true);
    // No ColorSwatch when there is no arbitrary color.
    expect(el.querySelector(".st-colorSwatch__chip")).toBeNull();
  });

  it("renders a count as a circle Badge with an explicit aria-label", () => {
    const wrapper = mount(NavItem, { props: { title: "Alerts", count: 12 } });
    const badge = (wrapper.element as HTMLElement).querySelector<HTMLElement>(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains("st-badge--circle")).toBe(true);
    expect(badge?.classList.contains("st-badge--sm")).toBe(true);
    expect(badge?.textContent?.trim()).toBe("12");
    // Count is ambiguous to SR → aria-label "N title".
    expect(badge?.getAttribute("aria-label")).toBe("12 Alerts");
  });

  it("renders count 0 (does not drop a falsy-but-present count)", () => {
    const wrapper = mount(NavItem, { props: { title: "Empty", count: 0 } });
    const badge = (wrapper.element as HTMLElement).querySelector<HTMLElement>(".st-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe("0");
  });

  it("does not render a badge when count is undefined", () => {
    const wrapper = mount(NavItem, { props: { title: "No count" } });
    expect((wrapper.element as HTMLElement).querySelector(".st-badge")).toBeNull();
  });

  it("applies the depth modifier class and scale (default 0)", () => {
    const d0 = mount(NavItem, { props: { title: "Root" } });
    expect(root(d0.element as HTMLElement)?.classList.contains("st-navItem--depth0")).toBe(true);

    for (const depth of [0, 1, 2, 3] as const) {
      const wrapper = mount(NavItem, { props: { title: "X", depth } });
      expect(
        root(wrapper.element as HTMLElement)?.classList.contains(`st-navItem--depth${depth}`),
      ).toBe(true);
    }
  });

  it("clamps an out-of-range depth into the [0..3] modifier set", () => {
    const wrapper = mount(NavItem, {
      props: { title: "X", depth: 9 as unknown as 0 },
    });
    expect(root(wrapper.element as HTMLElement)?.classList.contains("st-navItem--depth3")).toBe(
      true,
    );
  });

  it("applies the semantic status modifier (error is a real state, not decoration)", () => {
    const wrapper = mount(NavItem, { props: { title: "HTTP 403", status: "error" } });
    expect(
      root(wrapper.element as HTMLElement)?.classList.contains("st-navItem--status-error"),
    ).toBe(true);
    // The badge tone follows the row status.
    const counted = mount(NavItem, {
      props: { title: "HTTP 403", status: "error", count: 3 },
    });
    expect(
      (counted.element as HTMLElement)
        .querySelector(".st-badge")
        ?.classList.contains("st-badge--error"),
    ).toBe(true);
  });

  it("does not add a status modifier for the neutral default", () => {
    const wrapper = mount(NavItem, { props: { title: "Plain" } });
    expect(root(wrapper.element as HTMLElement)?.className).not.toContain("st-navItem--status-");
  });

  it("renders an optional divider after the row, hidden from SR", () => {
    const on = mount(NavItem, { props: { title: "X", divider: true } });
    const hr = (on.element as HTMLElement).querySelector<HTMLElement>(".st-navItem__divider");
    expect(hr).toBeTruthy();
    expect(hr?.getAttribute("aria-hidden")).toBe("true");

    const off = mount(NavItem, { props: { title: "X" } });
    expect((off.element as HTMLElement).querySelector(".st-navItem__divider")).toBeNull();
  });

  it("forwards selection to SelectableRow (selected → selected class + aria-selected)", () => {
    const wrapper = mount(NavItem, { props: { title: "Selected", selected: true } });
    const r = row(wrapper.element as HTMLElement);
    expect(r?.className).toContain("st-selectableRow--selected");
    // Vue SelectableRow defaults to role="option" → aria-selected (not aria-pressed).
    expect(r?.getAttribute("aria-selected")).toBe("true");
  });

  it("toggles selection on click (standalone) and notifies onSelect", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(NavItem, { props: { title: "Toggle", onSelect } });
    const r = row(wrapper.element as HTMLElement) as HTMLElement;
    expect(r.getAttribute("aria-selected")).toBe("false");
    await wrapper.find(".st-selectableRow").trigger("click");
    expect(onSelect).toHaveBeenLastCalledWith(true);
    expect(wrapper.emitted("select")?.[0]).toEqual([true]);
    expect(row(wrapper.element as HTMLElement)?.getAttribute("aria-selected")).toBe("true");
  });

  it("disabled exposes aria-disabled and does not toggle", async () => {
    const onSelect = vi.fn();
    const wrapper = mount(NavItem, { props: { title: "Off", disabled: true, onSelect } });
    const r = row(wrapper.element as HTMLElement) as HTMLElement;
    expect(r.getAttribute("aria-disabled")).toBe("true");
    await wrapper.find(".st-selectableRow").trigger("click");
    expect(onSelect).not.toHaveBeenCalled();
    expect(row(wrapper.element as HTMLElement)?.getAttribute("aria-selected")).toBe("false");
  });

  it("forwards value as data-value on the row", () => {
    const wrapper = mount(NavItem, { props: { title: "Keyed", value: "entities" } });
    expect(row(wrapper.element as HTMLElement)?.getAttribute("data-value")).toBe("entities");
  });

  it("href renders the row as a native anchor", () => {
    const wrapper = mount(NavItem, { props: { title: "Docs", href: "/docs" } });
    const r = row(wrapper.element as HTMLElement);
    expect(r?.tagName).toBe("A");
    expect(r?.getAttribute("href")).toBe("/docs");
    expect(r?.getAttribute("role")).toBeNull();
  });

  it("leading slot takes priority over swatch", () => {
    const wrapper = mount(NavItem, {
      props: { title: "Custom", swatch: { tone: "success" } },
      slots: { leading: () => h("span", { class: "x-lead" }, "L") },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".x-lead")).toBeTruthy();
    expect(el.querySelector(".st-statusDot__dot")).toBeNull();
  });

  it("trailing slot takes priority over count", () => {
    const wrapper = mount(NavItem, {
      props: { title: "Custom", count: 5 },
      slots: { trailing: () => h("span", { class: "x-trail" }, "T") },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".x-trail")).toBeTruthy();
    expect(el.querySelector(".st-badge")).toBeNull();
  });

  it("merges a consumer class onto the wrapper", () => {
    const wrapper = mount(NavItem, { props: { title: "X", class: "x-extra" } });
    expect(root(wrapper.element as HTMLElement)?.classList.contains("x-extra")).toBe(true);
  });
});
