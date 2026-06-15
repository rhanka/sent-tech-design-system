import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StatusDot from "./lib/StatusDot.svelte";

const dot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>(".st-statusDot__dot");

describe("StatusDot", () => {
  it("renders a bare decorative dot with role=img and a tone aria-label", () => {
    const { container } = render(StatusDot, { props: { tone: "success" } });
    const el = dot(container);
    expect(el).toBeTruthy();
    expect(el?.getAttribute("role")).toBe("img");
    expect(el?.getAttribute("aria-label")).toBe("success");
    expect(el?.classList.contains("st-statusDot__dot--success")).toBe(true);
  });

  it("defaults to the neutral tone", () => {
    const { container } = render(StatusDot, {});
    const el = dot(container);
    expect(el?.classList.contains("st-statusDot__dot--neutral")).toBe(true);
    expect(el?.getAttribute("aria-label")).toBe("neutral");
  });

  it("maps each tone to its modifier class", () => {
    for (const tone of ["neutral", "info", "success", "warning", "error"] as const) {
      const { container } = render(StatusDot, { props: { tone } });
      expect(dot(container)?.classList.contains(`st-statusDot__dot--${tone}`)).toBe(true);
    }
  });

  it("renders an arbitrary color as an inline background, taking priority over tone", () => {
    const { container } = render(StatusDot, {
      props: { color: "#16a34a", tone: "error" }
    });
    const el = dot(container);
    expect(el?.style.backgroundColor).toContain("rgb(22, 163, 74)");
    // no tone class when a color is supplied
    expect(el?.classList.contains("st-statusDot__dot--error")).toBe(false);
    expect(el?.getAttribute("aria-label")).toBe("#16a34a");
  });

  it("accepts a CSS token as the color", () => {
    const { container } = render(StatusDot, {
      props: { color: "var(--st-semantic-feedback-success)" }
    });
    expect(dot(container)?.style.backgroundColor).toContain(
      "var(--st-semantic-feedback-success)"
    );
  });

  it("applies the size as inline width/height in px (default 8)", () => {
    const { container: sized } = render(StatusDot, { props: { tone: "info", size: 12 } });
    expect(dot(sized)?.style.width).toBe("12px");
    expect(dot(sized)?.style.height).toBe("12px");

    const { container: dflt } = render(StatusDot, { props: { tone: "info" } });
    expect(dot(dflt)?.style.width).toBe("8px");
  });

  it("renders the label and hides the dot from SR when a label is given", () => {
    const { container } = render(StatusDot, {
      props: { tone: "success", label: "EN DIRECT" }
    });
    expect(container.querySelector(".st-statusDot__label")?.textContent).toBe("EN DIRECT");
    const el = dot(container);
    expect(el?.getAttribute("aria-hidden")).toBe("true");
    expect(el?.getAttribute("role")).toBeNull();
  });

  it("toggles the pulse modifier class", () => {
    const { container: on } = render(StatusDot, { props: { tone: "info", pulse: true } });
    expect(dot(on)?.classList.contains("st-statusDot__dot--pulse")).toBe(true);

    const { container: off } = render(StatusDot, { props: { tone: "info" } });
    expect(dot(off)?.classList.contains("st-statusDot__dot--pulse")).toBe(false);
  });

  it("merges a consumer class onto the root", () => {
    const { container } = render(StatusDot, { props: { class: "x-extra" } });
    const rootEl = container.querySelector(".st-statusDot");
    expect(rootEl?.classList.contains("x-extra")).toBe(true);
  });
});
