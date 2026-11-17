import { signal } from "@preact/signals";
import { cleanup, render, screen } from "@testing-library/preact";
import { EyeOff } from "lucide-preact";
import { afterEach, describe, expect, it } from "vitest";
import { Icon } from "./Icon.js";
import { Overline } from "./Overline.js";

afterEach(cleanup);

describe("P4c group 1 edges (Icon, Overline: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on Icon and Overline", () => {
    render(
      <>
        <Icon name="settings" data-testid="e-icon" className={signal("x-icon")} />
        <Overline data-testid="e-overline" className={signal("x-overline")}>
          Documentation
        </Overline>
      </>,
    );
    expect(screen.getByTestId("e-icon").getAttribute("class")).toContain("x-icon");
    expect(screen.getByTestId("e-overline").className).toContain("x-overline");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const iconClass = signal("x-icon");
    const overlineClass = signal("x-overline");
    render(
      <>
        <Icon name="settings" data-testid="m-icon" className={iconClass} />
        <Overline data-testid="m-overline" className={overlineClass}>
          Documentation
        </Overline>
      </>,
    );
    iconClass.value = "y-icon";
    overlineClass.value = "y-overline";
    await screen.findByTestId("m-icon");
    expect(screen.getByTestId("m-icon").getAttribute("class")).toContain("y-icon");
    expect(screen.getByTestId("m-icon").getAttribute("class")).not.toContain("x-icon");
    expect(screen.getByTestId("m-overline").className).toContain("y-overline");
    expect(screen.getByTestId("m-overline").className).not.toContain("x-overline");
  });

  it("Icon renders svg defaults, title naming and glyph precedence", () => {
    const { container, unmount } = render(<Icon name="settings" data-testid="t-icon" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("18");
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    unmount();
    const titled = render(<Icon name="eye" title="Afficher" />);
    const named = titled.container.querySelector("svg") as SVGElement;
    expect(named.getAttribute("role")).toBe("img");
    expect(named.getAttribute("aria-label")).toBe("Afficher");
    titled.unmount();
    const byName = render(<Icon name="eye-off" />);
    const byGlyph = render(<Icon glyph={EyeOff} />);
    expect(byGlyph.container.querySelector("svg")?.outerHTML).toBe(
      byName.container.querySelector("svg")?.outerHTML,
    );
    byName.unmount();
    byGlyph.unmount();
  });

  it("Overline renders the requested tag and forwards rest props", () => {
    const { container } = render(
      <Overline as="h2" data-testid="t-overline" id="ov-1">
        Signaux
      </Overline>,
    );
    const el = container.querySelector(".st-overline");
    expect(el?.tagName).toBe("H2");
    expect(el?.getAttribute("id")).toBe("ov-1");
  });
});
