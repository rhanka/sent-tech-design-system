import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Icon from "./Icon.svelte";
import { ICON_NAMES } from "./icons.js";

describe("Icon — canonical DS icon set", () => {
  it("renders an svg for every canonical name", () => {
    for (const name of ICON_NAMES) {
      const { container, unmount } = render(Icon, { props: { name } });
      const svg = container.querySelector("svg");
      expect(svg, `expected an <svg> for icon "${name}"`).toBeTruthy();
      unmount();
    }
  });

  it("defaults to size 18 and stroke-width 2.25 (DS-standard)", () => {
    const { container } = render(Icon, { props: { name: "settings" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("18");
    expect(svg.getAttribute("height")).toBe("18");
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
  });

  it("is decorative (aria-hidden) with no title", () => {
    const { container } = render(Icon, { props: { name: "close" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes an accessible name when title is set", () => {
    const { container } = render(Icon, { props: { name: "eye", title: "Afficher" } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Afficher");
  });

  it("honours a custom size", () => {
    const { container } = render(Icon, { props: { name: "layers", size: 24 } });
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("24");
  });
});
