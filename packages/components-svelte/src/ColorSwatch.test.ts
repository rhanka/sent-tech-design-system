import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ColorSwatch from "./lib/ColorSwatch.svelte";

const chip = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-colorSwatch__chip");

describe("ColorSwatch", () => {
  it("renders the chip with the color as an inline background", () => {
    const { container } = render(ColorSwatch, { props: { color: "#2563eb" } });
    const el = chip(container);
    expect(el).toBeTruthy();
    expect(el?.style.backgroundColor).toContain("rgb(37, 99, 235)");
  });

  it("applies the size as inline width/height in px", () => {
    const { container } = render(ColorSwatch, { props: { color: "#000", size: 40 } });
    const el = chip(container);
    expect(el?.style.width).toBe("40px");
    expect(el?.style.height).toBe("40px");
  });

  it("defaults the size to 24px when unset", () => {
    const { container } = render(ColorSwatch, { props: { color: "#000" } });
    expect(chip(container)?.style.width).toBe("24px");
  });

  it("renders an optional label and reflects the shape on the root", () => {
    const { container } = render(ColorSwatch, {
      props: { color: "#16a34a", label: "Vert", shape: "circle" }
    });
    expect(container.querySelector(".st-colorSwatch__label")?.textContent).toBe("Vert");
    expect(container.querySelector(".st-colorSwatch--circle")).toBeTruthy();
  });

  it("derives aria-label from the label, otherwise from the color", () => {
    const { container: withLabel } = render(ColorSwatch, {
      props: { color: "#000", label: "Encre" }
    });
    expect(chip(withLabel)?.getAttribute("aria-label")).toBe("Encre");

    const { container: noLabel } = render(ColorSwatch, { props: { color: "#abcdef" } });
    expect(chip(noLabel)?.getAttribute("aria-label")).toBe("#abcdef");
  });

  it("accepts a CSS token as the color", () => {
    const { container } = render(ColorSwatch, {
      props: { color: "var(--st-semantic-action-primary)" }
    });
    expect(chip(container)?.style.backgroundColor).toContain("var(--st-semantic-action-primary)");
  });
});
