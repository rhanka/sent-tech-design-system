import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { StatusDot } from "./StatusDot.js";

const dot = (el: HTMLElement) => el.querySelector<HTMLElement>(".st-statusDot__dot");

describe("StatusDot", () => {
  it("renders a bare decorative dot with role=img and a tone aria-label", () => {
    const wrapper = mount(StatusDot, { props: { tone: "success" } });
    const el = dot(wrapper.element as HTMLElement);
    expect(el).toBeTruthy();
    expect(el?.getAttribute("role")).toBe("img");
    expect(el?.getAttribute("aria-label")).toBe("success");
    expect(el?.classList.contains("st-statusDot__dot--success")).toBe(true);
  });

  it("defaults to the neutral tone", () => {
    const wrapper = mount(StatusDot);
    const el = dot(wrapper.element as HTMLElement);
    expect(el?.classList.contains("st-statusDot__dot--neutral")).toBe(true);
    expect(el?.getAttribute("aria-label")).toBe("neutral");
  });

  it("maps each tone to its modifier class", () => {
    for (const tone of ["neutral", "info", "success", "warning", "error"] as const) {
      const wrapper = mount(StatusDot, { props: { tone } });
      expect(dot(wrapper.element as HTMLElement)?.classList.contains(`st-statusDot__dot--${tone}`)).toBe(
        true,
      );
    }
  });

  it("renders an arbitrary color as an inline background, taking priority over tone", () => {
    const wrapper = mount(StatusDot, { props: { color: "#16a34a", tone: "error" } });
    const el = dot(wrapper.element as HTMLElement);
    expect(el?.style.backgroundColor).toContain("rgb(22, 163, 74)");
    // no tone class when a color is supplied
    expect(el?.classList.contains("st-statusDot__dot--error")).toBe(false);
    expect(el?.getAttribute("aria-label")).toBe("#16a34a");
  });

  it("accepts a CSS token as the color", () => {
    const wrapper = mount(StatusDot, { props: { color: "var(--st-semantic-feedback-success)" } });
    expect(dot(wrapper.element as HTMLElement)?.style.backgroundColor).toContain(
      "var(--st-semantic-feedback-success)",
    );
  });

  it("applies the size as inline width/height in px (default 8)", () => {
    const sized = mount(StatusDot, { props: { tone: "info", size: 12 } });
    expect(dot(sized.element as HTMLElement)?.style.width).toBe("12px");
    expect(dot(sized.element as HTMLElement)?.style.height).toBe("12px");

    const dflt = mount(StatusDot, { props: { tone: "info" } });
    expect(dot(dflt.element as HTMLElement)?.style.width).toBe("8px");
  });

  it("renders the label and hides the dot from SR when a label is given", () => {
    const wrapper = mount(StatusDot, { props: { tone: "success", label: "EN DIRECT" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-statusDot__label")?.textContent).toBe("EN DIRECT");
    const d = dot(el);
    expect(d?.getAttribute("aria-hidden")).toBe("true");
    expect(d?.getAttribute("role")).toBeNull();
  });

  it("toggles the pulse modifier class", () => {
    const on = mount(StatusDot, { props: { tone: "info", pulse: true } });
    expect(dot(on.element as HTMLElement)?.classList.contains("st-statusDot__dot--pulse")).toBe(true);

    const off = mount(StatusDot, { props: { tone: "info" } });
    expect(dot(off.element as HTMLElement)?.classList.contains("st-statusDot__dot--pulse")).toBe(false);
  });

  it("merges a consumer class onto the root", () => {
    const wrapper = mount(StatusDot, { props: { class: "x-extra" } });
    const rootEl = wrapper.element as HTMLElement;
    expect(rootEl.classList.contains("st-statusDot")).toBe(true);
    expect(rootEl.classList.contains("x-extra")).toBe(true);
  });
});
