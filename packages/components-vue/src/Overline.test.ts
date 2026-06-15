import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { Overline } from "./Overline.js";

const root = (el: HTMLElement) =>
  el.classList.contains("st-overline") ? el : el.querySelector<HTMLElement>(".st-overline");

describe("Overline", () => {
  it("renders a span by default with the slotted text", () => {
    const wrapper = mount(Overline, { slots: { default: () => "DOCUMENTATION" } });
    const el = root(wrapper.element as HTMLElement);
    expect(el).toBeTruthy();
    expect(el?.tagName).toBe("SPAN");
    expect(el?.textContent).toContain("DOCUMENTATION");
  });

  it("renders the requested tag via `as`", () => {
    for (const [as, tag] of [
      ["div", "DIV"],
      ["h2", "H2"],
      ["h3", "H3"],
    ] as const) {
      const wrapper = mount(Overline, { props: { as }, slots: { default: () => "SIGNAUX" } });
      expect(root(wrapper.element as HTMLElement)?.tagName).toBe(tag);
    }
  });

  it("carries the st-overline class (scoped small-caps styling lives there)", () => {
    const wrapper = mount(Overline, { slots: { default: () => "communities" } });
    expect(root(wrapper.element as HTMLElement)?.classList.contains("st-overline")).toBe(true);
  });

  it("merges a consumer class onto the root", () => {
    const wrapper = mount(Overline, {
      props: { class: "x-extra" },
      slots: { default: () => "DOCUMENTS SOURCES" },
    });
    const el = root(wrapper.element as HTMLElement);
    expect(el?.classList.contains("st-overline")).toBe(true);
    expect(el?.classList.contains("x-extra")).toBe(true);
  });

  it("forwards arbitrary attributes via attrs", () => {
    const wrapper = mount(Overline, {
      attrs: { id: "sec-label" },
      slots: { default: () => h("span", "SECTION") },
    });
    expect(root(wrapper.element as HTMLElement)?.getAttribute("id")).toBe("sec-label");
  });
});
