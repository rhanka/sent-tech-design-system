import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, ICON_NAMES } from "./Icon.js";

describe("Icon — canonical DS icon set", () => {
  it("renders an svg for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector("svg"), `expected an <svg> for icon "${name}"`).toBeTruthy();
      unmount();
    }
  });

  it("defaults to size 18 and stroke-width 2.25 (DS-standard)", () => {
    const { container } = render(<Icon name="settings" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("18");
    expect(svg.getAttribute("height")).toBe("18");
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
  });

  it("is decorative (aria-hidden) with no title", () => {
    const { container } = render(<Icon name="close" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when title is set", () => {
    const { container } = render(<Icon name="eye" title="Afficher" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Afficher");
  });
});
