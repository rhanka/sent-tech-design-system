import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ColorScaleBar } from "./ColorScaleBar.js";

const bar = (el: HTMLElement) => el.querySelector<HTMLElement>(".st-colorScaleBar__bar");

describe("ColorScaleBar", () => {
  it("renders a horizontal linear-gradient from the stops by default", () => {
    const wrapper = mount(ColorScaleBar, { props: { colors: ["#000", "#fff"] } });
    const bg = bar(wrapper.element as HTMLElement)?.style.background ?? "";
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("to right");
  });

  it("renders a bottom-up gradient when vertical", () => {
    const wrapper = mount(ColorScaleBar, {
      props: { colors: ["#000", "#fff"], orientation: "vertical" },
    });
    const el = wrapper.element as HTMLElement;
    expect(bar(el)?.style.background).toContain("to top");
    expect(el.classList.contains("st-colorScaleBar--vertical")).toBe(true);
  });

  it("applies length and thickness inline per orientation", () => {
    const horiz = mount(ColorScaleBar, {
      props: { colors: ["#000", "#fff"], length: 200, thickness: 10 },
    });
    expect(bar(horiz.element as HTMLElement)?.style.width).toBe("200px");
    expect(bar(horiz.element as HTMLElement)?.style.height).toBe("10px");

    const vert = mount(ColorScaleBar, {
      props: { colors: ["#000", "#fff"], orientation: "vertical", length: 200, thickness: 10 },
    });
    expect(bar(vert.element as HTMLElement)?.style.height).toBe("200px");
    expect(bar(vert.element as HTMLElement)?.style.width).toBe("10px");
  });

  it("renders optional min/max end labels", () => {
    const wrapper = mount(ColorScaleBar, {
      props: { colors: ["#000", "#fff"], min: "0", max: "100" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-colorScaleBar__end--min")?.textContent).toBe("0");
    expect(el.querySelector(".st-colorScaleBar__end--max")?.textContent).toBe("100");
  });

  it("renders an accessible label and exposes it on the bar", () => {
    const wrapper = mount(ColorScaleBar, {
      props: { colors: ["#000", "#fff"], label: "Intensité" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-colorScaleBar__label")?.textContent).toBe("Intensité");
    expect(bar(el)?.getAttribute("aria-label")).toBe("Intensité");
  });

  it("duplicates a single stop into a flat gradient", () => {
    const wrapper = mount(ColorScaleBar, { props: { colors: ["#3b82f6"] } });
    expect(bar(wrapper.element as HTMLElement)?.style.background).toContain("linear-gradient");
  });
});
