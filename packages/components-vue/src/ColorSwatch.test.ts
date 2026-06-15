import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ColorSwatch } from "./ColorSwatch.js";

const chip = (el: HTMLElement) => el.querySelector<HTMLElement>(".st-colorSwatch__chip");

describe("ColorSwatch", () => {
  it("renders the chip with the color as an inline background", () => {
    const wrapper = mount(ColorSwatch, { props: { color: "rgb(37, 99, 235)" } });
    expect(chip(wrapper.element as HTMLElement)?.style.background).toContain("rgb(37, 99, 235)");
  });

  it("applies the size as inline width/height in px", () => {
    const wrapper = mount(ColorSwatch, { props: { color: "#000", size: 40 } });
    const el = chip(wrapper.element as HTMLElement);
    expect(el?.style.width).toBe("40px");
    expect(el?.style.height).toBe("40px");
  });

  it("defaults the size to 24px when unset", () => {
    const wrapper = mount(ColorSwatch, { props: { color: "#000" } });
    expect(chip(wrapper.element as HTMLElement)?.style.width).toBe("24px");
  });

  it("renders an optional label and reflects the shape on the root", () => {
    const wrapper = mount(ColorSwatch, { props: { color: "#16a34a", label: "Vert", shape: "circle" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-colorSwatch__label")?.textContent).toBe("Vert");
    expect(el.classList.contains("st-colorSwatch--circle")).toBe(true);
  });

  it("derives aria-label from the label, otherwise from the color", () => {
    const withLabel = mount(ColorSwatch, { props: { color: "#000", label: "Encre" } });
    expect(chip(withLabel.element as HTMLElement)?.getAttribute("aria-label")).toBe("Encre");

    const noLabel = mount(ColorSwatch, { props: { color: "#abcdef" } });
    expect(chip(noLabel.element as HTMLElement)?.getAttribute("aria-label")).toBe("#abcdef");
  });

  it("accepts a CSS token as the color", () => {
    const wrapper = mount(ColorSwatch, { props: { color: "var(--st-semantic-action-primary)" } });
    expect(chip(wrapper.element as HTMLElement)?.style.background).toContain(
      "var(--st-semantic-action-primary)",
    );
  });
});
