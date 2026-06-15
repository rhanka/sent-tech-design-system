import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColorScaleBar } from "./ColorScaleBar.js";

const bar = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-colorScaleBar__bar");

describe("ColorScaleBar", () => {
  it("renders a horizontal linear-gradient from the stops by default", () => {
    const { container } = render(<ColorScaleBar colors={["#000", "#fff"]} />);
    const bg = bar(container)?.style.background ?? "";
    expect(bg).toContain("linear-gradient");
    expect(bg).toContain("to right");
  });

  it("renders a bottom-up gradient when vertical", () => {
    const { container } = render(<ColorScaleBar colors={["#000", "#fff"]} orientation="vertical" />);
    expect(bar(container)?.style.background).toContain("to top");
    expect(container.querySelector(".st-colorScaleBar--vertical")).toBeTruthy();
  });

  it("applies length and thickness inline per orientation", () => {
    const { container: horiz } = render(
      <ColorScaleBar colors={["#000", "#fff"]} length={200} thickness={10} />,
    );
    expect(bar(horiz)?.style.width).toBe("200px");
    expect(bar(horiz)?.style.height).toBe("10px");

    const { container: vert } = render(
      <ColorScaleBar colors={["#000", "#fff"]} orientation="vertical" length={200} thickness={10} />,
    );
    expect(bar(vert)?.style.height).toBe("200px");
    expect(bar(vert)?.style.width).toBe("10px");
  });

  it("renders optional min/max end labels", () => {
    const { container } = render(<ColorScaleBar colors={["#000", "#fff"]} min="0" max="100" />);
    expect(container.querySelector(".st-colorScaleBar__end--min")?.textContent).toBe("0");
    expect(container.querySelector(".st-colorScaleBar__end--max")?.textContent).toBe("100");
  });

  it("renders an accessible label and exposes it on the bar", () => {
    const { container } = render(<ColorScaleBar colors={["#000", "#fff"]} label="Intensité" />);
    expect(container.querySelector(".st-colorScaleBar__label")?.textContent).toBe("Intensité");
    expect(bar(container)?.getAttribute("aria-label")).toBe("Intensité");
  });

  it("duplicates a single stop into a flat gradient", () => {
    const { container } = render(<ColorScaleBar colors={["#3b82f6"]} />);
    expect(bar(container)?.style.background).toContain("linear-gradient");
  });
});
